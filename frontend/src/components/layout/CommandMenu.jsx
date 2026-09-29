import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, CheckCircle, ShieldAlert, Coins, RotateCcw,
  Sparkles, Scale, Blocks, X, ChevronRight
} from 'lucide-react';

const COMMANDS = [
  { id: 'SCENARIO_NORMAL', label: 'Set Scenario: Normal (Conserved Mass)', category: 'PLANT SIM', Icon: CheckCircle, color: 'var(--copper)' },
  { id: 'SCENARIO_INCONSISTENT', label: 'Set Scenario: Inconsistent (Recovery Delta)', category: 'PLANT SIM', Icon: ShieldAlert, color: 'var(--rust)' },
  { id: 'SCENARIO_TAMPERED', label: 'Set Scenario: Tampered (Hash Mismatch)', category: 'PLANT SIM', Icon: Sparkles, color: 'var(--amber)' },
  { id: 'ACTION_VERIFY_STAGE', label: 'Advance Pipeline: Human Verification Review', category: 'FORENSICS', Icon: Scale, color: 'var(--paper-dim)' },
  { id: 'ACTION_ATTEST', label: 'Trigger MST Testnet Attestation (P1 Anchor)', category: 'BLOCKCHAIN', Icon: Blocks, color: 'var(--paper-dim)' },
  { id: 'ACTION_CHALLENGE', label: 'Open Auditor Dispute & Stake Challenge Bounty', category: 'AUDIT DESK', Icon: ShieldAlert, color: 'var(--rust)' },
  { id: 'ACTION_RELEASE_ESCROW', label: 'Release Settlement Escrow (₹50,000)', category: 'SETTLEMENT', Icon: Coins, color: 'var(--copper)' },
  { id: 'ACTION_RESET_DATA', label: 'Reset Ledger to Default Laboratory State', category: 'SYSTEM', Icon: RotateCcw, color: 'var(--paper-ghost)' },
];

export default function CommandMenu({ isOpen, onClose, onSelectAction }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
        setQuery('');
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((prev) => Math.min(prev + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter' && filtered[active]) {
        onSelectAction(filtered[active].id);
        onClose(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filtered, active, onSelectAction]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-fade-in"
      style={{ background: 'rgba(10, 11, 12, 0.85)' }}
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(false); setQuery(''); } }}
    >
      <div
        className="w-full max-w-lg border overflow-hidden animate-slide-up"
        style={{ background: 'var(--bg-concrete)', borderColor: 'var(--border-primary)' }}
      >
        {/* Command bar header */}
        <div
          className="flex items-center px-4 py-3 border-b gap-2"
          style={{ background: 'var(--bg-void)', borderColor: 'var(--border-primary)' }}
        >
          <Terminal size={13} style={{ color: 'var(--paper-ghost)', flexShrink: 0 }} />
          <span className="font-mono text-[9px] uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--paper-ghost)' }}>
            LAB DISPATCH:
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a laboratory directive..."
            className="flex-1 border-none font-mono text-[12px]"
            style={{ background: 'transparent', color: 'var(--paper-aged)' }}
          />
          <span className="animate-blink font-mono text-[14px]" style={{ color: 'var(--copper)', opacity: 0.7 }}>|</span>
          <button
            onClick={() => { onClose(false); setQuery(''); }}
            className="font-mono text-[9px] uppercase px-2 py-0.5 border flex-shrink-0 transition-colors"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--paper-ghost)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--paper-aged)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--paper-ghost)'; }}
          >
            ESC
          </button>
        </div>

        {/* Command list */}
        <div
          className="max-h-72 overflow-y-auto"
          ref={listRef}
        >
          {filtered.length === 0 ? (
            <div
              className="py-10 text-center font-mono text-[10px] uppercase"
              style={{ color: 'var(--paper-ghost)' }}
            >
              No matching directive found.
            </div>
          ) : (
            <>
              {/* Group by category */}
              {(() => {
                const groups = {};
                filtered.forEach((cmd) => {
                  if (!groups[cmd.category]) groups[cmd.category] = [];
                  groups[cmd.category].push(cmd);
                });

                return Object.entries(groups).map(([cat, cmds]) => (
                  <div key={cat}>
                    <div
                      className="px-4 py-1.5 font-mono text-[8px] uppercase tracking-widest border-b"
                      style={{
                        color: 'var(--paper-ghost)',
                        background: 'var(--bg-void)',
                        borderColor: 'var(--border-faint)',
                      }}
                    >
                      {cat}
                    </div>
                    {cmds.map((cmd) => {
                      const idx = filtered.indexOf(cmd);
                      const isActive = active === idx;
                      const { Icon } = cmd;
                      return (
                        <div
                          key={cmd.id}
                          onClick={() => {
                            onSelectAction(cmd.id);
                            onClose(false);
                            setQuery('');
                          }}
                          onMouseEnter={() => setActive(idx)}
                          className="flex items-center justify-between px-4 py-2.5 cursor-pointer border-b transition-colors"
                          style={{
                            borderColor: 'var(--border-faint)',
                            background: isActive ? 'var(--bg-concrete-2)' : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            {isActive ? (
                              <ChevronRight size={11} style={{ color: 'var(--copper)', flexShrink: 0 }} />
                            ) : (
                              <span style={{ width: 11, flexShrink: 0 }} />
                            )}
                            <Icon size={13} style={{ color: cmd.color, flexShrink: 0 }} />
                            <span
                              className="font-mono text-[11px]"
                              style={{ color: isActive ? 'var(--paper-aged)' : 'var(--paper-dim)' }}
                            >
                              {cmd.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 border-t flex items-center justify-between font-mono text-[9px] uppercase"
          style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-void)', color: 'var(--paper-ghost)' }}
        >
          <span>CIRQPROOF // LAB CONSOLE // STATION 09</span>
          <div className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ execute</span>
          </div>
        </div>
      </div>
    </div>
  );
}
