const { getRegistryContract } = require('./contracts');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendTransaction(contractMethod, ...args) {
  const MAX_RETRIES = 3;
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      const tx = await contractMethod(...args);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      attempt++;
      console.error(`Blockchain transaction failed on attempt ${attempt}:`, error.message);
      if (attempt >= MAX_RETRIES) {
        return {
          success: false,
          error: error.message
        };
      }
      await sleep(1000 * Math.pow(2, attempt)); // Exponential backoff
    }
  }
}

async function recordAiResultOnChain(batchId, aiResultHash) {
  const registry = getRegistryContract(true);
  return await sendTransaction(registry.recordAiResult, batchId, aiResultHash);
}

module.exports = {
  sendTransaction,
  recordAiResultOnChain
};
