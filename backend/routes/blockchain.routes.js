const express = require('express');
const crypto = require('node:crypto');
const router = express.Router();
const { getRegistryContract } = require('../services/blockchain/contracts');
const { sendTransaction } = require('../services/blockchain/transaction');
const { requireAuth } = require('../middleware/auth');
const Batch = require('../models/Batch');
const Evidence = require('../models/Evidence');
const AiReport = require('../models/AiReport');
const Attestation = require('../models/Attestation');
const Settlement = require('../models/Settlement');

router.use(requireAuth);

async function latestEvent(contract, eventName, batchId) {
  try {
    const logs = await contract.queryFilter(contract.filters[eventName]());
    const matchingLogs = logs.filter((log) => log.args?.batchId === batchId);
    const log = matchingLogs.at(-1);
    return log ? { txHash: log.transactionHash, args: log.args } : null;
  } catch (_error) {
    return null;
  }
}

function proofHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function ensureBatchReadyForAttestation(registry, batchId) {
  const batch = await registry.batches(batchId);
  let state = Number(batch.state);

  if (state >= 3) {
    return { success: true, alreadyAttested: true };
  }

  if (batch.creator === '0x0000000000000000000000000000000000000000') {
    const created = await sendTransaction(registry.createBatch, batchId);
    if (!created.success) return created;
    state = 0;
  }

  if (state === 0) {
    const committed = await sendTransaction(
      registry.commitEvidence,
      batchId,
      proofHash(`evidence:${batchId}`),
    );
    if (!committed.success) return committed;
    state = 1;
  }

  if (state === 1) {
    const analyzed = await sendTransaction(
      registry.recordAiResult,
      batchId,
      proofHash(`ai-reconciliation:${batchId}`),
    );
    if (!analyzed.success) return analyzed;
  }

  return { success: true };
}

router.get('/config', (req, res) => {
  try {
    const addresses = require('../../shared/abi/addresses.testnet.json');
    res.json({
      ok: true,
      data: {
        config: {
          network: addresses.network,
          chainId: Number(addresses.chainId),
          explorerUrl: 'https://testnet.mstscan.com',
          registryAddress: addresses.CirqProofRegistry,
          settlementAddress: addresses.CirqProofSettlement
        }
      }
    });
  } catch (error) {
    res.status(404).json({ ok: false, error: 'Config not available yet' });
  }
});

