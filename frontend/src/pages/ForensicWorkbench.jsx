import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowDown, ArrowRight, RotateCcw, Command,
  ShieldAlert, CheckCircle, AlertTriangle, ChevronRight,
  Eye, Terminal, FileText, Scale, Truck, Cpu, Activity,
  Lock, Send, X, Search, Blocks
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// MATERIAL FLOW — horizontal stage bar
// ═══════════════════════════════════════════════════════════
const PIPELINE_STAGES = [
  { id: 'BATCH',          code: '01', label: 'Batch',         shortDesc: 'Intake' },
  { id: 'EVIDENCE',       code: '02', label: 'Evidence',      shortDesc: 'Merkle' },
  { id: 'RECONCILIATION', code: '03', label: 'AI Audit',      shortDesc: 'Multi-agent' },
  { id: 'VERIFICATION',   code: '04', label: 'Verification',  shortDesc: 'Human sign-off' },
  { id: 'ATTESTATION',    code: '05', label: 'Attestation',   shortDesc: 'On-chain' },
  { id: 'CHALLENGE',      code: '06', label: 'Challenge',     shortDesc: 'Dispute' },
  { id: 'SETTLEMENT',     code: '07', label: 'Settlement',    shortDesc: 'Escrow' },
];

function PipelineBar({ activeStage, onStageChange }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          minWidth: 700,
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {PIPELINE_STAGES.map((stage, idx) => {
          const isActive = activeStage === stage.id;
          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => onStageChange(stage.id)}
                style={{
                  flex: 1,
                  padding: '11px 8px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? 'var(--teal)' : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <div
                  className="font-mono"
                  style={{ fontSize: 9, color: isActive ? 'var(--teal)' : 'var(--text-faint)', marginBottom: 2 }}
                >
                  {stage.code}
                </div>
                <div
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: isActive ? 'var(--teal)' : 'var(--text-muted)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {stage.label}
                </div>
              </button>
              {idx < PIPELINE_STAGES.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--border)',
                    flexShrink: 0,
                  }}
                >
                  <ChevronRight size={12} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MASS BALANCE FLOW — the primary evidence visual
// ═══════════════════════════════════════════════════════════
function MassBalanceFlow({ batch, scenario }) {
  const isOk       = scenario === 'NORMAL';
  const isTampered = scenario === 'TAMPERED';
  const isInconsistent = scenario === 'INCONSISTENT';

  const steps = [
    {
      label:  'Input Material',
      kg:     batch?.inputWeight || batch?.evidence?.weighbridge?.weight || 0,
      status: 'ok',
      sub:    batch?.evidence?.weighbridge?.docId ? `Weighbridge receipt · ${batch.evidence.weighbridge.docId.slice(-6).toUpperCase()}` : 'Weighbridge receipt',
    },
    {
      label:  'Processed',
      kg:     batch?.evidence?.processingLog?.weight || batch?.evidence?.processingLog?.processedWeight || 0,
      status: isTampered ? 'tampered' : 'ok',
      sub:    batch?.evidence?.processingLog?.docId ? `Reactor telemetry · ${batch.evidence.processingLog.docId.slice(-6).toUpperCase()}` : 'Reactor telemetry',
    },
    {
      label:  'Recovered',
      kg:     batch?.claimedRecoveredWeight || batch?.evidence?.outputRecord?.recoveredWeight || 0,
      status: isInconsistent ? 'warning' : isOk ? 'ok' : isTampered ? 'tampered' : 'ok',
      sub:    batch?.evidence?.outputRecord?.docId ? `Assay + weighment · ${batch.evidence.outputRecord.docId.slice(-6).toUpperCase()}` : 'Assay + weighment',
    },
    {
      label:  'Verified Output',
      kg:     batch?.downstreamWeight || batch?.evidence?.downstreamInvoice?.verifiedWeight || 0,
      status: isInconsistent ? 'error' : isOk ? 'success' : isTampered ? 'tampered' : 'ok',
      sub:    batch?.evidence?.downstreamInvoice?.docId ? `Downstream bill of lading · ${batch.evidence.downstreamInvoice.docId.slice(-6).toUpperCase()}` : 'Downstream bill of lading',
    },
  ];

  const statusColor = {
    ok:       'var(--teal)',
    success:  'var(--success)',
    warning:  'var(--warning)',
    error:    'var(--error)',
    tampered: 'var(--error)',
  };

  const statusBg = {
    ok:       'var(--teal-light)',
    success:  'var(--success-light)',
    warning:  'var(--warning-light)',
    error:    'var(--error-light)',
    tampered: 'var(--error-light)',
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '28px 32px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="label-caps" style={{ marginBottom: 6 }}>Material Trace — {batch?.id}</div>
          <h3
            className="font-serif"
            style={{ fontSize: 22, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}
          >
            {batch?.material}
          </h3>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {batch?.recycler} · {batch?.producer}
          </div>
        </div>

        {/* Scenario badge */}
        <div>
          {isOk ? (
            <span className="badge badge-success">● CONSISTENT</span>
          ) : isTampered ? (
            <span className="badge badge-error">⚠ TAMPERED</span>
          ) : (
            <span className="badge badge-warning">⚠ INCONSISTENT</span>
          )}
        </div>
      </div>

      {/* Flow steps — horizontal */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const color  = statusColor[step.status];
          const bg     = statusBg[step.status];
          const isAnomaly = step.status !== 'ok' && step.status !== 'success';

          return (
            <React.Fragment key={idx}>
              <div
                className="animate-stage-enter"
                style={{
                  animationDelay: `${idx * 80}ms`,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* Stage number */}
                <div
                  className="font-mono"
                  style={{ fontSize: 10, color: 'var(--text-faint)' }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* Node with indicator line */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0,
                      boxShadow: isAnomaly ? `0 0 0 4px ${bg}` : 'none',
                    }}
                  />
                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: isAnomaly
                          ? `linear-gradient(to right, ${color}, var(--border))`
                          : `linear-gradient(to right, var(--teal), var(--border))`,
                        marginLeft: 4,
                        borderRadius: 1,
                      }}
                    />
                  )}
                </div>

                {/* Weight measurement */}
                <div
                  className="font-mono font-bold"
                  style={{
                    fontSize: 22,
                    color: isAnomaly ? color : 'var(--text)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {(step.kg || 0).toLocaleString()} kg
                </div>

                {/* Label */}
                <div>
                  <div
                    style={{
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      color: isAnomaly ? color : 'var(--text)',
                      marginBottom: 3,
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      color: 'var(--text-faint)',
                      lineHeight: 1.5,
                    }}
                  >
                    {step.sub}
                  </div>
                </div>

                {/* Anomaly annotation */}
                {isAnomaly && (
                  <div
                    style={{
                      padding: '4px 8px',
                      background: bg,
                      borderRadius: 3,
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: color,
                      fontWeight: 600,
                    }}
                  >
                    {step.status === 'warning' ? '⚠ ANOMALY' : '✕ MISMATCH'}
                  </div>
                )}
              </div>

              {!isLast && (
                <div
                  style={{
                    padding: '0 8px',
                    marginTop: 38,
                    color: 'var(--text-faint)',
                    flexShrink: 0,
                  }}
                >
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Escrow strip */}
      <div
        style={{
          marginTop: 24,
          padding: '12px 16px',
          background: 'var(--bg)',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={13} style={{ color: 'var(--text-muted)' }} />
          <span
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 12,
              color: 'var(--text-muted)',
            }}
          >
            Smart Contract Escrow
          </span>
        </div>
        <div style={{ display: 'flex', items: 'center', gap: 12 }}>
          <span
            className="font-mono font-bold"
            style={{ fontSize: 15, color: 'var(--teal)' }}
          >
            ₹{(batch?.settlement?.amountINR || 0).toLocaleString()}
          </span>
          <span
            className="badge"
            style={{
              background: batch?.settlement?.status === 'RELEASED' ? 'var(--success-light)' : 'var(--bg)',
              color: batch?.settlement?.status === 'RELEASED' ? 'var(--success)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            {batch?.settlement?.status || 'PENDING'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BATCH MASTER LIST — left panel
// ═══════════════════════════════════════════════════════════
function BatchMasterList({ batches, selectedId, onSelect, onScenario, scenario }) {
  const [filter, setFilter] = useState('ALL');

  const filtered = batches.filter(b =>
    filter === 'ALL' ||
    b.scenario === filter ||
    b.status === filter
  );

  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="label-caps" style={{ marginBottom: 8 }}>Active Batches</div>

        {/* Scenario switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg)',
            borderRadius: 4,
            padding: 2,
            border: '1px solid var(--border-light)',
          }}
        >
          {['NORMAL', 'INCON.', 'TAMPER'].map((s) => {
            const id = s === 'NORMAL' ? 'NORMAL' : s === 'INCON.' ? 'INCONSISTENT' : 'TAMPERED';
            const isActive = scenario === id;
            return (
              <button
                key={s}
                onClick={() => onScenario(id)}
                style={{
                  flex: 1,
                  padding: '5px 4px',
                  borderRadius: 3,
                  border: 'none',
                  background: isActive
                    ? (id === 'NORMAL' ? 'var(--success)' : id === 'INCONSISTENT' ? 'var(--warning)' : 'var(--error)')
                    : 'transparent',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Batch list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.map(b => {
          const isSelected = b.id === selectedId;
          const isOk       = b.aiReport?.status === 'CONSISTENT' || b.status === 'VERIFIED';
          const isTampered = b.scenario === 'TAMPERED';
          const dotColor   = isOk ? 'var(--success)' : isTampered ? 'var(--error)' : 'var(--warning)';

          return (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isSelected ? 'var(--surface-warm)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-light)',
                borderLeft: `3px solid ${isSelected ? 'var(--teal)' : 'transparent'}`,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-warm)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isSelected ? 'var(--teal)' : 'var(--text)',
                  }}
                >
                  {b.id}
                </span>
              </div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: 'var(--text-muted)' }}>
                {b.material}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}
              >
                {b.inputWeight} kg → {b.claimedRecoveredWeight} kg
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EVIDENCE CHAIN — animated list
// ═══════════════════════════════════════════════════════════
const EVIDENCE_DEFS = [
  { key: 'weighbridge',      title: 'Weighbridge Intake',       Icon: Scale },
  { key: 'processingLog',    title: 'Reactor Process Log',       Icon: Activity },
  { key: 'outputRecord',     title: 'Assay & Recovery Record',   Icon: FileText },
  { key: 'downstreamInvoice',title: 'Downstream Bill of Lading', Icon: Truck },
  { key: 'telemetry',        title: 'Enclave Cryptographic Seal',Icon: Cpu },
];

function EvidenceChain({ evidence, onInspect }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [evidence]);

  if (!evidence) return null;

  const validCount = EVIDENCE_DEFS.filter(d => {
    const s = evidence[d.key]?.status;
    return !s || s === 'VALID';
  }).length;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="label-caps" style={{ marginBottom: 4 }}>Evidence Chain</div>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            Merkle Leaf Anchors
          </div>
        </div>
        <span
          className="font-mono"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: validCount === 5 ? 'var(--success)' : 'var(--warning)',
          }}
        >
          {validCount}/5 valid
        </span>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {EVIDENCE_DEFS.map((def, idx) => {
          const data = evidence[def.key];
          const status = data?.status || 'VALID';
          const isOk   = status === 'VALID';
          const isWarn = status === 'SUSPICIOUS';
          const isErr  = status === 'TAMPERED_HASH' || status === 'MISMATCH';

          const color = isErr ? 'var(--error)' : isWarn ? 'var(--warning)' : 'var(--success)';
          const bg    = isErr ? 'var(--error-light)' : isWarn ? 'var(--warning-light)' : 'var(--success-light)';

          const { Icon } = def;
          const staggerClass = `stagger-${idx + 1}`;

          return (
            <div
              key={def.key}
              className={`animate-stage-enter ${staggerClass}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: isErr ? 'var(--error-light)' : isWarn ? 'var(--warning-light)' : 'var(--bg)',
                border: `1px solid ${isErr ? 'var(--error)' : isWarn ? 'var(--warning)' : 'var(--border-light)'}`,
                borderRadius: 4,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  background: isErr ? 'rgba(184,92,92,0.1)' : isWarn ? 'rgba(198,138,58,0.1)' : 'var(--teal-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={15} style={{ color: isErr ? 'var(--error)' : isWarn ? 'var(--warning)' : 'var(--teal)' }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className="font-mono"
                    style={{ fontSize: 10, color: 'var(--text-faint)', background: 'var(--border-light)', padding: '1px 5px', borderRadius: 2 }}
                  >
                    {data?.docId ? data.docId.slice(-6).toUpperCase() : 'PENDING'}
                  </span>
                  <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                    {def.title}
                  </span>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                    {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>
                  SHA-256: {data?.hash ? data.hash.substring(0, 16) + '...' : 'PENDING...'}
                </div>
              </div>

              {/* Status + inspect */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 3,
                    background: bg,
                    color,
                  }}
                >
                  {status}
                </span>
                <button
                  onClick={() => onInspect && onInspect({ ...def, data, status })}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-warm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'var(--btn-primary-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface-warm)'; }}
                >
                  <Eye size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AI RECONCILIATION — not a chatbot
// ═══════════════════════════════════════════════════════════
function ReconciliationPanel({ aiReport, scenario }) {
  const [runState, setRunState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const isOk       = aiReport?.status === 'CONSISTENT';
  const isTampered = scenario === 'TAMPERED';

  const checks = [
    { label: 'Mass Balance Check',       passed: aiReport?.massBalance?.passed,     detail: aiReport?.massBalance?.message },
    { label: 'Capacity Validation',      passed: aiReport?.capacity?.passed !== false, detail: 'Facility rated capacity validated' },
    { label: 'Energy Usage Analysis',    passed: !(['INCONSISTENT','TAMPERED'].includes(scenario)), detail: 'kWh/tonne within operational range' },
    { label: 'Downstream Traceability',  passed: aiReport?.downstreamMatch?.passed, detail: aiReport?.downstreamMatch?.message },
    { label: 'Hash Integrity',           passed: scenario !== 'TAMPERED',           detail: scenario === 'TAMPERED' ? 'Merkle root mismatch in leaf 2' : 'All 5 leaf hashes coherent' },
  ];

  const passCount  = checks.filter(c => c.passed).length;
  const confidence = isOk ? 96.4 : isTampered ? 12.0 : 58.7;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="label-caps" style={{ marginBottom: 4 }}>AI Reconciliation</div>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            Multi-Agent Audit Trace
          </div>
        </div>
        <Terminal size={16} style={{ color: 'var(--text-faint)' }} />
      </div>

      {/* Checks list */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {checks.map((check, idx) => {
          const staggerClass = `stagger-${idx + 1}`;
          return (
            <div
              key={idx}
              className={`animate-stage-enter ${staggerClass}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: idx < checks.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text)',
                    marginBottom: 2,
                  }}
                >
                  {check.label}
                </div>
                {check.detail && (
                  <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)', lineHeight: 1.5 }}>
                    {check.detail}
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, marginLeft: 12 }}>
                {check.passed ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--success)',
                    }}
                  >
                    <CheckCircle size={13} /> PASS
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      fontWeight: 700,
                      color: isTampered && check.label === 'Hash Integrity' ? 'var(--error)' : 'var(--warning)',
                    }}
                  >
                    {isTampered && check.label === 'Hash Integrity' ? (
                      <><X size={13} /> FAIL</>
                    ) : (
                      <><AlertTriangle size={13} /> WARN</>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result verdict */}
      <div
        style={{
          margin: '0 20px 20px',
          padding: '16px',
          background: isOk ? 'var(--success-light)' : isTampered ? 'var(--error-light)' : 'var(--warning-light)',
          borderRadius: 4,
          border: `1px solid ${isOk ? 'var(--success)' : isTampered ? 'var(--error)' : 'var(--warning)'}`,
        }}
      >
        <div className="label-caps" style={{ marginBottom: 8, color: 'var(--text-muted)' }}>
          Reconciliation Result
        </div>
        <div
          className="font-serif"
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: isOk ? 'var(--success)' : isTampered ? 'var(--error)' : 'var(--warning)',
            marginBottom: 6,
          }}
        >
          {isOk ? 'CONSISTENT' : isTampered ? 'INTEGRITY FAILURE' : 'INCONSISTENT'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div className="label-caps" style={{ marginBottom: 2 }}>Confidence</div>
            <div className="font-mono font-bold" style={{ fontSize: 16, color: 'var(--text)' }}>
              {confidence}%
            </div>
          </div>
          <div>
            <div className="label-caps" style={{ marginBottom: 2 }}>Checks</div>
            <div className="font-mono font-bold" style={{ fontSize: 16, color: 'var(--text)' }}>
              {passCount}/{checks.length}
            </div>
          </div>
        </div>
        {aiReport?.explanation && (
          <p
            className="font-serif"
            style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginTop: 10, fontStyle: 'italic' }}
          >
            "{aiReport.explanation}"
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HUMAN VERIFICATION PANEL
// ═══════════════════════════════════════════════════════════
function VerificationPanel({ batch, onApprove, onReject }) {
  const [notes, setNotes] = useState('Certified physical mass balance inspected and reconciled against weighbridge slips.');
  const [submitting, setSubmitting] = useState(false);
  const [actionTaken, setActionTaken] = useState(null);

  const isFlagged = batch?.status === 'FLAGGED' || batch?.scenario === 'INCONSISTENT' || batch?.scenario === 'TAMPERED';

  const verSteps = [
    { label: 'Evidence collected',    done: true },
    { label: 'Evidence hashed',       done: true },
    { label: 'AI reconciliation',     done: true },
    { label: 'Human review',          done: !isFlagged },
    { label: 'Attestation',           done: batch?.status === 'VERIFIED' },
    { label: 'Blockchain record',     done: Boolean(batch?.blockchain?.txHash) },
  ];

  const handleAction = async (action) => {
    setSubmitting(true);
    try {
      setActionTaken(action);
      if (action === 'APPROVE') { if (onApprove) await onApprove(batch.id, notes); }
      else                       { if (onReject)  await onReject(batch.id, notes); }
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Verification stages */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '20px',
        }}
      >
        <div className="label-caps" style={{ marginBottom: 16 }}>Verification Stages</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {verSteps.map((step, idx) => {
            const isLast = idx === verSteps.length - 1;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  position: 'relative',
                }}
              >
                {/* Line connector */}
                {!isLast && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: 22,
                      bottom: -8,
                      width: 1,
                      background: step.done ? 'var(--success)' : 'var(--border)',
                      zIndex: 0,
                    }}
                  />
                )}
                {/* Node */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: `2px solid ${step.done ? 'var(--success)' : 'var(--border)'}`,
                    background: step.done ? 'var(--success)' : 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {step.done && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L4 7L9 1"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="24"
                        strokeDashoffset="0"
                        style={{ animation: 'check-draw 0.4s ease both' }}
                      />
                    </svg>
                  )}
                </div>
                {/* Label */}
                <div
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: 13,
                    color: step.done ? 'var(--text)' : 'var(--text-faint)',
                    fontWeight: step.done ? 500 : 400,
                    paddingBottom: 16,
                    paddingTop: 2,
                  }}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sign-off form */}
      <div
        className="evidence-doc"
        style={{ padding: '20px' }}
      >
        <div className="label-caps" style={{ marginBottom: 12 }}>Auditor Sign-Off</div>

        <textarea
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{
            width: '100%',
            fontSize: 13,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            lineHeight: 1.6,
            padding: '10px 12px',
            marginBottom: 14,
            resize: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          {actionTaken ? (
            <div
              style={{
                padding: '9px 18px',
                borderRadius: 4,
                background: actionTaken === 'APPROVE' ? 'var(--success-light)' : 'var(--error-light)',
                color: actionTaken === 'APPROVE' ? 'var(--success)' : 'var(--error)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {actionTaken === 'APPROVE' ? '✓ Attestation signed' : '✕ Dispute raised'}
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('REJECT')}
                className="btn-danger"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Raise Dispute
              </button>
              <button
                type="button"
                disabled={submitting || isFlagged}
                onClick={() => handleAction('APPROVE')}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Sign & Attest
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BLOCKCHAIN LEDGER TABLE
// ═══════════════════════════════════════════════════════════
function LedgerTable({ batches, selectedId, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = batches.filter(b =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.material.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="label-caps" style={{ marginBottom: 4 }}>Immutable Evidence Ledger</div>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            MST Testnet · Chain ID 4242
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            border: '1px solid var(--border)',
            borderRadius: 4,
            background: 'var(--bg)',
          }}
        >
          <Search size={13} style={{ color: 'var(--text-faint)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search batches…"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 12,
              outline: 'none',
              width: 140,
              boxShadow: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Batch ID', 'Material', 'Intake / Recovered', 'Scenario', 'Status', 'Settlement', 'Tx Anchor'].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '9px 16px',
                    textAlign: 'left',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    background: 'var(--bg)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const isSelected = b.id === selectedId;
              const isOk       = b.status === 'VERIFIED';
              const isFlag     = b.status === 'FLAGGED';

              return (
                <tr
                  key={b.id}
                  onClick={() => onSelect(b.id)}
                  style={{
                    borderBottom: '1px solid var(--border-light)',
                    background: isSelected ? 'var(--teal-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    borderLeft: `3px solid ${isSelected ? 'var(--teal)' : 'transparent'}`,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 16px' }}>
                    <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: isSelected ? 'var(--teal)' : 'var(--text)' }}>
                      {b.id}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-muted)' }}>
                    {b.material}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.inputWeight} </span>
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>/ </span>
                    <span className="font-mono font-bold" style={{ fontSize: 11, color: 'var(--teal)' }}>{b.claimedRecoveredWeight} kg</span>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span
                      className="badge"
                      style={{
                        background: b.scenario === 'NORMAL' ? 'var(--teal-light)' : b.scenario === 'TAMPERED' ? 'var(--error-light)' : 'var(--warning-light)',
                        color: b.scenario === 'NORMAL' ? 'var(--teal)' : b.scenario === 'TAMPERED' ? 'var(--error)' : 'var(--warning)',
                      }}
                    >
                      {b.scenario}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span className={`badge ${isOk ? 'badge-success' : isFlag ? 'badge-warning' : 'badge-neutral'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span className="font-mono font-bold" style={{ fontSize: 12, color: 'var(--teal)' }}>
                      ₹{(b.settlement?.amountINR || 0).toLocaleString()}
                    </span>
                    <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)', display: 'block' }}>
                      {b.settlement?.status}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span className="font-mono" style={{ fontSize: 10, color: 'var(--teal)' }}>
                      {b.blockchain?.txHash ? `${b.blockchain.txHash.slice(0, 10)}…` : '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMMAND MENU
// ═══════════════════════════════════════════════════════════
const COMMANDS = [
  { id: 'SCENARIO_NORMAL',      label: 'Set Scenario: Normal (Conserved)',         category: 'Simulation',  color: 'var(--teal)' },
  { id: 'SCENARIO_INCONSISTENT',label: 'Set Scenario: Inconsistent (Delta)',        category: 'Simulation',  color: 'var(--warning)' },
  { id: 'SCENARIO_TAMPERED',    label: 'Set Scenario: Tampered (Hash Mismatch)',    category: 'Simulation',  color: 'var(--error)' },
  { id: 'ACTION_VERIFY_STAGE',  label: 'Go to: Human Verification',                category: 'Navigation',  color: 'var(--text-muted)' },
  { id: 'ACTION_CHALLENGE',     label: 'Open: Auditor Challenge & Dispute',         category: 'Actions',     color: 'var(--error)' },
  { id: 'ACTION_RELEASE_ESCROW',label: 'Release Settlement Escrow (₹50,000)',       category: 'Actions',     color: 'var(--teal)' },
  { id: 'ACTION_RESET_DATA',    label: 'Reset Ledger to Default State',             category: 'System',      color: 'var(--text-faint)' },
];

function CommandMenu({ isOpen, onClose, onAction }) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = React.useRef(null);

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onClose(!isOpen); }
      if (e.key === 'Escape' && isOpen)               { onClose(false); setQuery(''); }
      if (!isOpen) return;
      if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[activeIdx]) {
        onAction(filtered[activeIdx].id);
        onClose(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, filtered, activeIdx, onAction, onClose]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const groups = {};
  filtered.forEach(c => { if (!groups[c.category]) groups[c.category] = []; groups[c.category].push(c); });

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 80,
        paddingLeft: 16,
        paddingRight: 16,
        background: 'rgba(23,35,34,0.5)',
      }}
      onClick={e => { if (e.target === e.currentTarget) { onClose(false); setQuery(''); } }}
    >
      <div
        className="animate-reveal-up"
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(23,35,34,0.15)',
        }}
      >
        {/* Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Command size={15} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              fontSize: 14,
              background: 'transparent',
              color: 'var(--text)',
            }}
          />
          <button
            onClick={() => { onClose(false); setQuery(''); }}
            style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 6px',
              border: '1px solid var(--border)',
              borderRadius: 3,
              background: 'var(--bg)',
              color: 'var(--text-faint)',
              cursor: 'pointer',
            }}
          >
            ESC
          </button>
        </div>

        {/* Groups */}
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {Object.entries(groups).map(([cat, cmds]) => (
            <div key={cat}>
              <div
                style={{
                  padding: '8px 16px 4px',
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: 'var(--text-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'var(--bg)',
                }}
              >
                {cat}
              </div>
              {cmds.map(cmd => {
                const idx = filtered.indexOf(cmd);
                const isActive = activeIdx === idx;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => { onAction(cmd.id); onClose(false); setQuery(''); }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 16px',
                      cursor: 'pointer',
                      background: isActive ? 'var(--surface-warm)' : 'transparent',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    {isActive && (
                      <ChevronRight size={12} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                    )}
                    {!isActive && <span style={{ width: 12, flexShrink: 0 }} />}
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: cmd.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: 'var(--text)' }}>
                      {cmd.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg)',
            display: 'flex',
            gap: 16,
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--text-faint)',
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ execute</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EVIDENCE INSPECTION MODAL
// ═══════════════════════════════════════════════════════════
function EvidenceModal({ item, onClose }) {
  if (!item) return null;

  const isOk  = !item.status || item.status === 'VALID';
  const isErr = item.status === 'TAMPERED_HASH' || item.status === 'MISMATCH';
  const color = isErr ? 'var(--error)' : item.status === 'SUSPICIOUS' ? 'var(--warning)' : 'var(--success)';

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(23,35,34,0.5)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-reveal-up evidence-doc"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: '85vh',
          overflowY: 'auto',
          borderTopColor: color,
          borderTopWidth: 3,
          boxShadow: '0 20px 40px rgba(23,35,34,0.12)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="label-caps" style={{ marginBottom: 6 }}>Evidence Record · {item.code}</div>
            <h3 className="font-serif" style={{ fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>
              {item.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Metadata */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {[
            { label: 'Classification', value: item.code },
            { label: 'Status', value: item.status || 'VALID', color },
            { label: 'Timestamp', value: `${item.ts} IST` },
          ].map(({ label, value, color: c }, i) => (
            <div
              key={i}
              style={{
                padding: '14px 20px',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div className="label-caps" style={{ marginBottom: 4 }}>{label}</div>
              <div
                className="font-mono"
                style={{ fontSize: 12, fontWeight: 700, color: c || 'var(--text)' }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Payload */}
        <div style={{ padding: '20px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
              }}
            >
              Canonical Payload
            </span>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>SHA-256 Canonical Leaf</span>
          </div>
          <pre
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border-light)',
              borderRadius: 4,
              padding: '14px 16px',
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--text)',
              overflowX: 'auto',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {JSON.stringify(item.data || {}, null, 2)}
          </pre>

          {/* Hash */}
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: 'var(--bg)',
              border: '1px solid var(--border-light)',
              borderRadius: 4,
            }}
          >
            <div className="label-caps" style={{ marginBottom: 4 }}>Leaf Hash Digest</div>
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                color: isErr ? 'var(--error)' : 'var(--teal)',
                wordBreak: 'break-all',
              }}
            >
              {item.leafHash || 'Pending'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button className="btn-secondary" onClick={onClose}>Close Record</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CHALLENGE MODAL
// ═══════════════════════════════════════════════════════════
function ChallengeModal({ isOpen, onClose, batch, onSubmit }) {
  const [reason, setReason] = useState('Downstream certified receipt proves delta against claimed recovery weight.');
  const [bounty, setBounty] = useState(15000);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !batch) return null;

  const delta = Math.abs((batch.claimedRecoveredWeight || 0) - (batch.downstreamWeight || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (onSubmit) await onSubmit({ batchId: batch.id, reason, bountyINR: Number(bounty), challenger: '0xAuditorAddress' });
      onClose();
    } catch (err) {
      console.error(err);
    } finally { setSubmitting(false); }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(23,35,34,0.5)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-reveal-up evidence-doc evidence-doc-error"
        style={{ width: '100%', maxWidth: 500, boxShadow: '0 20px 40px rgba(23,35,34,0.12)' }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="label-caps" style={{ marginBottom: 6 }}>Dispute Record</div>
            <h3 className="font-serif" style={{ fontSize: 20, color: 'var(--text)' }}>
              Initiate Challenge
            </h3>
          </div>
          <button onClick={onClose} style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', background: 'var(--bg)', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Alert */}
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--error-light)',
              border: '1px solid var(--error)',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: 'var(--error)',
              lineHeight: 1.5,
            }}
          >
            ⚠ Submitting a challenge freezes escrowed funds and stakes your auditor bond into the dispute protocol.
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'Claimed', value: `${batch.claimedRecoveredWeight} kg`, color: 'var(--warning)' },
              { label: 'Buyer Receipt', value: `${batch.downstreamWeight} kg`, color: 'var(--error)' },
              { label: 'Delta', value: `±${delta} kg`, color: delta > 20 ? 'var(--error)' : 'var(--text-muted)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 4 }}>
                <div className="label-caps" style={{ marginBottom: 4 }}>{label}</div>
                <div className="font-mono font-bold" style={{ fontSize: 14, color }}>{value}</div>
              </div>
            ))}
          </div>

          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>Challenge Reason</label>
            <textarea required rows={3} value={reason} onChange={e => setReason(e.target.value)}
              style={{ width: '100%', fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '10px 12px', resize: 'none' }} />
          </div>

          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>Staked Bounty (INR)</label>
            <div style={{ position: 'relative' }}>
              <span className="font-mono" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>₹</span>
              <input type="number" min="5000" step="1000" value={bounty} onChange={e => setBounty(e.target.value)}
                style={{ width: '100%', paddingLeft: 28, padding: '10px 12px 10px 28px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--warning)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-danger" style={{ flex: 1, justifyContent: 'center', background: 'var(--error)', color: '#fff', opacity: submitting ? 0.6 : 1 }}>
              <Send size={13} />
              {submitting ? 'Broadcasting…' : 'Stake & Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FORENSIC WORKBENCH — main orchestrator
// ═══════════════════════════════════════════════════════════
export default function ForensicWorkbench() {
  const { currentUser } = useAuth();
  const [batches, setBatches] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeStage, setActiveStage] = useState('RECONCILIATION');
  const [inspectItem, setInspectItem] = useState(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const loadData = useCallback(async (preferredId) => {
    setLoading(true);
    try {
      const data = await api.getBatches();
      setBatches(data);
      if (preferredId)            setActiveId(preferredId);
      else if (!activeId && data.length) setActiveId(data[0].id);
    } finally { setLoading(false); }
  }, [activeId]);

  useEffect(() => { loadData(); }, []);

  const batch = batches.find(b => b.id === activeId) || batches[0];
  const scenario = batch?.scenario || 'NORMAL';

  // Scenario transform (in-place)
  const applyScenario = (sc) => {
    if (!batch) return;
    const isOk = sc === 'NORMAL';
    const claim = sc === 'NORMAL' ? 680 : sc === 'INCONSISTENT' ? 900 : 850;
    const down  = sc === 'NORMAL' ? 675 : sc === 'INCONSISTENT' ? 720 : 500;

    setBatches(prev => prev.map(b => b.id !== batch.id ? b : {
      ...b, scenario: sc,
      status: isOk ? 'VERIFIED' : 'FLAGGED',
      claimedRecoveredWeight: claim,
      downstreamWeight: down,
      residueWeight: b.inputWeight - claim,
      evidence: {
        ...b.evidence,
        processingLog:     { ...b.evidence?.processingLog,     status: sc === 'TAMPERED' ? 'TAMPERED_HASH' : isOk ? 'VALID' : 'SUSPICIOUS' },
        downstreamInvoice: { ...b.evidence?.downstreamInvoice, status: isOk ? 'VALID' : 'MISMATCH', verifiedWeight: down },
      },
      aiReport: {
        ...b.aiReport,
        status: isOk ? 'CONSISTENT' : 'FLAGGED',
        massBalance:    { passed: isOk, message: isOk ? 'Mass balance conserved within 0.5% thermodynamic bounds.' : 'Thermodynamic violation: Output exceeds theoretical yield envelope.' },
        downstreamMatch:{ passed: isOk, delta: down - claim, message: isOk ? 'Downstream off-taker delivery matched without discrepancy.' : `Severe mismatch of ${claim - down} kg detected.` },
        explanation: isOk ? 'Physical weighment, energy draw, and downstream certified lading pass multi-agent audit.' : 'Auditor alert: Reported recovery is contradictory to thermodynamic energy input and off-taker scales.',
      },
    }));
  };

  const handleApprove = async (id, notes) => {
    await api.updateSettlement(id, 'RELEASED');
    await loadData(id);
  };
  const handleReject = async (id, notes) => {
    await api.updateSettlement(id, 'HELD');
    await loadData(id);
    setActiveStage('CHALLENGE');
  };
  const handleChallenge = async (d) => {
    await api.challengeBatch(batch.id, d);
    await loadData(batch.id);
    setActiveStage('SETTLEMENT');
  };

  const handleCommand = (id) => {
    if (id === 'SCENARIO_NORMAL')       applyScenario('NORMAL');
    if (id === 'SCENARIO_INCONSISTENT') applyScenario('INCONSISTENT');
    if (id === 'SCENARIO_TAMPERED')     applyScenario('TAMPERED');
    if (id === 'ACTION_VERIFY_STAGE')   setActiveStage('VERIFICATION');
    if (id === 'ACTION_CHALLENGE')      setIsChallengeOpen(true);
    if (id === 'ACTION_RELEASE_ESCROW') handleApprove(batch.id, 'Via command');
    if (id === 'ACTION_RESET_DATA')     api.resetData().then(() => loadData());
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--teal)',
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin-slow 1s linear infinite',
            }}
          />
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            Loading workspace…
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'var(--text-muted)' }}>
        No batches available. Run a simulation to generate data.
      </div>
    );
  }

  // Stage-specific right panel content
  const renderStageContent = () => {
    if (!batch) return <div style={{ padding: 20, color: 'var(--text-muted)' }}>No batch selected. Run a simulation to generate data.</div>;

    switch (activeStage) {
      case 'EVIDENCE':
        return <EvidenceChain evidence={batch.evidence} onInspect={setInspectItem} />;
      case 'RECONCILIATION':
        return <ReconciliationPanel aiReport={batch.aiReport} scenario={scenario} />;
      case 'VERIFICATION':
        return <VerificationPanel batch={batch} onApprove={handleApprove} onReject={handleReject} />;
      case 'ATTESTATION':
      case 'SETTLEMENT':
        return (
          <div
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 20 }}
          >
            <div className="label-caps" style={{ marginBottom: 8 }}>
              {activeStage === 'ATTESTATION' ? 'On-Chain Attestation' : 'Settlement'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Attestation ID',   value: batch.blockchain?.attestationId || '—' },
                { label: 'Tx Hash',          value: batch.blockchain?.txHash || '—' },
                { label: 'Evidence Root',    value: batch.blockchain?.evidenceRoot || '—', truncate: true },
                { label: 'Escrow Status',    value: batch.settlement?.status || '—' },
                { label: 'Settlement INR',   value: `₹${(batch.settlement?.amountINR || 0).toLocaleString()}` },
              ].map(({ label, value, truncate }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--border-light)' }}>
                  <span className="label-caps">{label}</span>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--teal)', maxWidth: truncate ? 220 : 'none', wordBreak: 'break-all', textAlign: 'right' }}>
                    {value}
                  </span>
                </div>
              ))}
              {!batch.challenge && (
                <button
                  onClick={() => setIsChallengeOpen(true)}
                  className="btn-danger"
                  style={{ marginTop: 8, justifyContent: 'center' }}
                >
                  <ShieldAlert size={14} />
                  Raise Dispute
                </button>
              )}
            </div>
          </div>
        );
      default: // BATCH
        return (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 20 }}>
            <div className="label-caps" style={{ marginBottom: 12 }}>Batch Parameters</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Input Weight',  field: 'inputWeight',               readOnly: true },
                { label: 'Claimed Recovery', field: 'claimedRecoveredWeight', readOnly: false },
                { label: 'Downstream Certified', field: 'downstreamWeight',   readOnly: false },
              ].map(({ label, field, readOnly }) => (
                <div key={field}>
                  <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>{label}</label>
                  <input
                    type="number"
                    value={batch[field] || ''}
                    readOnly={readOnly}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 14,
                      background: readOnly ? 'var(--bg)' : 'var(--surface)',
                      color: 'var(--teal)',
                      fontWeight: 700,
                    }}
                  />
                </div>
              ))}
              <button
                onClick={async () => {
                  setIsGenerating(true);
                  try {
                    const { id, batchId, _id, _raw, ...batchData } = batch;
                    const nb = await api.createBatch({ ...batchData, amountINR: batch.settlement?.amountINR || 50000 });
                    await loadData(nb.id);
                  } finally { setIsGenerating(false); }
                }}
                className="btn-primary"
                style={{ justifyContent: 'center' }}
                disabled={isGenerating}
              >
                {isGenerating ? 'Running simulation…' : 'Re-run Simulation'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Pipeline bar */}
      <PipelineBar activeStage={activeStage} onStageChange={setActiveStage} />

      {/* Page header */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '28px 24px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="label-caps" style={{ marginBottom: 4 }}>Forensic Evidence Workstation</div>
          <h2
            className="font-serif"
            style={{ fontSize: 28, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}
          >
            {greeting}, {currentUser?.id || 'Operator'}
          </h2>
          <p style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 14, color: 'var(--text-muted)' }}>
            Here's your recycling forensics overview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsCommandOpen(true)}
            className="btn-secondary"
          >
            <Command size={14} />
            Commands
            <span
              className="font-mono"
              style={{ fontSize: 10, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 3, background: 'var(--surface-warm)', color: 'var(--text)' }}
            >
              ⌘K
            </span>
          </button>
          <button
            onClick={() => api.resetData().then(() => loadData())}
            className="btn-secondary"
            title="Reset to defaults"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '24px',
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        {/* Left: batch master list */}
        <BatchMasterList
          batches={batches}
          selectedId={activeId}
          onSelect={setActiveId}
          onScenario={applyScenario}
          scenario={scenario}
        />

        {/* Center + right */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Mass balance flow — primary visual */}
          <MassBalanceFlow batch={batch} scenario={scenario} />

          {/* Two-column: stage content + side info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
            <div>{renderStageContent()}</div>

            {/* Side: dossier summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div className="label-caps" style={{ marginBottom: 2 }}>Dossier</div>
                  <div className="font-mono font-bold" style={{ fontSize: 14, color: 'var(--teal)' }}>{batch.id}</div>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Material', value: batch.material },
                    { label: 'Recycler', value: batch.recycler },
                    { label: 'Producer', value: batch.producer },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span className="label-caps">{label}</span>
                      <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 12, fontWeight: 500, color: 'var(--text)', textAlign: 'right' }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick navigation */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div className="label-caps">Quick navigation</div>
                </div>
                {PIPELINE_STAGES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveStage(s.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 16px',
                      background: activeStage === s.id ? 'var(--teal-light)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontSize: 12,
                      fontWeight: activeStage === s.id ? 600 : 400,
                      color: activeStage === s.id ? 'var(--teal)' : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { if (activeStage !== s.id) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={e => { if (activeStage !== s.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)', marginRight: 6 }}>{s.code}</span>
                      {s.label}
                    </span>
                    {activeStage === s.id && <ChevronRight size={12} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ledger table */}
          <LedgerTable batches={batches} selectedId={activeId} onSelect={setActiveId} />
        </div>
      </div>

      {/* Modals */}
      {inspectItem && <EvidenceModal item={inspectItem} onClose={() => setInspectItem(null)} />}
      <CommandMenu isOpen={isCommandOpen} onClose={setIsCommandOpen} onAction={handleCommand} />
      <ChallengeModal isOpen={isChallengeOpen} onClose={() => setIsChallengeOpen(false)} batch={batch} onSubmit={handleChallenge} />
    </div>
  );
}
