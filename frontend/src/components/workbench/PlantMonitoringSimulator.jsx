import React, { useState, useEffect } from 'react';
import { Activity, Zap, Thermometer, Cpu, AlertTriangle, TrendingUp } from 'lucide-react';

// Animated telemetry gauge — inline animated bar with live value
function TelemetryGauge({ label, value, unit, fill, max = 100, status = 'nominal', sublabel, animated = true }) {
  const [displayValue, setDisplayValue] = useState(0);
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  
  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 80);
    return () => clearTimeout(timer);
  }, [value]);

  const fillColor =
    status === 'critical' ? 'var(--rust)' :
    status === 'warning' ? 'var(--amber)' :
    'var(--copper)';

  const pulseClass =
    status === 'critical' ? 'animate-pulse-rust' :
    status === 'warning' ? 'animate-telemetry' :
    '';

  return (
    <div className="relative p-3.5 bg-[var(--bg-void)] border border-[var(--border-secondary)] flex flex-col gap-1.5 overflow-hidden">
      {/* Corner registration marks — engineering drawing style */}
      <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[var(--border-primary)]" />
      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-[var(--border-primary)]" />
      <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-[var(--border-primary)]" />
      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[var(--border-primary)]" />

      <span className="field-label">{label}</span>

      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono text-xl font-bold ${pulseClass}`}
          style={{ color: status !== 'nominal' ? fillColor : 'var(--paper-aged)' }}
        >
          {displayValue}
        </span>
        <span className="font-mono text-xs" style={{ color: 'var(--paper-ghost)' }}>{unit}</span>
      </div>

      {/* Telemetry bar */}
      <div className="h-[2px] w-full" style={{ background: 'var(--border-secondary)' }}>
        <div
          className="h-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, background: fillColor }}
        />
      </div>

      {sublabel && (
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--paper-ghost)' }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

// Scenario selector — industrial toggle strip
function ScenarioSelector({ current, onChange }) {
  const scenarios = [
    { id: 'NORMAL', label: '01 // CONSERVED', marker: 'var(--copper)' },
    { id: 'INCONSISTENT', label: '02 // DISCREPANT', marker: 'var(--rust)' },
    { id: 'TAMPERED', label: '03 // TAMPERED', marker: 'var(--amber)' },
  ];

  return (
    <div
      className="flex border border-[var(--border-primary)]"
      style={{ background: 'var(--bg-void)' }}
    >
      {scenarios.map((s) => {
        const isActive = current === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className="relative flex-1 py-2 px-3 font-mono text-[10px] uppercase tracking-wider font-bold transition-all"
            style={{
              background: isActive ? 'var(--bg-concrete-2)' : 'transparent',
              color: isActive ? 'var(--paper-aged)' : 'var(--paper-ghost)',
              borderRight: s.id !== 'TAMPERED' ? '1px solid var(--border-primary)' : 'none',
            }}
          >
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: s.marker }}
              />
            )}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export default function PlantMonitoringSimulator({
  batch,
  onScenarioSelect,
  onParamChange,
  onGenerateBatch,
  isGenerating
}) {
  const scenario = batch?.scenario || 'NORMAL';
  const isNormal = scenario === 'NORMAL';
  const isInconsistent = scenario === 'INCONSISTENT';
  const isTampered = scenario === 'TAMPERED';

  // Telemetry readings that react to scenario
  const gauges = [
    {
      label: 'Intake Feed Mass',
      value: batch?.inputWeight || 1000,
      unit: 'kg',
      max: 1500,
      status: 'nominal',
      sublabel: 'Hopper Cell #1',
    },
    {
      label: 'Reactor Temperature',
      value: isInconsistent ? 94 : 142,
      unit: '°C',
      max: 220,
      status: isInconsistent ? 'warning' : 'nominal',
      sublabel: 'Thermal Desorption',
    },
    {
      label: 'Power Draw',
      value: isInconsistent ? 680 : 1240,
      unit: 'kWh',
      max: 2000,
      status: isInconsistent ? 'warning' : 'nominal',
      sublabel: 'Inverter Bus 440V',
    },
    {
      label: 'Enclave Pulse',
      value: isTampered ? 0 : 100,
      unit: 'Hz',
      max: 100,
      status: isTampered ? 'critical' : 'nominal',
      sublabel: 'Crypto Hardware Seal',
    },
  ];

  return (
    <div
      className="border border-[var(--border-primary)] bg-grid"
      style={{ background: 'var(--bg-concrete)' }}
    >
      {/* ── Section header ── */}
      <div
        className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-primary)]"
        style={{ background: 'var(--bg-void)' }}
      >
        <div className="flex items-center gap-3">
          <Activity size={15} style={{ color: 'var(--copper)' }} className="animate-telemetry" />
          <div>
            <h4 className="font-serif text-base font-semibold" style={{ color: 'var(--paper-aged)' }}>
              SCADA Telemetry Instrumentation Rig
            </h4>
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--paper-ghost)' }}>
              Continuous Mass-Flow Sensors // Hydromet Reactor 04 // Live Sensor Feed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Scenario status indicator */}
          {!isNormal && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] uppercase font-bold border animate-slide-left"
              style={{
                borderColor: isTampered ? 'var(--amber)' : 'var(--rust)',
                color: isTampered ? 'var(--amber)' : 'var(--rust)',
                background: isTampered ? 'var(--amber-trace)' : 'var(--rust-trace)',
              }}
            >
              <AlertTriangle size={11} />
              {isTampered ? 'HASH MISMATCH DETECTED' : 'MASS BALANCE VIOLATION'}
            </div>
          )}

          <ScenarioSelector current={scenario} onChange={onScenarioSelect} />
        </div>
      </div>

      {/* ── Telemetry gauges ── */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {gauges.map((g, i) => (
          <TelemetryGauge key={g.label} {...g} />
        ))}
      </div>

      {/* ── SCADA parameters tuning strip ── */}
      <div
        className="px-4 pb-4 pt-0 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 font-mono">
          <div>
            <label className="field-label mb-1">Claimed Recovered</label>
            <input
              type="number"
              value={batch?.claimedRecoveredWeight || ''}
              onChange={(e) => onParamChange('claimedRecoveredWeight', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 font-bold text-[13px]"
              style={{ color: 'var(--copper)', borderColor: isNormal ? 'var(--border-primary)' : 'var(--rust)' }}
            />
          </div>

          <div>
            <label className="field-label mb-1">Downstream Certified</label>
            <input
              type="number"
              value={batch?.downstreamWeight || ''}
              onChange={(e) => onParamChange('downstreamWeight', Number(e.target.value))}
              className="w-full px-2.5 py-1.5"
            />
          </div>

          <div>
            <label className="field-label mb-1">Calc. Residue</label>
            <div
              className="px-2.5 py-1.5 font-mono text-[12px] border border-[var(--border-secondary)]"
              style={{ background: 'var(--bg-void)', color: 'var(--paper-dim)' }}
            >
              {batch?.residueWeight} kg
            </div>
          </div>

          <div>
            <label className="field-label mb-1">Simulation Mode</label>
            <div
              className="px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase border"
              style={{
                background: 'var(--bg-void)',
                borderColor: isTampered ? 'var(--amber)' : isInconsistent ? 'var(--rust)' : 'var(--border-primary)',
                color: isTampered ? 'var(--amber)' : isInconsistent ? 'var(--rust)' : 'var(--copper)',
              }}
            >
              {scenario}
            </div>
          </div>
        </div>

        <button
          onClick={onGenerateBatch}
          disabled={isGenerating}
          className="px-6 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40"
          style={{
            background: 'var(--paper-aged)',
            color: 'var(--bg-void)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f0ece3'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--paper-aged)'; }}
        >
          {isGenerating ? 'Synthesizing Batch...' : 'Re-Run Plant Simulation'}
        </button>
      </div>
    </div>
  );
}
