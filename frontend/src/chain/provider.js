import { ethers } from 'ethers';
import { config } from './config';

export const hasWallet = () => typeof window !== 'undefined' && Boolean(window.ethereum);

export const getWeb3Provider = () => {
  if (hasWallet()) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  if (config.rpcUrl) {
    return new ethers.JsonRpcProvider(config.rpcUrl);
  }
  throw new Error('No Ethereum wallet found');
};

