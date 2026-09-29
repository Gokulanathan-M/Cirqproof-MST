import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertOctagon, Check, CheckCircle2, ShieldCheck, Activity, Server,
  CircleDashed, Loader2, Cpu, Brain, User, Link2,
} from "lucide-react";
import { batchesApi } from "../api/batches";
import { evidenceApi } from "../api/evidence";
import { aiApi } from "../api/ai";
import { blockchainApi } from "../api/blockchain";
import { attestationApi } from "../api/attestation";
import { Batch, Evidence, AiReport } from "../types";

function getHashLabel(hash: unknown) {
  const v = typeof hash === "string" ? hash : "";
  return v ? `${v.slice(0, 18)}…` : "N/A";
}

function normalizeReport(aiReport: AiReport | null) {
  if (!aiReport) return null;
  const nested = (aiReport as any).result ?? {};
  const flat = aiReport as any;
  const flatFlags: string[] = Array.isArray(flat.flags) ? flat.flags : [];
  const rules = Array.isArray(nested.rules) && nested.rules.length > 0
    ? nested.rules
    : flatFlags.map((flag: string, i: number) => ({
        ruleId: flag, description: flag.replace(/_/g, " ").toLowerCase(),
        passed: flat.status !== "FLAGGED", actual: flat.status ?? "REVIEW", expected: "CLEAR", index: i,
      }));
  return {
    rules,
    output: String(nested.output ?? nested.status ?? flat.output ?? flat.status ?? "REVIEW").toUpperCase(),
    explanation: nested.explanation ?? flat.explanation ?? "AI reconciliation completed without an explanation payload.",
  };
}

