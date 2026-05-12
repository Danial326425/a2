"use client";

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import axios from 'axios';
import { config } from '../../../config';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import {
  FiShoppingCart, FiDollarSign, FiTrendingUp, FiPackage, FiClock,
  FiCheckCircle, FiTruck, FiXCircle, FiBarChart2, FiUsers, FiUserPlus,
  FiRefreshCw, FiAlertCircle, FiActivity, FiRepeat, FiCreditCard,
  FiZap, FiTarget, FiAward,
} from 'react-icons/fi';
import { BsArrowUpShort, BsArrowDownShort } from 'react-icons/bs';

// ─── Utilities ─────────────────────────────────────────────────────────────────

const toNum = (v) => parseFloat(String(v || 0).replace(/,/g, '')) || 0;
const todayStr = () => new Date().toISOString().slice(0, 10);
const formatBDT = (v) => `৳${Math.round(v).toLocaleString()}`;
const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));
const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ─── Skeleton ──────────────────────────────────────────────────────────────────

const Skel = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl ${className}`} />
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = memo(({ title, value, icon: Icon, gradient, change, delay = 0 }) => {
  const up = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="relative overflow-hidden rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-default select-none"
      style={{ background: gradient }}
    >
      <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -right-2 w-12 h-12 rounded-full bg-white/10" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5 truncate">{title}</p>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-0.5 mt-2">
              {up
                ? <BsArrowUpShort className="text-emerald-200 text-base flex-shrink-0" />
                : <BsArrowDownShort className="text-red-200 text-base flex-shrink-0" />}
              <span className={`text-xs font-semibold ${up ? 'text-emerald-200' : 'text-red-200'}`}>
                {Math.abs(change)}% vs yesterday
              </span>
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0 ml-2">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
});

// ─── Section Header ────────────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-5">
    {Icon && (
      <div className="p-2 rounded-xl bg-indigo-50 flex-shrink-0">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
    )}
    <div>
      <h2 className="text-base font-bold text-gray-800 leading-none">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─── Recharts Tooltip ──────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 rounded-xl p-3 shadow-2xl text-xs min-w-[140px]">
      <p className="font-semibold text-gray-300 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-400">{p.name}</span>
          </div>
          <span className="font-bold text-white">
            {p.name === 'Revenue' ? formatBDT(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Health Progress Bar ───────────────────────────────────────────────────────

const HealthBar = ({ label, value, color, invert }) => {
  const v = Math.min(100, Math.max(0, value));
  const quality = invert
    ? v < 10 ? 'Excellent' : v < 25 ? 'Good' : 'Needs Attention'
    : v > 70 ? 'Excellent' : v > 45 ? 'Good' : 'Needs Attention';
  const qc = quality === 'Excellent' ? 'text-emerald-600' : quality === 'Good' ? 'text-amber-600' : 'text-red-500';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${qc}`}>{quality}</span>
          <span className="text-sm font-bold text-gray-800">{v}%</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

// ─── Badge ─────────────────────────────────────────────────────────────────────

