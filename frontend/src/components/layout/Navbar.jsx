import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../chain';
import api from '../../services/api';
import { LogOut, Command, ChevronDown, Wallet } from 'lucide-react';



export default function Navbar({ onOpenCommand }) {
  const { currentUser, logout } = useAuth();
  const { account, connectWallet, isConnected } = useWallet();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.checkHealth().then(online => {
      if (mounted) setIsBackendOnline(online);
    });
    const interval = setInterval(() => {
      api.checkHealth().then(online => {
        if (mounted) setIsBackendOnline(online);
      });
    }, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const roleColor = {
    RECYCLER: 'var(--teal)',
    AUDITOR:  'var(--warning)',
    PRODUCER: 'var(--teal-mid)',
    BUYER:    'var(--coral)',
  };

  const navLinks = [
    { to: '/',           label: 'Workbench',  end: true  },
    { to: '/blockchain', label: 'Ledger',      end: false },
    { to: '/simulator',  label: 'Simulator',   end: false },
  ];

  return (
    <header
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {/* Logo mark */}
            <div
              style={{
                width: 26,
                height: 26,
                border: '2px solid var(--teal)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--teal)',
                }}
              />
            </div>
            <span
              className="font-serif"
              style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.025em' }}
            >
              CirqProof
            </span>
          </button>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                style={({ isActive }) => ({
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '6px 12px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  color: isActive ? 'var(--teal)' : 'var(--text-muted)',
                  background: isActive ? 'var(--teal-light)' : 'transparent',
                  transition: 'all 0.15s ease',
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.background = 'var(--bg)';
                  }
                }}
                onMouseLeave={e => {
                  if (!e.currentTarget.style.background?.includes('teal')) {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Backend API status */}
          <div
            title={isBackendOnline ? 'Connected to CirqProof API Server (port 4000)' : 'API Server offline — using resilient mock engine'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 9px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              background: 'var(--bg)',
              cursor: 'default',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isBackendOnline ? 'var(--success)' : 'var(--warning)',
              }}
            />
            <span
              className="font-mono"
              style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em' }}
            >
              {isBackendOnline ? 'API: LIVE' : 'API: MOCK'}
            </span>
          </div>

          {/* Network status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 9px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              background: 'var(--bg)',
            }}
          >
            <div
              className="animate-pulse-teal"
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--teal)',
              }}
            />
            <span
              className="font-mono"
              style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em' }}
            >
              CHAIN:91562037
            </span>
          </div>

          {/* Web3 Wallet connect button */}
          <button
            onClick={() => connectWallet()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              border: `1px solid ${isConnected ? 'var(--teal)' : 'var(--border)'}`,
              borderRadius: 4,
              background: isConnected ? 'var(--teal-light)' : 'var(--bg)',
              color: isConnected ? 'var(--teal)' : 'var(--text-muted)',
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={account ? `Connected Account: ${account}` : 'Click to connect Web3 Wallet (MetaMask)'}
          >
            <Wallet size={12} />
            <span>
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
            </span>
          </button>


          {/* Command bar trigger */}
          {onOpenCommand && (
            <button
              onClick={onOpenCommand}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                border: '1px solid var(--border)',
                borderRadius: 4,
                background: 'var(--bg)',
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--teal)';
                e.currentTarget.style.color = 'var(--teal)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="Open command bar (⌘K)"
            >
              <Command size={13} />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  padding: '1px 5px',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  background: 'var(--surface)',
                }}
              >
                ⌘K
              </span>
            </button>
          )}

          {/* User identity */}
          {currentUser && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {/* Role dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: roleColor[currentUser.id] || 'var(--teal-mid)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text)',
                    maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUser.id}
                </span>
                <ChevronDown size={11} style={{ color: 'var(--text-faint)' }} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 6,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '6px',
                    minWidth: 180,
                    boxShadow: '0 4px 16px rgba(23,35,34,0.08)',
                    zIndex: 50,
                  }}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-light)', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{currentUser.id}</div>
                    <div
                      className="font-mono"
                      style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}
                    >
                      {currentUser.address?.slice(0, 14)}…
                    </div>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); navigate('/login'); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 10px',
                      background: 'none',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 13,
                      color: 'var(--error)',
                      cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontWeight: 500,
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--error-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
