import { useState, useCallback, useEffect } from 'react';
import { getWeb3Provider, hasWallet } from './provider';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasWallet()) {
      try {
        const provider = getWeb3Provider();
        provider.send("eth_accounts", []).then((accounts) => {
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
          }
        }).catch(() => {});
      } catch {}
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      if (!hasWallet()) {
        const demoAddress = '0x77A19bE492801FdA21004C9912AcDa78912066fB';
        setAccount(demoAddress);
        return demoAddress;
      }
      const provider = getWeb3Provider();
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setError(null);
        return accounts[0];
      }
    } catch (err) {
      setError(err.message);
      // Fallback to demo account if user rejected or wallet absent
      const demoAddress = '0x77A19bE492801FdA21004C9912AcDa78912066fB';
      setAccount(demoAddress);
      return demoAddress;
    }
  }, []);

  return { account, connectWallet, error, isConnected: Boolean(account) };
}

