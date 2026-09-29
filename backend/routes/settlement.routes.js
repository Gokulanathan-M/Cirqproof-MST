const express = require('express');
const router = express.Router();
const Settlement = require('../models/Settlement');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const settlements = await Settlement.find().sort({ createdAt: -1 });
    return res.json({ ok: true, data: { settlements } });
  } catch (error) {
    return next(error);
  }
});

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
    if (!settlement) return res.status(404).json({ ok: false, error: 'Settlement deposit not found' });
    const Batch = require('../models/Batch');
    await Batch.findOneAndUpdate({ batchId }, { status: 'SETTLED' });
    res.json({ success: true, settlement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
