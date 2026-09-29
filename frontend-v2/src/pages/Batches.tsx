import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Database, Plus, Search } from "lucide-react";
import { batchesApi } from "../api/batches";
import { Batch } from "../types";

export function Batches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    batchesApi.getBatches(1, 50)
      .then((res) => {
        if (res.ok) setBatches(res.data.batches);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBatches = batches.filter((batch) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      batch.batchId.toLowerCase().includes(term) ||
      batch.material.toLowerCase().includes(term) ||
      batch.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80">
            <Database className="text-cyan-300" size={22} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Operational ledger</div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Batches</h1>
          </div>
        </div>

        <Link to="/simulator" className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-[11px]">
          <Plus size={14} />
          Simulate New Batch
        </Link>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batches..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{filteredBatches.length} records</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/40 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Batch ID</th>
                <th className="px-5 py-4">Material</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">Loading batches…</td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">No matching batches found</td>
                </tr>
              ) : (
                filteredBatches.map((batch) => (
                  <tr key={batch.batchId} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-cyan-300">
                      <Link to={`/batches/${batch.batchId}`} className="hover:underline">{batch.batchId}</Link>
                    </td>
                    <td className="px-5 py-4 text-slate-100">{batch.material}</td>
                    <td className="px-5 py-4 text-slate-300">{batch.claim.quantity.toLocaleString()} {batch.claim.unit}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${
                          batch.status === "VERIFIED" || batch.status === "SETTLED"
                            ? "badge-success"
                            : batch.status === "CHALLENGED"
                              ? "badge-error"
                              : batch.status === "AI_ANALYZED" || batch.status === "UNDER_REVIEW"
                                ? "badge-warning"
                                : "badge-neutral"
                        }`}
                      >
                        {batch.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-slate-400">
                      {new Date(batch.createdAt).toLocaleString()}
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
