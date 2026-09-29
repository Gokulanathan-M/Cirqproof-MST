import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Coins, Lock, Unlock, RotateCcw, CheckCircle2,
  AlertOctagon, ExternalLink, ShieldCheck, Scale,
  Layers, ArrowRight, Clock, FileCheck
} from 'lucide-react';

export default function Settlements() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getBatches();
      setBatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (batchId, newStatus) => {
    setProcessingId(batchId);
    try {
      await api.updateSettlement(batchId, newStatus);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const totalEscrow = batches.reduce((acc, b) => acc + (b.settlement?.amountINR || 0), 0);
  const releasedEscrow = batches
    .filter(b => b.settlement?.status === 'RELEASED')
    .reduce((acc, b) => acc + (b.settlement?.amountINR || 0), 0);
  const heldEscrow = batches
    .filter(b => b.settlement?.status === 'HELD' || b.settlement?.status === 'PENDING')
    .reduce((acc, b) => acc + (b.settlement?.amountINR || 0), 0);
  const disputedEscrow = batches
    .filter(b => b.status === 'CHALLENGED' || b.settlement?.status === 'REFUNDED')
    .reduce((acc, b) => acc + (b.settlement?.amountINR || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32, height: 32,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--teal)',
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin-slow 1s linear infinite'
            }}
          />
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            Loading Escrow Settlement Engine...
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'RELEASED': return { text: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success)' };
      case 'HELD':     return { text: 'var(--orange)', bg: 'var(--orange-light)', border: 'var(--orange)' };
      case 'REFUNDED': return { text: 'var(--earth)', bg: 'var(--earth-light)', border: 'var(--earth)' };
      case 'PENDING':  return { text: 'var(--gold)', bg: 'var(--gold-light)', border: 'var(--gold)' };
      default:         return { text: 'var(--text-muted)', bg: 'var(--bg)', border: 'var(--border)' };
    }
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div
        className="animate-reveal-up"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '24px 28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div
                style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: 'var(--teal-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Coins size={13} style={{ color: 'var(--teal)' }} />
              </div>
              <span className="label-caps" style={{ color: 'var(--teal)' }}>
                SMART CONTRACT ESCROW PROTOCOL
              </span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                EIP-4337 COMPLIANT
              </span>
            </div>
            <h1 className="font-serif" style={{ fontSize: 28, color: 'var(--text)', margin: '0 0 4px', lineHeight: 1.15 }}>
              Evidence-Linked Settlement Engine
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Physical mass verification automatically triggers smart contract escrow payouts. Funds remain cryptographically locked until forensic multi-agent attestation completes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={loadData}
              className="btn-ghost"
              title="Refresh ledger"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Escrow TVL Metrics Row */}
      <div
        className="animate-reveal-up stagger-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}
      >
        {[
          { label: 'Total Value Committed', val: totalEscrow, color: 'var(--teal)', sub: `${batches.length} Batches Contracted` },
          { label: 'Released Payouts', val: releasedEscrow, color: 'var(--success)', sub: 'Verified Impact Settled' },
          { label: 'Locked in Escrow', val: heldEscrow, color: 'var(--orange)', sub: 'Under Multi-Agent Audit' },
          { label: 'Challenged / Frozen', val: disputedEscrow, color: 'var(--error)', sub: 'Bounty Bond Staked' },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="label-caps-sm" style={{ marginBottom: 6 }}>{m.label}</div>
            <div className="font-mono font-bold" style={{ fontSize: 22, color: m.color, letterSpacing: '-0.03em' }}>
              ₹{m.val.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Settlement Protocol Lifecycle */}
      <div
        className="animate-reveal-up stagger-2"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="label-caps" style={{ marginBottom: 12 }}>
          Evidence Settlement Sequence
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { step: '01. DEPOSITED', desc: 'Buyer deposits INR to escrow contract on batch creation', color: 'var(--gold)' },
            { step: '02. AUDITED', desc: 'AI reconciliation and physical mass balance pass audit', color: 'var(--orange)' },
            { step: '03. VERIFIED', desc: 'Human verifier & off-taker sign off on recovery receipt', color: 'var(--teal)' },
            { step: '04. RELEASED', desc: 'Cryptographic release to recycler wallet occurs instantly', color: 'var(--success)' },
          ].map((st, i) => (
            <div
              key={i}
              style={{
                padding: '12px 14px',
                background: 'var(--bg)',
                borderRadius: 4,
                border: '1px solid var(--border-light)',
              }}
            >
              <div className="font-mono font-bold" style={{ fontSize: 11, color: st.color, marginBottom: 4 }}>
                {st.step}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {st.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batches Settlement Table */}
      <div
        className="animate-reveal-up stagger-3"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="label-caps" style={{ marginBottom: 2 }}>Settlement Escrow Registry</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Deterministic smart contract balances & transaction triggers
            </div>
          </div>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            Contract: {batches[0]?.blockchain?.settlementAddress || 'Pending'}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Batch ID', 'Facility & Material', 'Claimed Mass', 'Escrow INR', 'Settlement Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="label-caps-sm"
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const statusMeta = getStatusColor(batch.settlement?.status || 'PENDING');
                const isProcessing = processingId === batch.id;
                const isReleased = batch.settlement?.status === 'RELEASED';
                const isHeld = batch.settlement?.status === 'HELD';

                return (
                  <tr
                    key={batch.id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div className="font-mono font-bold" style={{ fontSize: 12, color: 'var(--teal)' }}>
                        {batch.id}
                      </div>
                      <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                        {batch.scenario}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                        {batch.recycler}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {batch.material}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div className="font-mono" style={{ fontSize: 12, color: 'var(--text)' }}>
                        {batch.claimedRecoveredWeight || 0} kg
                      </div>
                      <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                        of {batch.inputWeight || 0} kg intake
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div className="font-mono font-bold" style={{ fontSize: 13, color: 'var(--text)' }}>
                        ₹{(batch.settlement?.amountINR || 0).toLocaleString()}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 8px',
                          borderRadius: 2,
                          fontSize: 10,
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          background: statusMeta.bg,
                          color: statusMeta.text,
                          border: `1px solid ${statusMeta.border}50`,
                        }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusMeta.text }} />
                        {batch.settlement?.status || 'PENDING'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {!isReleased && (
                          <button
                            onClick={() => handleUpdateStatus(batch.id, 'RELEASED')}
                            disabled={isProcessing}
                            className="btn-primary"
                            style={{ padding: '5px 10px', fontSize: 11 }}
                            title="Release escrow payout to recycler"
                          >
                            <Unlock size={11} />
                            <span>{isProcessing ? 'Releasing…' : 'Release'}</span>
                          </button>
                        )}

                        {!isHeld && (
                          <button
                            onClick={() => handleUpdateStatus(batch.id, 'HELD')}
                            disabled={isProcessing}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: 11 }}
                            title="Freeze escrow funds for investigation"
                          >
                            <Lock size={11} />
                            <span>Freeze</span>
                          </button>
                        )}

                        {batch.settlement?.status !== 'REFUNDED' && (
                          <button
                            onClick={() => handleUpdateStatus(batch.id, 'REFUNDED')}
                            disabled={isProcessing}
                            className="btn-ghost"
                            style={{ padding: '5px 8px', fontSize: 11, color: 'var(--earth)' }}
                            title="Refund to producer buyer"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
