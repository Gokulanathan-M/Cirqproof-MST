import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertOctagon, Check, CheckCircle2, ShieldCheck, Activity, Server, ArrowRight, CircleDashed } from "lucide-react";
import { batchesApi } from "../api/batches";
import { evidenceApi } from "../api/evidence";
import { aiApi } from "../api/ai";
import { blockchainApi } from "../api/blockchain";
import { attestationApi } from "../api/attestation";
import { Batch, Evidence, AiReport } from "../types";

export function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [aiReport, setAiReport] = useState<AiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [integrityStatus, setIntegrityStatus] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const [batchRes, evRes, integrityRes, aiRes] = await Promise.all([
          batchesApi.getBatch(id),
          evidenceApi.getEvidence(id),
          evidenceApi.checkIntegrity(id).catch(() => ({ data: { verified: false } })),
          aiApi.getReport(id).catch(() => ({ data: null })),
        ]);

        if (batchRes.ok) setBatch(batchRes.data.batch);
        if (evRes.ok) setEvidence(evRes.data.evidence);
        setIntegrityStatus(integrityRes.data);
        if (aiRes?.data?.report) setAiReport(aiRes.data.report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleVerify = async () => {
    if (!batch) return;
    setActionLoading(true);
    try {
      const anchorRes = await blockchainApi.anchor({ action: "submitAttestation", batchId: batch.batchId });
      if (!anchorRes.success) throw new Error("Blockchain anchor failed");
      const verifyRes = await blockchainApi.anchor({ action: "verifyAttestation", batchId: batch.batchId });
      if (!verifyRes.success) throw new Error("Attestation verification failed");
      await attestationApi.create({ batchId: batch.batchId, attestor: "Human Reviewer", txHash: anchorRes.txHash });
      const updated = await batchesApi.getBatch(batch.batchId);
      setBatch(updated.data.batch);
    } catch (err) {
      console.error(err);
      alert("Verification failed: " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAiReconcile = async () => {
    if (!batch) return;
    setActionLoading(true);
    try {
      const res = await aiApi.reconcile({ batchId: batch.batchId });
      if (res.ok) {
        setAiReport(res.data.report);
        const updated = await batchesApi.getBatch(batch.batchId);
        setBatch(updated.data.batch);
      }
    } catch (err) {
      alert("Reconciliation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!batch) return;
    setActionLoading(true);
    try {
      const { settlementApi } = await import("../api/settlement");
      const anchorRes = await blockchainApi.anchor({
        action: "deposit",
        batchId: batch.batchId,
        data: { amount: 5000 },
      });
      if (!anchorRes.success) throw new Error("Deposit anchor failed");
      await settlementApi.deposit({ batchId: batch.batchId, amount: 5000, payer: "Dell", txHash: anchorRes.txHash });
      alert("Deposit successful!");
    } catch (err) {
      alert("Deposit failed: " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!batch) return;
    setActionLoading(true);
    try {
      const { settlementApi } = await import("../api/settlement");
      const anchorRes = await blockchainApi.anchor({ action: "release", batchId: batch.batchId });
      if (!anchorRes.success) throw new Error("Release anchor failed");
      await settlementApi.release({ batchId: batch.batchId, txHash: anchorRes.txHash });
      const updated = await batchesApi.getBatch(batch.batchId);
      setBatch(updated.data.batch);
      setBatch((current) => current ? { ...current, status: "SETTLED" } : current);
      alert("Settlement released!");
    } catch (err) {
      alert("Release failed: " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading Batch {id}...</div>;
  if (!batch) return <div className="p-8 text-white">Batch not found</div>;

  const isTampered = integrityStatus && !integrityStatus.verified;
  const getHashLabel = (hash: unknown) => {
    const value = typeof hash === "string" ? hash : "";
    return value ? `${value.slice(0, 18)}…` : "N/A";
  };
  const getTypeLabel = (value: string | undefined) => (value ? value.replace("_", " ") : "Record");
  const getEvidenceMetric = (type: string, keys: string[], fallback: number) => {
    const record = evidence.find((entry) => entry.type === type);
    const value = keys.map((key) => record?.data?.[key]).find((candidate) => Number.isFinite(Number(candidate)));
    return value === undefined ? fallback : Number(value);
  };
  const inputWeight = getEvidenceMetric("weighbridge", ["weight", "inputWeight"], batch.claim.quantity);
  const processedWeight = getEvidenceMetric("processing_log", ["outputWeight", "processedWeight"], batch.claim.quantity);
  const recoveredWeight = getEvidenceMetric("output_record", ["recoveredWeight", "quantity", "weight"], batch.claim.quantity);
  const settlementValue = batch.status === "SETTLED" ? "$5,000" : "$0";

  const normalizedAiReport = (() => {
    const nested = (aiReport as any)?.result ?? {};
    const flat = (aiReport as any) ?? {};
    const flatFlags = Array.isArray(flat.flags) ? flat.flags : [];
    const rules = Array.isArray(nested.rules) && nested.rules.length > 0
      ? nested.rules
      : flatFlags.map((flag: string, index: number) => ({
          ruleId: flag,
          description: flag.replace(/_/g, " ").toLowerCase(),
          passed: flat.status !== "FLAGGED",
          actual: flat.status ?? "REVIEW",
          expected: "CLEAR",
          index,
        }));

    return {
      rules,
      output: nested.output ?? nested.status ?? flat.output ?? flat.status ?? "REVIEW",
      explanation: nested.explanation ?? flat.explanation ?? "AI reconciliation completed without an explanation payload.",
    };
  })();

  const aiRules = Array.isArray(normalizedAiReport.rules) ? normalizedAiReport.rules : [];
  const aiOutput = String(normalizedAiReport.output ?? "REVIEW").toUpperCase();
  const stages = [
    { label: "Evidence", state: evidence.length > 0 ? "verified" : "pending" },
    { label: "Reconciliation", state: aiReport ? (aiOutput === "CONSISTENT" ? "verified" : "review") : "pending" },
    { label: "Human Verification", state: batch.status === "VERIFIED" || batch.status === "SETTLED" ? "verified" : "pending" },
    { label: "MST Attestation", state: batch.status === "VERIFIED" || batch.status === "SETTLED" ? "verified" : "pending" },
    { label: "Settlement", state: batch.status === "SETTLED" ? "verified" : "pending" },
  ];

  return (
    <div className="animate-fade-in mx-auto max-w-6xl space-y-6 pb-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">Digital proof dossier</div>
            <span
              className={`badge ${
                batch.status === "VERIFIED" || batch.status === "SETTLED"
                  ? "badge-success"
                  : batch.status === "CHALLENGED"
                    ? "badge-error"
                    : "badge-warning"
              }`}
            >
              {batch.status.replace("_", " ")}
            </span>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">{batch.batchId}</h1>
          <div className="mt-2 text-sm text-slate-400">Created on {new Date(batch.createdAt).toLocaleString()}</div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleAiReconcile} disabled={actionLoading} className="btn-secondary text-[10px]">
            Reconcile
          </button>
          <button onClick={handleVerify} disabled={actionLoading || !aiReport} className="btn-primary text-[10px]">
            Sign Attestation
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-glass p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Input</div>
          <div className="mt-3 text-2xl font-bold text-white">{inputWeight.toLocaleString()} kg</div>
          <div className="mt-2 text-xs text-slate-400">Weighbridge record</div>
        </div>
        <div className="card-glass p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Processed</div>
          <div className="mt-3 text-2xl font-bold text-white">{processedWeight.toLocaleString()} kg</div>
          <div className="mt-2 text-xs text-slate-400">Operations output</div>
        </div>
        <div className="card-glass p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Recovered</div>
          <div className="mt-3 text-2xl font-bold text-white">{recoveredWeight.toLocaleString()} kg</div>
          <div className="mt-2 text-xs text-slate-400">Material recovery</div>
        </div>
        <div className="card-glass p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Settlement</div>
          <div className="mt-3 text-2xl font-bold text-white">{settlementValue}</div>
          <div className="mt-2 text-xs text-slate-400">Escrow status</div>
        </div>
      </div>

      <div className="card-glass p-5">
        <div className="mb-5 text-[10px] uppercase tracking-[0.24em] text-slate-400">Verification timeline</div>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.label} className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/80">
                {stage.state === "verified" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                ) : stage.state === "review" ? (
                  <AlertOctagon className="h-4 w-4 text-amber-300" />
                ) : (
                  <CircleDashed className="h-4 w-4 text-slate-500" />
                )}
              </div>
              <div className="flex-1 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-slate-200">{stage.label}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{stage.state}</div>
                </div>
              </div>
              {index < stages.length - 1 ? <ArrowRight className="text-slate-500" size={16} /> : null}
            </div>
          ))}
        </div>
      </div>

      {aiReport && (
        <div className="card-glass">
          <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
            <div className="flex items-center gap-3">
              <Activity className="text-cyan-300" size={18} />
              <h2 className="text-lg font-semibold text-white">AI explanation</h2>
            </div>
          </div>
          <div className="space-y-5 p-5">
            <div className="space-y-2">
              {aiRules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
                  No reconciliation rules were returned for this batch.
                </div>
              ) : (
                aiRules.map((rule, infoIndex) => (
                  <div key={infoIndex} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    <div className="flex items-start gap-3">
                      {rule.passed ? <Check className="mt-0.5 text-emerald-300" size={16} /> : <AlertOctagon className="mt-0.5 text-amber-300" size={16} />}
                      <div>
                        <div className="text-sm font-medium text-slate-100">{rule.description}</div>
                        <div className="mt-1 text-xs text-slate-400">Actual: {String(rule.actual)} / Expected: {String(rule.expected)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-4 text-sm leading-7 text-slate-200">
              {normalizedAiReport.explanation || "AI reconciliation completed without an explanation payload."}
            </div>
          </div>
        </div>
      )}

      <div className="card-glass overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-3">
            <Server className="text-cyan-300" size={18} />
            <h2 className="text-lg font-semibold text-white">Evidence ledger</h2>
          </div>
          {isTampered ? <span className="badge badge-error">Tamper detected</span> : <span className="badge badge-success">Integrity verified</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/40 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {evidence.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">No evidence records found</td>
                </tr>
              ) : (
                evidence.map((entry) => (
                  <tr key={entry.evidenceId} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4 text-slate-100 capitalize">{getTypeLabel(entry.type)}</td>
                    <td className="px-5 py-4 text-slate-300">{entry.source || "System"}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-cyan-300">{getHashLabel(entry.hash)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-glass p-5">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="text-emerald-300" size={18} />
            <h3 className="text-lg font-semibold text-white">Settlement controls</h3>
          </div>
          <div className="space-y-3">
            <button onClick={handleDeposit} disabled={actionLoading} className="btn-secondary w-full">Deposit escrow</button>
            <button onClick={handleRelease} disabled={actionLoading} className="btn-primary w-full">Release funds</button>
          </div>
        </div>

        <div className="card-glass p-5">
          <div className="mb-4 flex items-center gap-3">
            <AlertOctagon className="text-amber-300" size={18} />
            <h3 className="text-lg font-semibold text-white">Dispute controls</h3>
          </div>
          <button
            onClick={async () => {
              setActionLoading(true);
              try {
                const { challengeApi } = await import("../api/challenge");
                const anchorRes = await blockchainApi.anchor({ action: "challengeAttestation", batchId: batch.batchId });
                if (!anchorRes.success) throw new Error("Challenge anchor failed");
                await challengeApi.create({ batchId: batch.batchId, challenger: "Auditor", reason: "Manual dispute", txHash: anchorRes.txHash });
                alert("Challenge recorded");
                const updated = await batchesApi.getBatch(batch.batchId);
                setBatch(updated.data.batch);
              } catch (e: any) {
                alert("Challenge failed: " + e.message);
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading || batch.status === "SETTLED"}
            className="btn-secondary w-full text-amber-300"
          >
            Raise challenge
          </button>
        </div>
      </div>
    </div>
  );
}
