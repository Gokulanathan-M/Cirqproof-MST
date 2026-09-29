const express = require('express');
const router = express.Router();
const SimulationRun = require('../models/SimulationRun');
const { pushSimulationEvents } = require('../services/simulation/adapter');
const { overwriteEvidenceForSimulation } = require('../services/evidence/integrity');
const fs = require('fs');
const path = require('path');
const Evidence = require('../models/Evidence');
const Batch = require('../models/Batch');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/generate', async (req, res, next) => {
  try {
    const { batchId, material, inputWeight, processedWeight, recoveredWeight, downstreamWeight, machineRuntime, energyUsed, scenario } = req.body;
    const normalizedScenario = String(scenario || '').toUpperCase();
    if (!['NORMAL', 'INCONSISTENT', 'TAMPERED'].includes(normalizedScenario)) {
      return res.status(400).json({ ok: false, error: 'Scenario must be NORMAL, INCONSISTENT, or TAMPERED' });
    }
    const numericValues = { inputWeight, processedWeight, recoveredWeight, downstreamWeight, machineRuntime, energyUsed };
    if (Object.values(numericValues).some((value) => !Number.isFinite(Number(value)) || Number(value) <= 0)) {
      return res.status(400).json({ ok: false, error: 'Simulation measurements must be positive numbers' });
    }
    const committedProcessedWeight = Number(processedWeight);
    const committedDownstreamWeight = Number(downstreamWeight);
    const simEvent = {
      batchId, timestamp: new Date().toISOString(),
      inputWeight: Number(inputWeight),
      processedWeight: committedProcessedWeight,
      recoveredWeight: Number(recoveredWeight),
      residueWeight: Number(inputWeight) - Number(recoveredWeight),
      downstreamWeight: committedDownstreamWeight,
      machineRuntime: Number(machineRuntime),
      energyUsed: Number(energyUsed),
      temperature: 42.1,
      status: 'COMPLETED',
      scenario: normalizedScenario,
    };
    
    // Create batch if not exists
    let batch = await Batch.findOne({ batchId });
    if (!batch) {
      batch = await Batch.create({ batchId, material, claim: { quantity: committedProcessedWeight, unit: 'kg' }, status: 'CREATED', creator: 'Simulator', recycler: 'Recycler-A', producer: 'Dell' });
    }
    
    await SimulationRun.create(simEvent);
    const ingested = await pushSimulationEvents(simEvent);
    
    res.json({ ok: true, data: { ingested } });
  } catch (error) {
    next(error);
  }
});

router.post('/events', async (req, res, next) => {
  try {
    const ingested = await pushSimulationEvents(req.body);
    res.json({ ok: true, data: { ingested } });
  } catch (error) {
    next(error);
  }
});

router.post('/tamper/:batchId', async (req, res, next) => {
  try {
    // TAMPERED mode - alter an existing evidence record without updating the hash
    const evidenceList = await Evidence.find({ batchId: req.params.batchId, type: 'processing_log' });
    if (!evidenceList.length) return res.status(404).json({ ok: false, error: 'Processing log evidence not found' });
    
    const targetEvidence = evidenceList[0];
    const tamperedWeight = Number(targetEvidence.data.outputWeight ?? targetEvidence.data.processedWeight) + 250;
    const tamperedData = {
      ...targetEvidence.data,
      processedWeight: tamperedWeight,
      outputWeight: tamperedWeight,
    };
    
    await overwriteEvidenceForSimulation(targetEvidence.evidenceId, tamperedData);
    res.json({ ok: true, message: 'Evidence tampered successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/scenarios', (req, res) => {
  const scenariosDir = path.join(__dirname, '../../shared/scenarios');
  const scenarios = fs.readdirSync(scenariosDir).filter(f => f.endsWith('.json')).map(file => require(path.join(scenariosDir, file)));
  res.json({ ok: true, data: { scenarios } });
});

router.get('/events/:batchId', async (req, res, next) => {
  try {
    const runs = await SimulationRun.find({ batchId: req.params.batchId });
    res.json({ ok: true, data: { runs } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
