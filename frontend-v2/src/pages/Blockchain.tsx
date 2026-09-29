import React, { useEffect, useState } from "react";
import { Activity, ArrowUpRight, CheckCircle2, CircleDashed, Cpu, ExternalLink, FileKey2, Globe, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { batchesApi } from "../api/batches";
import { blockchainApi } from "../api/blockchain";
import { BlockchainConfig, BlockchainLifecycle } from "../types";
import { getAddressExplorerUrl, getTransactionExplorerUrl } from "../utils/explorer";

      function shorten(value: string | null) {
        if (!value) return "Not recorded";
        return `${value.slice(0, 12)}…${value.slice(-8)}`;
      }

      function ProofValue({ value, href }: { value: string | null; href?: string | null }) {
        if (!value) return <span className="text-slate-500">Not recorded</span>;
        return href ? (
          <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs text-cyan-300 hover:text-cyan-200">
            {shorten(value)} <ExternalLink size={13} />
          </a>
        ) : <span className="font-mono text-xs text-slate-200">{shorten(value)}</span>;
      }

    export function Blockchain() {
        const [config, setConfig] = useState<BlockchainConfig | null>(null);
        const [batchIds, setBatchIds] = useState<string[]>([]);
        const [selectedBatchId, setSelectedBatchId] = useState("");
        const [lifecycle, setLifecycle] = useState<BlockchainLifecycle | null>(null);
        const [loading, setLoading] = useState(true);
        const [lifecycleLoading, setLifecycleLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
          Promise.all([blockchainApi.getConfig(), batchesApi.getBatches(1, 100)])
            .then(([configRes, batchRes]) => {
              if (!configRes.ok) throw new Error(configRes.error || "Blockchain configuration unavailable");
              const ids = (batchRes.data?.batches ?? []).map((batch: { batchId: string }) => batch.batchId);
              setConfig(configRes.data.config);
              setBatchIds(ids);
              setSelectedBatchId(ids[0] || "");
            })
            .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load blockchain data"))
            .finally(() => setLoading(false));
        }, []);

        useEffect(() => {
          if (!selectedBatchId) return;
          setLifecycle(null);
          setLifecycleLoading(true);
          setError(null);
          blockchainApi.getLifecycle(selectedBatchId)
            .then((res) => {
              if (!res.ok) throw new Error(res.error || "Lifecycle unavailable");
              setLifecycle(res.data);
            })
            .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load batch lifecycle"))
            .finally(() => setLifecycleLoading(false));
        }, [selectedBatchId]);

        if (loading) return <div className="p-8 text-white">Loading blockchain audit…</div>;
        if (error && !config) return <div className="p-8 text-rose-300">{error}</div>;
        if (!config) return <div className="p-8 text-slate-400">Blockchain configuration unavailable.</div>;

        const explorer = config.explorerUrl || "https://testnet.mstscan.com";
        const registryUrl = getAddressExplorerUrl(config.registryAddress, explorer);
        const settlementUrl = getAddressExplorerUrl(config.settlementAddress, explorer);

        return (
          <div className="animate-fade-in mx-auto max-w-6xl space-y-6 pb-16">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-cyan-300"><span className="live-indicator" /> Chain audit</div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Blockchain Proofs</h1>
                <p className="mt-2 text-sm text-slate-400">Transaction evidence and lifecycle history for every batch.</p>
              </div>
              <select value={selectedBatchId} onChange={(event) => setSelectedBatchId(event.target.value)} className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-xs text-white outline-none focus:border-cyan-300/50">
                {batchIds.length === 0 ? <option value="">No batches available</option> : batchIds.map((batchId) => <option key={batchId} value={batchId}>{batchId}</option>)}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="card-glass p-5"><div className="flex items-center gap-3 text-cyan-300"><Globe size={18} /><span className="text-[10px] uppercase tracking-[0.2em]">Network</span></div><div className="mt-4 font-mono text-sm text-white">{config.network || "MST testnet"}</div><div className="mt-2 text-xs text-slate-400">Chain ID {config.chainId}</div></div>
              <div className="card-glass p-5"><div className="flex items-center gap-3 text-emerald-300"><Cpu size={18} /><span className="text-[10px] uppercase tracking-[0.2em]">Registry</span></div><div className="mt-4 font-mono text-xs text-slate-200">{config.registryAddress}</div>{registryUrl ? <a href={registryUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-300">Open explorer <ArrowUpRight size={13} /></a> : <div className="mt-2 text-xs text-slate-500">Explorer unavailable</div>}</div>
              <div className="card-glass p-5"><div className="flex items-center gap-3 text-amber-300"><LinkIcon size={18} /><span className="text-[10px] uppercase tracking-[0.2em]">Settlement</span></div><div className="mt-4 font-mono text-xs text-slate-200">{config.settlementAddress}</div>{settlementUrl ? <a href={settlementUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-300">Open explorer <ArrowUpRight size={13} /></a> : <div className="mt-2 text-xs text-slate-500">Explorer unavailable</div>}</div>
            </div>

            {error && <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
            {lifecycleLoading ? <div className="card-glass p-8 text-center text-sm text-slate-400">Loading on-chain lifecycle for {selectedBatchId}…</div> : lifecycle && <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="card-glass p-5"><div className="flex items-center gap-3 text-cyan-300"><FileKey2 size={18} /><span className="text-[10px] uppercase tracking-[0.2em]">Evidence root</span></div><div className="mt-4"><ProofValue value={lifecycle.evidenceRoot} /></div></div>
                <div className="card-glass p-5"><div className="flex items-center gap-3 text-violet-300"><ShieldCheck size={18} /><span className="text-[10px] uppercase tracking-[0.2em]">Attestation proof</span></div><div className="mt-4"><ProofValue value={lifecycle.attestation.txHash} href={getTransactionExplorerUrl(lifecycle.attestation.txHash, explorer)} /></div><div className="mt-2 text-xs text-slate-400">{lifecycle.attestation.status}</div></div>
                <div className="card-glass p-5"><div className="flex items-center gap-3 text-emerald-300"><Activity size={18} /><span className="text-[10px] uppercase tracking-[0.2em]">{lifecycle.settlement.status === "RELEASED" ? "Release transaction" : lifecycle.settlement.status === "DEPOSITED" ? "Deposit transaction" : "Settlement"}</span></div><div className="mt-4"><ProofValue value={lifecycle.settlement.txHash} href={getTransactionExplorerUrl(lifecycle.settlement.txHash, explorer)} /></div><div className="mt-2 text-xs text-slate-400">{lifecycle.settlement.status === "RELEASED" ? "RELEASED" : lifecycle.settlement.status === "DEPOSITED" ? "DEPOSITED — awaiting release" : "PENDING"}</div></div>
              </div>

              <div className="card-glass p-5">
                <div className="mb-6 flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Batch: {lifecycle.batchId}</div><h2 className="mt-1 text-xl font-semibold text-white">Batch → Blockchain lifecycle</h2></div><span className="badge badge-success">{lifecycle.status.replace("_", " ")}</span></div>
                <div className="space-y-4">
                  {lifecycle.lifecycle.map((step, index) => <div key={`${step.action}-${index}`} className="flex gap-4"><div className="flex flex-col items-center">{step.txHash ? <CheckCircle2 className="mt-1 text-emerald-300" size={18} /> : <CircleDashed className="mt-1 text-slate-500" size={18} />}{index < lifecycle.lifecycle.length - 1 && <div className="mt-2 h-full w-px bg-white/10" />}</div><div className="min-w-0 flex-1 pb-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="font-semibold text-slate-100">{step.state}</div><span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{step.action}</span></div><div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">{step.detail && <span>{step.action === "COMMIT EVIDENCE" ? "Evidence root: " : step.action === "RECORD AI RESULT" ? "Report hash: " : "Proof: "}<span className="font-mono text-slate-300">{shorten(String(step.detail))}</span></span>}<span>TX: <ProofValue value={step.txHash} href={getTransactionExplorerUrl(step.txHash, explorer)} /></span></div></div></div>)}
                </div>
              </div>
            </>}
          </div>
        );
      }

