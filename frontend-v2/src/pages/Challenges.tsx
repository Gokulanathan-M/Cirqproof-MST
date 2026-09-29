import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ShieldAlert, ArrowUpRight } from "lucide-react";
import { batchesApi } from "../api/batches";
import { challengeApi } from "../api/challenge";

interface ChallengeRow {
  batchId: string;
  material: string;
  challenge: any;
  status: string;
  reason: string;
}

export function Challenges() {
  const [rows, setRows] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const batchRes = await batchesApi.getBatches(1, 50);
        const batches = batchRes?.data?.batches ?? [];

        const mapped = await Promise.all(
          batches.map(async (batch: any) => {
            try {
              const challengeRes = await challengeApi.getByBatch(batch.batchId);
              const challengeList = challengeRes?.challenges ?? [];
              const active = challengeList[challengeList.length - 1] ?? null;
              return {
                batchId: batch.batchId,
                material: batch.material,
                challenge: active,
                status: active?.status ?? batch.status,
                reason: active?.reason ?? "No active dispute recorded",
              };
            } catch {
              return {
                batchId: batch.batchId,
                material: batch.material,
                challenge: null,
                status: batch.status,
                reason: "No active dispute recorded",
              };
            }
          })
        );

        setRows(mapped.filter((row) => row.challenge || row.status === "CHALLENGED" || row.status === "UNDER_REVIEW"));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const active = rows.filter((row) => row.status === "CHALLENGED" || row.status === "UNDER_REVIEW").length;
    const resolved = rows.filter((row) => row.status === "RESOLVED").length;
    return { active, resolved, total: rows.length };
  }, [rows]);

  return (
    <div className="animate-fade-in mx-auto max-w-6xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-red-300">Audit desk</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Challenge Review</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Open disputes</span>
            <ShieldAlert className="text-red-300" size={16} />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "-" : summary.active}</div>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Resolved</span>
            <AlertTriangle className="text-amber-300" size={16} />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "-" : summary.resolved}</div>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Tracked</span>
            <ArrowUpRight className="text-cyan-300" size={16} />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "-" : summary.total}</div>
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Dispute ledger</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/40 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Batch</th>
                <th className="px-5 py-4">Material</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Tx hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Loading challenges…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No challenge records found.</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.batchId} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-cyan-300">
                      <Link to={`/batches/${row.batchId}`} className="hover:underline">{row.batchId}</Link>
                    </td>
                    <td className="px-5 py-4 text-slate-100">{row.material}</td>
                    <td className="px-5 py-4 text-slate-300 max-w-md">{row.reason}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${row.status === "CHALLENGED" || row.status === "UNDER_REVIEW" ? "badge-error" : "badge-success"}`}>
                        {row.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-300">{row.challenge?.txHash ? `${row.challenge.txHash.slice(0, 18)}…` : "—"}</td>
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
