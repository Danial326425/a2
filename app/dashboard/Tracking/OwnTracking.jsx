"use client";

import React, { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  Activity, Eye, Users, ShoppingCart, TrendingUp, ChevronDown,
  RefreshCw, ToggleLeft, ToggleRight, ArrowRight, Filter,
  BarChart2, Globe, Zap,
} from 'lucide-react';
import { config } from '../../../config';

const apiUrl = config.apiUrl;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
const fmt = (n) => Number(n || 0).toLocaleString();
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

const DATE_PRESETS = [
  { label: 'আজ', from: () => todayStr(), to: () => todayStr() },
  { label: '৭ দিন', from: () => daysAgo(6), to: () => todayStr() },
  { label: '৩০ দিন', from: () => daysAgo(29), to: () => todayStr() },
];

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Skel = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl ${className}`} />
);

// ─── Funnel Card ──────────────────────────────────────────────────────────────
const FunnelCard = memo(({ title, value, rate, rateLabel, icon: Icon, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.32 }}
    className="relative overflow-hidden rounded-2xl p-5 shadow-md"
    style={{ background: gradient }}
  >
    <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10" />
    <div className="absolute -bottom-3 -right-2 w-12 h-12 rounded-full bg-white/10" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/70">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={17} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{fmt(value)}</p>
      {rate !== undefined && (
        <p className="text-xs text-white/75 font-medium">
          {rateLabel}: <span className="text-white font-bold">{rate}%</span>
        </p>
      )}
    </div>
  </motion.div>
));

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold text-gray-800">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OwnTracking = () => {
  const [loading, setLoading]       = useState(true);
  const [data, setData]             = useState(null);
  const [settings, setSettings]     = useState({ tracking_enabled: '1' });
  const [preset, setPreset]         = useState(1); // default: 7 days
  const [from, setFrom]             = useState(daysAgo(6));
  const [to, setTo]                 = useState(todayStr());
  const [slugFilter, setSlugFilter] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { from, to };
      if (slugFilter) params.slug = slugFilter;
      const [analyticsRes, settingsRes] = await Promise.all([
        axios.get(`${apiUrl}/tracking/analytics`, { params }),
        axios.get(`${apiUrl}/tracking/settings`),
      ]);
      setData(analyticsRes.data);
      setSettings(settingsRes.data.settings || { tracking_enabled: '1' });
    } catch (e) {
      console.error('Tracking analytics error:', e);
    } finally {
      setLoading(false);
    }
  }, [from, to, slugFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleTracking = async () => {
    const next = settings.tracking_enabled === '1' ? '0' : '1';
    // Optimistic update — flip immediately so UI responds instantly
    setSettings((s) => ({ ...s, tracking_enabled: next }));
    try {
      await axios.put(`${apiUrl}/tracking/settings`, { settings: { tracking_enabled: next } });
    } catch (_) {
      // Rollback on network error
      setSettings((s) => ({ ...s, tracking_enabled: next === '1' ? '0' : '1' }));
    }
  };

  const applyPreset = (idx) => {
    setPreset(idx);
    setShowCustom(false);
    const p = DATE_PRESETS[idx];
    setFrom(p.from());
    setTo(p.to());
  };

  const trackingOn = settings.tracking_enabled !== '0';
  const funnel     = data?.funnel || {};
  const daily      = data?.daily  || [];
  const bySlug     = data?.by_slug || [];
  const slugs      = data?.slugs  || [];

  const pv  = Number(funnel.page_views     || 0);
  const uv  = Number(funnel.unique_visitors || 0);
  const cv  = Number(funnel.checkout_views  || 0);
  const ord = Number(funnel.orders          || 0);

  const funnelCards = [
    {
      title: 'ল্যান্ডিং পেজ ভিউ',
      value: pv,
      icon: Eye,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
      rate: undefined,
    },
    {
      title: 'ইউনিক ভিজিটর',
      value: uv,
      icon: Users,
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
      rate: pct(uv, pv),
      rateLabel: 'ভিউ থেকে',
    },
    {
      title: 'চেকআউট ভিউ',
      value: cv,
      icon: ShoppingCart,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      rate: pct(cv, uv),
      rateLabel: 'ভিজিটর থেকে',
    },
    {
      title: 'অর্ডার',
      value: ord,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      rate: pct(ord, cv),
      rateLabel: 'চেকআউট থেকে',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Activity size={19} className="text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Own Tracking System</h1>
          </div>
          <p className="text-sm text-gray-500 pl-11">
            Internal analytics — Meta Pixel এর উপর নির্ভরশীলতা ছাড়াই ফানেল ট্র্যাক করুন
          </p>
        </div>

        {/* Tracking Toggle */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
          <span className="text-sm font-medium text-gray-700">Tracking</span>
          <button
            onClick={toggleTracking}
            className="flex items-center gap-1.5 transition-all"
          >
            {trackingOn ? (
              <ToggleRight size={30} className="text-emerald-500" />
            ) : (
              <ToggleLeft size={30} className="text-gray-400" />
            )}
          </button>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trackingOn ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {trackingOn ? 'চালু' : 'বন্ধ'}
          </span>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date presets */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {DATE_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                preset === i && !showCustom
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => { setShowCustom(true); setPreset(-1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showCustom ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            কাস্টম
          </button>
        </div>

        {/* Custom date range */}
        <AnimatePresence>
          {showCustom && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <input
                type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <span className="text-gray-400 text-xs">—</span>
              <input
                type="date" value={to} onChange={(e) => setTo(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slug / Page filter */}
        {slugs.length > 0 && (
          <div className="relative">
            <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={slugFilter}
              onChange={(e) => setSlugFilter(e.target.value)}
              className="pl-8 pr-8 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm appearance-none"
            >
              <option value="">সব পেজ</option>
              {slugs.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Refresh */}
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          রিফ্রেশ
        </button>
      </div>

      {/* ── Funnel Cards ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skel key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {funnelCards.map((card, i) => (
            <React.Fragment key={i}>
              <FunnelCard {...card} delay={i * 0.07} />
              {i < funnelCards.length - 1 && (
                <div className="hidden lg:flex items-center justify-center col-span-0 -mx-2">
                  <ArrowRight size={18} className="text-gray-300" style={{ position: 'relative', left: '-100%', marginLeft: '-1.5rem' }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Funnel Visual Bar ────────────────────────────────────────────────── */}
      {!loading && pv > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={15} className="text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">কনভার্সন ফানেল</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'ল্যান্ডিং পেজ ভিউ', val: pv, color: '#6366f1', pctOf: pv },
              { label: 'ইউনিক ভিজিটর', val: uv, color: '#0ea5e9', pctOf: pv },
              { label: 'চেকআউট ভিউ', val: cv, color: '#f59e0b', pctOf: pv },
              { label: 'অর্ডার', val: ord, color: '#10b981', pctOf: pv },
            ].map(({ label, val, color, pctOf }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-36 shrink-0">{label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct(val, pctOf)}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ background: color }}
                  >
                    {pct(val, pctOf) > 10 && (
                      <span className="text-[10px] font-bold text-white">{pct(val, pctOf)}%</span>
                    )}
                  </motion.div>
                </div>
                <span className="text-xs font-bold text-gray-700 w-12 text-right">{fmt(val)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Daily Trend Chart ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={15} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-gray-800">ডেইলি ট্রেন্ড</h3>
        </div>

        {loading ? (
          <Skel className="h-56" />
        ) : daily.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Activity size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">এই সময়কালে কোনো ডেটা নেই</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                {[
                  ['pv', '#6366f1'],
                  ['uv', '#0ea5e9'],
                  ['cv', '#f59e0b'],
                  ['ord', '#10b981'],
                ].map(([k, c]) => (
                  <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => <span style={{ fontSize: 11, color: '#6b7280' }}>{v}</span>}
                iconType="circle" iconSize={7}
              />
              <Area type="monotone" dataKey="page_views"     name="পেজ ভিউ"      stroke="#6366f1" strokeWidth={2} fill="url(#grad_pv)"  dot={false} />
              <Area type="monotone" dataKey="unique_visitors" name="ইউনিক ভিজিটর" stroke="#0ea5e9" strokeWidth={2} fill="url(#grad_uv)"  dot={false} />
              <Area type="monotone" dataKey="checkout_views"  name="চেকআউট ভিউ"  stroke="#f59e0b" strokeWidth={2} fill="url(#grad_cv)"  dot={false} />
              <Area type="monotone" dataKey="orders"          name="অর্ডার"        stroke="#10b981" strokeWidth={2} fill="url(#grad_ord)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ── Per-Page Table ───────────────────────────────────────────────────── */}
      {!loading && bySlug.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
            <Filter size={15} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-800">পেজ-ভিত্তিক বিশ্লেষণ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">ল্যান্ডিং পেজ</th>
                  <th className="px-4 py-3 text-right font-semibold">ভিউ</th>
                  <th className="px-4 py-3 text-right font-semibold">ইউনিক</th>
                  <th className="px-4 py-3 text-right font-semibold">চেকআউট</th>
                  <th className="px-4 py-3 text-right font-semibold">অর্ডার</th>
                  <th className="px-4 py-3 text-right font-semibold">CVR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bySlug.map((row, i) => {
                  const cvr = pct(Number(row.orders), Number(row.unique_visitors));
                  return (
                    <tr key={row.slug} className={`hover:bg-indigo-50/40 transition-colors ${i === 0 ? 'bg-emerald-50/30' : ''}`}>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 font-bold">TOP</span>}
                          <span className="font-mono text-indigo-600">{row.slug}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-700">{fmt(row.page_views)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{fmt(row.unique_visitors)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{fmt(row.checkout_views)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmt(row.orders)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold ${
                          cvr >= 5 ? 'bg-emerald-100 text-emerald-700' :
                          cvr >= 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {cvr}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!loading && pv === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity size={30} className="text-indigo-300" />
          </div>
          <p className="text-gray-500 font-medium mb-1">এখনো কোনো ট্র্যাকিং ডেটা নেই</p>
          <p className="text-xs text-gray-400">
            {trackingOn
              ? 'ল্যান্ডিং পেজে ভিজিটর আসলে এখানে ডেটা দেখাবে'
              : 'ট্র্যাকিং চালু করুন এবং ল্যান্ডিং পেজে ভিজিটর পাঠান'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default OwnTracking;
