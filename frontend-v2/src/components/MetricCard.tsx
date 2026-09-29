import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}

export function MetricCard({ label, value, icon, trend, className = "" }: MetricCardProps) {
  return (
    <div className={`card-glass p-5 flex flex-col gap-2 card-glass-hover ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#8b92a5] uppercase tracking-wider">{label}</span>
        {icon && <div className="text-[#565d70]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {trend && <span className="text-sm font-medium text-[#00E676]">{trend}</span>}
      </div>
    </div>
  );
}
