import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Database, ShieldCheck, TriangleAlert, ArrowUpRight } from "lucide-react";
import { batchesApi } from "../api/batches";
import { evidenceApi } from "../api/evidence";

interface EvidenceRow {
  batchId: string;
  material: string;
  recordCount: number;
  integrity: boolean;
  hash: string | null;
}

export function Evidence() {
  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await batchesApi.getBatches(1, 50);
        if (!res.ok) return;

        const batches = res.data.batches;
        const mapped = await Promise.all(
          batches.map(async (batch: any) => {
            try {
              const evidenceRes = await evidenceApi.getEvidence(batch.batchId);
              const integrityRes = await evidenceApi.checkIntegrity(batch.batchId).catch(() => ({ data: { verified: false } }));
              const evidence = evidenceRes?.data?.evidence ?? [];
              const root = evidenceRes?.data?.evidenceRoot ?? null;
              return {
                batchId: batch.batchId,
                material: batch.material,
                recordCount: evidence.length,
                integrity: Boolean(integrityRes?.data?.verified ?? true),
                hash: root,
              } as EvidenceRow;
            } catch {
              return {
                batchId: batch.batchId,
                material: batch.material,
                recordCount: 0,
                integrity: false,
                hash: null,
              } as EvidenceRow;
            }
          })
        );

        setRows(mapped.filter((row) => row.recordCount > 0 || row.batchId));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalRecords = rows.reduce((sum, row) => sum + row.recordCount, 0);
  const verifiedRows = rows.filter((row) => row.integrity).length;
  const flaggedRows = rows.filter((row) => !row.integrity).length;

  return (
    <div className="animate-fade-in mx-auto max-w-6xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-cyan-300">Evidence ledger</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Evidence Explorer</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Total records</span>
            <Database className="text-cyan-300" size={16} />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "-" : totalRecords}</div>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Verified</span>
            <ShieldCheck className="text-emerald-300" size={16} />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "-" : verifiedRows}</div>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Flagged</span>
            <TriangleAlert className="text-amber-300" size={16} />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "-" : flaggedRows}</div>
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Batch evidence audit</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/40 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Batch</th>
                <th className="px-5 py-4">Material</th>
                <th className="px-5 py-4">Records</th>
                <th className="px-5 py-4">Integrity</th>
                <th className="px-5 py-4">Root hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Loading evidence…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No evidence records found.</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.batchId} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-cyan-300">
                      <Link to={`/batches/${row.batchId}`} className="inline-flex items-center gap-2 hover:underline">
                        {row.batchId}
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-100">{row.material}</td>
                    <td className="px-5 py-4 text-slate-300">{row.recordCount}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${row.integrity ? "badge-success" : "badge-error"}`}>
                        {row.integrity ? "Verified" : "Flagged"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-300">
                      {row.hash ? `${row.hash.slice(0, 18)}…` : "—"}
                    </td>
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
