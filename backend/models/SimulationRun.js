const mongoose = require('mongoose');
const simulationRunSchema = new mongoose.Schema({
  batchId: { type: String, required: true },
  scenario: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  inputWeight: { type: Number },
  processedWeight: { type: Number },
  recoveredWeight: { type: Number },
  residueWeight: { type: Number },
  downstreamWeight: { type: Number },
  machineRuntime: { type: Number },
  energyUsed: { type: Number },
  temperature: { type: Number },
  status: { type: String, default: 'COMPLETED' },
});
module.exports = mongoose.model('SimulationRun', simulationRunSchema);
