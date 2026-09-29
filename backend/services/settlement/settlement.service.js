const { getSettlementContract } = require('../blockchain/contracts');
const { sendTransaction } = require('../blockchain/transaction');

async function deposit(batchId, amount) {
  const settlement = getSettlementContract(true);
  return await sendTransaction(settlement.deposit, batchId, { value: amount });
}

async function release(batchId) {
  const settlement = getSettlementContract(true);
  return await sendTransaction(settlement.release, batchId);
}

async function hold(batchId) {
  const settlement = getSettlementContract(true);
  return await sendTransaction(settlement.hold, batchId);
}

async function refund(batchId) {
  const settlement = getSettlementContract(true);
  return await sendTransaction(settlement.refund, batchId);
}

module.exports = {
  deposit,
  release,
  hold,
  refund
};
