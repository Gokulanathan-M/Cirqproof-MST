import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link2, RefreshCw, Shield, Clock, Hash, Check, ExternalLink } from 'lucide-react';

/* ─────────────────────────────────────────────
   ANIMATED HASH REVEAL
─────────────────────────────────────────────── */
function HashReveal({ hash, color = 'var(--text)' }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <span
      className="font-mono hash-reveal"
      style={{
        fontSize: 11,
        color,
        letterSpacing: '0.04em',
        animation: revealed ? 'hash-scan 0.8s cubic-bezier(0.22,1,0.36,1) both' : 'none',
      }}
    >
      {hash ? `${hash.slice(0, 20)}...` : '—'}
    </span>
  );
}

/* ─────────────────────────────────────────────
   BLOCK CARD
─────────────────────────────────────────────── */
function BlockCard({ block, index, isNew }) {
  const isConfirmed = block.confirmed !== false;
  const statusColor = isConfirmed ? 'var(--success)' : 'var(--warning)';

  return (
    <div
      className={isNew ? 'animate-block-confirm' : 'animate-reveal-up'}
      style={{
        animationDelay: `${index * 60}ms`,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: 6,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.2s ease',
        boxShadow: isNew ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = isNew ? 'var(--shadow-lg)' : 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {/* Block number */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 6,
          background: isConfirmed ? 'var(--success-light)' : 'var(--warning-light)',
          border: `1px solid ${isConfirmed ? 'var(--success)' : 'var(--warning)'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div className="label-caps-sm" style={{ color: 'var(--text-faint)', fontSize: 8 }}>BLOCK</div>
        <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
          #{block.blockNumber || (8830 + index)}
        </div>
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            {block.batchId || block.id || `CP-2026-00${index + 1}`}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '2px 7px',
              borderRadius: 2,
              background: isConfirmed ? 'var(--success-light)' : 'var(--warning-light)',
              color: isConfirmed ? 'var(--success)' : 'var(--warning)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {isConfirmed ? 'CONFIRMED' : 'PENDING'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div className="label-caps-sm" style={{ marginBottom: 2 }}>TX HASH</div>
            <HashReveal hash={block.txHash || block.blockchain?.txHash} color="var(--teal)" />
          </div>
          {block.merkleRoot && (
            <div>
              <div className="label-caps-sm" style={{ marginBottom: 2 }}>MERKLE ROOT</div>
              <HashReveal hash={block.merkleRoot} color="var(--earth)" />
            </div>
          )}
        </div>
      </div>

      {/* Right side: timestamp + material */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 4 }}>
          {block.timestamp
            ? new Date(block.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
            : new Date(Date.now() - index * 840000).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
          }
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {block.material || 'E-Waste'}
        </div>
        <div className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', marginTop: 3 }}>
          {block.claimedRecoveredWeight || '—'} kg
        </div>
      </div>

      {/* External link */}
      <div style={{ flexShrink: 0 }}>
        <a 
          href={`https://explorer.mst-testnet.io/tx/${block.txHash || block.blockchain?.txHash}`} 
          target="_blank" 
          rel="noopener noreferrer"
          title="View on MST Explorer"
        >
          <ExternalLink size={13} style={{ color: 'var(--text-faint)' }} />
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NEW BLOCK ANIMATION
─────────────────────────────────────────────── */
function NewBlockBeingMined({ show }) {
  if (!show) return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--surface-warm)',
        border: '2px dashed var(--teal)',
        borderRadius: 6,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 6,
          background: 'var(--teal-light)',
          border: '1px solid var(--teal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            border: '2px solid var(--teal)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin-slow 1s linear infinite',
          }}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', marginBottom: 4 }}>
          Committing new block...
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Computing Merkle root · Anchoring evidence hash
        </div>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <div
          className="font-mono"
          style={{ fontSize: 10, color: 'var(--warning)', animation: 'status-pulse 1s ease infinite' }}
        >
          PENDING CONFIRMATION
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAIN STATS BAR
─────────────────────────────────────────────── */
function ChainStatsBar({ batches }) {
  const verified  = batches.filter(b => b.status === 'VERIFIED').length;
  const total     = batches.length;
  const totalKg   = batches.reduce((a, b) => a + (b.claimedRecoveredWeight || 0), 0);

  const stats = [
    { label: 'CHAIN ID',         value: '4242',              color: 'var(--teal)' },
    { label: 'LATEST BLOCK',     value: `#${8830 + total}`,   color: 'var(--text)' },
    { label: 'BLOCKS CONFIRMED', value: verified,             color: 'var(--success)' },
    { label: 'TOTAL ATTESTED',   value: `${totalKg.toLocaleString()} KG`, color: 'var(--gold)' },
    { label: 'NETWORK',          value: 'MST TESTNET',        color: 'var(--earth)' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        background: 'var(--surface-warm)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            flex: 1,
            padding: '16px 20px',
            borderRight: i < stats.length - 1 ? '1px solid var(--border-light)' : 'none',
          }}
        >
          <div className="label-caps-sm" style={{ color: 'var(--text-faint)', marginBottom: 6 }}>
            {s.label}
          </div>
          <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: s.color }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN BLOCKCHAIN PAGE
─────────────────────────────────────────────── */
export default function Blockchain() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);

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

  useEffect(() => { loadData(); }, []);

  const simulateMining = () => {
    setMining(true);
    setTimeout(() => {
      setMining(false);
      loadData();
    }, 3000);
  };

  // Batches that have blockchain data
  const onChainBatches = batches.filter(b => b.blockchain?.txHash || b.status === 'VERIFIED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="animate-reveal-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="label-caps" style={{ marginBottom: 8 }}>Immutable Evidence Ledger</div>
            <h1 className="font-serif" style={{ fontSize: 32, color: 'var(--text)', margin: 0, lineHeight: 1.1 }}>
              Blockchain<br />Attestation Record
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5, maxWidth: 480 }}>
              Every recycling batch is permanently anchored on the MST Testnet. Evidence hashes are immutable and independently verifiable.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadData} className="btn-secondary">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={simulateMining} className="btn-primary" disabled={mining}>
              <Link2 size={13} />
              {mining ? 'Mining...' : 'Commit Block'}
            </button>
          </div>
        </div>
      </div>

      {/* Chain stats */}
      <div className="animate-reveal-up stagger-1">
        <ChainStatsBar batches={batches} />
      </div>

      {/* Block layout: list + detail */}
      <div
        className="animate-reveal-up stagger-2"
        style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}
      >
        {/* Block list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="label-caps">Recent Attestations</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
              {onChainBatches.length} confirmed blocks
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Mining pending indicator */}
            <NewBlockBeingMined show={mining} />

            {loading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 80,
                    background: 'var(--surface)',
                    borderRadius: 6,
                    border: '1px solid var(--border-light)',
                  }}
                  className="shimmer"
                />
              ))
            ) : onChainBatches.length > 0 ? onChainBatches.map((batch, i) => (
              <BlockCard
                key={batch.id}
                block={batch}
                index={i}
                isNew={i === 0 && !mining}
              />
            )) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 6 }}>
                No attestations found on chain.
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* How it works */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="label-caps" style={{ marginBottom: 16 }}>Evidence Chain</div>

            {[
              { step: '01', label: 'Evidence Collected',  desc: 'Weighbridge, sensors, IoT devices upload tamper-evident records', color: 'var(--earth)' },
              { step: '02', label: 'Merkle Root Built',   desc: 'AI engine hashes all evidence records into a single root hash', color: 'var(--orange)' },
              { step: '03', label: 'On-Chain Commitment', desc: 'Root hash anchored on MST Testnet — permanently immutable', color: 'var(--gold)' },
              { step: '04', label: 'Settlement Released', desc: 'Smart contract verifies hash and releases escrow payment', color: 'var(--success)' },
            ].map((s, i) => (
              <div
                key={i}
                className="animate-reveal-up"
                style={{
                  display: 'flex',
                  gap: 12,
                  paddingBottom: 16,
                  animationDelay: `${i * 80 + 300}ms`,
                  position: 'relative',
                }}
              >
                {/* Line */}
                {i < 3 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 13,
                      top: 26,
                      bottom: 0,
                      width: 1,
                      background: 'var(--border-light)',
                    }}
                  />
                )}

                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 5,
                    background: 'var(--surface-warm)',
                    border: '1.5px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <span className="font-mono" style={{ fontSize: 8, fontWeight: 700, color: s.color }}>
                    {s.step}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current block info */}
          <div
            style={{
              background: 'var(--surface-warm)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '18px 20px',
            }}
          >
            <div className="label-caps" style={{ marginBottom: 14 }}>Network Info</div>
            {[
              { k: 'PROTOCOL',    v: 'EVM-compatible' },
              { k: 'CONSENSUS',   v: 'PoA Testnet' },
              { k: 'TXN TYPE',    v: 'Evidence Anchor' },
              { k: 'GAS POLICY',  v: '0 fee (testnet)' },
              { k: 'VERIFIER',    v: 'AI Multi-Agent v2' },
            ].map(({ k, v }) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: 11,
                }}
              >
                <span className="font-mono" style={{ color: 'var(--text-faint)', fontSize: 10, letterSpacing: '0.08em' }}>
                  {k}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
