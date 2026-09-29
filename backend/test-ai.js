require('dotenv').config();
const mongoose = require('mongoose');
const { reconcile } = require('./services/ai/aiClient');
const Batch = require('./models/Batch');
const Evidence = require('./models/Evidence');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cirqproof');
  console.log('Connected to DB');
  
  const batch = await Batch.findOne({ batchId: 'CP-RAND-1' });
  const evidence = await Evidence.find({ batchId: 'CP-RAND-1' });
  
  console.log('Sending to AI Service...');
  const result = await reconcile(batch.toObject(), evidence.map(e => e.toObject()));
  console.log('AI Response:', JSON.stringify(result, null, 2));
  
  process.exit(0);
}

run().catch(console.error);