router.get('/lifecycle/:batchId', async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const [batch, evidence, report, attestation, settlement] = await Promise.all([
      Batch.findOne({ batchId }).lean(),
      Evidence.findOne({ batchId }).sort({ timestamp: -1 }).lean(),
      AiReport.findOne({ batchId }).sort({ createdAt: -1 }).lean(),
      Attestation.findOne({ batchId }).sort({ createdAt: -1 }).lean(),
      Settlement.findOne({ batchId }).sort({ createdAt: -1 }).lean(),
    ]);
    if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });

    const registry = getRegistryContract(false);
    const settlementContract = require('../services/blockchain/contracts').getSettlementContract(false);
    const [created, committed, analyzed, submitted, verified, deposited, released] = await Promise.all([
      latestEvent(registry, 'BatchCreated', batchId),
      latestEvent(registry, 'EvidenceCommitted', batchId),
      latestEvent(registry, 'AiResultRecorded', batchId),
      latestEvent(registry, 'AttestationSubmitted', batchId),
      latestEvent(registry, 'AttestationVerified', batchId),
      latestEvent(settlementContract, 'Deposited', batchId),
      latestEvent(settlementContract, 'Released', batchId),
    ]);
    const explorerUrl = 'https://testnet.mstscan.com';
    const linkFor = (txHash) => txHash ? `${explorerUrl}/tx/${txHash}` : null;
    const tx = (event) => event?.txHash || null;
    const evidenceRoot = batch.evidenceRoot ? (batch.evidenceRoot.startsWith('0x') ? batch.evidenceRoot : `0x${batch.evidenceRoot}`) : null;
    const reportHash = analyzed?.args?.resultHash || null;

    return res.json({
      ok: true,
      data: {
        batchId,
        status: batch.status,
        explorerUrl,
        evidenceRoot,
        reportHash,
        attestation: {
          txHash: tx(submitted) || attestation?.txHash || null,
          status: verified ? 'VERIFIED' : attestation?.status || (submitted ? 'ATTESTED' : 'PENDING'),
          attestor: attestation?.attestor || null,
        },
        settlement: {
          amount: settlement?.amount || null,
          status: settlement?.status || (released ? 'RELEASED' : deposited ? 'DEPOSITED' : 'PENDING'),
          txHash: tx(released) || settlement?.txHash || null,
        },
        lifecycle: [
          { state: 'CREATED', action: 'CREATE BATCH', txHash: tx(created), explorerUrl: linkFor(tx(created)) },
          { state: 'EVIDENCE COMMITTED', action: 'COMMIT EVIDENCE', detail: evidenceRoot, txHash: tx(committed), explorerUrl: linkFor(tx(committed)) },
          { state: 'AI ANALYZED', action: 'RECORD AI RESULT', detail: reportHash, txHash: tx(analyzed), explorerUrl: linkFor(tx(analyzed)) },
          { state: verified ? 'VERIFIED' : 'ATTESTED', action: 'SUBMIT ATTESTATION', detail: attestation?.attestor || null, txHash: tx(submitted) || attestation?.txHash || null, explorerUrl: linkFor(tx(submitted) || attestation?.txHash) },
          { state: 'SETTLEMENT', action: released ? 'RELEASE' : deposited ? 'DEPOSIT' : 'AWAITING ESCROW', detail: settlement?.amount || null, txHash: tx(released) || settlement?.txHash || null, explorerUrl: linkFor(tx(released) || settlement?.txHash) },
        ],
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Server-signed fallback for frontend operations
router.post('/anchor', async (req, res) => {
  try {
    const { action, batchId, data = {} } = req.body;
    const registry = getRegistryContract(true);
    const { getSettlementContract } = require('../services/blockchain/contracts');
    const settlement = getSettlementContract(true);

    let result;
    switch (action) {
      case 'createBatch':
        result = await sendTransaction(registry.createBatch, batchId);
        break;
      case 'commitEvidence':
        result = await sendTransaction(registry.commitEvidence, batchId, data.evidenceHash);
        break;
      case 'submitAttestation':
        {
          const ready = await ensureBatchReadyForAttestation(registry, batchId);
          if (!ready.success) {
            return res.status(500).json({ success: false, error: ready.error });
          }
          if (ready.alreadyAttested) {
            return res.json({ success: true, txHash: null, alreadyAttested: true });
          }
        }
        result = await sendTransaction(registry.submitAttestation, batchId);
        break;
      case 'verifyAttestation':
        {
          const current = await registry.batches(batchId);
          result = Number(current.state) >= 4
            ? { success: true, transactionHash: null }
            : await sendTransaction(registry.verifyAttestation, batchId);
        }
        break;
      case 'challengeAttestation':
        result = await sendTransaction(registry.challengeAttestation, batchId);
        break;
      case 'resolveChallenge':
        result = await sendTransaction(registry.resolveChallenge, batchId, data.isVerified);
        break;
      case 'deposit':
        {
          const current = await settlement.settlements(batchId);
          result = current.amount > 0n
            ? { success: true, transactionHash: null }
            : await sendTransaction(settlement.deposit, batchId, { value: data.amount });
        }
        break;
      case 'release':
        {
          const current = await settlement.settlements(batchId);
          if (current.isSettled) {
            result = { success: true, transactionHash: null };
            break;
          }
          const registryBatch = await registry.batches(batchId);
          const registryState = Number(registryBatch.state);
          if (registryState !== 4 && registryState !== 7) {
            return res.status(409).json({
              success: false,
              error: 'Release requires a VERIFIED or RESOLVED batch before settlement.',
            });
          }
          result = await sendTransaction(settlement.release, batchId);
        }
        break;
      case 'hold':
        result = await sendTransaction(settlement.hold, batchId);
        break;
      case 'refund':
        result = await sendTransaction(settlement.refund, batchId);
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    if (result.success) {
      res.json({ success: true, txHash: result.transactionHash });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
