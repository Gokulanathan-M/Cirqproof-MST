const Evidence = require('../../models/Evidence');
const Batch = require('../../models/Batch');
const { merkleRoot } = require('./merkle');
const { sha256 } = require('./hash');
const { readArtifact } = require('./storage');

async function verifyIntegrity(batchId) {
  const [batch, evidence] = await Promise.all([
    Batch.findOne({ batchId }),
    Evidence.find({ batchId }).sort({ evidenceId: 1 }),
  ]);
  if (!batch) throw Object.assign(new Error('Batch not found'), { status: 404 });

  const mismatchedEvidenceIds = [];
  for (const item of evidence) {
    try {
      const actualHash = sha256(await readArtifact(item.fileLocation));
      if (actualHash !== item.fileHash) mismatchedEvidenceIds.push(item.evidenceId);
    } catch (_error) {
      mismatchedEvidenceIds.push(item.evidenceId);
    }
  }
  const calculatedRoot = merkleRoot(evidence.map((item) => item.fileHash));
  return {
    allHashesMatch: mismatchedEvidenceIds.length === 0 && calculatedRoot === batch.evidenceRoot,
    mismatchedEvidenceIds,
  };
}

async function overwriteEvidenceForSimulation(evidenceId, replacement) {
  if (process.env.NODE_ENV === 'production') {
    throw Object.assign(new Error('Simulation tampering is disabled in production'), { status: 403 });
  }
  const EvidenceModel = require('../../models/Evidence');
  const { overwriteArtifact } = require('./storage');
  const evidence = await EvidenceModel.findOne({ evidenceId });
  if (!evidence) throw Object.assign(new Error('Evidence not found'), { status: 404 });
  const content = Buffer.isBuffer(replacement) ? replacement : Buffer.from(JSON.stringify(replacement));
  await overwriteArtifact(evidence.fileLocation, content);
  
  await EvidenceModel.updateOne({ evidenceId }, { $set: { data: replacement } });
  
  return evidence;
}

module.exports = { verifyIntegrity, overwriteEvidenceForSimulation };