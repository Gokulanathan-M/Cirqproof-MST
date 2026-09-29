const DEFAULT_EXPLORER_BASE = "https://testnet.mstscan.com";

function baseUrl(value?: string) {
  const base = (value || DEFAULT_EXPLORER_BASE).trim().replace(/\/+$/, "");
  return /^https:\/\/testnet\.mstscan\.com$/i.test(base) ? base : null;
}

export function getAddressExplorerUrl(address: string | null | undefined, explorerBase?: string) {
  const value = address?.trim() || "";
  const base = baseUrl(explorerBase);
  return base && /^0x[0-9a-fA-F]{40}$/.test(value) ? `${base}/address/${value}` : null;
}

export function getTransactionExplorerUrl(txHash: string | null | undefined, explorerBase?: string) {
  const value = txHash?.trim() || "";
  const base = baseUrl(explorerBase);
  return base && /^0x[0-9a-fA-F]{64}$/.test(value) ? `${base}/tx/${value}` : null;
}
