import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Play, RefreshCcw, CheckCircle2, AlertTriangle,
  Flame, Settings, Zap, ArrowDown, Activity
} from 'lucide-react';

/* ─────────────────────────────────────────────
   SCENARIO CONFIGURATIONS
─────────────────────────────────────────────── */
const SCENARIOS = {
  NORMAL: {
    label: 'Normal',
    description: 'Physically conserved mass-balance, verified sensor telemetry, matching downstream weighment.',
    icon: CheckCircle2,
    accent: 'var(--success)',
    bg: 'var(--success-light)',
    tag: 'CONSISTENT',
    values: { input: 1000, processed: 950, recovered: 680, downstream: 675, runtime: 8.5, energy: 1240 },
    flowColors: ['var(--earth)', 'var(--orange)', 'var(--gold)', 'var(--success)'],
    verdict: { label: 'RECONCILIATION COMPLETE', pct: '96.4%', status: 'CONSISTENT' },
    checks: [
      { label: 'Mass Balance',             status: 'pass' },
      { label: 'Capacity Validation',      status: 'pass' },
      { label: 'Energy Usage',             status: 'pass' },
      { label: 'Downstream Traceability',  status: 'pass' },
      { label: 'Hash Integrity',           status: 'pass' },
    ],
  },
  INCONSISTENT: {
    label: 'Inconsistent',
    description: 'Exaggerated recovery yield — 900 kg claimed vs 680 kg downstream. Triggers mass-balance alert.',
    icon: AlertTriangle,
    accent: 'var(--warning)',
    bg: 'var(--warning-light)',
    tag: 'FLAGGED',
    values: { input: 1000, processed: 920, recovered: 900, downstream: 680, runtime: 4.2, energy: 480 },
    flowColors: ['var(--earth)', 'var(--orange)', 'var(--error)', 'var(--error)'],
    verdict: { label: 'MASS BALANCE MISMATCH', pct: '62.1%', status: 'INCONSISTENT' },
    checks: [
      { label: 'Mass Balance',             status: 'fail' },
      { label: 'Capacity Validation',      status: 'warn' },
      { label: 'Energy Usage',             status: 'warn' },
      { label: 'Downstream Traceability',  status: 'fail' },
      { label: 'Hash Integrity',           status: 'pass' },
    ],
  },
  TAMPERED: {
    label: 'Tampered',
    description: 'Modified evidence signatures, offline telemetry spoofing, impossible thermodynamic throughput.',
    icon: Flame,
    accent: 'var(--error)',
    bg: 'var(--error-light)',
    tag: 'TAMPERED',
    values: { input: 1500, processed: 1400, recovered: 1350, downstream: 820, runtime: 2.1, energy: 120 },
    flowColors: ['var(--earth)', 'var(--orange)', 'var(--error)', 'var(--error)'],
    verdict: { label: 'EVIDENCE INTEGRITY FAILURE', pct: '0%', status: 'TAMPERED' },
    checks: [
      { label: 'Mass Balance',             status: 'fail' },
      { label: 'Capacity Validation',      status: 'fail' },
      { label: 'Energy Usage',             status: 'fail' },
      { label: 'Downstream Traceability',  status: 'fail' },
      { label: 'Hash Integrity',           status: 'fail' },
    ],
  },
};