const Badge = ({ label, value, cls, loading, onRefresh }) => (
  <div className={`rounded-xl p-3 ${cls}`}>
    <p className="text-xs font-medium opacity-60 mb-0.5">{label}</p>
    <div className="flex items-center gap-1">
      <p className="text-base font-bold">{loading ? '...' : value}</p>
      {onRefresh && (
        <button onClick={onRefresh} disabled={loading} className="ml-1 opacity-50 hover:opacity-100 transition">
          <FiRefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  </div>
);

// ─── Insight Card ──────────────────────────────────────────────────────────────

const InsightCard = ({ type, text }) => {
  const s = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 before:bg-emerald-400',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger:  'bg-red-50 border-red-200 text-red-800',
    info:    'bg-indigo-50 border-indigo-200 text-indigo-800',
  }[type] || 'bg-indigo-50 border-indigo-200 text-indigo-800';
  const dot = { success: 'bg-emerald-400', warning: 'bg-amber-400', danger: 'bg-red-400', info: 'bg-indigo-400' }[type] || 'bg-indigo-400';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${s}`}>
      <div className={`w-2 h-2 rounded-full ${dot} mt-1.5 flex-shrink-0`} />
      <p className="text-xs font-medium leading-relaxed">{text}</p>
    </div>
  );
};

// ─── Status Pill ───────────────────────────────────────────────────────────────

const statusCls = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  shipped:   'bg-purple-100 text-purple-700',
  return:    'bg-orange-100 text-orange-700',
};

// ─── Main BizView ──────────────────────────────────────────────────────────────

const BizView = () => {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [balance, setBalance]           = useState(null);
  const [steadfast, setSteadfast]       = useState(null);
  const [balanceLoading, setBL]         = useState(false);
  const [chartView, setChartView]       = useState('revenue');
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(new Date());

  const apiUrl = config.apiUrl;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [orderRes, sfRes] = await Promise.all([
        axios.get(`${apiUrl}/customers`),
        axios.get(`${apiUrl}/steadfasts`),
      ]);
      setSteadfast(sfRes.data[0] || {});
      const raw = orderRes.data.customers;
      setOrders(Array.isArray(raw) ? raw : (raw?.data ?? []));
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError('ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const fetchBalance = useCallback(async () => {
    if (!steadfast?.apiKey || !steadfast?.secretKey) return;
    try {
      setBL(true);
      const res = await axios.get('https://portal.packzy.com/api/v1/get_balance', {
        headers: { 'Api-Key': steadfast.apiKey, 'Secret-Key': steadfast.secretKey },
      });
      setBalance(res.data.current_balance ?? null);
    } catch { setBalance(null); }
    finally { setBL(false); }
  }, [steadfast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (steadfast) fetchBalance(); }, [steadfast, fetchBalance]);

  // ─── Analytics computation ────────────────────────────────────────────────

  const a = useMemo(() => {
    if (!orders.length) return null;

    const today  = todayStr();
    const yd     = new Date(); yd.setDate(yd.getDate() - 1);
    const yesterday = yd.toISOString().slice(0, 10);

    const byStatus = (s) => orders.filter(o => (o.delivery_status || '').toLowerCase() === s);
    const sumTotal = (list) => list.reduce((acc, o) => acc + toNum(o.total), 0);
    const byDate   = (list, d) => list.filter(o => (o.created_at || '').slice(0, 10) === d);

    const delivered  = byStatus('delivered');
    const pending    = byStatus('pending');
    const confirmed  = byStatus('confirmed');
    const cancelled  = byStatus('cancelled');
    const returned   = byStatus('return');
    const shipped    = byStatus('shipped');

    const todayAll      = byDate(orders, today);
    const todayDel      = byDate(delivered, today);
    const ydAll         = byDate(orders, yesterday);
    const ydDel         = byDate(delivered, yesterday);

    const totalRevenue   = sumTotal(delivered);
    const todayRevenue   = sumTotal(todayDel);
    const ydRevenue      = sumTotal(ydDel);

    const revenueChange  = ydRevenue  === 0 ? 100 : Math.round(((todayRevenue - ydRevenue) / ydRevenue) * 100);
    const ordersChange   = ydAll.length === 0 ? 100 : Math.round(((todayAll.length - ydAll.length) / ydAll.length) * 100);

    // Returning vs new customers
    const phoneCnt = {};
    orders.forEach(o => { const p = o.phone_number || ''; phoneCnt[p] = (phoneCnt[p] || 0) + 1; });
    const returning   = Object.values(phoneCnt).filter(c => c > 1).length;
    const newCust     = Object.values(phoneCnt).filter(c => c === 1).length;

    // Last 30 days chart data
    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const dayOrders = byDate(orders, ds);
      const dayDel    = byDate(delivered, ds);
      last30.push({
        date:    d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        orders:  dayOrders.length,
        revenue: Math.round(sumTotal(dayDel)),
      });
    }

    // Weekly chart data
    const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const dayOrders = byDate(orders, ds);
      const dayDel    = byDate(delivered, ds);
      weekly.push({
        day:       DAY[d.getDay()],
        orders:    dayOrders.length,
        revenue:   Math.round(sumTotal(dayDel)),
        delivered: dayDel.length,
      });
    }

    // Top products
    const buildProductMap = (list) => {
      const m = {};
      list.forEach(o => {
        const n = o.product_name || 'Unknown';
        if (!m[n]) m[n] = { name: n, orders: 0, revenue: 0 };
        m[n].orders++;
        m[n].revenue += toNum(o.total);
      });
      return Object.values(m).sort((a, b) => b.orders - a.orders).slice(0, 5);
    };
    const todayProducts = buildProductMap(todayAll);
    const allProducts   = buildProductMap(orders);
    const topProducts   = todayProducts.length > 0 ? todayProducts : allProducts;
    const productsIsToday = todayProducts.length > 0;

    // Recent orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    // Pie data for status breakdown
    const pieData = [
      { name: 'Delivered',  value: delivered.length,  color: '#10b981' },
      { name: 'Pending',    value: pending.length,    color: '#f59e0b' },
      { name: 'Confirmed',  value: confirmed.length,  color: '#6366f1' },
      { name: 'Cancelled',  value: cancelled.length,  color: '#ef4444' },
      { name: 'Returned',   value: returned.length,   color: '#f97316' },
    ].filter(d => d.value > 0);

    const deliverySuccessRate = pct(delivered.length, delivered.length + cancelled.length);
    const cancellationRate    = pct(cancelled.length, orders.length);
    const pendingPressure     = pct(pending.length, orders.length);
    const conversionRate      = pct(delivered.length, orders.length);
    const avgOrderValue       = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalOrders: orders.length,
      todayOrders: todayAll.length,
      todayRevenue,
      totalRevenue,
      ordersChange,
      revenueChange,
      pending: pending.length,
      confirmed: confirmed.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      returned: returned.length,
      shipped: shipped.length,
      conversionRate,
      avgOrderValue,
      returning,
      newCust,
      last30,
      weekly,
      topProducts,
      productsIsToday,
      recentOrders,
      pieData,
      deliverySuccessRate,
      cancellationRate,
      pendingPressure,
    };
  }, [orders]);

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skel className="h-8 w-52" />
          <Skel className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array(12).fill(0).map((_, i) => <Skel key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skel className="h-72 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skel className="h-64 rounded-2xl" />
          <Skel className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="p-4 rounded-full bg-red-100">
          <FiAlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={fetchData}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-95 transition">
          পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  // Empty state
  if (!a) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <FiShoppingCart className="w-12 h-12" />
        <p className="font-medium">কোন অর্ডার নেই</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 p-4 md:p-6 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Last updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' · '}{a.totalOrders} total orders
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm active:scale-95 transition"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── 12 KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
        <StatCard title="Today's Orders"   value={a.todayOrders}            icon={FiShoppingCart}
          gradient="linear-gradient(135deg,#667eea,#764ba2)" change={a.ordersChange}  delay={0.04} />
        <StatCard title="Today's Revenue"  value={formatBDT(a.todayRevenue)} icon={FiDollarSign}
          gradient="linear-gradient(135deg,#f093fb,#f5576c)" change={a.revenueChange} delay={0.08} />
        <StatCard title="Total Revenue"    value={formatBDT(a.totalRevenue)} icon={FiTrendingUp}
          gradient="linear-gradient(135deg,#4facfe,#00f2fe)" delay={0.12} />
        <StatCard title="Total Orders"     value={a.totalOrders}            icon={FiPackage}
          gradient="linear-gradient(135deg,#43e97b,#38f9d7)" delay={0.16} />
        <StatCard title="Pending"          value={a.pending}                icon={FiClock}
          gradient="linear-gradient(135deg,#fa709a,#fee140)" delay={0.20} />
        <StatCard title="Confirmed"        value={a.confirmed}              icon={FiCheckCircle}
          gradient="linear-gradient(135deg,#a18cd1,#fbc2eb)" delay={0.24} />
        <StatCard title="Delivered"        value={a.delivered}              icon={FiTruck}
          gradient="linear-gradient(135deg,#0ba360,#3cba92)" delay={0.28} />
        <StatCard title="Cancelled"        value={a.cancelled}              icon={FiXCircle}
          gradient="linear-gradient(135deg,#f5576c,#f093fb)" delay={0.32} />
        <StatCard title="Conversion Rate"  value={`${a.conversionRate}%`}  icon={FiTarget}
          gradient="linear-gradient(135deg,#5ee7df,#b490ca)" delay={0.36} />
        <StatCard title="Avg Order Value"  value={formatBDT(a.avgOrderValue)} icon={FiBarChart2}
          gradient="linear-gradient(135deg,#f7971e,#ffd200)" delay={0.40} />
        <StatCard title="Returning"        value={a.returning}              icon={FiRepeat}
          gradient="linear-gradient(135deg,#1a78c2,#2196f3)" delay={0.44} />
        <StatCard title="New Customers"    value={a.newCust}                icon={FiUserPlus}
          gradient="linear-gradient(135deg,#11998e,#38ef7d)" delay={0.48} />
      </div>

      {/* ── 30-Day Area Chart ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <SectionHeader title="30-Day Performance" subtitle="Revenue & order volume trends" icon={FiActivity} />
          <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm flex-shrink-0">
            {['revenue', 'orders'].map(v => (
              <button key={v} onClick={() => setChartView(v)}
                className={`px-4 py-2 font-semibold capitalize transition ${
                  chartView === v ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >{v}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={a.last30} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}
              interval={Math.ceil(a.last30.length / 8)} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}
              tickFormatter={v => chartView === 'revenue' ? `৳${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip content={<ChartTooltip />} />
            {chartView === 'revenue'
              ? <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5}
                  fill="url(#gRev)" dot={false} activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} />
              : <Area type="monotone" dataKey="orders"  name="Orders"  stroke="#10b981" strokeWidth={2.5}
                  fill="url(#gOrd)" dot={false} activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }} />
            }
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Weekly + Top Products ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"
        >
          <SectionHeader title="Weekly Breakdown" subtitle="Orders vs delivered — last 7 days" icon={FiBarChart2} />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={a.weekly} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="orders"    name="Orders"    fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={30} />
              <Bar dataKey="delivered" name="Delivered" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3 justify-center">
            {[['#6366f1','Orders'],['#10b981','Delivered']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm" style={{ background: c }} />{l}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"
        >
          <SectionHeader
            title={a.productsIsToday ? 'Top Products Today' : 'Top Products (Overall)'}
            subtitle="Ranked by number of orders"
            icon={FiAward}
          />
          {a.topProducts.length === 0
            ? <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No data</div>
            : (
              <div className="space-y-3.5">
                {a.topProducts.map((p, i) => {
                  const w = pct(p.orders, a.topProducts[0].orders);
                  const rankCls = [
                    'bg-yellow-400', 'bg-gray-400', 'bg-orange-400', 'bg-indigo-300', 'bg-slate-300'
                  ][i] || 'bg-slate-300';
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1 text-sm gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${rankCls}`}>
                            {i + 1}
                          </span>
                          <span className="text-gray-700 font-medium truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-gray-400 text-xs">{p.orders} orders</span>
                          <span className="font-bold text-gray-800 text-xs">{formatBDT(p.revenue)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${w}%` }}
                          transition={{ delay: 0.55 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </motion.div>
      </div>

      {/* ── Status Pie + Business Health ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"
        >
          <SectionHeader title="Order Status Distribution" subtitle="All-time breakdown" icon={FiBarChart2} />
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={a.pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {a.pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-shrink-0 w-full sm:w-auto">
              {a.pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-sm text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Business Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"
        >
          <SectionHeader title="Business Health" subtitle="Key performance indicators" icon={FiActivity} />
          <div className="space-y-4 mb-5">
            <HealthBar label="Delivery Success Rate" value={a.deliverySuccessRate} color="bg-emerald-500" />
            <HealthBar label="Conversion Rate"        value={a.conversionRate}      color="bg-indigo-500" />
            <HealthBar label="Cancellation Rate"      value={a.cancellationRate}    color="bg-red-400"    invert />
            <HealthBar label="Pending Pressure"       value={a.pendingPressure}     color="bg-amber-400"  invert />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Badge label="Steadfast Balance" value={balance !== null ? formatBDT(balance) : '—'}
              cls="bg-indigo-50 text-indigo-700" loading={balanceLoading} onRefresh={fetchBalance} />
            <Badge label="Returned Orders" value={a.returned}              cls="bg-orange-50 text-orange-700" />
            <Badge label="Shipped Orders"  value={a.shipped}               cls="bg-purple-50 text-purple-700" />
            <Badge label="Avg Order Value" value={formatBDT(a.avgOrderValue)} cls="bg-emerald-50 text-emerald-700" />
          </div>
        </motion.div>
      </div>

      {/* ── Smart Insights ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"
      >
        <SectionHeader title="Smart Insights" subtitle="Auto-generated business analysis" icon={FiZap} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InsightCard
            type={a.revenueChange >= 0 ? 'success' : 'warning'}
            text={`Today's revenue is ${formatBDT(a.todayRevenue)} — ${a.revenueChange >= 0 ? `up ${a.revenueChange}%` : `down ${Math.abs(a.revenueChange)}%`} vs yesterday`}
          />
          <InsightCard
            type={a.conversionRate >= 50 ? 'success' : a.conversionRate >= 30 ? 'info' : 'warning'}
            text={`Conversion rate is ${a.conversionRate}% — ${a.conversionRate >= 50 ? 'excellent performance!' : a.conversionRate >= 30 ? 'good, room to improve' : 'needs attention'}`}
          />
          <InsightCard
            type={a.cancellationRate <= 10 ? 'success' : 'danger'}
            text={`Cancellation rate is ${a.cancellationRate}% — ${a.cancellationRate <= 10 ? 'healthy level' : 'above target, review order process'}`}
          />
          <InsightCard
            type="info"
            text={`${a.returning} returning customers (${pct(a.returning, a.returning + a.newCust)}% of base) — loyalty is ${a.returning > a.newCust ? 'strong' : 'growing'}`}
          />
          {a.topProducts[0] && (
            <InsightCard
              type="success"
              text={`"${a.topProducts[0].name}" is top performer with ${a.topProducts[0].orders} orders & ${formatBDT(a.topProducts[0].revenue)} revenue`}
            />
          )}
          {a.pending > 0 && (
            <InsightCard
              type="warning"
              text={`${a.pending} orders pending (${pct(a.pending, a.totalOrders)}% of total) — confirm or ship to improve conversion`}
            />
          )}
        </div>
      </motion.div>

      {/* ── Recent Orders Table ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"
      >
        <SectionHeader title="Recent Orders" subtitle="Latest 10 orders across all statuses" icon={FiActivity} />
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left border-b border-gray-100">
                {['Order ID', 'Customer', 'Product', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.recentOrders.map((order, i) => (
                <motion.tr
                  key={order.order_id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.025 }}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 pr-4 font-mono text-xs text-indigo-600 font-semibold whitespace-nowrap">
                    {order.order_id}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-800 truncate max-w-[110px]">{order.customer_name}</p>
                    <p className="text-gray-400 text-xs">{order.phone_number}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 truncate max-w-[130px] text-xs">{order.product_name}</td>
                  <td className="py-3 pr-4 font-bold text-gray-800 whitespace-nowrap">{formatBDT(toNum(order.total))}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      statusCls[(order.delivery_status || '').toLowerCase()] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {order.delivery_status || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 text-xs whitespace-nowrap">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                      : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
};

export default BizView;