export function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [aiReport, setAiReport] = useState<AiReport | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [aiAnimating, setAiAnimating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [batchRes, evRes, integrityRes, aiRes] = await Promise.all([
          batchesApi.getBatch(id),
          evidenceApi.getEvidence(id),
          evidenceApi.checkIntegrity(id).catch(() => ({ data: { allHashesMatch: null } })),
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
    load();
  }, [id]);

  const handleAiReconcile = async () => {
    if (!batch) return;
    setActionLoading(true);
    setAiAnimating(true);
    try {
      const res = await aiApi.reconcile({ batchId: batch.batchId });
      if (res.ok) {
        setAiReport(res.data.report);
        const updated = await batchesApi.getBatch(batch.batchId);
        setBatch(updated.data.batch);
      }
    } catch {
      alert("Reconciliation failed");
    } finally {
      setActionLoading(false);
      setAiAnimating(false);
    }
  };

  const handleVerify = async () => {
    if (!batch) return;
    setActionLoading(true);
    try {
      const anchorRes = await blockchainApi.anchor({ action: "submitAttestation", batchId: batch.batchId });
      if (!anchorRes.success) throw new Error("Blockchain anchor failed");
      await blockchainApi.anchor({ action: "verifyAttestation", batchId: batch.batchId });
      await attestationApi.create({ batchId: batch.batchId, attestor: "Human Reviewer", txHash: anchorRes.txHash });
      const updated = await batchesApi.getBatch(batch.batchId);
      setBatch(updated.data.batch);
    } catch (err) {
      alert("Verification failed: " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!batch) return;
    setActionLoading(true);
    try {
      const { settlementApi } = await import("../api/settlement");
      const anchorRes = await blockchainApi.anchor({ action: "deposit", batchId: batch.batchId, data: { amount: 5000 } });
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
    } catch (err) {
      alert("Release failed: " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading Batch {id}…</div>;
  if (!batch) return <div className="p-8 text-white">Batch not found</div>;

  const isTampered = integrityStatus?.allHashesMatch === false;
  const integrityUnavailable = integrityStatus?.allHashesMatch == null;

  const getEvidenceMetric = (type: string, keys: string[], fallback: number) => {
    const record = evidence.find((e) => e.type === type);
    const value = keys.map((k) => record?.data?.[k]).find((v) => Number.isFinite(Number(v)));
    return value === undefined ? fallback : Number(value);
  };
  const inputWeight = getEvidenceMetric("weighbridge", ["weight", "inputWeight"], batch.claim.quantity);
  const processedWeight = getEvidenceMetric("processing_log", ["outputWeight", "processedWeight"], batch.claim.quantity);
  const recoveredWeight = getEvidenceMetric("output_record", ["recoveredWeight", "quantity", "weight"], batch.claim.quantity);

  const norm = normalizeReport(aiReport);
  const aiOutput = norm?.output ?? null;

  const stages = [
    { label: "Evidence Records", state: evidence.length > 0 ? "verified" : "pending", detail: `${evidence.length} records` },
    { label: "Evidence Integrity", state: isTampered ? "error" : integrityUnavailable ? "pending" : "verified", detail: isTampered ? "✕ TAMPERED" : integrityUnavailable ? "NOT CHECKED" : "✓ VERIFIED" },
    { label: "AI Reconciliation", state: isTampered ? "error" : aiReport ? (aiOutput === "CONSISTENT" ? "verified" : "review") : "pending", detail: isTampered ? "🔒 NOT TRUSTED" : aiOutput === "CONSISTENT" ? "✓ CONSISTENT" : aiOutput === "FLAGGED" ? "⚠ FLAGGED" : "Not run" },
    { label: "Human Attestation", state: isTampered || aiOutput === "FLAGGED" ? "error" : batch.status === "VERIFIED" || batch.status === "SETTLED" ? "verified" : batch.status === "CREATED" && !isTampered && aiOutput === "CONSISTENT" ? "pending" : "pending", detail: isTampered || aiOutput === "FLAGGED" ? "✕ BLOCKED" : batch.status === "VERIFIED" || batch.status === "SETTLED" ? "VERIFIED" : "READY" },
    { label: "MST Attestation", state: isTampered || aiOutput === "FLAGGED" ? "error" : batch.chainRefs?.txHash ? "verified" : "pending", detail: isTampered || aiOutput === "FLAGGED" ? "✕ BLOCKED" : batch.chainRefs?.txHash ? getHashLabel(batch.chainRefs.txHash) : "PENDING" },
    { label: "Settlement", state: isTampered || aiOutput === "FLAGGED" ? "error" : batch.status === "SETTLED" ? "verified" : "pending", detail: isTampered || aiOutput === "FLAGGED" ? "✕ BLOCKED" : batch.status === "SETTLED" ? "Released" : "Awaiting" },
  ];

  return (
    <div className="animate-fade-in mx-auto max-w-6xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">Digital proof dossier</div>
            <span className={`badge ${batch.status === "VERIFIED" || batch.status === "SETTLED" ? "badge-success" : batch.status === "CHALLENGED" ? "badge-error" : "badge-warning"}`}>
              {batch.status.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-tight text-white">{batch.batchId}</h1>
          <div className="mt-2 text-sm text-slate-400">{batch.material} · Created {new Date(batch.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAiReconcile} disabled={actionLoading} className="btn-secondary text-xs">
            {aiAnimating ? <><Loader2 size={13} className="animate-spin mr-1" />Reconciling…</> : "Reconcile"}
          </button>
          <button onClick={handleVerify} disabled={actionLoading || !aiReport || isTampered || integrityUnavailable || aiOutput !== "CONSISTENT" || batch.status === "CHALLENGED" || batch.status === "VERIFIED" || batch.status === "SETTLED"} className="btn-primary text-xs">
            Sign Attestation
          </button>
        </div>
      </div>

      {/* Mass balance metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Input", value: `${inputWeight.toLocaleString()} kg`, sub: "Weighbridge record" },
          { label: "Processed", value: `${processedWeight.toLocaleString()} kg`, sub: "Operations output" },
          { label: "Recovered", value: `${recoveredWeight.toLocaleString()} kg`, sub: "Material recovery" },
          { label: "Status", value: batch.status.replace(/_/g, " "), sub: "Batch lifecycle" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card-glass p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</div>
            <div className="mt-3 text-xl font-bold text-white">{value}</div>
            <div className="mt-2 text-xs text-slate-400">{sub}</div>
          </div>
        ))}
      </div>

      {/* Verification timeline */}
      <div className="card-glass p-5">
        <div className="mb-5 text-[10px] uppercase tracking-[0.24em] text-slate-400">Verification timeline</div>
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07 }}
              className="flex items-center gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 shrink-0">
                {stage.state === "verified" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> :
                  stage.state === "error" ? <AlertOctagon className="h-4 w-4 text-red-400" /> :
                  stage.state === "review" ? <AlertOctagon className="h-4 w-4 text-amber-300" /> :
                  <CircleDashed className="h-4 w-4 text-slate-500" />}
              </div>
              <div className="flex-1 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-slate-200">{stage.label}</div>
                  <div className="text-[10px] font-mono text-slate-400">{stage.detail}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Reconciliation panel */}
      <AnimatePresence>
        {aiAnimating && !aiReport && (
          <motion.div key="ai-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card-glass p-6 space-y-3">
            <div className="flex items-center gap-3 text-cyan-300">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-semibold">Reconciliation engine running…</span>
            </div>
            {["Loading evidence", "Normalizing measurements", "Running deterministic rules", "Generating AI explanation"].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 size={12} className="animate-spin text-cyan-400" />
                {s}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {norm && (
        <motion.div key="ai-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-glass">
          <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4 flex items-center gap-3">
            <Activity className="text-cyan-300" size={18} />
            <h2 className="text-lg font-semibold text-white">AI Reconciliation</h2>
            <span className={`badge ml-auto ${aiOutput === "CONSISTENT" ? "badge-success" : "badge-error"}`}>{aiOutput}</span>
          </div>
          <div className="p-5 grid md:grid-cols-2 gap-5">
            {/* Deterministic rules */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={14} className="text-slate-400" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Deterministic rule engine</span>
              </div>
              <div className="space-y-2">
                {norm.rules.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">No rule results returned.</div>
                ) : (
                  norm.rules.map((rule: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                      {rule.passed
                        ? <Check className="mt-0.5 text-emerald-300 shrink-0" size={14} />
                        : <AlertOctagon className="mt-0.5 text-amber-300 shrink-0" size={14} />}
                      <div>
                        <div className="text-sm text-slate-100">{rule.description}</div>
                        <div className="mt-0.5 text-xs text-slate-500">Actual: {String(rule.actual)} / Expected: {String(rule.expected)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI explanation */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} className="text-cyan-400" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">AI explanation</span>
              </div>
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-4 text-sm leading-7 text-slate-200">
                {norm.explanation}
              </div>
              {aiOutput !== "CONSISTENT" && (
                <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-300">
                  This indicates an evidence inconsistency requiring human review. It is not by itself proof of fraud.
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                <User size={11} />
                <span>Human verification required before MST attestation</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Evidence ledger */}
      <div className="card-glass overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-3">
            <Server className="text-cyan-300" size={18} />
            <h2 className="text-lg font-semibold text-white">Evidence ledger</h2>
          </div>
          {isTampered
            ? <span className="badge badge-error">Tamper detected</span>
            : integrityUnavailable
              ? <span className="badge badge-neutral">Integrity not checked</span>
              : <span className="badge badge-success">Integrity valid</span>}
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
                <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">No evidence records found</td></tr>
              ) : (
                evidence.map((entry) => (
                  <tr key={entry.evidenceId} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4 text-slate-100 capitalize">{entry.type?.replace(/_/g, " ") ?? "Record"}</td>
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

      {/* Settlement + Dispute controls */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-glass p-5">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="text-emerald-300" size={18} />
            <h3 className="text-lg font-semibold text-white">Settlement</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Deposit locks escrow on-chain. Release transfers funds after verification. Both operations submit real MST transactions.
          </p>
          <div className="space-y-3">
            <button onClick={handleDeposit} disabled={actionLoading} className="btn-secondary w-full text-sm">
              Deposit escrow ($5,000)
            </button>
            <button onClick={handleRelease} disabled={actionLoading || !["VERIFIED", "RESOLVED", "SETTLED"].includes(batch.status)} className="btn-primary w-full text-sm">
              Release funds
            </button>
          </div>
        </div>

        <div className="card-glass p-5">
          <div className="mb-4 flex items-center gap-3">
            <AlertOctagon className="text-amber-300" size={18} />
            <h3 className="text-lg font-semibold text-white">Dispute</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Raises a challenge on-chain. Resolution requires manual review — no automated resolution endpoint is exposed by the current backend.
          </p>
          <button
            onClick={async () => {
              setActionLoading(true);
              try {
                const { challengeApi } = await import("../api/challenge");
                const anchorRes = await blockchainApi.anchor({ action: "challengeAttestation", batchId: batch.batchId });
                if (!anchorRes.success) throw new Error("Challenge anchor failed");
                await challengeApi.create({ batchId: batch.batchId, challenger: "Auditor", reason: "Manual dispute", txHash: anchorRes.txHash });
                const updated = await batchesApi.getBatch(batch.batchId);
                setBatch(updated.data.batch);
              } catch (e: any) {
                alert("Challenge failed: " + e.message);
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading || batch.status === "SETTLED"}
            className="btn-secondary w-full text-amber-300 text-sm"
          >
            <Link2 size={14} className="mr-2" />
            Raise challenge
          </button>
        </div>
      </div>
    </div>
  );
}
