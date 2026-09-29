import React from 'react';

const statusConfig = {
  VERIFIED:    { color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success)' },
  RELEASED:    { color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success)' },
  VALID:       { color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success)' },
  CONSISTENT:  { color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success)' },
  SETTLED:     { color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success)' },

  PROCESSING:  { color: 'var(--orange)', bg: 'var(--orange-light)', border: 'var(--orange)' },
  HELD:        { color: 'var(--orange)', bg: 'var(--orange-light)', border: 'var(--orange)' },

  PENDING:     { color: 'var(--gold)', bg: 'var(--gold-light)', border: 'var(--gold)' },
  SUBMITTED:   { color: 'var(--gold)', bg: 'var(--gold-light)', border: 'var(--gold)' },

  FLAGGED:     { color: 'var(--error)', bg: 'var(--error-light)', border: 'var(--error)' },
  CHALLENGED:  { color: 'var(--error)', bg: 'var(--error-light)', border: 'var(--error)' },
  TAMPERED:    { color: 'var(--error)', bg: 'var(--error-light)', border: 'var(--error)' },
  MISMATCH:    { color: 'var(--error)', bg: 'var(--error-light)', border: 'var(--error)' },

  WARNING:     { color: 'var(--warning)', bg: 'var(--warning-light)', border: 'var(--warning)' },
  SUSPICIOUS:  { color: 'var(--warning)', bg: 'var(--warning-light)', border: 'var(--warning)' },

  REFUNDED:    { color: 'var(--earth)', bg: 'var(--earth-light)', border: 'var(--earth)' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').toUpperCase();
  const cfg = statusConfig[normalized] || {
    color: 'var(--text-muted)',
    bg: 'var(--bg)',
    border: 'var(--border)'
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        borderRadius: 3,
        border: `1px solid ${cfg.border}50`,
        background: cfg.bg,
        color: cfg.color,
        fontSize: isSmall ? 9 : isLarge ? 12 : 10,
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: isSmall ? '2px 6px' : isLarge ? '4px 10px' : '3px 8px',
        lineHeight: 1.2,
      }}
    >
      <span
        style={{
          width: isSmall ? 4 : 5,
          height: isSmall ? 4 : 5,
          borderRadius: '50%',
          background: cfg.color,
        }}
      />
      {status}
    </span>
  );
}
