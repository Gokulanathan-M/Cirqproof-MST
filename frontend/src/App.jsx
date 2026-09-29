import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import {
  LayoutGrid, Layers, FlaskConical, ShieldCheck, GitBranch,
  Scale, Link2, BarChart3, LogOut, Command, X, ChevronRight,
  Menu, Bell, Sun, Moon
} from 'lucide-react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import Verification from './pages/Verification';
import Blockchain from './pages/Blockchain';
import Challenges from './pages/Challenges';
import Settlements from './pages/Settlements';
import ForensicWorkbench from './pages/ForensicWorkbench';
import BatchDetails from './pages/BatchDetails';

/* ═══════════════════════════════════════════════════════════
   COMMAND MENU
═══════════════════════════════════════════════════════════ */
const COMMANDS = [
  { id: 'dashboard',   label: 'Dashboard',     desc: 'Investigation overview',       path: '/',            icon: LayoutGrid },
  { id: 'batches',     label: 'Batches',        desc: 'Material batch records',       path: '/workbench',   icon: Layers },
  { id: 'simulator',  label: 'Simulator',      desc: 'Generate test scenarios',      path: '/simulator',   icon: FlaskConical },
  { id: 'verify',     label: 'Verification',   desc: 'Human approval workflow',      path: '/verification',icon: ShieldCheck },
  { id: 'evidence',   label: 'Evidence',       desc: 'Forensic evidence chain',      path: '/workbench',   icon: GitBranch },
  { id: 'challenges', label: 'Challenges',     desc: 'Disputed evidence records',    path: '/challenges',  icon: Scale },
  { id: 'settlement', label: 'Settlement',     desc: 'Escrow settlement flow',       path: '/settlements', icon: BarChart3 },
  { id: 'blockchain', label: 'Blockchain',     desc: 'Immutable evidence ledger',    path: '/blockchain',  icon: Link2 },
];

function CommandMenu({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(0);
  const navigate = useNavigate();
  const inputRef = React.useRef(null);

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
    setQuery('');
    setFocused(0);
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
    if (e.key === 'Enter' && filtered[focused]) {
      navigate(filtered[focused].path);
      onClose();
    }
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(11, 30, 27, 0.65)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '14vh',
      }}
    >
      <div
        className="command-menu animate-scale-in"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%', maxWidth: 520,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <Command size={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setFocused(0); }}
            placeholder="Search commands, pages, batches..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif',
              padding: 0, boxShadow: 'none',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-faint)', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 340, overflowY: 'auto', padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
              No results found
            </div>
          ) : filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                className={`command-item ${i === focused ? 'command-item-focused' : ''}`}
                onClick={() => { navigate(cmd.path); onClose(); }}
                onMouseEnter={() => setFocused(i)}
                style={{
                  width: '100%', border: 'none', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', cursor: 'pointer',
                  background: i === focused ? 'var(--teal-light)' : 'transparent',
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} style={{ color: 'var(--teal)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{cmd.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{cmd.desc}</div>
                </div>
                <ChevronRight size={12} style={{ color: 'var(--border)' }} />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid var(--border-light)',
          background: 'var(--bg)',
          display: 'flex', gap: 16,
        }}>
          {[['↑↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-faint)' }}>
              <kbd style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 3, padding: '1px 6px', fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)',
              }}>{key}</kbd>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION
═══════════════════════════════════════════════════════════ */
const NAV_GROUPS = [
  {
    label: 'Investigation',
    items: [
      { path: '/',            label: 'Dashboard',     icon: LayoutGrid },
      { path: '/workbench',   label: 'Batches',       icon: Layers },
      { path: '/simulator',   label: 'Simulator',     icon: FlaskConical },
    ],
  },
  {
    label: 'Evidence',
    items: [
      { path: '/verification',label: 'Verification',  icon: ShieldCheck },
      { path: '/challenges',  label: 'Challenges',    icon: Scale },
      { path: '/settlements', label: 'Settlement',    icon: BarChart3 },
    ],
  },
  {
    label: 'Ledger',
    items: [
      { path: '/blockchain',  label: 'Blockchain',    icon: Link2 },
    ],
  },
];

