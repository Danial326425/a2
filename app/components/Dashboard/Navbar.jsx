"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Search, Bell, ChevronDown, LogOut, Settings, User,
  BarChart2, Shield, Plus, Package, ShoppingCart, Users,
  Megaphone, X, Command, ExternalLink, Check, Clock,
  TrendingUp, Zap, CreditCard
} from "lucide-react";
import { config } from "../../../config";
import axios from "axios";

const apiUrl = config.apiUrl;
const imageProxyUrl = config.apiStorageUrl;

// ─── Page title map ────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: "Dashboard",
  createHome: "Create Home", homeOverview: "Home Pages",
  createProduct: "Add Product", productOverview: "Products",
  createCategory: "Add Category", categoryOverview: "Categories",
  createColor: "Add Color", colorOverview: "Colors",
  createSize: "Add Size", sizeOverview: "Sizes",
  createBanner: "Add Banner", bannerOverview: "Banners",
  createLandingPage: "Create Landing Page", landingPageOverview: "Landing Pages",
  createCongrates: "Add Congratulation", congratesOverview: "Congratulations",
  createForm: "Add Form", formOverview: "Forms",
  createCommunity: "Add Community", communityOverview: "Community",
  customerOverview: "Orders", createOrder: "Create Order", leadOverview: "Leads",
  transactionOverview: "Transactions", usersOverview: "Users",
  createDeliveryCharge: "Add Delivery Charge", deliveryChargeOverview: "Delivery Charges",
  createPixel: "Add Pixel", PixelOverview: "Pixels",
  createSteadfast: "Steadfast Setup", steadfastOverview: "Steadfast",
  createProductPage: "Add Product Page", productPageOverview: "Product Pages",
  createPaymentMethod: "Add Payment Method", paymentMethodOverview: "Payment Methods",
  createAdvancePay: "Advance Pay Setup", advancePayOverview: "Advance Pay",
  createLogo: "Update Logo", logoOverview: "Branding",
  createLegal: "Add Legal", legalOverview: "Legal Pages",
  createContact: "Add Contact", contactOverview: "Contact",
  createContactInfo: "Add Contact Info", contactInfoOverview: "Contact Info",
  createMenu: "Add Menu", menuOverview: "Menus",
  createSocial: "Add Social", socialOverview: "Social Links",
  seoSettings: "SEO Settings",
};

const BREADCRUMB_PARENT = {
  createHome: "Home Pages", createProduct: "Products", createCategory: "Categories",
  createColor: "Colors", createSize: "Sizes", createBanner: "Banners",
  createLandingPage: "Landing Pages", createCongrates: "Congratulations",
  createForm: "Forms", createCommunity: "Community",
  createOrder: "Orders", createDeliveryCharge: "Delivery Charges", createPixel: "Pixels",
  createSteadfast: "Steadfast", createProductPage: "Product Pages",
  createPaymentMethod: "Payment Methods", createAdvancePay: "Advance Pay",
  createLogo: "Branding", createLegal: "Legal", createContact: "Contact",
  createContactInfo: "Contact Info", createMenu: "Menus", createSocial: "Social Links",
  seoSettings: "Marketing",
};

// ─── Quick actions ──────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Add Product", icon: Package, menu: "createProduct", color: "text-indigo-600 bg-indigo-50" },
  { label: "Create Order", icon: ShoppingCart, menu: "createOrder", color: "text-emerald-600 bg-emerald-50" },
  { label: "View Orders", icon: Users, menu: "customerOverview", color: "text-sky-600 bg-sky-50" },
  { label: "Add Banner", icon: Megaphone, menu: "createBanner", color: "text-amber-600 bg-amber-50" },
  { label: "Analytics", icon: TrendingUp, menu: "dashboard", color: "text-purple-600 bg-purple-50" },
];

// ─── Sample notifications ───────────────────────────────────────────────────────
const SAMPLE_NOTIFICATIONS = [
  { id: 1, type: "order", title: "New order received", desc: "Order #HA10293 — ৳1,200", time: "2m ago", read: false },
  { id: 2, type: "payment", title: "Payment confirmed", desc: "Order #HA10287 payment verified", time: "18m ago", read: false },
  { id: 3, type: "delivery", title: "Delivery dispatched", desc: "Order #HA10280 shipped via Steadfast", time: "1h ago", read: true },
  { id: 4, type: "system", title: "New lead captured", desc: "Phone: 01712XXXXXX", time: "2h ago", read: true },
];

const NOTIF_ICON_MAP = {
  order: { icon: ShoppingCart, bg: "bg-indigo-100", color: "text-indigo-600" },
  payment: { icon: CreditCard, bg: "bg-emerald-100", color: "text-emerald-600" },
  delivery: { icon: Zap, bg: "bg-amber-100", color: "text-amber-600" },
  system: { icon: Bell, bg: "bg-gray-100", color: "text-gray-600" },
};

