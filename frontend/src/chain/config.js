import testnetAddresses from '../../../shared/abi/addresses.testnet.json';

export const config = {
  registryAddress:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REGISTRY_ADDRESS) ||
    testnetAddresses.CirqProofRegistry ||
    '',
  settlementAddress:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SETTLEMENT_ADDRESS) ||
    testnetAddresses.CirqProofSettlement ||
    '',
  networkName: 'MST Testnet',
  chainId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHAIN_ID)
      ? parseInt(import.meta.env.VITE_CHAIN_ID, 10)
      : parseInt(testnetAddresses.chainId || '91562037', 10),
  rpcUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RPC_URL) || 'https://rpc.mst-testnet.io'
};

