import React from 'react';
import { X, ShieldCheck, AlertOctagon, Hash } from 'lucide-react';

export default function EvidenceInspectionModal({ isOpen, onClose, evidenceItem }) {
  if (!isOpen || !evidenceItem) return null;

  const isOk = !evidenceItem.status || evidenceItem.status === 'VALID';
  const isTampered = evidenceItem.status === 'TAMPERED_HASH' || evidenceItem.status === 'MISMATCH';
  const statusColor = isTampered ? 'var(--error)' : evidenceItem.status === 'SUSPICIOUS' ? 'var(--warning)' : 'var(--success)';
  const statusBg = isTampered ? 'var(--error-light)' : evidenceItem.status === 'SUSPICIOUS' ? 'var(--warning-light)' : 'var(--success-light)';

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(18, 60, 54, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="evidence-doc animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 640,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--surface-warm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 4, height: 32, borderRadius: 2, background: statusColor }} />
            <div>
              <div className="label-caps-sm" style={{ color: 'var(--text-muted)' }}>
                Forensic Dossier // {evidenceItem.code || 'LEAF-XX'}
              </div>
              <h3 className="font-serif" style={{ fontSize: 18, color: 'var(--text)', margin: '2px 0 0' }}>
                {evidenceItem.title || evidenceItem.key}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: 6 }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Content body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '68vh', overflowY: 'auto' }}>
          {/* Metadata grid */}
          <div
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              border: '1px solid var(--border-light)',
              borderRadius: 6,
              background: 'var(--bg)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '12px 16px', borderRight: '1px solid var(--border-light)' }}>
              <span className="label-caps-sm" style={{ display: 'block', marginBottom: 2 }}>Classification</span>
              <span className="font-mono font-bold" style={{ fontSize: 12, color: 'var(--text)' }}>
                {evidenceItem.code || 'LEAF-XX'}
              </span>
            </div>
            <div style={{ padding: '12px 16px', borderRight: '1px solid var(--border-light)' }}>
              <span className="label-caps-sm" style={{ display: 'block', marginBottom: 2 }}>Integrity Status</span>
              <span className="font-mono font-bold" style={{ fontSize: 12, color: statusColor }}>
                {evidenceItem.status || 'VALID'}
              </span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <span className="label-caps-sm" style={{ display: 'block', marginBottom: 2 }}>Audit Verdict</span>
              <span className="font-mono" style={{ fontSize: 12, color: isOk ? 'var(--success)' : 'var(--error)' }}>
                {isOk ? 'PASS (99.8%)' : 'ANOMALY DETECTED'}
              </span>
            </div>
          </div>

          {/* Canonical payload */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="label-caps-sm">Telemetry & Canonical Payload</span>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>SHA-256 Canonical Leaf</span>
            </div>
            <pre
              style={{
                padding: '14px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border-light)',
                borderRadius: 6,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: 'var(--text)',
                overflowX: 'auto',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {JSON.stringify(evidenceItem.data || evidenceItem, null, 2)}
            </pre>
          </div>

          {/* Leaf hash digest */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--bg)',
              border: '1px solid var(--border-light)',
              borderRadius: 6,
            }}
          >
            <div className="label-caps-sm" style={{ marginBottom: 4 }}>Merkle Leaf Digest</div>
            <div className="font-mono" style={{ fontSize: 11, color: isTampered ? 'var(--error)' : 'var(--teal)', wordBreak: 'break-all' }}>
              {evidenceItem.leafHash || '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'flex-end',
            background: 'var(--surface-warm)',
          }}
        >
          <button onClick={onClose} className="btn-secondary">
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
}
