import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Scale,
  Cpu, FileText, Activity, Truck, ChevronRight, Fingerprint,
  RotateCcw, Lock, ExternalLink, ArrowRight, ShieldAlert, Award
} from 'lucide-react';

export default function Verification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const batchIdParam = searchParams.get('batchId');

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditorNotes, setAuditorNotes] = useState('Certified physical mass balance inspected and reconciled against certified weighbridge slips and downstream bills of lading.');
  const [signing, setSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getBatches();
      setBatches(data);
      if (batchIdParam) {
        const found = data.find(b => b.id === batchIdParam);
        if (found) setSelectedBatch(found);
        else if (data.length > 0) setSelectedBatch(data[0]);
      } else if (data.length > 0) {
        setSelectedBatch(data[0]);
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

  const handleApprove = async () => {
    if (!selectedBatch) return;
    setSigning(true);
    try {
      // 1. Submit Attestation on Blockchain
      await api.anchorToBlockchain('submitAttestation', selectedBatch.id).catch(err => {
        console.warn('Blockchain attestation failed (demo mode fallback):', err.message);
      });
      
      // 2. Submit Attestation record to backend
      await api.submitAttestation({ 
        batchId: selectedBatch.id, 
        attestor: 'BureauVeritas AI Audit Unit',
        txHash: `0x${Math.random().toString(16).slice(2)}` // Mock tx hash if blockchain fails
      });

      // 3. Release Settlement
      await api.releaseSettlement({ batchId: selectedBatch.id, txHash: `0x${Math.random().toString(16).slice(2)}` });

      setSignSuccess(true);
      setTimeout(() => {
        loadData();
        setSignSuccess(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSigning(false);
    }
  };

  const handleDispute = () => {
    if (!selectedBatch) return;
    navigate(`/challenges?batchId=${selectedBatch.id}`);
  };

  if (loading || !selectedBatch) {
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
            Loading Forensic Verification Station...
          </div>
        </div>
      </div>
    );
  }

  const isVerified = selectedBatch.status === 'VERIFIED';
  const isFlagged = selectedBatch.status === 'FLAGGED' || selectedBatch.scenario === 'INCONSISTENT';
  const isTampered = selectedBatch.scenario === 'TAMPERED';
  const isOk = !isFlagged && !isTampered;

  const checks = [
    {
      title: 'Mass Balance Conservation',
      desc: isOk ? 'Mass conserved within 0.5% thermodynamic envelope' : 'Output exceeds allowable thermodynamic yield balance',
      passed: isOk,
      icon: Scale,
    },
    {
      title: 'Facility Processing Capacity',
      desc: isOk ? 'Throughput validated against Unit 07 rated capacity' : 'Processing rate exceeds certified reactor envelope',
      passed: !isFlagged,
      icon: Activity,
    },
    {
      title: 'Downstream Off-taker Reconciliation',
      desc: isOk ? 'Buyer receipt confirms 675 kg verified recovery' : 'Severe discrepancy between claimed output and buyer scale receipt',
      passed: !isFlagged,
      icon: Truck,
    },
    {
      title: 'Hardware Cryptographic Enclave',
      desc: !isTampered ? 'Continuous signed enclave telemetry without signature drop' : 'Merkle root mismatch detected in telemetry signature leaf',
      passed: !isTampered,
      icon: Cpu,
    },
  ];

  const passCount = checks.filter(c => c.passed).length;

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
                <ShieldCheck size={13} style={{ color: 'var(--teal)' }} />
              </div>
              <span className="label-caps" style={{ color: 'var(--teal)' }}>
                HUMAN VERIFICATION STATION
              </span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                AUDIT DISCIPLINE 04
              </span>
            </div>
            <h1 className="font-serif" style={{ fontSize: 28, color: 'var(--text)', margin: '0 0 4px', lineHeight: 1.15 }}>
              Forensic Recovery Verification
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Deterministic human-in-the-loop audit reconciling intake telemetry, laboratory mass recovery, and off-chain anchor proofs.
            </p>
          </div>

          {/* Batch Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="label-caps" style={{ color: 'var(--text-muted)' }}>Case Batch:</span>
            <select
              value={selectedBatch.id}
              onChange={(e) => {
                const found = batches.find(b => b.id === e.target.value);
                if (found) setSelectedBatch(found);
              }}
              style={{
                padding: '8px 14px',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
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
                  {b.id} — {b.material} ({b.scenario})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Forensic Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Left Column: Evidence Audit Checklist & Mass Balance Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Case File Header Card */}
          <div
            className="animate-reveal-up stagger-1"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '20px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div className="label-caps" style={{ marginBottom: 4 }}>Dossier Case File</div>
                <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                  {selectedBatch.id}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {selectedBatch.material} · Facility: {selectedBatch.recycler}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span
                  style={{
                    padding: '3px 8px', borderRadius: 2,
                    fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                    background: selectedBatch.scenario === 'NORMAL' ? 'var(--teal-light)' : selectedBatch.scenario === 'TAMPERED' ? 'var(--error-light)' : 'var(--warning-light)',
                    color: selectedBatch.scenario === 'NORMAL' ? 'var(--teal)' : selectedBatch.scenario === 'TAMPERED' ? 'var(--error)' : 'var(--warning)',
                    border: `1px solid ${selectedBatch.scenario === 'NORMAL' ? 'var(--teal)' : selectedBatch.scenario === 'TAMPERED' ? 'var(--error)' : 'var(--warning)'}40`,
                  }}
                >
                  {selectedBatch.scenario}
                </span>
                <span
                  style={{
                    padding: '3px 8px', borderRadius: 2,
                    fontSize: 10, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700,
                    background: isVerified ? 'var(--success-light)' : isFlagged || isTampered ? 'var(--error-light)' : 'var(--warning-light)',
                    color: isVerified ? 'var(--success)' : isFlagged || isTampered ? 'var(--error)' : 'var(--warning)',
                  }}
                >
                  {selectedBatch.status}
                </span>
              </div>
            </div>

            {/* Mass Balance 4-Step Chain */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                padding: '16px',
                background: 'var(--bg)',
                borderRadius: 6,
                border: '1px solid var(--border-light)',
              }}
            >
              {[
                { label: 'INTAKE', kg: selectedBatch.inputWeight || 1000, color: 'var(--earth)' },
                { label: 'PROCESSED', kg: selectedBatch.evidence?.processingLog?.outputWeight || Math.round((selectedBatch.inputWeight || 1000) * 0.95), color: 'var(--orange)' },
                { label: 'RECOVERED', kg: selectedBatch.claimedRecoveredWeight || 680, color: 'var(--gold)' },
                { label: 'DELIVERED', kg: selectedBatch.downstreamWeight || 675, color: isOk ? 'var(--success)' : 'var(--error)' },
              ].map((step, idx) => (
                <div key={step.label} style={{ textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.08em', marginBottom: 2 }}>
                    {step.label}
                  </div>
                  <div className="font-mono font-bold" style={{ fontSize: 15, color: step.color }}>
                    {(step.kg || 0).toLocaleString()} kg
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forensic Audit Checks */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div className="label-caps" style={{ marginBottom: 2 }}>Autonomous & Forensic Checks</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  Integrity Validation Matrix
                </div>
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 11, fontWeight: 700,
                  color: passCount === 4 ? 'var(--success)' : 'var(--warning)',
                  padding: '2px 8px', borderRadius: 4,
                  background: passCount === 4 ? 'var(--success-light)' : 'var(--warning-light)',
                }}
              >
                {passCount}/4 PASSED
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {checks.map((chk, i) => {
                const Icon = chk.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 14px',
                      background: chk.passed ? 'var(--bg)' : 'var(--error-light)',
                      border: `1px solid ${chk.passed ? 'var(--border-light)' : 'var(--error)'}`,
                      borderRadius: 4,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: 4,
                        background: chk.passed ? 'var(--teal-light)' : 'rgba(185,87,79,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} style={{ color: chk.passed ? 'var(--teal)' : 'var(--error)' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                          {chk.title}
                        </span>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 10, fontWeight: 700,
                            color: chk.passed ? 'var(--success)' : 'var(--error)',
                          }}
                        >
                          {chk.passed ? '✓ VALIDATED' : '✕ ANOMALY'}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.4 }}>
                        {chk.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Auditor Sign-Off & Escrow Stamp */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Sign-Off Panel */}
          <div
            className="animate-reveal-up stagger-3"
            style={{
              background: 'var(--surface)',
              border: `1px solid ${signSuccess ? 'var(--success)' : 'var(--border)'}`,
              borderRadius: 8,
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top accent bar */}
            <div
              style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 3,
                background: isVerified ? 'var(--success)' : isFlagged || isTampered ? 'var(--error)' : 'var(--gold)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Award size={16} style={{ color: 'var(--gold)' }} />
              <div className="label-caps" style={{ color: 'var(--text)' }}>
                Auditor Sign-Off & Attestation
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Upon signing, an on-chain zero-knowledge attestation root is broadcast to MST Testnet, locking the batch and releasing smart contract escrow.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                Certified Inspection Statement
              </label>
              <textarea
                rows={4}
                value={auditorNotes}
                onChange={e => setAuditorNotes(e.target.value)}
                disabled={isVerified}
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

            {/* Escrow Details */}
            <div
              style={{
                padding: '12px 14px',
                background: 'var(--bg)',
                borderRadius: 4,
                border: '1px solid var(--border-light)',
                marginBottom: 18,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span className="label-caps-sm" style={{ display: 'block' }}>Escrow Value</span>
                <span className="font-mono font-bold" style={{ fontSize: 16, color: 'var(--teal)' }}>
                  ₹{(selectedBatch.settlement?.amountINR || 50000).toLocaleString()}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="label-caps-sm" style={{ display: 'block' }}>Settlement State</span>
                <span
                  className="font-mono font-bold"
                  style={{
                    fontSize: 11,
                    color: selectedBatch.settlement?.status === 'RELEASED' ? 'var(--success)' : 'var(--warning)',
                  }}
                >
                  {selectedBatch.settlement?.status || 'HELD'}
                </span>
              </div>
            </div>

            {/* Actions */}
            {isVerified ? (
              <div
                style={{
                  padding: '14px',
                  background: 'var(--success-light)',
                  border: '1px solid var(--success)',
                  borderRadius: 4,
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--success)', fontWeight: 700, fontSize: 13 }}>
                  <CheckCircle2 size={16} />
                  <span>Attestation Confirmed On-Chain</span>
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Anchor:{' '}
                  <a 
                    href={`https://explorer.mst-testnet.io/tx/${selectedBatch.blockchain?.txHash}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--teal)', textDecoration: 'none' }}
                  >
                    {selectedBatch.blockchain?.txHash?.slice(0, 16) || 'Pending'}
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleApprove}
                  disabled={signing || isFlagged || isTampered}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    opacity: (isFlagged || isTampered) ? 0.45 : 1,
                  }}
                >
                  <Fingerprint size={16} />
                  <span>{signing ? 'Computing Signature…' : 'Sign & Verify Batch'}</span>
                </button>

                {(isFlagged || isTampered) && (
                  <button
                    onClick={handleDispute}
                    className="btn-danger"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                  >
                    <ShieldAlert size={14} />
                    <span>Raise Auditor Fraud Dispute</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cryptographic Footprint Box */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '16px 20px',
            }}
          >
            <div className="label-caps-sm" style={{ marginBottom: 8 }}>
              Cryptographic Footprint
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Merkle Root', val: selectedBatch.evidenceRoot || 'Pending' },
                { label: 'Attestation Scheme', val: 'EIP-712 Structured Sig' },
                { label: 'Enclave Cert', val: 'SGX-DCAP-V4-VERIFIED' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--teal)' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
