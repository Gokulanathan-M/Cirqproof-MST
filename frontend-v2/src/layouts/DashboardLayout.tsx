import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { useAuth } from "../context/AuthContext";

export function DashboardLayout() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#06070a]">
      <Navigation />
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 p-4 flex items-center gap-3 z-50">
          <div className="flex items-center gap-2 bg-[#00e6761a] border border-[#00e67633] px-3 py-1 rounded-full text-[#00E676] text-xs font-semibold tracking-wider">
            <div className="live-indicator" /> CHAIN LIVE
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
