"use client";
/**
 * DashUI — Shared design-system primitives for the Admin Dashboard.
 * Import individual named exports; do NOT import the whole module.
 */
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, AlertCircle, ChevronLeft, ChevronRight, X, Loader2,
  Upload, ImageIcon, ChevronDown, CheckCircle2, Eye, EyeOff,
} from "lucide-react";

// ─── Colour maps ─────────────────────────────────────────────────────────────

const BADGE = {
  success:  "bg-emerald-50  text-emerald-700  ring-1 ring-emerald-600/20",
  warning:  "bg-amber-50    text-amber-700    ring-1 ring-amber-600/20",
  danger:   "bg-red-50      text-red-700      ring-1 ring-red-600/20",
  info:     "bg-blue-50     text-blue-700     ring-1 ring-blue-600/20",
  purple:   "bg-violet-50   text-violet-700   ring-1 ring-violet-600/20",
  gray:     "bg-gray-100    text-gray-600     ring-1 ring-gray-500/20",
  indigo:   "bg-indigo-50   text-indigo-700   ring-1 ring-indigo-600/20",
  orange:   "bg-orange-50   text-orange-700   ring-1 ring-orange-600/20",
};

const BTN = {
  primary:   "bg-indigo-600  text-white  hover:bg-indigo-700  shadow-sm",
  secondary: "bg-white       text-gray-700  border border-gray-200 hover:bg-gray-50 shadow-sm",
  danger:    "bg-red-600     text-white  hover:bg-red-700     shadow-sm",
  ghost:     "text-gray-600  hover:text-gray-900 hover:bg-gray-100",
  success:   "bg-emerald-600 text-white  hover:bg-emerald-700 shadow-sm",
  warning:   "bg-amber-500   text-white  hover:bg-amber-600   shadow-sm",
};

// ─── PageHeader ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, icon: Icon, action, badge }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-indigo-600" />
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {badge !== undefined && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

// ─── SectionCard ─────────────────────────────────────────────────────────────
export const SectionCard = ({ children, className = "", noPad = false }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${noPad ? "" : "p-5"} ${className}`}>
    {children}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ title, value, icon: Icon, color = "indigo", sub }) => {
  const colors = {
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", val: "text-indigo-700" },
    emerald:{ bg: "bg-emerald-50", icon: "text-emerald-600", val: "text-emerald-700" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  val: "text-amber-700" },
    red:    { bg: "bg-red-50",    icon: "text-red-600",    val: "text-red-700" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600", val: "text-violet-700" },
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   val: "text-blue-700" },
  };
  const c = colors[color] || colors.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
    >
      {Icon && (
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
          <Icon size={22} className={c.icon} />
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ variant = "gray", children, className = "" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${BADGE[variant] || BADGE.gray} ${className}`}>
    {children}
  </span>
);