// ─── Dropdown animation variants ───────────────────────────────────────────────
const dropVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } },
};

// ─── useClickOutside ───────────────────────────────────────────────────────────
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

// ─── IconBtn ──────────────────────────────────────────────────────────────────
const IconBtn = ({ icon: Icon, badge, title, onClick, active }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`relative p-2 rounded-xl transition-colors ${
      active ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
    }`}
  >
    <Icon size={18} />
    {badge > 0 && (
      <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none px-0.5">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </motion.button>
);

// ─── SearchModal ──────────────────────────────────────────────────────────────
const SearchModal = ({ isOpen, onClose, setSelectedMenu }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const allPages = Object.entries(PAGE_TITLES).map(([menu, label]) => ({ menu, label }));
  const results = query.trim()
    ? allPages.filter(p => p.label.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); if (isOpen) onClose(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
        style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search pages, products, customers…"
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-medium">
              Esc
            </kbd>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={14} />
            </button>
          </div>

          {results.length > 0 ? (
            <ul className="py-2 max-h-72 overflow-y-auto">
              {results.map(({ menu, label }) => (
                <li key={menu}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
                    onClick={() => { setSelectedMenu(menu); onClose(); }}
                  >
                    <Search size={13} className="text-gray-400 shrink-0" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="py-10 text-center text-sm text-gray-400">No results for "{query}"</div>
          ) : (
            <div className="py-3 px-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Quick Nav</p>
              <div className="grid grid-cols-2 gap-1">
                {[["dashboard","Dashboard"],["productOverview","Products"],["customerOverview","Orders"],["createOrder","Create Order"]].map(([menu,label]) => (
                  <button key={menu} onClick={() => { setSelectedMenu(menu); onClose(); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left">
                    <Clock size={12} className="text-gray-400" />{label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── NotificationDropdown ─────────────────────────────────────────────────────
const NotificationDropdown = ({ onClose }) => {
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFICATIONS);
  const unread = notifs.filter(n => !n.read).length;

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  return (
    <motion.div
      variants={dropVariants} initial="hidden" animate="visible" exit="exit"
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">Notifications</span>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            <Check size={12} />Mark all read
          </button>
        )}
      </div>

      <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
        {notifs.map(n => {
          const cfg = NOTIF_ICON_MAP[n.type];
          const Icon = cfg.icon;
          return (
            <li key={n.id} className={`flex gap-3 px-4 py-3 transition-colors cursor-pointer ${n.read ? "bg-white" : "bg-indigo-50/40"} hover:bg-gray-50`}
              onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
              <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                <Icon size={14} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${n.read ? "text-gray-700" : "text-gray-900"}`}>{n.title}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{n.desc}</p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
            </li>
          );
        })}
      </ul>

      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
        <button className="w-full text-xs text-center text-indigo-600 hover:text-indigo-800 font-medium">
          View all notifications
        </button>
      </div>
    </motion.div>
  );
};

// ─── QuickActionsDropdown ─────────────────────────────────────────────────────
const QuickActionsDropdown = ({ setSelectedMenu, onClose }) => (
  <motion.div
    variants={dropVariants} initial="hidden" animate="visible" exit="exit"
    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-2"
  >
    <p className="px-4 pt-1 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</p>
    {QUICK_ACTIONS.map(({ label, icon: Icon, menu, color }) => (
      <button key={menu}
        onClick={() => { setSelectedMenu(menu); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={14} />
        </div>
        {label}
      </button>
    ))}
  </motion.div>
);

// ─── ProfileDropdown ──────────────────────────────────────────────────────────
const ProfileDropdown = ({ name, role, onClose, setSelectedMenu }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const initials = (name || "A").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const MENU_ITEMS = [
    { label: "Profile", icon: User, action: () => {} },
    { label: "Business Settings", icon: Settings, action: () => setSelectedMenu("createContactInfo") },
    { label: "Analytics", icon: BarChart2, action: () => setSelectedMenu("dashboard") },
    { label: "Billing", icon: CreditCard, action: () => {} },
    { label: "Security", icon: Shield, action: () => {} },
  ];

  return (
    <motion.div
      variants={dropVariants} initial="hidden" animate="visible" exit="exit"
      className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
    >
      {/* Profile card */}
      <div className="px-4 py-3.5 border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{name || "Admin"}</p>
            <span className={`inline-block mt-0.5 px-1.5 py-px rounded-full text-[10px] font-semibold ${
              role === "admin" ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"
            }`}>
              {role?.charAt(0).toUpperCase() + role?.slice(1) || "Admin"}
            </span>
          </div>
        </div>
      </div>

      <div className="py-1.5">
        {MENU_ITEMS.map(({ label, icon: Icon, action }) => (
          <button key={label}
            onClick={() => { action(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
            <Icon size={15} className="text-gray-400 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-100 py-1.5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
          <LogOut size={15} className="shrink-0" />
          Logout
        </button>
      </div>

      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <a href="/" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
          <ExternalLink size={11} />View Website
        </a>
        <span className="text-[10px] text-gray-400">v1.0</span>
      </div>
    </motion.div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = ({ toggleSidebar, selectedMenu, setSelectedMenu }) => {
  const [logo, setLogo] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const quickRef = useRef(null);
  const profileRef = useRef(null);

  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("admin");

  useEffect(() => {
    setUserName(() => localStorage.getItem("name") || localStorage.getItem("user") || "Admin");
    setUserRole(() => localStorage.getItem("type") || "admin");
  }, []);

  const unreadCount = SAMPLE_NOTIFICATIONS.filter(n => !n.read).length;

  useClickOutside(notifRef, useCallback(() => setNotifOpen(false), []));
  useClickOutside(quickRef, useCallback(() => setQuickOpen(false), []));
  useClickOutside(profileRef, useCallback(() => setProfileOpen(false), []));

  // Logo fetch
  useEffect(() => {
    axios.get(`${apiUrl}/websitelogos`)
      .then(r => setLogo(r.data[0]?.logo || ""))
      .catch(() => {});
  }, []);

  // Scroll shadow
  useEffect(() => {
    const el = document.querySelector("main");
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 4);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const pageTitle = PAGE_TITLES[selectedMenu] || "Dashboard";
  const parentLabel = BREADCRUMB_PARENT[selectedMenu];
  const initials = userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        setSelectedMenu={setSelectedMenu}
      />

      <header
        className={`fixed top-0 right-0 left-0 lg:left-0 z-40 h-16 flex items-center transition-all duration-200 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/70"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="flex items-center w-full px-4 gap-3">

          {/* ── Left: Toggle + Logo + Breadcrumb ── */}
          <div className="flex items-center gap-3 min-w-0 flex-1">

            {/* Sidebar toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors shrink-0"
            >
              <Menu size={18} />
            </motion.button>

            {/* Logo — visible on mobile only */}
            {logo && (
              <a href="/" target="_blank" rel="noreferrer" className="shrink-0 lg:hidden">
                <img src={`${imageProxyUrl}/${logo}`} alt="Logo" className="h-7 w-auto" />
              </a>
            )}

            {/* Breadcrumb — desktop */}
            <div className="hidden lg:flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-gray-400 font-medium">Dashboard</span>
              {parentLabel && (
                <>
                  <ChevronDown size={12} className="text-gray-300 -rotate-90 shrink-0" />
                  <span className="text-xs text-gray-400 font-medium">{parentLabel}</span>
                </>
              )}
              <ChevronDown size={12} className="text-gray-300 -rotate-90 shrink-0" />
              <span className="text-sm font-semibold text-gray-800 truncate">{pageTitle}</span>
            </div>

            {/* Page title — mobile */}
            <span className="lg:hidden text-sm font-semibold text-gray-800 truncate">{pageTitle}</span>
          </div>

          {/* ── Centre: Search ── */}
          <div className="hidden md:flex flex-1 max-w-xs xl:max-w-sm">
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200/80 border border-transparent hover:border-gray-200 transition-all text-left"
            >
              <Search size={14} className="text-gray-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-400">Search…</span>
              <div className="flex items-center gap-0.5">
                <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-400 text-[10px] font-medium shadow-sm">⌘</kbd>
                <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-400 text-[10px] font-medium shadow-sm">K</kbd>
              </div>
            </motion.button>
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Mobile search */}
            <div className="md:hidden">
              <IconBtn icon={Search} title="Search" onClick={() => setSearchOpen(true)} />
            </div>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <IconBtn
                icon={Bell}
                badge={unreadCount}
                title="Notifications"
                active={notifOpen}
                onClick={() => { setNotifOpen(o => !o); setQuickOpen(false); setProfileOpen(false); }}
              />
              <AnimatePresence>
                {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
              </AnimatePresence>
            </div>

            {/* Quick actions */}
            <div ref={quickRef} className="relative hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setQuickOpen(o => !o); setNotifOpen(false); setProfileOpen(false); }}
                title="Quick Actions"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  quickOpen
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                <Plus size={14} />
                <span className="hidden lg:inline">New</span>
              </motion.button>
              <AnimatePresence>
                {quickOpen && (
                  <QuickActionsDropdown
                    setSelectedMenu={setSelectedMenu}
                    onClose={() => setQuickOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-gray-200 mx-1" />

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setQuickOpen(false); }}
                aria-label="Profile menu"
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <p className="text-xs font-semibold text-gray-800 leading-none truncate max-w-[80px]">{userName}</p>
                  <p className="text-[10px] text-gray-400 leading-none mt-0.5 capitalize">{userRole}</p>
                </div>
                <ChevronDown
                  size={13}
                  className={`hidden lg:block text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                />
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <ProfileDropdown
                    name={userName}
                    role={userRole}
                    onClose={() => setProfileOpen(false)}
                    setSelectedMenu={setSelectedMenu}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