function Sidebar({ onOpenCommand, mobileOpen, onMobileClose }) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 0 16px' }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30, height: 30, border: '2px solid var(--teal)',
              borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 11, height: 11, border: '2.5px solid var(--teal)',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)',
              }}
            />
          </div>
          <div>
            <div
              className="font-serif"
              style={{ fontSize: 16, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}
            >
              CirqProof
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 8, color: 'var(--text-faint)', letterSpacing: '0.1em', marginTop: 2 }}
            >
              MATERIAL FORENSICS
            </div>
          </div>
        </div>
      </div>

      {/* Command search */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
        <button
          onClick={onOpenCommand}
          style={{
            width: '100%', padding: '8px 12px',
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontSize: 12, color: 'var(--text-faint)', fontFamily: 'Plus Jakarta Sans, sans-serif',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <Command size={12} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search commands...</span>
          <kbd
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 2, padding: '1px 5px', fontSize: 9,
              fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: 24 }}>
            <div
              className="label-caps-sm"
              style={{ padding: '0 8px', marginBottom: 6 }}
            >
              {group.label}
            </div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  >
                    <Icon size={14} style={{ flexShrink: 0 }} />
                    {item.label}
                  </div>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User + Theme Toggle + Logout */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)' }}>
        {currentUser && (
          <div style={{ marginBottom: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
              {currentUser.id}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 3, letterSpacing: '0.05em' }}
            >
              {currentUser.address?.slice(0, 14)}...
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'flex-start', fontSize: 11 }}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun size={13} style={{ color: 'var(--gold)' }} /> : <Moon size={13} style={{ color: 'var(--teal)' }} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '7px 10px' }}
            title="Sign Out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className="hide-mobile"
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border-light)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          transition: 'background 0.2s ease, border-color 0.2s ease',
        }}
      >
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(11,30,27,0.6)',
          }}
          onClick={onMobileClose}
        >
          <div
            style={{
              width: 260, height: '100%',
              background: 'var(--surface)',
              animation: 'reveal-left 0.3s cubic-bezier(0.22,1,0.36,1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOP BAR (mobile + status)
═══════════════════════════════════════════════════════════ */
function TopBar({ onMenuOpen, onCommandOpen }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const pageTitle = NAV_GROUPS
    .flatMap(g => g.items)
    .find(i => i.path === location.pathname || (i.path !== '/' && location.pathname.startsWith(i.path)))
    ?.label || 'Dashboard';

  return (
    <div
      style={{
        height: 52,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile menu toggle */}
        <button
          className="hide-desktop btn-ghost"
          onClick={onMenuOpen}
          style={{ padding: '6px', border: 'none' }}
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="font-mono"
            style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.1em' }}
          >
            CIRQPROOF /
          </span>
          <span
            style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}
          >
            {pageTitle}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Live status indicator */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px',
            background: 'var(--teal-wash)', border: '1px solid var(--border)',
            borderRadius: 20, fontSize: 10, fontWeight: 600,
            color: 'var(--teal)', fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          <div
            style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
              animation: 'pulse-ring 2.2s ease-in-out infinite',
            }}
          />
          CHAIN LIVE
        </div>

        {/* Theme mode toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost"
          style={{ padding: '7px 10px' }}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun size={14} style={{ color: 'var(--gold)' }} />
          ) : (
            <Moon size={14} style={{ color: 'var(--teal)' }} />
          )}
        </button>

        <button className="btn-ghost" style={{ padding: '7px 10px' }}>
          <Bell size={14} />
        </button>

        <button
          onClick={onCommandOpen}
          className="btn-ghost"
          style={{ padding: '7px 10px' }}
          title="Command Menu (⌘K)"
        >
          <Command size={14} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROTECTED LAYOUT
═══════════════════════════════════════════════════════════ */
function ProtectedLayout() {
  const { currentUser } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', transition: 'background 0.2s ease' }}>
      {/* Sidebar */}
      <Sidebar
        onOpenCommand={() => setCommandOpen(true)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          onMenuOpen={() => setMobileMenuOpen(true)}
          onCommandOpen={() => setCommandOpen(true)}
        />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 28px',
          }}
        >
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/workbench"     element={<ForensicWorkbench />} />
            <Route path="/workbench/:id" element={<ForensicWorkbench />} />
            <Route path="/batch/:id"     element={<BatchDetails />} />
            <Route path="/simulator"     element={<Simulator />} />
            <Route path="/verification"  element={<Verification />} />
            <Route path="/challenges"    element={<Challenges />} />
            <Route path="/settlements"   element={<Settlements />} />
            <Route path="/blockchain"    element={<Blockchain />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Command Menu */}
      <CommandMenu isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*"     element={<ProtectedLayout />} />
      </Routes>
    </ThemeProvider>
  );
}
