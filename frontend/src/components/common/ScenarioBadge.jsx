import React from 'react';

const scenarioConfig = {
  NORMAL: {
    color: 'var(--teal)',
    bg: 'var(--teal-light)',
    border: 'var(--teal)',
    icon: '✓',
  },
  INCONSISTENT: {
    color: 'var(--warning)',
    bg: 'var(--warning-light)',
    border: 'var(--warning)',
    icon: '⚠',
  },
  TAMPERED: {
    color: 'var(--error)',
    bg: 'var(--error-light)',
    border: 'var(--error)',
    icon: '✕',
  },
};

export default function ScenarioBadge({ scenario }) {
  const sc = (scenario || 'NORMAL').toUpperCase();
  const cfg = scenarioConfig[sc] || scenarioConfig.NORMAL;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 3,
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700,
        border: `1px solid ${cfg.border}60`,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      <span>{cfg.icon}</span>
      <span>{sc}</span>
    </span>
  );
}
