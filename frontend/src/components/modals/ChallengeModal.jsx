import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, Coins, Send } from 'lucide-react';

export default function ChallengeModal({ isOpen, onClose, batch, onChallengeSubmitted }) {
  const [reason, setReason] = useState(
    'Downstream certified receipt proves delta against claimed recovery weight. Weighbridge scale seal was broken between process step 2 and step 3.'
  );
  const [bountyINR, setBountyINR] = useState(15000);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !batch) return null;

  const delta = Math.abs((batch.claimedRecoveredWeight || 0) - (batch.downstreamWeight || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (onChallengeSubmitted) {
        await onChallengeSubmitted({
          batchId: batch.id,
          reason,
          bountyINR: Number(bountyINR),
          challenger: '0x77A19bE492801FdA21004C9912AcDa78912066fB',
        });
      }
      onClose();
    } catch (err) {
      console.error('Challenge submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(10, 11, 12, 0.90)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg border overflow-hidden animate-slide-up"
        style={{ background: 'var(--bg-concrete)', borderColor: 'var(--rust-dim)' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ background: 'var(--bg-void)', borderColor: 'var(--rust-dim)' }}
        >
          <div className="flex items-center gap-3">
            {/* Accent bar */}
            <div className="w-1 self-stretch" style={{ background: 'var(--rust)' }} />
            <div>
              <span className="field-label">Auditor Dispute Protocol</span>
              <h3 className="font-serif text-lg font-semibold" style={{ color: 'var(--paper-aged)' }}>
                Initiate MST Fraud Challenge
              </h3>
              <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--paper-ghost)' }}>
                Challenge &amp; Escrow Freeze // Stake Bond Required
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border transition-colors flex-shrink-0"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--paper-ghost)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-concrete-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Warning notice — engineering caution box */}
          <div
            className="flex items-start gap-2.5 p-3 border"
            style={{ background: 'var(--rust-trace)', borderColor: 'var(--rust-dim)' }}
          >
            <AlertTriangle size={14} style={{ color: 'var(--rust)', flexShrink: 0, marginTop: 1 }} />
            <p className="font-mono text-[10px] leading-relaxed" style={{ color: 'var(--rust-bright)' }}>
              Submitting a challenge freezes escrowed funds on MST Testnet and stakes your auditor bond
              into the dispute resolution protocol. This action is irreversible.
            </p>
          </div>

          {/* Target batch */}
          <div>
            <label className="field-label mb-1.5">Target Batch Dossier</label>
            <input
              type="text"
              readOnly
              value={batch.id}
              className="w-full px-3 py-2 font-bold text-[12px]"
              style={{ color: 'var(--paper-aged)', background: 'var(--charcoal)' }}
            />
          </div>

          {/* Mass discrepancy — engineering spec grid */}
          <div
            className="grid grid-cols-3 divide-x border"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="p-3">
              <span className="field-label mb-1">Claimed Recovery</span>
              <span className="font-mono text-[13px] font-bold" style={{ color: 'var(--amber)' }}>
                {batch.claimedRecoveredWeight} kg
              </span>
            </div>
            <div className="p-3" style={{ borderLeft: '1px solid var(--border-primary)' }}>
              <span className="field-label mb-1">Buyer Receipt</span>
              <span className="font-mono text-[13px] font-bold" style={{ color: 'var(--rust)' }}>
                {batch.downstreamWeight} kg
              </span>
            </div>
            <div className="p-3" style={{ borderLeft: '1px solid var(--border-primary)' }}>
              <span className="field-label mb-1">Mass Delta</span>
              <span className="font-mono text-[13px] font-bold" style={{ color: delta > 20 ? 'var(--rust)' : 'var(--paper-dim)' }}>
                ±{delta} kg
              </span>
            </div>
          </div>

          {/* Reason textarea */}
          <div>
            <label className="field-label mb-1.5">Challenge Reason &amp; Proof Narrative</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-[11px] leading-relaxed resize-none"
              style={{ color: 'var(--paper-dim)' }}
            />
          </div>

          {/* Bounty */}
          <div>
            <label className="field-label mb-1.5">Staked Challenge Bounty (INR)</label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[13px]"
                style={{ color: 'var(--paper-ghost)' }}
              >
                ₹
              </span>
              <input
                type="number"
                min="5000"
                step="1000"
                value={bountyINR}
                onChange={(e) => setBountyINR(e.target.value)}
                className="w-full pl-7 pr-3 py-2"
                style={{ color: 'var(--amber)' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div
            className="pt-3 flex items-center justify-end gap-3 border-t"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-mono text-[10px] uppercase border transition-colors"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--paper-ghost)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--paper-aged)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--paper-ghost)'; }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-1.5 font-mono text-[10px] font-bold uppercase border transition-all disabled:opacity-40"
              style={{
                background: 'var(--rust)',
                borderColor: 'var(--rust)',
                color: 'var(--paper-aged)',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--rust-bright)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--rust)';
              }}
            >
              <Send size={12} />
              {submitting ? 'Broadcasting...' : 'Stake & Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
