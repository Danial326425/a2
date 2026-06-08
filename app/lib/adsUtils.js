// Utility helpers for the Facebook Ads Performance dashboard.

/** 12500 → "৳12,500" (BDT, no decimals). */
export function formatBDT(amount) {
  const n = Number(amount || 0);
  return `৳${Math.round(n).toLocaleString('en-US')}`;
}

/** 45200 → "45.2K", 1250000 → "1.3M". */
export function formatNumber(num) {
  const n = Number(num || 0);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

/** Plain number with thousands separators. */
export function fmtInt(num) {
  return Number(num || 0).toLocaleString('en-US');
}

export function calculateROAS(revenue, spend) {
  const s = Number(spend || 0);
  if (s <= 0) return 0;
  return Number(revenue || 0) / s;
}

/** Tailwind text colour for a ROAS value. */
export function roasColorClass(roas) {
  const r = Number(roas || 0);
  if (r >= 3) return 'text-green-600';
  if (r >= 1.5) return 'text-yellow-600';
  return 'text-red-600';
}

/** Tailwind badge classes for a ROAS value. */
export function roasBadgeClass(roas) {
  const r = Number(roas || 0);
  if (r >= 3) return 'bg-green-100 text-green-700';
  if (r >= 1.5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

/**
 * Badge + dot for a campaign/adset/ad. Pass the EFFECTIVE status so a child
 * whose parent is paused (CAMPAIGN_PAUSED / ADSET_PAUSED) shows as not-active
 * instead of green.
 */
export function statusBadge(status) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE') return { cls: 'bg-green-100 text-green-700', dot: '🟢', label: 'Active', active: true };
  if (s === 'PAUSED') return { cls: 'bg-yellow-100 text-yellow-700', dot: '🟡', label: 'Paused' };
  if (s === 'CAMPAIGN_PAUSED') return { cls: 'bg-yellow-100 text-yellow-700', dot: '🟡', label: 'Campaign Paused' };
  if (s === 'ADSET_PAUSED') return { cls: 'bg-yellow-100 text-yellow-700', dot: '🟡', label: 'Ad Set Paused' };
  if (s === 'ARCHIVED' || s === 'DELETED') return { cls: 'bg-gray-100 text-gray-500', dot: '⚫', label: s === 'DELETED' ? 'Deleted' : 'Archived' };
  if (s === 'DISAPPROVED') return { cls: 'bg-red-100 text-red-700', dot: '🔴', label: 'Disapproved' };
  if (['PENDING_REVIEW', 'IN_PROCESS', 'PENDING_BILLING_INFO', 'WITH_ISSUES', 'PREAPPROVED'].includes(s)) {
    return { cls: 'bg-amber-100 text-amber-700', dot: '🟠', label: 'Review/Issue' };
  }
  return { cls: 'bg-gray-100 text-gray-500', dot: '⚪', label: status || 'Unknown' };
}

export const DATE_PRESETS = [
  { value: 'today', label: 'আজ (Today)' },
  { value: 'yesterday', label: 'গতকাল (Yesterday)' },
  { value: 'last_7d', label: 'গত ৭ দিন (Last 7 Days)' },
  { value: 'last_14d', label: 'গত ১৪ দিন (Last 14 Days)' },
  { value: 'last_30d', label: 'গত ৩০ দিন (Last 30 Days)' },
  { value: 'last_90d', label: 'গত ৯০ দিন (Last 90 Days)' },
];

export function datePresetLabel(preset) {
  return DATE_PRESETS.find((p) => p.value === preset)?.label || preset;
}

/** % change between current and previous, rounded. */
export function pctChange(current, previous) {
  const c = Number(current || 0);
  const p = Number(previous || 0);
  if (p <= 0) return c > 0 ? 100 : 0;
  return Math.round(((c - p) / p) * 100);
}

/** "2 min ago" style relative time from an ISO/date string. */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}
