const express = require('express');
const router = express.Router();
const Attestation = require('../models/Attestation');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    const { batchId, attestor, txHash } = req.body;
    const attestation = new Attestation({ batchId, attestor, txHash, status: 'VERIFIED' });
    await attestation.save();
    
    // Update Batch status to VERIFIED
    const Batch = require('../models/Batch');
    await Batch.findOneAndUpdate(
      { batchId, status: { $ne: 'SETTLED' } },
      { status: 'VERIFIED' },
    );
    
    res.status(201).json({ success: true, attestation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:batchId', async (req, res) => {
  try {
    const attestations = await Attestation.find({ batchId: req.params.batchId });
    res.json({ success: true, attestations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
