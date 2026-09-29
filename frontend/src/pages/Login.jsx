import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, ChevronRight, ShieldCheck, Layers, Scale } from 'lucide-react';

/* ─────────────────────────────────────────────
   MATERIAL FLOW STAGES — LEFT PANEL
─────────────────────────────────────────────── */
const FLOW_STAGES = [
  {
    kg: '1,000 KG', label: 'INPUT', sub: 'Waste feedstock collected',
    pct: 100, color: '#A8C8B5', icon: '⬛'
  },
  {
    kg: '950 KG', label: 'PROCESSED', sub: 'Thermal / chemical treatment',
    pct: 95, color: '#C9683F', icon: '⚙'
  },
  {
    kg: '680 KG', label: 'RECOVERED', sub: 'Certified material yield',
    pct: 68, color: '#C8A75A', icon: '♻'
  },
  {
    kg: '675 KG', label: 'VERIFIED', sub: 'On-chain attestation',
    pct: 67.5, color: '#3F805D', icon: '✓'
  },
];

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
─────────────────────────────────────────────── */
function AnimCounter({ target, duration = 1200, visible }) {
  const [val, setVal] = useState(0);
  const targetNum = parseInt(String(target).replace(/[^0-9]/g, ''), 10);
  const suffix = String(target).replace(/[0-9,]/g, '').trim();

  useEffect(() => {
    if (!visible) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * targetNum));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, targetNum, duration]);

  return (
    <span>
      {val.toLocaleString()}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
   PARTICLES — animated material fragments
─────────────────────────────────────────────── */
function Particles() {
  const particles = [
    { x: '42%', delay: 0,    dur: 3.2, size: 4, opacity: 0.45 },
    { x: '48%', delay: 0.6,  dur: 2.8, size: 3, opacity: 0.35 },
    { x: '52%', delay: 1.2,  dur: 3.5, size: 5, opacity: 0.30 },
    { x: '46%', delay: 1.8,  dur: 2.6, size: 3, opacity: 0.40 },
    { x: '54%', delay: 0.3,  dur: 3.0, size: 4, opacity: 0.25 },
    { x: '44%', delay: 2.1,  dur: 2.9, size: 3, opacity: 0.35 },
    { x: '56%', delay: 0.9,  dur: 3.3, size: 4, opacity: 0.30 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: '-8px',
            width: p.size,
            height: p.size,
            borderRadius: '2px',
            background: `rgba(168,200,181,${p.opacity})`,
            animationName: 'float-particle-down',
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            '--particle-travel': '480px',
            '--particle-drift': `${(i % 2 === 0 ? 1 : -1) * 3}px`,
            transform: 'rotate(45deg)',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MATERIAL FLOW DIAGRAM
─────────────────────────────────────────────── */
function MaterialFlowDiagram({ visible }) {
  return (
    <div style={{ position: 'relative' }}>
      <Particles />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative', zIndex: 1 }}>
        {FLOW_STAGES.map((stage, idx) => {
          const isLast = idx === FLOW_STAGES.length - 1;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {/* Stage node row */}
              <div
                className="animate-stage-enter"
                style={{ animationDelay: `${idx * 150 + 400}ms`, width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0' }}>
                  {/* KG value */}
                  <div style={{ width: 110, textAlign: 'right', flexShrink: 0 }}>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: idx === 0 ? 24 : 19,
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                      }}
                    >
                      {visible ? <AnimCounter target={stage.kg} duration={900 + idx * 200} visible={visible} /> : '0 KG'}
                    </div>
                  </div>

                  {/* Node dot + bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
                    <div
                      style={{
                        width: idx === 0 ? 16 : 12,
                        height: idx === 0 ? 16 : 12,
                        borderRadius: idx === 3 ? '3px' : '50%',
                        background: stage.color,
                        border: '2.5px solid rgba(255,255,255,0.3)',
                        boxShadow: `0 0 12px ${stage.color}60`,
                        transition: 'all 0.3s ease',
                        transform: 'rotate(45deg)',
                      }}
                    />
                    <div
                      style={{
                        width: 40,
                        height: 3,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        marginTop: 6,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        className="animate-line-grow-x"
                        style={{
                          height: '100%',
                          width: `${stage.pct}%`,
                          background: stage.color,
                          animationDelay: `${idx * 150 + 600}ms`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Label + sub */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        color: '#fff',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                      }}
                    >
                      {stage.label}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.45)',
                        marginTop: 2,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                      }}
                    >
                      {stage.sub}
                    </div>
                  </div>

                  {/* Pct */}
                  <div
                    className="font-mono"
                    style={{ fontSize: 12, color: stage.color, fontWeight: 600, flexShrink: 0 }}
                  >
                    {stage.pct}%
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: 36,
                    position: 'relative',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      width: 1,
                      height: '100%',
                      background: `linear-gradient(to bottom, ${stage.color}60, ${FLOW_STAGES[idx + 1].color}60)`,
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WORKSPACE TRANSITION OVERLAY
─────────────────────────────────────────────── */
function WorkspaceTransition({ onComplete }) {
  const stages = ['COLLECT', 'PROCESS', 'RECOVER', 'VERIFY'];
  const messages = [
    'SECURING EVIDENCE',
    'VERIFYING MATERIAL TRACE',
    'LOADING BATCH DATA',
    'ESTABLISHING TRUSTED SESSION',
  ];
  const [activeIdx, setActiveIdx] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const stageTimers = stages.map((_, i) =>
      setTimeout(() => setActiveIdx(i + 1), 300 + i * 320)
    );
    const msgTimers = messages.map((_, i) =>
      setTimeout(() => setMsgIdx(i), 150 + i * 320)
    );
    const doneTimer = setTimeout(() => {
      setDone(true);
      setTimeout(onComplete, 400);
    }, 300 + stages.length * 320 + 400);

    return () => {
      stageTimers.forEach(clearTimeout);
      msgTimers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: '#123C36',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        opacity: done ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div
          className="font-serif"
          style={{ fontSize: 28, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          CirqProof
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginTop: 6 }}
        >
          MATERIAL FORENSICS PLATFORM
        </div>
      </div>

      {/* Stage progress track */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {stages.map((stage, i) => {
          const isActive = i < activeIdx;
          const isCurrent = i === activeIdx - 1;
          return (
            <React.Fragment key={stage}>
              <div
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${isActive ? 'rgba(168,200,181,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 3,
                  background: isActive ? 'rgba(168,200,181,0.12)' : 'rgba(255,255,255,0.03)',
                  transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.25s ease',
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.15em',
                    color: isActive ? '#A8C8B5' : 'rgba(255,255,255,0.2)',
                    fontWeight: 700,
                  }}
                >
                  {stage}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div
                  style={{
                    width: 40,
                    height: 1,
                    background: isActive ? '#A8C8B5' : 'rgba(255,255,255,0.08)',
                    transition: 'background 0.3s ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ width: 320, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${(activeIdx / stages.length) * 100}%`,
            background: 'linear-gradient(to right, #A8C8B5, #C8A75A)',
            borderRadius: 2,
            transition: 'width 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>

      {/* Status message */}
      <div
        className="font-mono"
        style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}
      >
        {messages[msgIdx]}...
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROLE PILL
─────────────────────────────────────────────── */
function RolePill({ roleKey, label, icon: Icon, desc, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(roleKey)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 4,
        border: `1.5px solid ${isSelected ? '#2F6F5E' : '#D6D0C3'}`,
        background: isSelected ? '#F0F5F0' : '#FDFAF4',
        color: isSelected ? '#123C36' : '#6F7770',
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        letterSpacing: '0.04em',
      }}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   MAIN LOGIN PAGE
─────────────────────────────────────────────── */
export default function Login() {
  const { selectRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('RECYCLER');
  const [showTransition, setShowTransition] = useState(false);
  const [email, setEmail] = useState('operator@cirqproof.io');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 300);
    const t2 = setTimeout(() => setPanelVisible(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const roleOptions = [
    { key: 'RECYCLER', label: 'Operator',  icon: Layers },
    { key: 'AUDITOR',  label: 'Verifier',  icon: ShieldCheck },
    { key: 'PRODUCER', label: 'Auditor',   icon: Scale },
    { key: 'BUYER',    label: 'Off-taker', icon: null },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    selectRole(selectedRole);
    setShowTransition(true);
  };

  return (
    <>
      {showTransition && (
        <WorkspaceTransition onComplete={() => navigate('/')} />
      )}

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          overflow: 'hidden',
          background: '#F4F1E8',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
      >
        {/* ═══ LEFT — CINEMATIC MATERIAL PANEL ═══ */}
        <div
          className="hide-mobile"
          style={{
            width: '57%',
            flexShrink: 0,
            background: '#123C36',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 56px',
            justifyContent: 'space-between',
          }}
        >
          {/* Texture layers */}
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: `
                radial-gradient(ellipse at 20% 30%, rgba(168,200,181,0.06) 0%, transparent 55%),
                radial-gradient(ellipse at 80% 70%, rgba(201,104,63,0.04) 0%, transparent 45%),
                radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.3) 0%, transparent 60%)
              `,
            }}
          />

          {/* Grain texture */}
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            }}
          />

          {/* ── Logo ── */}
          <div
            className="animate-fade-in"
            style={{ position: 'relative', zIndex: 1, animationDelay: '200ms' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              {/* Mark */}
              <div
                style={{
                  width: 34, height: 34,
                  border: '2px solid rgba(168,200,181,0.5)',
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 14, height: 14,
                    border: '2.5px solid rgba(168,200,181,0.9)',
                    borderRadius: '50%',
                  }}
                />
                <div
                  style={{
                    position: 'absolute', bottom: -1, right: -1,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#C9683F',
                  }}
                />
              </div>
              <div>
                <div
                  className="font-serif"
                  style={{ fontSize: 22, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}
                >
                  CirqProof
                </div>
              </div>
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', paddingLeft: 46 }}
            >
              TRACE · RECOVER · VERIFY
            </div>
          </div>

          {/* ── Headline ── */}
          <div
            style={{ position: 'relative', zIndex: 1 }}
            className={visible ? 'animate-reveal-up' : ''}
          >
            <div
              className="font-mono"
              style={{ fontSize: 9, color: 'rgba(168,200,181,0.6)', letterSpacing: '0.18em', marginBottom: 16 }}
            >
              MATERIAL FORENSICS PLATFORM
            </div>
            <h1
              className="font-serif"
              style={{
                fontSize: 52,
                color: '#fff',
                lineHeight: 1.04,
                marginBottom: 20,
                letterSpacing: '-0.04em',
              }}
            >
              From Waste<br />to Verified<br />Impact
            </h1>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7,
                maxWidth: 320,
                fontWeight: 400,
              }}
            >
              Turn real-world recycling activity into independently verifiable evidence — anchored on-chain, certified by AI.
            </p>
          </div>

          {/* ── Material Flow ── */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              className="font-mono"
              style={{
                fontSize: 9, color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.15em', marginBottom: 20,
              }}
            >
              ACTIVE MATERIAL TRACE — BATCH #CP-2026-041
            </div>
            <MaterialFlowDiagram visible={visible} />
          </div>

          {/* ── Footer annotation ── */}
          <div
            className="font-mono animate-fade-in"
            style={{
              fontSize: 9, color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.1em', position: 'relative', zIndex: 1,
              animationDelay: '800ms',
            }}
          >
            MST TESTNET · CHAIN ID 4242 · AI VERIFIER ACTIVE
          </div>
        </div>

        {/* ═══ RIGHT — AUTHENTICATION PANEL ═══ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 32px',
            background: '#F4F1E8',
            position: 'relative',
          }}
        >
          {/* Subtle warm vignette */}
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)',
            }}
          />

          <div
            style={{
              width: '100%',
              maxWidth: 400,
              position: 'relative',
              zIndex: 1,
              opacity: panelVisible ? 1 : 0,
              transform: panelVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {/* Evidence sheet header */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #D6D0C3',
                borderTop: '3px solid #2F6F5E',
                borderRadius: 4,
                padding: '22px 24px',
                marginBottom: 24,
                boxShadow: '0 4px 20px rgba(18,60,54,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="label-caps" style={{ marginBottom: 8 }}>Workspace Access</div>
                  <h2
                    className="font-serif"
                    style={{ fontSize: 30, color: '#182521', lineHeight: 1, marginBottom: 8 }}
                  >
                    Welcome Back
                  </h2>
                  <p style={{ fontSize: 13, color: '#6F7770', lineHeight: 1.5 }}>
                    Access your material forensics workstation.
                  </p>
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 9, color: '#A8B5B0', textAlign: 'right', lineHeight: 1.8 }}
                >
                  <div>DOC-2026-041</div>
                  <div>28 SEP 2026</div>
                </div>
              </div>
            </div>

            {/* Auth form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Role selector */}
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: 10 }}>
                  Access Role
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {roleOptions.map(r => (
                    <RolePill
                      key={r.key}
                      roleKey={r.key}
                      label={r.label}
                      icon={r.icon}
                      isSelected={selectedRole === r.key}
                      onSelect={setSelectedRole}
                    />
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: 7 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@cirqproof.io"
                  style={{
                    padding: '11px 14px',
                    fontSize: 13,
                    background: '#FDFAF4',
                    border: '1.5px solid #D6D0C3',
                    borderRadius: 4,
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <label className="label-caps">Password</label>
                  <button
                    type="button"
                    style={{
                      fontSize: 11, color: '#2F6F5E', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    Forgot?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    padding: '11px 14px',
                    fontSize: 13,
                    background: '#FDFAF4',
                    border: '1.5px solid #D6D0C3',
                    borderRadius: 4,
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: '#123C36',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'background 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: '0 4px 16px rgba(18,60,54,0.3)',
                  marginTop: 4,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#2F6F5E';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(47,111,94,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#123C36';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(18,60,54,0.3)';
                }}
              >
                ENTER WORKSPACE
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 20px' }}>
              <hr style={{ flex: 1, height: 1, background: '#D6D0C3', border: 'none' }} />
              <span
                className="font-mono"
                style={{ fontSize: 9, color: '#A8B5B0', letterSpacing: '0.15em' }}
              >
                QUICK ACCESS
              </span>
              <hr style={{ flex: 1, height: 1, background: '#D6D0C3', border: 'none' }} />
            </div>

            {/* Quick role buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {roleOptions.map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r.key);
                    selectRole(r.key);
                    setShowTransition(true);
                  }}
                  style={{
                    padding: '10px 14px',
                    border: '1.5px solid #D6D0C3',
                    borderRadius: 4,
                    background: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6F7770',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#2F6F5E';
                    e.currentTarget.style.color = '#2F6F5E';
                    e.currentTarget.style.background = '#F0F5F0';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#D6D0C3';
                    e.currentTarget.style.color = '#6F7770';
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  <span>{r.label}</span>
                  <ChevronRight size={12} />
                </button>
              ))}
            </div>

            {/* Footer */}
            <div
              className="font-mono"
              style={{ fontSize: 9, color: '#A8B5B0', textAlign: 'center', marginTop: 28, lineHeight: 1.8 }}
            >
              MST Testnet · Chain ID 4242<br />
              AI Verifier Active · Autonomous Reconciliation Engine
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
