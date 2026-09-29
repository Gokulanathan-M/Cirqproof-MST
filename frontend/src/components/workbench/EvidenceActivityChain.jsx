import React, { useState, useEffect } from 'react';
import { Scale, Activity, FileText, Truck, Cpu, Eye, Check, AlertOctagon, AlertTriangle } from 'lucide-react';

const EVIDENCE_STEPS = [
  {
    key: 'weighbridge',
    code: 'LEAF-01',
    title: 'Weighbridge Intake Slip',
    desc: 'Physical mass intake — certified scale calibration, seal #WB-0041',
    icon: Scale,
    dataKey: 'weighbridge',
    hashShort: '0x3a91…b42e',
  },
  {
    key: 'processingLog',
    code: 'LEAF-02',
    title: 'Thermal Hydro-Reactor Telemetry',
    desc: 'Continuous process logs — temperature, energy draw, runtime',
    icon: Activity,
    dataKey: 'processingLog',
    hashShort: '0x8fa1…912c',
  },
  {
    key: 'outputRecord',
    code: 'LEAF-03',
    title: 'Assay Grade & Recovery Weighment',
    desc: 'Output sampling, grade, recovery mass',
    icon: FileText,
    dataKey: 'outputRecord',
    hashShort: '0x110e…88a4',
  },
  {
    key: 'downstreamInvoice',
    code: 'LEAF-04',
    title: 'Downstream Certified Bill of Lading',
    desc: 'Buyer off-taker weighbridge — counter-certified receipt',
    icon: Truck,
    dataKey: 'downstreamInvoice',
    hashShort: '0x99bc…2310',
  },
  {
    key: 'telemetry',
    code: 'LEAF-05',
    title: 'Enclave Hardware Cryptographic Pulse',
    desc: 'Secure hardware attestation — tamper-evident sensor log',
    icon: Cpu,
    dataKey: 'telemetry',
    hashShort: '0x55ca…0981',
  },
];

const TIMESTAMPS = [
  '08:15:22',
  '10:30:00',
  '12:00:15',
  '13:45:00',
  '14:00:00',
];

function getStatusMeta(status) {
  if (status === 'VALID' || !status) return { label: 'VALID', color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success)' };
  if (status === 'TAMPERED_HASH') return { label: 'TAMPERED', color: 'var(--error)', bg: 'var(--error-light)', border: 'var(--error)' };
  if (status === 'MISMATCH') return { label: 'MISMATCH', color: 'var(--error)', bg: 'var(--error-light)', border: 'var(--error)' };
  if (status === 'SUSPICIOUS') return { label: 'SUSPICIOUS', color: 'var(--warning)', bg: 'var(--warning-light)', border: 'var(--warning)' };
  return { label: 'VALID', color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success)' };
}

export default function EvidenceActivityChain({ evidence, onInspect }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [evidence]);

  if (!evidence) return null;

  const validCount = EVIDENCE_STEPS.filter(s => {
    const d = evidence[s.dataKey];
    return !d?.status || d?.status === 'VALID';
  }).length;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h4 className="font-serif" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Forensic Evidence Chain
          </h4>
          <span className="label-caps-sm" style={{ marginTop: 2, display: 'block' }}>
            Chronological Merkle Leaf Anchors // Provable Attestation
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: validCount === 5 ? 'var(--success)' : 'var(--warning)' }}>
          <span>{validCount}/5</span>
          <span style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Leaves Verified</span>
        </div>
      </div>

      {/* Timeline list */}
      <div style={{ padding: '20px' }}>
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          {/* Vertical rail */}
          <div
            style={{
              position: 'absolute',
              left: 5,
              top: 12,
              bottom: 12,
              width: 1,
              background: 'var(--border-light)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EVIDENCE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const data = evidence[step.dataKey];
              const rawStatus = data?.status;
              const meta = getStatusMeta(rawStatus);
              const isOk = rawStatus === 'VALID' || !rawStatus;

              return (
                <div
                  key={step.key}
                  style={{
                    position: 'relative',
                    opacity: mounted ? 1 : 0,
                    transition: 'all 0.3s ease',
                    transitionDelay: `${idx * 60}ms`,
                  }}
                >
                  {/* Timeline node */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -23,
                      top: 14,
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: meta.color,
                      boxShadow: isOk ? 'none' : `0 0 0 3px ${meta.bg}`,
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      background: isOk ? 'var(--bg)' : meta.bg,
                      border: `1px solid ${isOk ? 'var(--border-light)' : meta.border}`,
                      borderRadius: 4,
                      overflow: 'hidden',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      style={{
                        width: 3,
                        background: meta.color,
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 4,
                            background: isOk ? 'var(--teal-light)' : 'rgba(185,87,79,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          <Icon size={14} style={{ color: meta.color }} />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <span className="font-mono" style={{ fontSize: 9, padding: '1px 4px', borderRadius: 2, background: 'var(--surface)', border: '1px solid var(--border-light)', color: 'var(--text-faint)' }}>
                              {step.code}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                              {step.title}
                            </span>
                            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                              {TIMESTAMPS[idx]} IST
                            </span>
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                            {step.desc}
                          </p>
                          <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 4 }}>
                            SHA-256: <span style={{ color: meta.color }}>{data?.docId || data?.invoiceNo || 'Pending'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 2,
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.border}50`,
                          }}
                        >
                          {meta.label}
                        </span>
                        <button
                          onClick={() => onInspect && onInspect({ ...step, data, status: rawStatus || 'VALID', leafHash: data?.docId || data?.invoiceNo || 'Pending' })}
                          className="btn-ghost"
                          style={{ padding: '6px' }}
                          title="Open Evidence Dossier"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