// ─── ActionBtn ────────────────────────────────────────────────────────────────
export const ActionBtn = ({
  variant = "primary",
  children,
  icon: Icon,
  size = "md",
  className = "",
  loading = false,
  ...props
}) => {
  const sizes = { sm: "px-2.5 py-1.5 text-xs gap-1.5", md: "px-3.5 py-2 text-sm gap-2", lg: "px-5 py-2.5 text-sm gap-2" };
  return (
    <button
      className={`inline-flex items-center font-medium rounded-lg transition-colors ${BTN[variant] || BTN.primary} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <Loader2 size={size === "sm" ? 12 : 14} className="animate-spin shrink-0" />
        : Icon && <Icon size={size === "sm" ? 13 : 15} className="shrink-0" />
      }
      {children}
    </button>
  );
};

// ─── SearchInput ─────────────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => (
  <div className={`relative ${className}`}>
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors placeholder:text-gray-400"
    />
  </div>
);

// ─── FilterSelect ─────────────────────────────────────────────────────────────
export const FilterSelect = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={onChange}
    className={`px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors text-gray-700 ${className}`}
  >
    {children}
  </select>
);

// ─── Table primitives ─────────────────────────────────────────────────────────
export const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full">{children}</table>
  </div>
);

export const THead = ({ children }) => (
  <thead>
    <tr className="border-b border-gray-100 bg-gray-50/60">{children}</tr>
  </thead>
);

export const TH = ({ children, className = "" }) => (
  <th className={`px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${className}`}>
    {children}
  </th>
);

export const TBody = ({ children }) => (
  <tbody className="divide-y divide-gray-50">{children}</tbody>
);

export const TR = ({ children, className = "", onClick }) => (
  <tr
    onClick={onClick}
    className={`hover:bg-gray-50/80 transition-colors ${onClick ? "cursor-pointer" : ""} ${className}`}
  >
    {children}
  </tr>
);

export const TD = ({ children, className = "" }) => (
  <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);

// ─── Loading skeleton ─────────────────────────────────────────────────────────
export const SkeletonRow = ({ cols = 5 }) => (
  <tr className="border-b border-gray-50">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} />
      </td>
    ))}
  </tr>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <TBody>
    {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} cols={cols} />)}
  </TBody>
);

// ─── Form skeleton ────────────────────────────────────────────────────────────
export const FormSkeleton = ({ fields = 4 }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-1.5">
        <div className="h-3.5 bg-gray-200 rounded w-28" />
        <div className="h-9 bg-gray-100 rounded-lg w-full" />
      </div>
    ))}
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title = "No data found", message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={26} className="text-gray-400" />
      </div>
    )}
    <p className="text-base font-semibold text-gray-700">{title}</p>
    {message && <p className="text-sm text-gray-400 mt-1 max-w-xs">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ─── ErrorBanner ─────────────────────────────────────────────────────────────
export const ErrorBanner = ({ message }) =>
  message ? (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
    >
      <AlertCircle size={15} className="shrink-0" />
      {message}
    </motion.div>
  ) : null;

// ─── SuccessAlert ─────────────────────────────────────────────────────────────
export const SuccessAlert = ({ message }) =>
  message ? (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700"
    >
      <CheckCircle2 size={15} className="shrink-0" />
      {message}
    </motion.div>
  ) : null;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const delta = 1;
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i);
  }
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{start}–{end}</span> of{" "}
        <span className="font-medium text-gray-700">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {currentPage > 2 && <><PageBtn page={1} current={currentPage} onClick={onPageChange} /><span className="text-gray-400 px-0.5">…</span></>}
        {pages.map(p => <PageBtn key={p} page={p} current={currentPage} onClick={onPageChange} />)}
        {currentPage < totalPages - 1 && <><span className="text-gray-400 px-0.5">…</span><PageBtn page={totalPages} current={currentPage} onClick={onPageChange} /></>}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const PageBtn = ({ page, current, onClick }) => (
  <button
    onClick={() => onClick(page)}
    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
      page === current
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {page}
  </button>
);

// ─── Modal / Drawer ───────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
        >
          <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} pointer-events-auto overflow-hidden`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh]">{children}</div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Slide-in drawer from the right
export const Drawer = ({ isOpen, onClose, title, children, width = "max-w-xl" }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className={`fixed right-0 top-0 h-full ${width} w-full bg-white shadow-2xl z-50 flex flex-col`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
export const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title = "Are you sure?", message, confirmLabel = "Delete", confirmVariant = "danger" }) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-sm">
    <div className="p-6">
      {message && <p className="text-sm text-gray-600 mb-5">{message}</p>}
      <div className="flex gap-3 justify-end">
        <ActionBtn variant="secondary" onClick={onCancel}>Cancel</ActionBtn>
        <ActionBtn variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</ActionBtn>
      </div>
    </div>
  </Modal>
);

// ─── FormField ────────────────────────────────────────────────────────────────
export const FormField = ({ label, required, error, hint, children, className = "" }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export const Input = ({ className = "", prefix, ...props }) => (
  prefix ? (
    <div className="flex rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 overflow-hidden bg-white transition-colors">
      <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 shrink-0">{prefix}</span>
      <input
        className={`flex-1 px-3 py-2 text-sm bg-white focus:outline-none placeholder:text-gray-400 ${className}`}
        {...props}
      />
    </div>
  ) : (
    <input
      className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors placeholder:text-gray-400 ${className}`}
      {...props}
    />
  )
);

export const PasswordInput = ({ className = "", ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={`w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors placeholder:text-gray-400 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
};

export const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors placeholder:text-gray-400 resize-none ${className}`}
    {...props}
  />
);

export const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors text-gray-700 ${className}`}
    {...props}
  >
    {children}
  </select>
);

// ─── Toggle ───────────────────────────────────────────────────────────────────
export const Toggle = ({ checked, onChange, label, description, name, id }) => {
  const inputId = id || name || label;
  return (
    <label htmlFor={inputId} className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          id={inputId}
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/30 peer-checked:bg-indigo-600 transition-colors" />
        <div className="absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-gray-700 leading-tight">{label}</p>}
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
};

// ─── CheckItem ────────────────────────────────────────────────────────────────
export const CheckItem = ({ checked, onChange, label, description, name, id }) => {
  const inputId = id || name || label;
  return (
    <label htmlFor={inputId} className="flex items-start gap-2.5 cursor-pointer group">
      <div className="relative shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={inputId}
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white hidden peer-checked:block" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-gray-700 leading-tight">{label}</p>}
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
};

// ─── FileUpload ───────────────────────────────────────────────────────────────
export const FileUpload = ({
  value,
  onChange,
  accept = "image/*",
  preview,
  onClear,
  hint,
  loading = false,
  className = "",
  height = "h-40",
  inputName,
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && onChange) {
      const fakeEvent = { target: { name: inputName, files: [file] } };
      onChange(fakeEvent);
    }
  };

  return (
    <div className={className}>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          <img src={preview} alt="Preview" className={`w-full ${height} object-cover`} />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Change
              </button>
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="px-3 py-1.5 bg-red-600 rounded-lg text-xs font-medium text-white shadow-sm hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !loading && inputRef.current?.click()}
          className={`${height} flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? "border-indigo-400 bg-indigo-50/50"
              : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
              <p className="text-xs text-gray-500">Compressing image…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Upload size={18} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-indigo-600">Click to upload</span> or drag & drop
                </p>
                {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
              </div>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        name={inputName}
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
};

// ─── MultiFileUpload ──────────────────────────────────────────────────────────
export const MultiFileUpload = ({ files = [], onChange, onRemove, hint, loading = false, className = "" }) => {
  const inputRef = useRef(null);
  return (
    <div className={`space-y-3 ${className}`}>
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square">
              <img
                src={typeof f === "string" ? f : URL.createObjectURL(f)}
                alt=""
                className="w-full h-full object-cover"
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        className="h-24 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer"
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin text-indigo-500" />
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <ImageIcon size={16} className="text-gray-400" />
            <span className="text-gray-500">Add images</span>
          </div>
        )}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={onChange} className="hidden" />
    </div>
  );
};

// ─── CollapsibleSection ───────────────────────────────────────────────────────
export const CollapsibleSection = ({
  title,
  subtitle,
  icon: Icon,
  children,
  defaultOpen = false,
  badge,
  accent = "indigo",
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const accents = {
    indigo: { border: "border-indigo-100", bg: "bg-indigo-50/50", icon: "bg-indigo-100 text-indigo-600", chevron: "text-indigo-500" },
    emerald: { border: "border-emerald-100", bg: "bg-emerald-50/50", icon: "bg-emerald-100 text-emerald-600", chevron: "text-emerald-500" },
    amber: { border: "border-amber-100", bg: "bg-amber-50/50", icon: "bg-amber-100 text-amber-600", chevron: "text-amber-500" },
    violet: { border: "border-violet-100", bg: "bg-violet-50/50", icon: "bg-violet-100 text-violet-600", chevron: "text-violet-500" },
  };
  const ac = accents[accent] || accents.indigo;
  return (
    <div className={`rounded-xl border ${ac.border} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3.5 ${ac.bg} hover:brightness-95 transition-all`}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-7 h-7 rounded-lg ${ac.icon} flex items-center justify-center shrink-0`}>
              <Icon size={14} />
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          {badge !== undefined && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/70 text-gray-600">
              {badge}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className={ac.chevron} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── FormGrid ─────────────────────────────────────────────────────────────────
export const FormGrid = ({ children, cols = 2, className = "" }) => (
  <div className={`grid grid-cols-1 ${cols === 2 ? "md:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : ""} gap-4 ${className}`}>
    {children}
  </div>
);

// ─── FormPage ─────────────────────────────────────────────────────────────────
export const FormPage = ({ children, maxWidth = "max-w-2xl", className = "" }) => (
  <div className={`${maxWidth} mx-auto ${className}`}>
    {children}
  </div>
);

// ─── FormActions ──────────────────────────────────────────────────────────────
export const FormActions = ({
  submitLabel = "Save",
  onCancel,
  loading = false,
  cancelLabel = "Cancel",
  className = "",
}) => (
  <div className={`flex items-center justify-end gap-3 pt-2 ${className}`}>
    {onCancel && (
      <ActionBtn variant="secondary" type="button" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </ActionBtn>
    )}
    <ActionBtn variant="primary" type="submit" loading={loading}>
      {submitLabel}
    </ActionBtn>
  </div>
);

// ─── InfoBox ──────────────────────────────────────────────────────────────────
export const InfoBox = ({ children, variant = "info", className = "" }) => {
  const styles = {
    info:    "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    tip:     "bg-indigo-50 border-indigo-200 text-indigo-800",
  };
  return (
    <div className={`px-3.5 py-2.5 rounded-lg border text-xs leading-relaxed ${styles[variant] || styles.info} ${className}`}>
      {children}
    </div>
  );
};

// ─── TabBar ───────────────────────────────────────────────────────────────────
export const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex items-center gap-1 overflow-x-auto pb-px scrollbar-none">
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
          active === tab.key
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {tab.icon && <tab.icon size={13} />}
        {tab.label}
        {tab.count !== undefined && (
          <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-bold ${
            active === tab.key ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
          }`}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ─── Image preview ────────────────────────────────────────────────────────────
export const ImagePreview = ({ src, alt = "", size = 10 }) => {
  const dim = `w-${size} h-${size}`;
  return src ? (
    <img src={src} alt={alt} className={`${dim} rounded-lg object-cover border border-gray-100`} />
  ) : (
    <div className={`${dim} rounded-lg bg-gray-100 flex items-center justify-center`}>
      <span className="text-gray-300 text-xs">—</span>
    </div>
  );
};

// ─── StatusBadge — for order statuses ────────────────────────────────────────
const STATUS_MAP = {
  new_order:          { variant: "info",    label: "New Order" },
  confirmed:          { variant: "indigo",  label: "Confirmed" },
  ready_to_delivery:  { variant: "purple",  label: "Ready to Ship" },
  ready_to_ship:      { variant: "purple",  label: "Ready to Ship" },
  delivered:          { variant: "success", label: "Delivered" },
  cancelled:          { variant: "danger",  label: "Cancelled" },
  return:             { variant: "warning", label: "Return" },
  hold:               { variant: "orange",  label: "Hold" },
  blocked:            { variant: "danger",  label: "Blocked" },
  in_transit:         { variant: "blue",    label: "In Transit" },
  partial_delivered:  { variant: "warning", label: "Partial" },
};

export const StatusBadge = ({ status }) => {
  const key = (status || "").toLowerCase().replace(/\s+/g, "_");
  const cfg = STATUS_MAP[key] || { variant: "gray", label: status || "—" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20 }) => (
  <Loader2 size={size} className="animate-spin text-indigo-600" />
);

// ─── DividerLabel ─────────────────────────────────────────────────────────────
export const DividerLabel = ({ label }) => (
  <div className="relative flex items-center">
    <div className="flex-1 border-t border-gray-200" />
    <span className="mx-3 text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
    <div className="flex-1 border-t border-gray-200" />
  </div>
);

// ─── RepeatableItem ───────────────────────────────────────────────────────────
export const RepeatableItem = ({ children, onRemove, index, canRemove = true }) => (
  <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-4">
    {canRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
      >
        <X size={12} />
      </button>
    )}
    <div className="flex items-center gap-1.5 mb-3">
      <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0">
        {index + 1}
      </span>
    </div>
    {children}
  </div>
);