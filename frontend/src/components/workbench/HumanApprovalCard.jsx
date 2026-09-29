import React, { useState } from 'react';
import { FileSignature, Lock, Check, X, AlertTriangle, ChevronRight } from 'lucide-react';

// Forensic checklist item — React Bits Agent Approval / Plan step
function ChecklistItem({ number, text, status, statusText }) {
  const isPass = status === 'pass';
  const isFail = status === 'fail';

  return (
    <div
      className="flex items-center gap-3 p-2.5 border-b"
      style={{ borderColor: 'var(--border-faint)', background: 'var(--bg-void)' }}
    >
      {/* Step number */}
      <div
        className="w-5 h-5 flex-shrink-0 flex items-center justify-center font-mono text-[9px] font-bold border"
        style={{
          borderColor: isPass ? 'var(--copper-dim)' : isFail ? 'var(--rust-dim)' : 'var(--border-primary)',
          color: isPass ? 'var(--copper)' : isFail ? 'var(--rust)' : 'var(--paper-ghost)',
          background: 'var(--bg-concrete-2)',
        }}
      >
        {number}
      </div>

      {/* Text */}
      <span className="flex-1 font-mono text-[10px]" style={{ color: 'var(--paper-dim)' }}>
        {text}
      </span>

      {/* Status */}
      <span
        className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 border whitespace-nowrap"
        style={{
          color: isPass ? 'var(--copper)' : isFail ? 'var(--rust)' : 'var(--paper-ghost)',
          borderColor: isPass ? 'var(--copper-dim)' : isFail ? 'var(--rust-dim)' : 'var(--border-primary)',
          background: isPass ? 'var(--copper-trace)' : isFail ? 'var(--rust-trace)' : 'transparent',
        }}
      >
        {statusText}
      </span>
    </div>
  );
}

export default function HumanApprovalCard({ batch, onApprove, onReject }) {
  const [notes, setNotes] = useState(
    'Certified physical mass balance inspected and reconciled against weighbridge slips.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [actionTaken, setActionTaken] = useState(null);

  const isFlagged =
    batch?.status === 'FLAGGED' ||
    batch?.scenario === 'INCONSISTENT' ||
    batch?.scenario === 'TAMPERED';

  const handleAction = async (action) => {
    setSubmitting(true);
    try {
      setActionTaken(action);
      if (action === 'APPROVE') {
        if (onApprove) await onApprove(batch.id, notes);
      } else {
        if (onReject) await onReject(batch.id, notes);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const checklistItems = [
    {
      number: '1',
      text: 'Physical intake mass equals process feed record',
      status: 'pass',
      statusText: `PASSED (${batch?.inputWeight} kg)`,
    },
    {
      number: '2',
      text: 'Yield complies with theoretical recovery limits (≤72%)',
      status: isFlagged ? 'fail' : 'pass',
      statusText: isFlagged ? 'FLAGGED — VIOLATION' : `PASSED (68% YIELD)`,
    },
    {
      number: '3',
      text: 'Downstream buyer certified counter-weighment matches',
      status: isFlagged ? 'fail' : 'pass',
      statusText: isFlagged
        ? `DELTA: ${Math.abs((batch?.claimedRecoveredWeight || 0) - (batch?.downstreamWeight || 0))} kg`
        : `CONFIRMED (${batch?.downstreamWeight} kg)`,
    },
  ];

  return (
    <div className="border border-[var(--border-primary)]" style={{ background: 'var(--bg-concrete)' }}>
      {/* Header */}
      <div
        className="px-5 py-3.5 border-b border-[var(--border-primary)] flex items-center justify-between"
        style={{ background: 'var(--bg-void)' }}
      >
        <div className="flex items-center gap-3">
          <FileSignature size={15} style={{ color: 'var(--copper)' }} />
          <div>
            <h4 className="font-serif text-base font-semibold" style={{ color: 'var(--paper-aged)' }}>
              Auditor Sign-Off Protocol
            </h4>
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--paper-ghost)' }}>
              Mandatory Dual-Control Workflow // Prior to Escrow Dispatch
            </span>
          </div>
        </div>

        <span
          className="font-mono text-[9px] uppercase tracking-wider px-2 py-1 border"
          style={{ borderColor: 'var(--border-primary)', color: 'var(--paper-ghost)', background: 'var(--bg-concrete-2)' }}
        >
          Stage: Verification
        </span>
      </div>

      {/* Plan checklist — React Bits Agent Approval step list */}
      <div className="border-b border-[var(--border-primary)]">
        {checklistItems.map((item) => (
          <ChecklistItem key={item.number} {...item} />
        ))}
      </div>

      {/* Auditor attestation notes */}
      <div className="p-4 space-y-3">
        <div>
          <label className="field-label mb-1.5">Auditor Attestation Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-[11px] leading-relaxed resize-none"
            style={{ color: 'var(--paper-dim)' }}
          />
        </div>

        {/* Escrow info + action buttons */}
        <div
          className="pt-3 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase"
            style={{ color: 'var(--paper-ghost)' }}
          >
            <Lock size={10} />
            MST Testnet Smart Contract Escrow
          </div>

          <div className="flex items-center gap-2">
            {actionTaken ? (
              <span
                className="font-mono text-[10px] uppercase font-bold px-3 py-1.5 border"
                style={{
                  color: actionTaken === 'APPROVE' ? 'var(--copper)' : 'var(--rust)',
                  borderColor: actionTaken === 'APPROVE' ? 'var(--copper-dim)' : 'var(--rust-dim)',
                  background: actionTaken === 'APPROVE' ? 'var(--copper-trace)' : 'var(--rust-trace)',
                }}
              >
                {actionTaken === 'APPROVE' ? '✓ ATTESTED' : '✗ DISPUTED'}
              </span>
            ) : (
              <>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAction('REJECT')}
                  className="px-4 py-1.5 font-mono text-[10px] font-bold uppercase border transition-colors disabled:opacity-40"
                  style={{ borderColor: 'var(--rust-dim)', color: 'var(--rust)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--rust-trace)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Dispute / Reject
                </button>
                <button
                  type="button"
                  disabled={submitting || isFlagged}
                  onClick={() => handleAction('APPROVE')}
                  className="px-5 py-1.5 font-mono text-[10px] font-bold uppercase border transition-colors disabled:opacity-40"
                  style={{
                    background: 'var(--copper)',
                    borderColor: 'var(--copper)',
                    color: 'var(--bg-void)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'var(--copper-bright)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--copper)';
                  }}
                >
                  Sign &amp; Attest
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
