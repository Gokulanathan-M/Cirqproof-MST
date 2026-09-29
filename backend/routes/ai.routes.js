const express = require('express');
const Evidence = require('../models/Evidence');
const AiReport = require('../models/AiReport');
const batchService = require('../services/batch/batch.service');
const { reconcile } = require('../services/ai/aiClient');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function buildRules(result) {
  const rules = [];
  const mb = result.massBalanceResult;
  if (mb && mb.input !== null && mb.output !== null) {
    rules.push({
      ruleId: 'MASS_BALANCE',
      description: 'Processed quantity ≤ Input quantity',
      passed: mb.output <= mb.input,
      actual: mb.output,
      expected: `≤ ${mb.input}`,
    });
  }
  const dm = result.downstreamMatch;
  if (dm && dm.quantity !== null && mb && mb.output !== null) {
    rules.push({
      ruleId: 'DOWNSTREAM_MATCH',
      description: 'Downstream quantity ≤ Processed quantity',
      passed: dm.quantity <= mb.output,
      actual: dm.quantity,
      expected: `≤ ${mb.output}`,
    });
  }
  const flags = Array.isArray(result.flags) ? result.flags.map((f) => (typeof f === 'string' ? f : f?.code)).filter(Boolean) : [];
  const nonMissing = flags.filter((f) => f !== 'MISSING_EVIDENCE');
  if (nonMissing.length > 0) {
    nonMissing.forEach((flag) => {
      rules.push({
        ruleId: flag,
        description: flag.replace(/_/g, ' ').toLowerCase(),
        passed: false,
        actual: 'FLAGGED',
        expected: 'CLEAR',
      });
    });
  }
  return rules;
}

router.post('/reconcile', async (req, res, next) => {
  try {
    const batch = await batchService.getBatch(req.body.batchId);
    if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });
    const evidence = await Evidence.find({ batchId: batch.batchId }).sort({ timestamp: 1 });
    const result = await reconcile(batch.toObject(), evidence.map((item) => item.toObject()));
    // Normalize flags: AI service may return [{code, detail}] objects; model expects [String]
    const normalizedFlags = Array.isArray(result.flags)
      ? result.flags.map((f) => (typeof f === 'string' ? f : f?.code)).filter(Boolean)
      : [];
    // Normalize result shape: AI service returns flat fields; wrap into result sub-object for frontend
    const reportData = {
      batchId: batch.batchId,
      status: result.status,
      massBalanceResult: result.massBalanceResult ?? null,
      capacityResult: result.capacityResult ?? null,
      downstreamMatch: result.downstreamMatch ?? null,
      flags: normalizedFlags,
      missingEvidence: result.missingEvidence ?? [],
      explanation: result.explanation ?? '',
      recommendation: result.recommendation ?? '',
      result: {
        output: result.status,
        rules: buildRules(result),
        explanation: result.explanation ?? '',
      },
    };
    const report = await AiReport.create(reportData);
    batch.aiReport = report._id;
    batch.status = 'AI_ANALYZED';
    await batch.save();
    return res.json({ ok: true, data: { report } });
  } catch (error) {
    return next(error);
  }
});

router.get('/report/:batchId', async (req, res, next) => {
  try {
    const report = await batchService.getLatestAiReport(req.params.batchId);
    if (!report) return res.status(404).json({ ok: false, error: 'AI report not found' });
    return res.json({ ok: true, data: { report } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;