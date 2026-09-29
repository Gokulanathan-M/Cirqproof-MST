const express = require('express');
const crypto = require('node:crypto');
const router = express.Router();
const { getRegistryContract } = require('../services/blockchain/contracts');
const { sendTransaction } = require('../services/blockchain/transaction');

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
          registryAddress: addresses.CirqProofRegistry,
          settlementAddress: addresses.CirqProofSettlement
        }
      }
    });
  } catch (error) {
    res.status(404).json({ ok: false, error: 'Config not available yet' });
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
          result = current.isSettled
            ? { success: true, transactionHash: null }
            : await sendTransaction(settlement.release, batchId);
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
