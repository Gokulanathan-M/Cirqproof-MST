const enums = require('../../../shared/enums.json');
const Batch = require('../../models/Batch');

async function createBatch(params) {
  return Batch.create({
    batchId: params.batchId,
    producer: params.producer,
    recycler: params.recycler,
    material: params.material,
    claim: params.claim,
    status: 'CREATED',
  });
}

function getBatch(batchId) {
  return Batch.findOne({ batchId });
}

async function setBatchStatus(batchId, status) {
  if (!enums.batchStatus.includes(status)) throw Object.assign(new Error('Invalid batch status'), { status: 400 });
  const batch = await Batch.findOneAndUpdate({ batchId }, { status }, { new: true, runValidators: true });
  if (!batch) throw Object.assign(new Error('Batch not found'), { status: 404 });
  return batch;
}

async function setChainRefs(batchId, { txHash, attestationId } = {}) {
  const updates = {};
  if (txHash !== undefined) updates['chainRefs.txHash'] = txHash;
  if (attestationId !== undefined) updates['chainRefs.attestationId'] = attestationId;
  const batch = await Batch.findOneAndUpdate({ batchId }, { $set: updates }, { new: true, runValidators: true });
  if (!batch) throw Object.assign(new Error('Batch not found'), { status: 404 });
  return batch;
}

async function getEvidenceRoot(batchId) {
  const batch = await getBatch(batchId);
  return batch?.evidenceRoot || null;
}

async function getLatestAiReport(batchId) {
  const batch = await getBatch(batchId);
  if (batch?.aiReport) {
    await batch.populate('aiReport');
    return batch.aiReport;
  }
  const AiReport = require('../../models/AiReport');
  return AiReport.findOne({ batchId }).sort({ createdAt: -1 });
}

module.exports = { createBatch, getBatch, setBatchStatus, setChainRefs, getEvidenceRoot, getLatestAiReport };