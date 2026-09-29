import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Database, ShieldCheck, AlertTriangle, Link as LinkIcon, Play, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Navigation() {
  const { logout, user } = useAuth();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/batches", icon: Database, label: "Batches" },
    { to: "/evidence", icon: ShieldCheck, label: "Evidence" },
    { to: "/challenges", icon: AlertTriangle, label: "Challenges" },
    { to: "/settlement", icon: LinkIcon, label: "Settlement" },
    { to: "/blockchain", icon: LinkIcon, label: "Blockchain" },
    { to: "/simulator", icon: Play, label: "Simulator" },
  ];

  return (
    <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-[#070b0d]/90 backdrop-blur-xl">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.12)]">
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full border border-emerald-300/70">
              <span className="absolute h-3.5 w-3.5 rounded-full border border-emerald-300/60" />
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white">CirqProof</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Verification network</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Primary workflow</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'border border-emerald-400/25 bg-emerald-500/10 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 rounded-xl border border-white/10 bg-slate-900/60 p-3">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Logged in as</div>
          <div className="mt-1 truncate text-sm font-semibold text-white">{user?.name}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-cyan-300">{user?.role}</div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
