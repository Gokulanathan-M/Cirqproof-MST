import React, { useState } from 'react';
import TxHashLink from '../common/TxHashLink';
import { Blocks, Search, Filter } from 'lucide-react';


const FILTER_OPTIONS = ['ALL', 'NORMAL', 'INCONSISTENT', 'TAMPERED', 'VERIFIED', 'FLAGGED'];

function getScenarioStyle(scenario) {
  if (scenario === 'NORMAL') return { color: 'var(--copper)', border: 'var(--copper-dim)', bg: 'var(--copper-trace)' };
  if (scenario === 'TAMPERED') return { color: 'var(--amber)', border: 'var(--amber-dim)', bg: 'var(--amber-trace)' };
  return { color: 'var(--rust)', border: 'var(--rust-dim)', bg: 'var(--rust-trace)' };
}

function getStatusStyle(status) {
  if (status === 'VERIFIED') return { color: 'var(--copper)', border: 'var(--copper-dim)', bg: 'var(--copper-trace)' };
  if (status === 'CHALLENGED') return { color: 'var(--amber)', border: 'var(--amber-dim)', bg: 'var(--amber-trace)' };
  return { color: 'var(--rust)', border: 'var(--rust-dim)', bg: 'var(--rust-trace)' };
}

export default function ForensicLedgerTable({ batches, selectedBatchId, onSelectBatch }) {
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = batches.filter((b) => {
    const matchFilter =
      filterType === 'ALL' ||
      b.scenario === filterType ||
      b.status === filterType;
    const matchSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.material.toLowerCase().includes(search.toLowerCase()) ||
      (b.blockchain?.txHash || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="border border-[var(--border-primary)]" style={{ background: 'var(--bg-concrete)' }}>
      {/* Header + filter strip */}
      <div
        className="px-5 py-3.5 border-b border-[var(--border-primary)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ background: 'var(--bg-void)' }}
      >
        <div className="flex items-center gap-3">
          <Blocks size={15} style={{ color: 'var(--copper)' }} />
          <div>
            <h4 className="font-serif text-base font-semibold" style={{ color: 'var(--paper-aged)' }}>
              MST Testnet On-Chain Forensic Ledger
            </h4>
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--paper-ghost)' }}>
              Chain ID: 4242 // Immutable Attestation &amp; Escrow Registry
            </span>
          </div>
        </div>

        {/* Filter group + search — React Bits Filtering pattern */}
        <div className="flex items-center gap-2">
          <div
            className="flex border divide-x"
            style={{ borderColor: 'var(--border-primary)', divideColor: 'var(--border-primary)' }}
          >
            {FILTER_OPTIONS.slice(0, 4).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className="px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wide font-bold transition-colors"
                style={{
                  background: filterType === f ? 'var(--bg-concrete-2)' : 'transparent',
                  color: filterType === f ? 'var(--paper-aged)' : 'var(--paper-ghost)',
                  borderRight: '1px solid var(--border-primary)',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div
            className="flex items-center border px-2"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-void)' }}
          >
            <Search size={11} style={{ color: 'var(--paper-ghost)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="batch / tx hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-32 py-1 pl-2 font-mono text-[11px] border-none"
              style={{ background: 'transparent', color: 'var(--paper-aged)' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr
              className="border-b font-mono text-[9px] uppercase tracking-wider"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--paper-ghost)' }}
            >
              <th className="py-2.5 px-4">Batch Dossier</th>
              <th className="py-2.5 px-4">Classification</th>
              <th className="py-2.5 px-4">Intake / Recovered</th>
              <th className="py-2.5 px-4">Scenario</th>
              <th className="py-2.5 px-4">Escrow</th>
              <th className="py-2.5 px-4">MST Tx Anchor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const isSelected = b.id === selectedBatchId;
              const scenarioStyle = getScenarioStyle(b.scenario);
              const statusStyle = getStatusStyle(b.status);

              return (
                <tr
                  key={b.id}
                  onClick={() => onSelectBatch(b.id)}
                  className="border-b cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--border-faint)',
                    background: isSelected ? 'var(--bg-concrete-2)' : 'transparent',
                    borderLeft: isSelected ? '2px solid var(--copper)' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-void)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--paper-aged)' }}>
                      {b.id}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px]" style={{ color: 'var(--paper-dim)' }}>
                    {b.material}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span style={{ color: 'var(--paper-dim)' }}>{b.inputWeight} kg</span>
                    <span style={{ color: 'var(--paper-ghost)' }}> / </span>
                    <span style={{ color: 'var(--copper)', fontWeight: 700 }}>{b.claimedRecoveredWeight} kg</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 border"
                      style={scenarioStyle}
                    >
                      {b.scenario}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--paper-aged)' }}>
                      ₹{b.settlement?.amountINR?.toLocaleString()}
                    </span>
                    <span
                      className="font-mono text-[9px] uppercase block"
                      style={{ color: 'var(--paper-ghost)' }}
                    >
                      {b.settlement?.status}
                    </span>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <TxHashLink hash={b.blockchain?.txHash} truncate />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div
            className="py-8 text-center font-mono text-[10px] uppercase"
            style={{ color: 'var(--paper-ghost)' }}
          >
            No records matching filter criteria
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div
        className="px-5 py-2.5 border-t flex items-center gap-4 font-mono text-[9px] uppercase"
        style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-void)', color: 'var(--paper-ghost)' }}
      >
        <span>{filtered.length} records</span>
        <span style={{ color: 'var(--border-primary)' }}>|</span>
        <span style={{ color: 'var(--copper)' }}>
          {batches.filter(b => b.status === 'VERIFIED').length} verified
        </span>
        <span style={{ color: 'var(--border-primary)' }}>|</span>
        <span style={{ color: 'var(--rust)' }}>
          {batches.filter(b => b.status === 'FLAGGED').length} flagged
        </span>
      </div>
    </div>
  );
}
