import React, { useEffect, useState } from "react";
import { blockchainApi } from "../api/blockchain";
import { BlockchainConfig } from "../types";
import { Link as LinkIcon, Cpu, Globe, Key } from "lucide-react";

export function Blockchain() {
  const [config, setConfig] = useState<BlockchainConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blockchainApi.getConfig()
      .then(res => {
        if (res.ok) setConfig(res.data.config);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white p-8">Loading Blockchain Config...</div>;
  if (!config) return <div className="text-white p-8">Unable to load blockchain configuration.</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#ffffff0a] rounded-lg border border-[#ffffff1a]">
          <LinkIcon className="text-[#8b92a5]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MST Network</h1>
          <p className="text-[#8b92a5] text-sm">Blockchain configuration and smart contract infrastructure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-[#00B8D4]" size={20} />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Network Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-[#8b92a5] uppercase tracking-wider mb-1">RPC URL</div>
              <div className="font-mono text-sm text-white bg-[#121419] p-2 rounded border border-[#ffffff0a]">{config.rpcUrl}</div>
            </div>
            <div>
              <div className="text-xs text-[#8b92a5] uppercase tracking-wider mb-1">Chain ID</div>
              <div className="font-mono text-sm text-white bg-[#121419] p-2 rounded border border-[#ffffff0a]">{config.chainId}</div>
            </div>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="text-[#00E676]" size={20} />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Smart Contracts</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-[#8b92a5] uppercase tracking-wider mb-1">Registry Contract</div>
              <div className="font-mono text-sm text-[#00E676] bg-[#00e6760a] p-2 rounded border border-[#00e6761a] truncate">{config.registryAddress}</div>
            </div>
            <div>
              <div className="text-xs text-[#8b92a5] uppercase tracking-wider mb-1">Settlement Contract</div>
              <div className="font-mono text-sm text-[#00E676] bg-[#00e6760a] p-2 rounded border border-[#00e6761a] truncate">{config.settlementAddress}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-glass p-6 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <Key className="text-[#FFB300]" size={20} />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Security Notice</h2>
          </div>
          <p className="text-[#8b92a5] text-sm leading-relaxed">
            For security, the Deployer Private Key is intentionally isolated in the backend service. The frontend never signs raw transactions directly. All interactions flow through the canonical P2 backend anchoring controller.
          </p>
      </div>
    </div>
  );
}
