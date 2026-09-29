import React from 'react';
import { Bot, CheckCircle2, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function AiReportCard({ report }) {
  if (!report) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '24px',
          color: 'var(--text-muted)',
          fontSize: 12,
        }}
      >
        Forensic multi-agent evaluation in progress…
      </div>
    );
  }

  const isConsistent = report.status === 'CONSISTENT';

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isConsistent ? 'var(--border)' : 'var(--error)'}`,
        borderRadius: 8,
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: isConsistent ? 'var(--teal-light)' : 'var(--error-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={18} style={{ color: isConsistent ? 'var(--teal)' : 'var(--error)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                CirqProof Multi-Agent Reconciliation Report
              </h3>
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  color: 'var(--text-muted)',
                }}
              >
                v2.4-deterministic
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Autonomous telemetry, mass balance & downstream match engine
            </p>
          </div>
        </div>
        <StatusBadge status={report.status} size="lg" />
      </div>

      {/* Grid of 3 Core Checks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '16px' }}>
        {/* Mass Balance Check */}
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border-light)',
            borderRadius: 6,
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span className="label-caps-sm">Mass Balance</span>
            {report.massBalance?.passed ? (
              <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
            ) : (
              <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
            )}
          </div>
          <div
            className="font-mono font-bold"
            style={{ fontSize: 12, color: report.massBalance?.passed ? 'var(--success)' : 'var(--error)' }}
          >
            {report.massBalance?.passed ? 'CONSERVED' : 'THERMODYNAMIC VIOLATION'}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
            {report.massBalance?.message || `Variance: ${report.massBalance?.variancePercent}%`}
          </p>
        </div>

        {/* Capacity Check */}
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border-light)',
            borderRadius: 6,
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span className="label-caps-sm">Facility Capacity</span>
            {report.capacity?.passed !== false ? (
              <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
            ) : (
              <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
            )}
          </div>
          <div
            className="font-mono font-bold"
            style={{ fontSize: 12, color: report.capacity?.passed !== false ? 'var(--success)' : 'var(--error)' }}
          >
            {report.capacity?.passed !== false ? 'RATED COMPLIANT' : 'EXCEEDS CAPACITY'}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
            {report.capacity?.message || 'Within operational limits.'}
          </p>
        </div>

        {/* Downstream Match Check */}
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border-light)',
            borderRadius: 6,
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span className="label-caps-sm">Downstream Match</span>
            {report.downstreamMatch?.passed ? (
              <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
            ) : (
              <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
            )}
          </div>
          <div
            className="font-mono font-bold"
            style={{ fontSize: 12, color: report.downstreamMatch?.passed ? 'var(--success)' : 'var(--error)' }}
          >
            {report.downstreamMatch?.passed ? 'CONFIRMED RECEIPT' : 'DISCREPANCY DETECTED'}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
            {report.downstreamMatch?.message || 'Invoice weight aligns with recovery claimed.'}
          </p>
        </div>
      </div>

      {/* Explanation note */}
      {report.explanation && (
        <div
          style={{
            padding: '12px 14px',
            background: isConsistent ? 'var(--teal-wash)' : 'var(--error-light)',
            border: `1px solid ${isConsistent ? 'var(--border)' : 'var(--error)'}`,
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'Newsreader, Georgia, serif',
            fontStyle: 'italic',
            color: 'var(--text)',
            lineHeight: 1.5,
          }}
        >
          "{report.explanation}"
        </div>
      )}
    </div>
  );
}
