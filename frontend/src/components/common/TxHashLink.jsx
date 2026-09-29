import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

export default function TxHashLink({ hash, label = 'Transaction', truncate = true, explorerBase }) {
  const [copied, setCopied] = useState(false);
  const base = explorerBase || import.meta.env.VITE_MST_EXPLORER_URL || 'https://testnet.mstscan.io';

  if (!hash) {
    return (
      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
        —
      </span>
    );
  }

  const displayHash =
    truncate && hash.length > 16
      ? `${hash.substring(0, 8)}…${hash.substring(hash.length - 8)}`
      : hash;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
      <a
        href={`${base}/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        title={hash}
        style={{ color: 'var(--teal)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <span>{displayHash}</span>
        <ExternalLink size={10} style={{ opacity: 0.7 }} />
      </a>
      <button
        onClick={handleCopy}
        title="Copy Hash"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-faint)', display: 'inline-flex', alignItems: 'center' }}
      >
        {copied ? (
          <Check size={11} style={{ color: 'var(--success)' }} />
        ) : (
          <Copy size={11} />
        )}
      </button>
    </div>
  );
}
