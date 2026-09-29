import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, Database, ShieldCheck, TriangleAlert, Play, AlertOctagon, Clock } from "lucide-react";
import { batchesApi } from "../api/batches";
import { settlementApi } from "../api/settlement";
import { Batch } from "../types";

export function Dashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [totalBatches, setTotalBatches] = useState(0);
  const [releasedAmount, setReleasedAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([batchesApi.getBatches(1, 100), settlementApi.list()])
      .then(([batchRes, settlementRes]) => {
        if (batchRes.ok) {
          setBatches(batchRes.data.batches);
          setTotalBatches(batchRes.data.total);
        }
        if (settlementRes.ok) {
          setReleasedAmount(
            settlementRes.data.settlements
              .filter((s: any) => s.status === "RELEASED")
              .reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0),
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allBatches = batches;
  const verified = allBatches.filter((b) => b.status === "VERIFIED" || b.status === "SETTLED").length;
  const flagged = allBatches.filter((b) => b.status === "CHALLENGED" || b.status === "UNDER_REVIEW").length;
  const awaitingReview = allBatches.filter((b) => b.status === "AI_ANALYZED").length;

  const metrics = [
    { label: "Total batches", value: loading ? "-" : totalBatches, icon: Database, tone: "text-cyan-300", sub: "All simulation runs" },
    { label: "Verified", value: loading ? "-" : verified, icon: ShieldCheck, tone: "text-emerald-300", sub: "Attested & settled" },
    { label: "Awaiting review", value: loading ? "-" : awaitingReview, icon: Clock, tone: "text-amber-300", sub: "AI analyzed, pending human" },
    { label: "Active disputes", value: loading ? "-" : flagged, icon: AlertOctagon, tone: "text-red-300", sub: "Challenged or under review" },
  ];

  const pipeline = ["Evidence", "Reconciliation", "Human Verification", "MST Attestation", "Settlement"];

  const recentBatches = batches.slice(0, 5);

  return (
    <div className="animate-fade-in space-y-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <span className="live-indicator" />
            MST testnet configured
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">CirqProof Control Center</h1>
          <p className="mt-2 text-sm text-slate-400">MST testnet / evidence-backed settlement infrastructure</p>
        </div>

        <Link to="/simulator" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[11px]">
          <Play size={16} />
          New Simulation
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone, sub }) => (
          <div key={label} className="card-glass card-glass-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
              <div className={`rounded-lg border border-white/10 bg-slate-950/60 p-2 ${tone}`}>
                <Icon size={16} />
              </div>
            </div>
            <div className="mt-5 text-3xl font-bold tracking-tight text-white">{value}</div>
            <div className="mt-2 text-xs text-slate-500">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="card-glass p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Verification pipeline</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Sequence</span>
          </div>

          <div className="space-y-3">
            {pipeline.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-500/5 text-[10px] font-bold text-emerald-300">
                  {index + 1}
                </div>
                <div className="flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">{step}</div>
                {index < pipeline.length - 1 ? <ArrowRight className="text-slate-500" size={16} /> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Settlement summary</h2>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-300">Application data</span>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <span>Total batches</span>
              <span className="font-semibold text-cyan-300">{loading ? "—" : totalBatches}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <span>Verified batches</span>
              <span className="font-semibold text-emerald-300">{loading ? "—" : verified}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <span>Released escrow</span>
              <span className="font-semibold text-emerald-300">{loading ? "—" : `$${releasedAmount.toLocaleString()}`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Recent batches</div>
            <h2 className="mt-1 text-xl font-semibold text-white">Operational activity</h2>
          </div>
          <Link to="/batches" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">View all</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/40 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Batch ID</th>
                <th className="px-5 py-4">Material</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">Loading batches…</td>
                </tr>
              ) : recentBatches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">No activity found — run a simulation to get started</td>
                </tr>
              ) : (
                recentBatches.map((batch) => (
                  <tr key={batch.batchId} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-cyan-300">
                      <Link to={`/batches/${batch.batchId}`} className="hover:underline">{batch.batchId}</Link>
                    </td>
                    <td className="px-5 py-4 text-slate-200">{batch.material}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${
                          batch.status === "VERIFIED" || batch.status === "SETTLED"
                            ? "badge-success"
                            : batch.status === "CHALLENGED" || batch.status === "UNDER_REVIEW"
                              ? "badge-error"
                              : batch.status === "AI_ANALYZED"
                                ? "badge-warning"
                                : "badge-neutral"
                        }`}
                      >
                        {batch.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{new Date(batch.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
