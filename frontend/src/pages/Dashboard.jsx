import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowRight, RefreshCw, TrendingUp, Layers,
  Activity, Package, CheckCircle, AlertTriangle,
  ShieldAlert, Clock, Cpu, PlusCircle
} from 'lucide-react';

/* ─────────────────────────────────────────────
   ANIMATED NUMBER
─────────────────────────────────────────────── */
function AnimNumber({ value, suffix = '', prefix = '' }) {
  const [display, setDisplay] = useState(0);
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;

  useEffect(() => {
    let start = null;
    const duration = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setDisplay(Math.round(ease * num));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [num]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   MATERIAL FLOW NODE
─────────────────────────────────────────────── */
const FLOW_CONFIG = [
  { id: 'input',     label: 'INPUT',     color: '#806653', bg: '#F0E8E0', icon: '⬜', unit: 'KG' },
  { id: 'processed', label: 'PROCESSED', color: '#C9683F', bg: '#F5DDD1', icon: '⚙', unit: 'KG' },
  { id: 'recovered', label: 'RECOVERED', color: '#C8A75A', bg: '#F7EDD6', icon: '♻', unit: 'KG' },
  { id: 'verified',  label: 'VERIFIED',  color: '#3F805D', bg: '#D8EDDF', icon: '✓', unit: 'KG' },
];

function FlowParticle({ color, delay, duration, horizontal }) {
  const style = horizontal
    ? {
        position: 'absolute',
        top: '50%', left: 0,
        transform: 'translateY(-50%)',
        width: 5, height: 5, borderRadius: '1px',
        background: color,
        animationName: 'float-particle-right',
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        '--particle-travel': '80px',
        zIndex: 2,
        opacity: 0,
      }
    : {};
  return <div style={style} />;
}

function MaterialFlowNode({ config, value, batch, index, isSelected, onClick }) {
  const percentage = batch ? Math.round((value / (batch.inputWeight || 1)) * 100) : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        flex: 1,
      }}
    >
      <div
        onClick={onClick}
        style={{
          background: isSelected ? config.color : 'var(--surface)',
          border: `2px solid ${isSelected ? config.color : 'var(--border-light)'}`,
          borderRadius: 8,
          padding: '20px 16px',
          width: '100%',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: isSelected
            ? `0 8px 24px ${config.color}30`
            : 'var(--shadow-sm)',
          transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
        }}
        onMouseEnter={e => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = config.color;
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = `0 6px 20px ${config.color}20`;
          }
        }}
        onMouseLeave={e => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }
        }}
      >
        {/* Node indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: isSelected ? 'rgba(255,255,255,0.2)' : config.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13,
            }}
          >
            {index + 1}
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 10, fontWeight: 700,
              color: isSelected ? 'rgba(255,255,255,0.6)' : config.color,
              letterSpacing: '0.08em',
            }}
          >
            {percentage}%
          </div>
        </div>

        {/* Weight value */}
        <div
          className="font-mono"
          style={{
            fontSize: 22, fontWeight: 700,
            color: isSelected ? '#fff' : 'var(--text)',
            letterSpacing: '-0.04em', lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {value ? <AnimNumber value={value} suffix="" /> : '—'}
        </div>
        <div
          className="font-mono"
          style={{
            fontSize: 9, color: isSelected ? 'rgba(255,255,255,0.5)' : config.color,
            letterSpacing: '0.1em', fontWeight: 700,
          }}
        >
          {config.unit}
        </div>

        {/* Label */}
        <div
          style={{
            marginTop: 10,
            fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em',
            color: isSelected ? 'rgba(255,255,255,0.8)' : '#6F7770',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          {config.label}
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 3, background: isSelected ? 'rgba(255,255,255,0.2)' : '#F4F1E8',
            borderRadius: 2, marginTop: 10, overflow: 'hidden',
          }}
        >
          <div
            className="animate-line-grow-x"
            style={{
              height: '100%',
              width: `${percentage}%`,
              background: isSelected ? 'rgba(255,255,255,0.6)' : config.color,
              borderRadius: 2,
              animationDelay: `${index * 150}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIVE EVIDENCE TIMELINE
─────────────────────────────────────────────── */
function LiveTimeline({ batches }) {
  const [events, setEvents] = useState([]);

  // Build events from real batches only
  useEffect(() => {
    const batchEvents = (batches || []).slice(-8).reverse().map((b) => {
      const timeStr = b.createdAt ? new Date(b.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : 'Now';
      return {
        time: timeStr,
        label: `Batch ${b.id} — ${b.status}`,
        type: b.status === 'VERIFIED' ? 'verify' : b.status === 'FLAGGED' ? 'ai' : 'batch',
        color: b.status === 'VERIFIED' ? '#3F805D' : b.status === 'FLAGGED' ? '#B9574F' : '#2F6F5E',
      };
    });

    setEvents(batchEvents);
  }, [batches]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute', left: 8, top: 8, bottom: 0,
          width: 1, background: 'var(--border-light)',
        }}
      />
      {events.map((ev, i) => (
        <div
          key={i}
          className="animate-reveal-left"
          style={{
            display: 'flex', gap: 14, paddingBottom: 16,
            position: 'relative', zIndex: 1,
            animationDelay: `${i * 60}ms`,
          }}
        >
          {/* Dot */}
          <div
            style={{
              width: 16, height: 16, borderRadius: '50%',
              border: `2px solid ${ev.color}`,
              background: 'var(--surface)', flexShrink: 0,
              marginTop: 2,
              boxShadow: `0 0 0 3px ${ev.color}15`,
            }}
          />
          <div>
            <div
              className="font-mono"
              style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.08em', marginBottom: 3 }}
            >
              {ev.time}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>
              {ev.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PLANT UNIT CARD
─────────────────────────────────────────────── */
function PlantUnitCard({ batches }) {
  return (
    <div
      style={{
        background: '#123C36',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(18,60,54,0.2)',
      }}
    >
      {/* Image area with gradient overlay */}
      <div
        style={{
          height: 120,
          background: 'linear-gradient(135deg, #1a5248 0%, #0e2e2a 50%, #123C36 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Stylized plant visualization */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 2 + (i % 3) * 2,
                height: 30 + (i % 4) * 15,
                background: i % 2 === 0 ? '#A8C8B5' : '#C9683F',
                borderRadius: 2,
                left: `${10 + i * 12}%`,
                bottom: 0,
                opacity: 0.5 + (i % 3) * 0.15,
              }}
            />
          ))}
          {/* Conveyor belt lines */}
          <div
            style={{
              position: 'absolute', bottom: 18, left: 0, right: 0,
              height: 3, background: 'rgba(168,200,181,0.3)',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div
            className="font-mono"
            style={{ fontSize: 9, color: 'rgba(168,200,181,0.7)', letterSpacing: '0.15em', marginBottom: 4 }}
          >
            UNIT 07 — E-WASTE
          </div>
          <div style={{ fontSize: 24 }}>♻</div>
        </div>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <div style={{ marginBottom: 12 }}>
          <div
            style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}
          >
            PLANT UNIT 07
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
            Processing Electronic Waste
          </div>
        </div>

        {[
          { label: 'THROUGHPUT', value: `${(batches?.reduce((a, b) => a + (b.inputWeight || 0), 0) || 0).toLocaleString()} KG`, color: '#A8C8B5' },
          { label: 'BATCHES',    value: (batches?.length || 0).toString(), color: '#C8A75A' },
          { label: 'VERIFIED',   value: (batches?.filter(b => b.status === 'VERIFIED')?.length || 0).toString(), color: '#C9683F' },
        ].map(m => (
          <div
            key={m.label}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span
              className="label-caps-sm"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {m.label}
            </span>
            <span
              className="font-mono"
              style={{ fontSize: 13, fontWeight: 700, color: m.color }}
            >
              {m.value}
            </span>
          </div>
        ))}

        {/* Mini activity bars */}
        <div style={{ marginTop: 14, display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
          {[0.4, 0.7, 0.55, 0.9, 0.75, 0.6, 0.85, 0.95, 0.8, 0.65].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: `${h * 100}%`,
                background: h > 0.8 ? '#A8C8B5' : h > 0.6 ? '#C8A75A' : 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                transition: 'height 0.5s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STATUS BADGE INLINE
─────────────────────────────────────────────── */
function StatusTag({ status }) {
  const config = {
    VERIFIED:    { bg: '#D8EDDF', color: '#3F805D', label: 'VERIFIED' },
    FLAGGED:     { bg: '#F5DADA', color: '#B9574F', label: 'FLAGGED' },
    PENDING:     { bg: '#F5E8CF', color: '#C38A3C', label: 'PENDING' },
    CHALLENGED:  { bg: '#F5DADA', color: '#B9574F', label: 'CHALLENGED' },
    PROCESSING:  { bg: '#F5DDD1', color: '#C9683F', label: 'PROCESSING' },
    SUBMITTED:   { bg: '#E4EFE8', color: '#2F6F5E', label: 'SUBMITTED' },
    SETTLED:     { bg: '#D8EDDF', color: '#3F805D', label: 'SETTLED' },
  }[status] || { bg: '#F4F1E8', color: '#6F7770', label: status };

  return (
    <span
      style={{
        background: config.bg, color: config.color,
        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
        padding: '3px 8px', borderRadius: 2,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {config.label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
─────────────────────────────────────────────── */
export default function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(1);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getBatches();
      setBatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Compute aggregate metrics
  const totalInput     = batches.reduce((a, b) => a + (b.inputWeight || 0), 0);
  const totalProcessed = batches.reduce((a, b) => a + (b.processedWeight || b.inputWeight * 0.95 || 0), 0);
  const totalRecovered = batches.reduce((a, b) => a + (b.claimedRecoveredWeight || 0), 0);
  const totalVerified  = batches.filter(b => b.status === 'VERIFIED')
                                .reduce((a, b) => a + (b.claimedRecoveredWeight || 0), 0);

  const flowValues = [totalInput, totalProcessed, totalRecovered, totalVerified];

  const verifiedCount   = batches.filter(b => b.status === 'VERIFIED').length;
  const flaggedCount    = batches.filter(b => b.status === 'FLAGGED').length;
  const challengedCount = batches.filter(b => b.status === 'CHALLENGED').length;

  return (
    <div style={{ display: 'flex', gap: 24, minHeight: 0 }}>
      {/* ═══ LEFT MAIN — Material Flow Investigation ═══ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Page header */}
        <div className="animate-reveal-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="label-caps" style={{ marginBottom: 8 }}>Investigation Overview</div>
              <h1
                className="font-serif"
                style={{ fontSize: 32, color: 'var(--text)', lineHeight: 1.1, margin: 0 }}
              >
                Material Flow<br />Dashboard
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                {batches.length} batches · {verifiedCount} verified · {flaggedCount + challengedCount} flagged
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={loadData}
                className="btn-secondary"
                style={{ padding: '8px 10px' }}
                title="Refresh data"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => navigate('/simulator')}
                className="btn-secondary"
              >
                <Cpu size={13} />
                Simulate
              </button>
              <button
                onClick={() => navigate('/workbench')}
                className="btn-primary"
              >
                <PlusCircle size={13} />
                New Batch
              </button>
            </div>
          </div>
        </div>

        {/* Material flow nodes */}
        <div
          className="animate-reveal-up stagger-2"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div className="label-caps" style={{ marginBottom: 4 }}>Primary Material Flow</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Aggregate across all active batches</div>
            </div>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 10, color: 'var(--success)', fontWeight: 700,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
              LIVE
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
            {FLOW_CONFIG.map((config, i) => (
              <React.Fragment key={config.id}>
                <MaterialFlowNode
                  config={config}
                  value={flowValues[i]}
                  batch={{ inputWeight: totalInput }}
                  index={i}
                  isSelected={selectedStage === i}
                  onClick={() => setSelectedStage(i)}
                />
                {i < FLOW_CONFIG.length - 1 && (
                  <div
                    style={{
                      display: 'flex', alignItems: 'center',
                      flexShrink: 0, position: 'relative', width: 40,
                    }}
                  >
                    {/* Flow connector */}
                    <div
                      style={{
                        width: '100%', height: 2,
                        background: `linear-gradient(to right, ${FLOW_CONFIG[i].color}60, ${FLOW_CONFIG[i + 1].color}60)`,
                        borderRadius: 2,
                        position: 'relative',
                      }}
                    >
                      {/* Arrow */}
                      <div
                        style={{
                          position: 'absolute', right: 0, top: '50%',
                          transform: 'translateY(-50%)',
                          width: 0, height: 0,
                          borderLeft: `6px solid ${FLOW_CONFIG[i + 1].color}80`,
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                        }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* KPI summary row */}
        <div
          className="animate-reveal-up stagger-3"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}
        >
          {[
            { label: 'Total Batches',   value: batches.length, icon: Package,       color: 'var(--teal)', bg: 'var(--teal-wash)' },
            { label: 'Verified',        value: verifiedCount,  icon: CheckCircle,   color: 'var(--success)', bg: 'var(--success-light)' },
            { label: 'Flagged',         value: flaggedCount,   icon: AlertTriangle, color: 'var(--error)', bg: 'var(--error-light)' },
            { label: 'Challenged',      value: challengedCount,icon: ShieldAlert,   color: 'var(--warning)', bg: 'var(--warning-light)' },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div
                key={i}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border-light)',
                  borderRadius: 8, padding: '16px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div
                    style={{
                      width: 30, height: 30, borderRadius: 6, background: kpi.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon size={14} style={{ color: kpi.color }} />
                  </div>
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}
                >
                  {loading ? '—' : <AnimNumber value={kpi.value} />}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
                  {kpi.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Batch ledger table */}
        <div
          className="animate-reveal-up stagger-4"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border-light)',
            borderRadius: 8, overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', borderBottom: '1px solid var(--border-light)',
          }}>
            <div>
              <div className="label-caps" style={{ marginBottom: 3 }}>Batch Processing Ledger</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Immutable trace and validation records</div>
            </div>
            <button onClick={() => navigate('/workbench')} className="btn-secondary" style={{ padding: '6px 14px' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Batch ID', 'Material', 'Intake / Recovery', 'Status', 'Settlement', ''].map(h => (
                    <th
                      key={h}
                      className="label-caps-sm"
                      style={{
                        padding: '10px 16px', textAlign: 'left',
                        borderBottom: '1px solid var(--border-light)',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                          <div className="shimmer" style={{ height: 14, borderRadius: 3, width: '70%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : batches.slice(0, 6).map((batch) => (
                  <tr
                    key={batch.id}
                    onClick={() => navigate('/workbench')}
                    style={{
                      borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        className="font-mono"
                        style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}
                      >
                        {batch.id}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
                      {batch.material}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="font-mono" style={{ fontSize: 12, color: 'var(--text)', fontWeight: 700 }}>
                        {batch.inputWeight?.toLocaleString()}
                      </span>
                      <span style={{ color: 'var(--border)', fontSize: 11, margin: '0 4px' }}>/</span>
                      <span className="font-mono" style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>
                        {batch.claimedRecoveredWeight?.toLocaleString()} kg
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusTag status={batch.status} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                        ₹{batch.settlement?.amountINR?.toLocaleString() || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: 11 }}
                        onClick={e => { e.stopPropagation(); navigate('/workbench'); }}
                      >
                        <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Live Activity + Plant ═══ */}
      <div
        style={{
          width: 280,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Plant unit card */}
        <div className="animate-reveal-right stagger-2">
          <PlantUnitCard batches={batches} />
        </div>

        {/* Live evidence activity */}
        <div
          className="animate-reveal-right stagger-3"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border-light)',
            borderRadius: 8, overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border-light)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div className="label-caps">Live Evidence Activity</div>
            <div
              style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
                animation: 'pulse-ring 2.2s ease-in-out infinite',
              }}
            />
          </div>
          <div style={{ padding: '16px' }}>
            <LiveTimeline batches={batches} />
          </div>
        </div>

        {/* Chain status */}
        <div
          className="animate-reveal-right stagger-4"
          style={{
            background: '#123C36',
            borderRadius: 8, padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(18,60,54,0.2)',
          }}
        >
          <div
            className="label-caps-sm"
            style={{ color: 'rgba(168,200,181,0.6)', marginBottom: 12 }}
          >
            MST Testnet Status
          </div>
          {[
            { label: 'CHAIN ID',     value: '4242', color: '#A8C8B5' },
            { label: 'LATEST BLOCK', value: '#8,841', color: '#C8A75A' },
            { label: 'GAS PRICE',    value: '12 gwei', color: '#C9683F' },
            { label: 'AI VERIFIER',  value: 'ACTIVE', color: '#3F805D' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}
              >
                {item.label}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: 11, fontWeight: 700, color: item.color }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
