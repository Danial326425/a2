'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatBDT, formatNumber } from '@/app/lib/adsUtils';

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className="font-bold">
            {p.dataKey === 'spend' ? formatBDT(p.value) : Number(p.value || 0).toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function DailyTrendChart({ data, isLoading }) {
  if (isLoading && (!data || !data.length)) {
    return <div className="h-72 rounded-2xl animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />;
  }

  const rows = (data || []).map((d) => ({
    date: d.date ? d.date.slice(5) : '', // MM-DD
    spend: Number(d.spend || 0),
    purchases: Number(d.purchases || 0),
  }));

  if (!rows.length) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-2xl">
        এই সময়ের জন্য কোনো ডেটা নেই
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4">Spend vs Purchases — দৈনিক ট্রেন্ড</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} minTickGap={16} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6366f1' }} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} width={48} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#f59e0b' }} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
            <Tooltip content={<TooltipBox />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="spend" name="Spend (৳)" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="purchases" name="Purchases" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
