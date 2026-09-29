import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, Coins } from 'lucide-react';

export default function StatusTimeline({ status, createdAt, blockchainTime }) {
  const steps = [
    { key: 'CREATED', label: 'Batch Intake Created', desc: 'Material weighed & certified slip logged' },
    { key: 'AI_VERIFIED', label: 'Multi-Agent AI Audit', desc: 'Mass-balance & telemetry envelope verified' },
    { key: 'ATTESTED', label: 'MST Testnet Attestation', desc: 'Merkle root committed on-chain' },
    { key: 'SETTLED', label: 'Escrow Settlement', desc: 'Recycler payout released or disputed' }
  ];

  const getStepState = (index) => {
    if (status === 'FLAGGED' && index === 1) return 'error';
    if (status === 'CHALLENGED' && index >= 2) return 'disputed';
    if (status === 'VERIFIED') return 'completed';
    return index === 0 ? 'completed' : 'pending';
  };

  const getNodeColor = (state) => {
    if (state === 'completed') return { dot: 'var(--success)', border: 'var(--success)' };
    if (state === 'error') return { dot: 'var(--error)', border: 'var(--error)' };
    if (state === 'disputed') return { dot: 'var(--warning)', border: 'var(--warning)' };
    return { dot: 'var(--surface)', border: 'var(--border)' };
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '20px 24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="label-caps" style={{ marginBottom: 16 }}>
        Lifecycle Verification Stages
      </div>
      
      <div style={{ position: 'relative', borderLeft: '1px solid var(--border)', marginLeft: 10, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {steps.map((step, idx) => {
          const state = getStepState(idx);
          const colors = getNodeColor(state);

          return (
            <div key={step.key} style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: -26,
                  top: 2,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: colors.dot,
                  border: `2px solid ${colors.border}`,
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: state === 'completed' ? 'var(--text)' : state === 'error' ? 'var(--error)' : 'var(--text-muted)',
                    }}
                  >
                    {step.label}
                  </span>
                  {state === 'completed' && <CheckCircle2 size={13} style={{ color: 'var(--success)' }} />}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
