import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldAlert, AlertTriangle, Scale, Coins, ArrowRight,
  Gavel, CheckCircle2, XCircle, Search, FileText, Send,
  HelpCircle, Eye, AlertOctagon, History
} from 'lucide-react';

export default function Challenges() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const batchIdParam = searchParams.get('batchId');

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('Certified downstream off-taker bill of lading indicates an irreconcilable 180 kg delta against reported recovery mass.');
  const [bountyINR, setBountyINR] = useState(15000);
  const [submitting, setSubmitting] = useState(false);
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getBatches();
      setBatches(data);
      if (batchIdParam) {
        const found = data.find(b => b.id === batchIdParam);
        if (found) setSelectedBatch(found);
        else if (data.length > 0) setSelectedBatch(data[0]);
      } else {
        // Priority to an inconsistent or challenged batch
        const candidate = data.find(b => b.scenario === 'INCONSISTENT' || b.status === 'CHALLENGED' || b.scenario === 'TAMPERED') || data[0];
        setSelectedBatch(candidate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [batchIdParam]);

  const handleSubmitChallenge = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setSubmitting(true);
    try {
      await api.challengeBatch(selectedBatch.id, {
        batchId: selectedBatch.id,
        reason,
        bountyINR: Number(bountyINR),
        challenger: '0xAuditorAddress',
      });
      setChallengeSubmitted(true);
      setTimeout(() => {
        loadData();
        setChallengeSubmitted(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32, height: 32,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--error)',
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin-slow 1s linear infinite'
            }}
          />
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            Loading Forensic Dispute Dossiers...
          </div>
        </div>
      </div>
    );
  }

  if (!selectedBatch) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380, color: 'var(--text-muted)' }}>
        No batches available to investigate.
      </div>
    );
  }

  const delta = Math.abs((selectedBatch.claimedRecoveredWeight || 0) - (selectedBatch.downstreamWeight || 0));
  const isChallenged = selectedBatch.status === 'CHALLENGED' || selectedBatch.challenge != null;

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
                  background: 'var(--error-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ShieldAlert size={13} style={{ color: 'var(--error)' }} />
              </div>
              <span className="label-caps" style={{ color: 'var(--error)' }}>
                AUDITOR FRAUD DISPUTE PROTOCOL
              </span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                CASE FILE #{selectedBatch.id.replace('CP-', 'CF-')}
              </span>
            </div>
            <h1 className="font-serif" style={{ fontSize: 28, color: 'var(--text)', margin: '0 0 4px', lineHeight: 1.15 }}>
              Forensic Challenge & Investigation
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Independent verifiers stake collateral to contest material mass balance violations, fraudulent weight tickets, or altered telemetry hashes.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="label-caps" style={{ color: 'var(--text-muted)' }}>Investigate Batch:</span>
            <select
              value={selectedBatch.id}
              onChange={(e) => {
                const found = batches.find(b => b.id === e.target.value);
                if (found) setSelectedBatch(found);
              }}
              style={{
                padding: '8px 14px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.id} ({b.scenario}) — {b.status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Investigation Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Left Column: Forensic Evidence Anomaly & Flow Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Dispute Case Overview */}
          <div
            className="animate-reveal-up stagger-1 evidence-doc evidence-doc-error"
            style={{
              padding: '22px 24px',
              borderRadius: 8,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div className="label-caps" style={{ color: 'var(--error)', marginBottom: 4 }}>
                  Disputed Material Case
                </div>
                <div className="font-mono font-bold" style={{ fontSize: 20, color: 'var(--text)' }}>
                  {selectedBatch.id}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Claimed: {selectedBatch.material} by {selectedBatch.recycler}
                </div>
              </div>

              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 3,
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  background: isChallenged ? 'var(--error-light)' : 'var(--warning-light)',
                  color: isChallenged ? 'var(--error)' : 'var(--warning)',
                  border: `1px solid ${isChallenged ? 'var(--error)' : 'var(--warning)'}50`,
                }}
              >
                {isChallenged ? '● UNDER ACTIVE DISPUTE' : '⚠ ANOMALY DETECTED'}
              </span>
            </div>

            {/* Delta Comparison Matrix */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                padding: '16px',
                background: 'var(--bg)',
                borderRadius: 6,
                border: '1px solid var(--border-light)',
                marginBottom: 16,
              }}
            >
              <div>
                <span className="label-caps-sm" style={{ display: 'block', marginBottom: 4 }}>Claimed Recovery</span>
                <span className="font-mono font-bold" style={{ fontSize: 16, color: 'var(--warning)' }}>
                  {(selectedBatch.claimedRecoveredWeight || 680).toLocaleString()} kg
                </span>
              </div>
              <div>
                <span className="label-caps-sm" style={{ display: 'block', marginBottom: 4 }}>Buyer Off-taker Receipt</span>
                <span className="font-mono font-bold" style={{ fontSize: 16, color: 'var(--error)' }}>
                  {(selectedBatch.downstreamWeight || 675).toLocaleString()} kg
                </span>
              </div>
              <div>
                <span className="label-caps-sm" style={{ display: 'block', marginBottom: 4 }}>Unaccounted Delta</span>
                <span className="font-mono font-bold" style={{ fontSize: 16, color: delta > 20 ? 'var(--error)' : 'var(--teal)' }}>
                  {delta > 0 ? `±${delta.toLocaleString()} kg` : '0 kg (Consistent)'}
                </span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              {selectedBatch.aiReport?.explanation || 'Physical mass audit flagged potential phantom mass generation. Thermodynamic conservation violated.'}
            </p>
          </div>

          {/* Forensic Evidence Chain with Disputed Stage Highlighted */}
          <div
            className="animate-reveal-up stagger-2"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '22px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="label-caps" style={{ marginBottom: 14 }}>
              Evidence Chain Investigation Trace
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { stage: 'Stage 01: Intake Weighbridge', desc: 'Scale calibration ticket', ok: true },
                { stage: 'Stage 02: Reactor Telemetry', desc: 'Hydro-reactor energy & heat balance', ok: selectedBatch.scenario !== 'TAMPERED' },
                { stage: 'Stage 03: Recovery Assay', desc: 'Laboratory chemical composition certificate', ok: selectedBatch.scenario === 'NORMAL' },
                { stage: 'Stage 04: Downstream Off-taker', desc: 'Certified off-taker receiving scale ticket', ok: selectedBatch.scenario === 'NORMAL' },
              ].map((st, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 4,
                    background: st.ok ? 'var(--bg)' : 'var(--error-light)',
                    border: `1px solid ${st.ok ? 'var(--border-light)' : 'var(--error)'}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: st.ok ? 'var(--text)' : 'var(--error)' }}>
                      {st.stage}
                    </div>
                    <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {st.desc}
                    </div>
                  </div>
                  <span
                    className="font-mono font-bold"
                    style={{
                      fontSize: 10,
                      color: st.ok ? 'var(--success)' : 'var(--error)',
                      padding: '2px 6px',
                      borderRadius: 2,
                    }}
                  >
                    {st.ok ? '✓ COHERENT' : '✕ DISPUTED POINT'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Challenge Action Form & Settlement Impact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Dispute Action Card */}
          <div
            className="animate-reveal-up stagger-3"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Gavel size={16} style={{ color: 'var(--error)' }} />
              <div className="label-caps" style={{ color: 'var(--text)' }}>
                Stake Bounty & Initiate Challenge
              </div>
            </div>

            {challengeSubmitted ? (
              <div
                style={{
                  padding: '16px',
                  background: 'var(--error-light)',
                  border: '1px solid var(--error)',
                  borderRadius: 4,
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={24} style={{ color: 'var(--error)', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--error)' }}>
                  Challenge Successfully Staked
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Escrow locked. Tri-party arbitration initiated.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitChallenge} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'var(--error-light)',
                    border: '1px solid var(--error)',
                    borderRadius: 4,
                    fontSize: 11,
                    color: 'var(--error)',
                    lineHeight: 1.45,
                  }}
                >
                  ⚠ Initiating a dispute freezes the ₹{(selectedBatch.settlement?.amountINR || 50000).toLocaleString()} escrow settlement and bonds your collateral to the dispute protocol.
                </div>

                <div>
                  <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                    Discrepancy Justification
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      fontSize: 12,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      color: 'var(--text)',
                      lineHeight: 1.5,
                      resize: 'none',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                    Staked Collateral Bounty (INR)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="font-mono" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      min="5000"
                      step="1000"
                      value={bountyINR}
                      onChange={e => setBountyINR(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 28px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 13,
                        color: 'var(--warning)',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-danger"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    marginTop: 6,
                  }}
                >
                  <Send size={14} />
                  <span>{submitting ? 'Broadcasting Stake…' : 'Stake Collateral & Dispute'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Settlement Protocol Lifecycle */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '18px 20px',
            }}
          >
            <div className="label-caps-sm" style={{ marginBottom: 12 }}>
              Dispute Resolution Lifecycle
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { stage: '1. DISPUTED', desc: 'Auditor flags delta & stakes bounty bond', current: isChallenged },
                { stage: '2. REVIEWED', desc: 'Multi-agent AI runs secondary mass verification' },
                { stage: '3. VERIFIED', desc: 'Neutral human arbitrator inspects physical manifests' },
                { stage: '4. SETTLED', desc: 'Bounty paid out or refunded via smart contract escrow' },
              ].map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11 }}>
                  <div
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: s.current ? 'var(--error)' : 'var(--border)',
                      marginTop: 4,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <span className="font-mono font-bold" style={{ color: s.current ? 'var(--error)' : 'var(--text)' }}>
                      {s.stage}
                    </span>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
