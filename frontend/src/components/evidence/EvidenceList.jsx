import React from 'react';
import { Scale, FileText, Cpu, Truck, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function EvidenceList({ evidence, evidenceRoot, integrityStatus }) {
  if (!evidence) return null;

  const items = [
    {
      key: 'weighbridge',
      title: 'Weighbridge Intake Slip',
      icon: Scale,
      data: evidence.weighbridge,
      desc: `Weight: ${evidence?.weighbridge?.weight || 0} kg | Slip #${evidence?.weighbridge?.docId ? evidence.weighbridge.docId.slice(-6).toUpperCase() : 'PENDING'}`
    },
    {
      key: 'processingLog',
      title: 'Process Reactor Logs',
      icon: Activity,
      data: evidence?.processingLog,
      desc: `Runtime: ${evidence?.processingLog?.runtimeHours || 0}h | Energy: ${evidence?.processingLog?.energyKwh || 0} kWh | Temp: ${evidence?.processingLog?.temperatureAvg || 'N/A'}`
    },
    {
      key: 'outputRecord',
      title: 'Output Assay & Weight',
      icon: FileText,
      data: evidence?.outputRecord,
      desc: `Recovered: ${evidence?.outputRecord?.recoveredWeight || 0} kg | ${evidence?.outputRecord?.grade || 'N/A'}`
    },
    {
      key: 'downstreamInvoice',
      title: 'Downstream Off-taker Receipt',
      icon: Truck,
      data: evidence?.downstreamInvoice,
      desc: `Invoice #${evidence?.downstreamInvoice?.invoiceNo || 'PENDING'} | Received: ${evidence?.downstreamInvoice?.verifiedWeight || 0} kg`
    },
    {
      key: 'telemetry',
      title: 'IoT Enclave Telemetry',
      icon: Cpu,
      data: evidence?.telemetry,
      desc: `Sensor Integrity: ${evidence?.telemetry?.sensorIntegrity || 'N/A'} | Streaming: ${evidence?.telemetry?.continuousLogging !== false ? 'Continuous' : 'Interrupted'}`
    }
  ];

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '16px',
        }}
      >
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Multi-Tier Verifiable Evidence Root
          </h4>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Cryptographically anchored off-chain and on-chain inputs
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="label-caps-sm">Integrity:</span>
          <StatusBadge status={integrityStatus || 'VALID'} size="sm" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const status = item.data?.status || 'VALID';
          const isValid = status === 'VALID';

          return (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 4,
                background: isValid ? 'var(--bg)' : 'var(--error-light)',
                border: `1px solid ${isValid ? 'var(--border-light)' : 'var(--error)'}`,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    background: isValid ? 'var(--teal-light)' : 'rgba(185,87,79,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={15} style={{ color: isValid ? 'var(--teal)' : 'var(--error)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                      {item.title}
                    </span>
                    {isValid ? (
                      <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                    ) : (
                      <AlertCircle size={13} style={{ color: 'var(--error)' }} />
                    )}
                  </div>
                  <p className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {item.desc}
                  </p>
                </div>
              </div>

              <div>
                <StatusBadge status={status} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
