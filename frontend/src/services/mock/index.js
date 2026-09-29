import { initialBatches, delay } from './data';

const STORAGE_KEY = 'cirqproof_batches_v1';

const getStoredBatches = () => {
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBatches));
    return initialBatches;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    return initialBatches;
  }
};

const saveBatches = (batches) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
};

export const mockService = {
  async getBatches() {
    await delay(200);
    return [...getStoredBatches()];
  },

  async getBatchById(id) {
    await delay(200);
    const batches = getStoredBatches();
    return batches.find(b => b.id === id) || null;
  },

  async createBatch(payload) {
    await delay(400);
    const batches = getStoredBatches();
    const newId = `BATCH-${new Date().getFullYear()}-${String(batches.length + 891).padStart(4, '0')}`;
    
    // Auto-compute residue and consistency
    const input = Number(payload.inputWeight) || 1000;
    const claimed = Number(payload.claimedRecoveredWeight) || 700;
    const processed = Number(payload.processedWeight) || input * 0.95;
    const downstream = Number(payload.downstreamWeight) || claimed;
    const residue = Math.max(0, input - claimed);

    const isConsistent = Math.abs(claimed - downstream) <= 15 && (claimed / input) <= 0.88;

    const newBatch = {
      id: newId,
      material: payload.material || "Recycled High-Density Polymers",
      inputWeight: input,
      processedWeight: processed,
      claimedRecoveredWeight: claimed,
      downstreamWeight: downstream,
      residueWeight: residue,
      producer: payload.producer || "Genesis Material Corp",
      recycler: payload.recycler || "Apex Circular Labs",
      buyer: payload.buyer || "Standard Circular Consumer Goods",
      status: isConsistent ? "VERIFIED" : "FLAGGED",
      scenario: payload.scenario || (isConsistent ? "NORMAL" : "INCONSISTENT"),
      createdAt: new Date().toISOString(),
      evidence: {
        weighbridge: { status: "VALID", docId: `WB-${Math.floor(10000 + Math.random() * 90000)}`, weight: input, timestamp: new Date().toISOString() },
        processingLog: { status: isConsistent ? "VALID" : "SUSPICIOUS", runtimeHours: 9.0, energyKwh: 1100, temperatureAvg: "155°C" },
        outputRecord: { status: isConsistent ? "VALID" : "FLAGGED", recoveredWeight: claimed, grade: "Industrial Grade A" },
        downstreamInvoice: { status: isConsistent ? "VALID" : "MISMATCH", invoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`, verifiedWeight: downstream },
        telemetry: { status: isConsistent ? "VALID" : "WARNING", sensorIntegrity: isConsistent ? "99.9%" : "72%", continuousLogging: true }
      },
      evidenceRoot: "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      integrityStatus: isConsistent ? "VALID" : "FLAGGED",
      aiReport: {
        status: isConsistent ? "CONSISTENT" : "FLAGGED",
        massBalance: {
          passed: isConsistent,
          variancePercent: isConsistent ? 0.3 : Math.abs(((claimed - downstream) / input) * 100).toFixed(1),
          message: isConsistent ? "Mass balance conserved across intake, process, and off-take." : "Yield anomaly: Claimed output contradicts physical process boundaries."
        },
        capacity: {
          passed: true,
          message: "Facility capacity verification verified within permitted envelope."
        },
        downstreamMatch: {
          passed: isConsistent,
          delta: downstream - claimed,
          message: isConsistent ? "Downstream weighment matches bill of lading." : `Discrepancy of ${downstream - claimed} kg detected.`
        },
        flags: isConsistent ? [] : ["MASS_BALANCE_VIOLATION", "DISCREPANT_DOWNSTREAM_DELIVERY"],
        explanation: isConsistent
          ? "All multi-point telemetry, weighbridge records, and downstream off-taker receipts pass validation."
          : "Audit flag raised. Downstream buyer invoice does not reconcile with claimed EPR credit weights.",
        recommendation: isConsistent
          ? "Certified for automatic smart contract attestation and payment release."
          : "Dispute escrow lock engaged. Forward to Auditor."
      },
      blockchain: {
        attestationId: `ATTEST-MST-${Math.floor(100000 + Math.random() * 900000)}`,
        txHash: "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        evidenceRoot: "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        verifier: "0x3F881c2069B56eF70F04D6a61DEa3D8f4f9a0A21",
        timestamp: new Date().toISOString(),
        blockNumber: 14890350 + batches.length,
        network: "MST Testnet (Chain ID: 4242)"
      },
      settlement: {
        id: `SETTLE-${batches.length + 985}`,
        amountINR: payload.amountINR || 50000,
        status: isConsistent ? "RELEASED" : "HELD",
        escrowTx: "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        releaseTx: isConsistent ? "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('') : null,
        recipient: payload.recycler || "Apex Circular Labs"
      }
    };

    batches.unshift(newBatch);
    saveBatches(batches);
    return newBatch;
  },

  async challengeBatch(batchId, challengeData) {
    await delay(300);
    const batches = getStoredBatches();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) throw new Error("Batch not found");

    batch.status = "CHALLENGED";
    batch.settlement.status = "HELD";
    batch.challenge = {
      id: `CHALLENGE-${Math.floor(100 + Math.random() * 900)}`,
      challenger: challengeData.challenger || "0x77A19bE492801FdA21004C9912AcDa78912066fB",
      reason: challengeData.reason || "Fraudulent claim flagged by auditor",
      bountyINR: challengeData.bountyINR || 15000,
      status: "ACTIVE",
      timestamp: new Date().toISOString(),
      txHash: "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };

    saveBatches(batches);
    return batch;
  },

  async updateSettlement(batchId, status) {
    await delay(300);
    const batches = getStoredBatches();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) throw new Error("Batch not found");

    batch.settlement.status = status;
    if (status === "RELEASED" && !batch.settlement.releaseTx) {
      batch.settlement.releaseTx = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
    saveBatches(batches);
    return batch;
  },

  async resetToDefaults() {
    saveBatches(initialBatches);
    return initialBatches;
  }
};