/* ─────────────────────────────────────────────
   CHECK ICON
─────────────────────────────────────────────── */
function CheckIcon({ status, animate, delay }) {
  const config = {
    pass: { color: 'var(--success)', symbol: '✓', bg: 'var(--success-light)' },
    warn: { color: 'var(--warning)', symbol: '⚠', bg: 'var(--warning-light)' },
    fail: { color: 'var(--error)',   symbol: '✕', bg: 'var(--error-light)' },
  }[status] || { color: 'var(--text-muted)', symbol: '•', bg: 'var(--bg)' };

  return (
    <div
      className={animate ? 'animate-scale-in' : ''}
      style={{
        animationDelay: `${delay}ms`,
        width: 26, height: 26, borderRadius: 5,
        background: config.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: config.color, fontWeight: 800,
        transition: 'all 0.3s ease',
      }}
    >
      {config.symbol}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MATERIAL FLOW VISUALIZATION
─────────────────────────────────────────────── */
function ScenarioFlowViz({ scenario, values, running }) {
  const cfg = SCENARIOS[scenario];
  const stages = [
    { label: 'INPUT',      value: values.input,      color: cfg.flowColors[0] },
    { label: 'PROCESSED',  value: values.processed,  color: cfg.flowColors[1] },
    { label: 'RECOVERED',  value: values.recovered,  color: cfg.flowColors[2] },
    { label: 'DOWNSTREAM', value: values.downstream, color: cfg.flowColors[3] },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center', width: '100%' }}>
      {stages.map((stage, i) => {
        const isLast = i === stages.length - 1;
        const mismatch = scenario !== 'NORMAL' && i >= 2;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div
              className={mismatch ? 'animate-shake' : ''}
              style={{
                width: '100%', padding: '16px 20px',
                background: 'var(--surface)',
                border: `2px solid ${mismatch ? 'var(--error)' : 'var(--border-light)'}`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.4s ease',
                boxShadow: mismatch
                  ? '0 4px 16px rgba(185,87,79,0.2)'
                  : 'var(--shadow-sm)',
              }}
            >
              <div>
                <div
                  className="font-mono"
                  style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.12em', marginBottom: 3 }}
                >
                  {stage.label}
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em',
                    color: mismatch ? 'var(--error)' : 'var(--text)', lineHeight: 1,
                    transition: 'color 0.4s ease',
                  }}
                >
                  {running ? '···' : stage.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>KG</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: mismatch ? 'var(--error)' : stage.color,
                    marginLeft: 'auto', marginBottom: 6,
                    boxShadow: `0 0 10px ${mismatch ? 'var(--error)' : stage.color}`,
                  }}
                />
                <div
                  className="font-mono"
                  style={{ fontSize: 11, fontWeight: 700, color: mismatch ? 'var(--error)' : stage.color }}
                >
                  {Math.round((stage.value / values.input) * 100)}%
                </div>
              </div>
            </div>

            {!isLast && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 26, position: 'relative' }}>
                <div
                  style={{
                    width: 2, height: '100%',
                    background: 'var(--border)',
                  }}
                />
                <ArrowDown
                  size={12}
                  style={{
                    position: 'absolute', bottom: -2,
                    color: stages[i + 1].color,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RECONCILIATION PANEL
─────────────────────────────────────────────── */
function ReconciliationPanel({ scenario, running }) {
  const cfg = SCENARIOS[scenario];
  const [revealed, setRevealed] = useState(false);

  React.useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, [scenario]);

  const isConsistent = cfg.verdict.status === 'CONSISTENT';

  return (
    <div
      style={{
        background: 'var(--surface)', border: '1px solid var(--border-light)',
        borderRadius: 8, padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div className="label-caps" style={{ marginBottom: 6 }}>AI Reconciliation Engine</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Autonomous multi-agent forensic verification
        </div>
      </div>

      {/* Check items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cfg.checks.map((check, i) => (
          <div
            key={check.label}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', background: 'var(--bg)', borderRadius: 4,
              border: '1px solid var(--border-light)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
              {check.label}
            </span>
            {running ? (
              <div
                style={{
                  width: 26, height: 26, borderRadius: 5, background: 'var(--surface)',
                }}
                className="shimmer"
              />
            ) : (
              <CheckIcon status={check.status} animate={revealed} delay={i * 80} />
            )}
          </div>
        ))}
      </div>

      {/* Verdict */}
      {!running && (
        <div
          className="animate-reveal-up stagger-6"
          style={{
            marginTop: 20, padding: '18px',
            background: isConsistent ? 'var(--success-light)' : 'var(--error-light)',
            borderRadius: 6,
            textAlign: 'center',
            border: `1px solid ${isConsistent ? 'var(--success)' : 'var(--error)'}`,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 32, fontWeight: 700,
              color: isConsistent ? 'var(--success)' : 'var(--error)',
              letterSpacing: '-0.04em', lineHeight: 1,
              marginBottom: 6,
            }}
          >
            {cfg.verdict.pct}
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              color: isConsistent ? 'var(--success)' : 'var(--error)',
              marginBottom: 4,
            }}
          >
            {cfg.verdict.status}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {cfg.verdict.label}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PARAMETER FIELD
─────────────────────────────────────────────── */
function ParamField({ label, value, onChange, type = 'number', unit, step }) {
  return (
    <div>
      <label className="label-caps-sm" style={{ display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          step={step}
          style={{
            width: '100%',
            padding: '9px 12px',
            paddingRight: unit ? '42px' : '12px',
            fontSize: 13,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            color: 'var(--text)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            outline: 'none',
          }}
        />
        {unit && (
          <span
            className="font-mono"
            style={{
              position: 'absolute', right: 10, top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 10, color: 'var(--text-faint)', fontWeight: 700,
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN SIMULATOR PAGE
─────────────────────────────────────────────── */
export default function Simulator() {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState('NORMAL');

  // Editable values (synced with scenario presets)
  const [values, setValues] = useState(SCENARIOS.NORMAL.values);
  const [material, setMaterial] = useState('Lithium-Ion Batteries (NMC 811)');

  const handleScenarioChange = (scenario) => {
    setActiveScenario(scenario);
    setValues(SCENARIOS[scenario].values);
  };

  const updateValue = (key) => (val) => {
    setValues(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleGenerate = async () => {
    setRunning(true);
    try {
      // 1. P2: Generate Simulation Evidence Data & Create Batch
      const batchId = `SIM-${Date.now()}`;
      await api.generateScenario(activeScenario, batchId, {
        material,
        inputWeight: values.input,
        processedWeight: values.processed,
        recoveredWeight: values.recovered,
        downstreamWeight: values.downstream,
        runtimeHours: values.runtime,
        energyKwh: values.energy,
      });

      // 2. P3: Trigger AI Verification
      await api.reconcileBatch(batchId);

      // 3. P1: Commit to Blockchain
      await api.anchorToBlockchain('createBatch', batchId);
      await api.anchorToBlockchain('commitEvidence', batchId, { evidenceHash: `0x${batchId}-ev` });

      setTimeout(() => navigate(`/verification?batchId=${batchId}`), 500);
    } catch (err) {
      console.error('Simulation pipeline failed', err);
    } finally {
      setRunning(false);
    }
  };

  const activeCfg = SCENARIOS[activeScenario];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-reveal-up">
        <div className="label-caps" style={{ marginBottom: 8 }}>Simulation Control Panel</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: 32, color: 'var(--text)', margin: 0, lineHeight: 1.1 }}>
              Material Batch<br />Simulator
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5, maxWidth: 520 }}>
              Generate realistic circular recycling scenarios. Trigger autonomous multi-agent forensic verification and MST Testnet attestation.
            </p>
          </div>
          <div
            style={{
              padding: '8px 14px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 4, fontSize: 10, fontWeight: 700,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: 'var(--text-muted)', letterSpacing: '0.06em',
            }}
          >
            ACTIVE SCENARIO: <span style={{ color: activeCfg.accent }}>{activeScenario}</span>
          </div>
        </div>
      </div>

      {/* Scenario selector */}
      <div
        className="animate-reveal-up stagger-1"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
      >
        {Object.entries(SCENARIOS).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const isActive = activeScenario === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleScenarioChange(key)}
              style={{
                padding: '20px',
                background: isActive ? 'var(--surface-warm)' : 'var(--surface)',
                border: `2px solid ${isActive ? cfg.accent : 'var(--border-light)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'var(--shadow)' : 'var(--shadow-sm)',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div
                  style={{
                    width: 34, height: 34, borderRadius: 6,
                    background: cfg.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={16} style={{ color: cfg.accent }} />
                </div>
                <span
                  style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                    padding: '3px 8px', borderRadius: 2,
                    background: cfg.bg,
                    color: cfg.accent,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  {cfg.tag}
                </span>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                {cfg.label}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {cfg.description}
              </p>

              {/* Values preview */}
              <div
                className="font-mono"
                style={{
                  marginTop: 12, fontSize: 10, color: isActive ? cfg.accent : 'var(--text-faint)',
                  background: 'var(--bg)',
                  padding: '7px 10px', borderRadius: 4,
                  border: `1px solid ${isActive ? 'var(--border)' : 'var(--border-light)'}`,
                }}
              >
                {cfg.values.input}kg → {cfg.values.recovered}kg / ds:{cfg.values.downstream}kg
              </div>
            </button>
          );
        })}
      </div>

      {/* Main content: flow viz + parameters + reconciliation */}
      <div
        className="animate-reveal-up stagger-2"
        style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 20, alignItems: 'flex-start' }}
      >
        {/* Flow visualization */}
        <div
          style={{
            background: 'var(--surface)', border: '1px solid var(--border-light)',
            borderRadius: 8, padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="label-caps" style={{ marginBottom: 16 }}>Material Flow</div>
          <ScenarioFlowViz
            scenario={activeScenario}
            values={values}
            running={running}
          />
        </div>

        {/* Parameters */}
        <div
          style={{
            background: 'var(--surface)', border: '1px solid var(--border-light)',
            borderRadius: 8, padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="label-caps">Simulation Parameters</div>
            <Settings size={14} style={{ color: 'var(--text-faint)' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
              Material Feedstock
            </label>
            <input
              type="text"
              value={material}
              onChange={e => setMaterial(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px', fontSize: 13,
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4,
                color: 'var(--text)', outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <ParamField label="Input Weight"        value={values.input}      onChange={updateValue('input')}      unit="KG" />
            <ParamField label="Processed Weight"    value={values.processed}  onChange={updateValue('processed')}  unit="KG" />
            <ParamField label="Claimed Recovery"    value={values.recovered}  onChange={updateValue('recovered')}  unit="KG" />
            <ParamField label="Downstream Off-take" value={values.downstream} onChange={updateValue('downstream')} unit="KG" />
            <ParamField label="Runtime"             value={values.runtime}    onChange={updateValue('runtime')}    unit="HR" step={0.1} />
            <ParamField label="Energy Consumed"     value={values.energy}     onChange={updateValue('energy')}     unit="kWh" />
          </div>

          {/* Efficiency indicators */}
          {['INCONSISTENT', 'TAMPERED'].includes(activeScenario) && (
            <div
              style={{
                padding: '12px 14px', background: 'var(--error-light)',
                border: '1px solid var(--error)', borderRadius: 4, marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--error)', marginBottom: 4 }}>
                {activeScenario === 'TAMPERED' ? '⚠ EVIDENCE INTEGRITY FAILURE DETECTED' : '⚠ MASS BALANCE ANOMALY DETECTED'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text)', lineHeight: 1.5 }}>
                {activeScenario === 'TAMPERED'
                  ? 'Hash signatures modified. Runtime physically impossible for claimed throughput.'
                  : `Recovery claim (${values.recovered}kg) exceeds downstream receipt (${values.downstream}kg) by ${values.recovered - values.downstream}kg.`
                }
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={running}
            className="btn-primary"
            style={{
              width: '100%', padding: '14px',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            {running
              ? <><RefreshCcw size={15} style={{ animation: 'spin-slow 1s linear infinite' }} /> SIMULATING BATCH...</>
              : <><Zap size={15} /> GENERATE BATCH</>
            }
          </button>
        </div>

        {/* Reconciliation */}
        <ReconciliationPanel scenario={activeScenario} running={running} />
      </div>
    </div>
  );
}
