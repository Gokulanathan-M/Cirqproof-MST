import React, { useState } from 'react';
import { UploadCloud, Check, FileCheck } from 'lucide-react';

export default function EvidenceUploader({ onFilesReady }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSimulateUpload = (docType) => {
    const fileName = `${docType}_verified_${Date.now().toString().slice(-4)}.pdf`;
    const newFiles = [...uploadedFiles, { type: docType, name: fileName, size: '1.4 MB' }];
    setUploadedFiles(newFiles);
    if (onFilesReady) onFilesReady(newFiles);
  };

  const uploadSlots = [
    { type: 'weighbridge', label: 'Weighbridge Intake Slip' },
    { type: 'processingLog', label: 'Reactor Energy/Temp Logs' },
    { type: 'outputRecord', label: 'Assay Output Certification' },
    { type: 'downstreamInvoice', label: 'Downstream Off-taker Lading' },
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
      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>
        Attach Physical & IoT Evidence
      </h4>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 16px' }}>
        Files will be canonicalized and hashed into Merkle tree leaves
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {uploadSlots.map(slot => {
          const isUploaded = uploadedFiles.some(f => f.type === slot.type);

          return (
            <div 
              key={slot.type}
              onClick={() => handleSimulateUpload(slot.type)}
              style={{
                padding: '12px 14px',
                borderRadius: 6,
                border: `1px dashed ${isUploaded ? 'var(--success)' : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isUploaded ? 'var(--success-light)' : 'var(--bg)',
                color: isUploaded ? 'var(--success)' : 'var(--text)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isUploaded ? <FileCheck size={16} style={{ color: 'var(--success)' }} /> : <UploadCloud size={16} style={{ color: 'var(--text-muted)' }} />}
                <span style={{ fontSize: 12, fontWeight: 500 }}>{slot.label}</span>
              </div>
              {isUploaded && <Check size={14} style={{ color: 'var(--success)' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
