import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronRight, ChevronDown, AlertTriangle, Check, Clock } from 'lucide-react';

const AGENT_DEFS = [
  {
    id: 'thermo',
    agent: 'Thermodynamic Mass-Balance Agent',
    tool: 'eval_thermodynamics_conservation',
    getParams: (b, isOk) => ({ intake_kg: 1000, recovered_kg: isOk ? 680 : 900, tolerance: '0.8%' }),
    getStatus: (r) => r?.massBalance?.passed ? 'SUCCESS' : 'VIOLATION',
    getOutput: (r) => r?.massBalance?.message || 'Mass balance evaluated',
    duration: '18ms',
  },
  {
    id: 'capacity',
    agent: 'Plant Operational Limits Agent',
    tool: 'query_facility_rated_capacity',
    getParams: () => ({ facility_id: 'FAC-HYDROMET-04', metric: 'throughput_tons_per_shift' }),
    getStatus: (r) => r?.capacity?.passed !== false ? 'SUCCESS' : 'ANOMALY',
    getOutput: (r) => r?.capacity?.message || 'Capacity compliant within rated bounds',
    duration: '34ms',
  },
  {
    id: 'downstream',
    agent: 'Downstream Off-Take Reconciliation Agent',
    tool: 'reconcile_buyer_weighbridge_invoice',
    getParams: () => ({ invoice_id: 'INV-CATH-4402', delta_threshold_kg: 15 }),
    getStatus: (r) => r?.downstreamMatch?.passed ? 'SUCCESS' : 'DISCREPANCY',
    getOutput: (r) => r?.downstreamMatch?.message || 'Downstream weight reconciled',
    duration: '41ms',
  },
  {
    id: 'merkle',
    agent: 'Cryptographic Merkle Attestor',
    tool: 'compute_and_verify_evidence_root',
    getParams: () => ({ leaves_count: 5, algorithm: 'SHA-256' }),
    getStatus: (_, scenario) => scenario === 'TAMPERED' ? 'TAMPERED_ROOT' : 'SEALED',
    getOutput: (_, scenario) =>
      scenario === 'TAMPERED'
        ? 'Root signature mismatch in leaf 2 (Process Logs) — enclave seal broken'
        : 'Merkle tree integrity fully valid — all 5 leaves coherent',
    duration: '12ms',
  },
];

