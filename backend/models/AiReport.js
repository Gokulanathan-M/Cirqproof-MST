const mongoose = require('mongoose');
const enums = require('../../shared/enums.json');

const aiReportSchema = new mongoose.Schema({
  batchId: { type: String, required: true, index: true },
  status: { type: String, enum: enums.aiResult, required: true },
  massBalanceResult: { type: mongoose.Schema.Types.Mixed, default: null },
  capacityResult: { type: mongoose.Schema.Types.Mixed, default: null },
  downstreamMatch: { type: mongoose.Schema.Types.Mixed, default: null },
  flags: [{ type: String, enum: enums.flagCodes }],
  missingEvidence: [{ type: String }],
  explanation: { type: String, default: '' },
  recommendation: { type: String, default: '' },
  result: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

module.exports = mongoose.models.AiReport || mongoose.model('AiReport', aiReportSchema);