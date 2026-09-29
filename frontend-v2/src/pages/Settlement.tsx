import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Coins, Lock, ArrowUpRight } from "lucide-react";
import { batchesApi } from "../api/batches";
import { settlementApi } from "../api/settlement";

interface SettlementRow {
  batchId: string;
  amount: number;
  material: string;
  status: string;
  txHash: string | null;
}

export function Settlement() {
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [batchRes, settlementRes] = await Promise.all([
          batchesApi.getBatches(1, 100),
          settlementApi.list(),
        ]);
        const batches = batchRes?.data?.batches ?? [];
        const settlements = settlementRes?.data?.settlements ?? [];
        const settlementByBatch = new Map<string, any>(settlements.map((settlement: any) => [settlement.batchId, settlement]));

        const mapped = batches.map((batch: any) => {
          const settlement = settlementByBatch.get(batch.batchId);
          const amount = Number(settlement?.amount ?? 0);
          const status = settlement?.status ?? "PENDING";

          return {
            batchId: batch.batchId,
            material: batch.material,
            amount,
            status,
            txHash: settlement?.txHash ?? null,
          } as SettlementRow;
        });

        setRows(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + row.amount, 0);
    const released = rows.filter((row) => row.status === "RELEASED").reduce((sum, row) => sum + row.amount, 0);
    const held = rows.filter((row) => row.status === "HELD" || row.status === "PENDING").reduce((sum, row) => sum + row.amount, 0);
    return { total, released, held };
  }, [rows]);

  return (
    <div className="animate-fade-in mx-auto max-w-6xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-emerald-300">Settlement ledger</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Escrow Settlement</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Committed</span>
            <Coins className="text-cyan-300" size={16} />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "-" : `$${summary.total.toLocaleString()}`}</div>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Released</span>
            <ArrowUpRight className="text-emerald-300" size={16} />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "-" : `$${summary.released.toLocaleString()}`}</div>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Held</span>
            <Lock className="text-amber-300" size={16} />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "-" : `$${summary.held.toLocaleString()}`}</div>
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Escrow status by batch</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/40 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Batch</th>
                <th className="px-5 py-4">Material</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Tx hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Loading settlement ledger…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No settlement records found.</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.batchId} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-cyan-300">
                      <Link to={`/batches/${row.batchId}`} className="hover:underline">{row.batchId}</Link>
                    </td>
                    <td className="px-5 py-4 text-slate-100">{row.material}</td>
                    <td className="px-5 py-4 text-slate-200">${row.amount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${
                        row.status === "RELEASED" ? "badge-success" :
                        row.status === "DEPOSITED" || row.status === "HELD" ? "badge-info" :
                        row.status === "PENDING" ? "badge-neutral" : "badge-warning"
                      }`}>
                        {row.status === "DEPOSITED" ? "DEPOSIT" : row.status === "RELEASED" ? "RELEASE" : row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-300">{row.txHash ? `${row.txHash.slice(0, 18)}…` : "—"}</td>
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