function ToolCallRow({ call, index, isExpanded, onToggle }) {
  const isSuccess = call.status === 'SUCCESS' || call.status === 'SEALED';
  const statusColor = isSuccess ? 'var(--copper)' : call.status === 'TAMPERED_ROOT' ? 'var(--amber)' : 'var(--rust)';
  const statusBg = isSuccess ? 'var(--copper-trace)' : call.status === 'TAMPERED_ROOT' ? 'var(--amber-trace)' : 'var(--rust-trace)';

  return (
    <div
      className="border transition-colors"
      style={{
        borderColor: isSuccess ? 'var(--border-secondary)' : statusColor + '44',
        background: isSuccess ? 'var(--bg-void)' : statusBg,
      }}
    >
      <button
        className="w-full p-2.5 flex items-center justify-between text-left gap-3 transition-colors"
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-concrete-2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ color: 'var(--paper-ghost)', flexShrink: 0 }}>
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>

          {/* Agent label */}
          <span
            className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 border whitespace-nowrap flex-shrink-0"
            style={{ color: 'var(--paper-ghost)', borderColor: 'var(--border-primary)', background: 'var(--bg-concrete-2)' }}
          >
            {call.agent.split(' ')[0]}
          </span>

          {/* Tool name */}
          <span className="font-mono text-[11px] font-bold truncate" style={{ color: 'var(--paper-aged)' }}>
            {call.tool}()
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="font-mono text-[9px]" style={{ color: 'var(--paper-ghost)' }}>
            {call.duration}
          </span>
          <span
            className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 border"
            style={{ color: statusColor, borderColor: statusColor + '55', background: statusBg }}
          >
            {call.status}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div
          className="px-4 pb-3 pt-1 border-t space-y-2 animate-slide-up"
          style={{ borderColor: 'var(--border-faint)', background: 'var(--charcoal)' }}
        >
          <div className="font-mono text-[10px]" style={{ color: 'var(--paper-ghost)' }}>
            <span style={{ color: 'var(--paper-dim)' }}>PARAMS: </span>
            <code style={{ color: 'var(--paper-aged)' }}>{JSON.stringify(call.params)}</code>
          </div>
          <div className="font-mono text-[10px]" style={{ color: 'var(--paper-ghost)' }}>
            <span style={{ color: 'var(--paper-dim)' }}>VERDICT: </span>
            <span style={{ color: isSuccess ? 'var(--copper)' : statusColor }}>{call.output}</span>
          </div>
          <div className="font-mono text-[10px]" style={{ color: 'var(--paper-ghost)' }}>
            <Clock size={9} className="inline mr-1" style={{ color: 'var(--paper-ghost)' }} />
            <span>{call.agent} // Sub-agent execution trace</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentActivityLog({ aiReport, scenario }) {
  const [expanded, setExpanded] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, [aiReport?.status]);

  if (!aiReport) return null;

  const isOk = aiReport.status === 'CONSISTENT';

  const calls = AGENT_DEFS.map((def) => ({
    agent: def.agent,
    tool: def.tool,
    params: def.getParams(aiReport, isOk),
    status: def.getStatus(aiReport, scenario),
    output: def.getOutput(aiReport, scenario),
    duration: def.duration,
  }));

  const overallColor = isOk ? 'var(--copper)' : scenario === 'TAMPERED' ? 'var(--amber)' : 'var(--rust)';

  return (
    <div className="border border-[var(--border-primary)]" style={{ background: 'var(--bg-concrete)' }}>
      {/* Header */}
      <div
        className="px-5 py-3.5 border-b border-[var(--border-primary)] flex items-center justify-between"
        style={{ background: 'var(--bg-void)' }}
      >
        <div className="flex items-center gap-3">
          <Terminal size={15} style={{ color: 'var(--copper)' }} />
          <div>
            <h4 className="font-serif text-base font-semibold" style={{ color: 'var(--paper-aged)' }}>
              AI Multi-Agent Audit Trace
            </h4>
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--paper-ghost)' }}>
              Deep Heuristic Reconciliation Engine // 4 Active Sub-Agents
            </span>
          </div>
        </div>

        <div>
          {isOk ? (
            <span className="stamp stamp-conserved">Consistent</span>
          ) : scenario === 'TAMPERED' ? (
            <span className="stamp stamp-tampered">Tampered</span>
          ) : (
            <span className="stamp stamp-flagged">Flagged</span>
          )}
        </div>
      </div>

      {/* Tool calls */}
      <div className={`p-4 space-y-1.5 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
        {calls.map((call, idx) => (
          <ToolCallRow
            key={idx}
            call={call}
            index={idx}
            isExpanded={expanded === idx}
            onToggle={() => setExpanded(expanded === idx ? null : idx)}
          />
        ))}
      </div>

      {/* Synthesis verdict */}
      <div
        className="mx-4 mb-4 p-4 border"
        style={{ background: 'var(--bg-void)', borderColor: isOk ? 'var(--copper-dim)' : overallColor + '44' }}
      >
        <span className="field-label mb-2">Forensic Synthesis &amp; Recommendation</span>
        <p className="font-serif text-sm leading-relaxed" style={{ color: 'var(--paper-aged)' }}>
          {aiReport.explanation}
        </p>
        {aiReport.recommendation && (
          <div className="mt-2 font-mono text-[10px]" style={{ color: overallColor }}>
            → {aiReport.recommendation}
          </div>
        )}
      </div>
    </div>
  );
}
