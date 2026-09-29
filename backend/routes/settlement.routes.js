const express = require('express');
const router = express.Router();
const Settlement = require('../models/Settlement');

router.post('/deposit', async (req, res) => {
  try {
    const { batchId, amount, payer, txHash } = req.body;
    const settlement = new Settlement({ batchId, amount, payer, txHash, status: 'DEPOSITED' });
    await settlement.save();
    res.status(201).json({ success: true, settlement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/release', async (req, res) => {
  try {
    const { batchId, txHash } = req.body;
    const settlement = await Settlement.findOneAndUpdate(
      { batchId },
      { status: 'RELEASED', txHash },
      { new: true }
    );
    const Batch = require('../models/Batch');
    await Batch.findOneAndUpdate({ batchId }, { status: 'SETTLED' });
    res.json({ success: true, settlement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
