'use client';

import { DollarSign, Users, MousePointerClick, TrendingUp, ShoppingBag, Target, Eye } from 'lucide-react';
import MetricCard from './MetricCard';
import { formatBDT, formatNumber, fmtInt } from '@/app/lib/adsUtils';

const SkelCard = () => (
  <div className="rounded-2xl p-5 h-[120px] animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
);

export default function AccountSummaryCards({ summary, isLoading }) {
  if (isLoading && !summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => <SkelCard key={i} />)}
      </div>
    );
  }

  const s = summary || {};
  const cards = [
    { icon: DollarSign, label: 'Total Spend', value: formatBDT(s.spend), sub: 'মোট খরচ',
      gradient: 'linear-gradient(135deg,#6366f1,#4338ca)' },
    { icon: Users, label: 'Reach', value: formatNumber(s.reach), sub: `Impr. ${formatNumber(s.impressions)}`,
      gradient: 'linear-gradient(135deg,#0ea5e9,#0369a1)' },
    { icon: MousePointerClick, label: 'Clicks', value: fmtInt(s.clicks), sub: `CTR ${Number(s.ctr || 0)}%`,
      gradient: 'linear-gradient(135deg,#14b8a6,#0f766e)' },
    { icon: Eye, label: 'LP Views', value: fmtInt(s.landing_page_views), sub: `লিংক ক্লিকের ${Number(s.lp_view_rate || 0)}%`,
      gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
    { icon: ShoppingBag, label: 'Purchases', value: fmtInt(s.purchases), sub: formatBDT(s.purchase_value),
      gradient: 'linear-gradient(135deg,#f59e0b,#b45309)' },
    { icon: Target, label: 'Avg. CPA', value: formatBDT(s.cpa), sub: 'প্রতি অর্ডার খরচ',
      gradient: 'linear-gradient(135deg,#ec4899,#be185d)' },
    { icon: TrendingUp, label: 'Avg. ROAS', value: `${Number(s.roas || 0).toFixed(2)}x`, sub: 'Return on spend',
      gradient: 'linear-gradient(135deg,#22c55e,#15803d)' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {cards.map((c) => <MetricCard key={c.label} {...c} />)}
    </div>
  );
}
