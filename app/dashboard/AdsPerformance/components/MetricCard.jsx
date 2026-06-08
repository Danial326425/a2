'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Single account-summary metric card. `change` (optional %) renders a green
 * up / red down chip vs the previous period.
 */
export default function MetricCard({ icon: Icon, label, value, sub, gradient, change }) {
  const hasChange = change !== undefined && change !== null && !Number.isNaN(change);
  const up = Number(change) >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-md text-white"
      style={{ background: gradient }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -right-2 w-14 h-14 rounded-full bg-white/10" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/75">{label}</span>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            {Icon && <Icon size={17} className="text-white" />}
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold leading-tight">{value}</p>
        <div className="flex items-center gap-2 mt-1.5 min-h-[18px]">
          {sub && <span className="text-xs text-white/70">{sub}</span>}
          {hasChange && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                up ? 'bg-white/20 text-white' : 'bg-black/20 text-white'
              }`}
            >
              {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
