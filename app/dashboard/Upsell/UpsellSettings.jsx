"use client";

import React, { useState, useEffect, useCallback } from "react";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const TABS = [
  { key: "layout",   label: "লেআউট"   },
  { key: "header",   label: "হেডার"   },
  { key: "urgency",  label: "আর্জেন্সি" },
  { key: "scarcity", label: "স্কার্সিটি" },
  { key: "product",  label: "প্রোডাক্ট" },
  { key: "pricing",  label: "মূল্য"   },
  { key: "timer",    label: "টাইমার"  },
  { key: "cta",      label: "বাটন"    },
  { key: "trust",    label: "ট্রাস্ট"  },
  { key: "design",   label: "ডিজাইন"  },
];

const SECTION_KEYS   = ["header","urgency","scarcity","product","pricing","timer","cta","trust"];
const SECTION_LABELS = {
  header: "হেডার", urgency: "আর্জেন্সি", scarcity: "স্কার্সিটি",
  product: "প্রোডাক্ট", pricing: "মূল্য", timer: "টাইমার",
  cta: "বাটন", trust: "ট্রাস্ট",
};

// ─── Reusable primitives ──────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? ""}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 2 }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? ""}
      rows={rows}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
    />
  );
}

function ColorPicker({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value ?? "#000000"}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-md border border-gray-200 cursor-pointer p-0.5"
        />
        <input
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="#000000"
        />
      </div>
    </Field>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        className="w-10 h-5 rounded-full transition-colors relative"
        style={{ backgroundColor: checked ? "#3B82F6" : "#D1D5DB" }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
          style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function NumberInput({ value, onChange, min, max }) {
  return (
    <input
      type="number"
      value={value ?? 0}
      min={min}
      max={max}
      onChange={e => onChange(Number(e.target.value))}
      className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// Compact px input used for font-size / dimension fields
function PxInput({ value, onChange, placeholder = "14px" }) {
  return (
    <input
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}

// Mobile + Desktop width pair
function WidthPair({ mobileVal, desktopVal, onMobile, onDesktop }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="প্রস্থ — মোবাইল">
        <PxInput value={mobileVal} onChange={onMobile} placeholder="100%" />
      </Field>
      <Field label="প্রস্থ — ডেস্কটপ">
        <PxInput value={desktopVal} onChange={onDesktop} placeholder="80%" />
      </Field>
    </div>
  );
}

// Grouped card for sub-sections inside a tab
function SubCard({ title, children }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function LayoutTab({ cfg, update }) {
  const sectionsEnabled = cfg.sections_enabled ?? {};
  const sectionsOrder   = Array.isArray(cfg.sections_order) ? cfg.sections_order : SECTION_KEYS;

  const toggleSection = (key) =>
    update("sections_enabled", { ...sectionsEnabled, [key]: !sectionsEnabled[key] });

  const moveUp = (idx) => {
    if (idx === 0) return;
    const arr = [...sectionsOrder];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    update("sections_order", arr);
  };

  const moveDown = (idx) => {
    if (idx === sectionsOrder.length - 1) return;
    const arr = [...sectionsOrder];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    update("sections_order", arr);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">সেকশনের ক্রম পরিবর্তন করুন এবং যা দেখাতে চান তা চালু রাখুন।</p>
      {sectionsOrder.map((key, idx) => (
        <div key={key} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
          <div className="flex flex-col gap-0.5">
            <button onClick={() => moveUp(idx)}   className="text-gray-400 hover:text-gray-700 text-xs leading-none">▲</button>
            <button onClick={() => moveDown(idx)} className="text-gray-400 hover:text-gray-700 text-xs leading-none">▼</button>
          </div>
          <span className="flex-1 text-sm font-medium text-gray-700">{SECTION_LABELS[key] ?? key}</span>
          <Toggle
            label={sectionsEnabled[key] !== false ? "চালু" : "বন্ধ"}
            checked={sectionsEnabled[key] !== false}
            onChange={() => toggleSection(key)}
          />
        </div>
      ))}
    </div>
  );
}

function HeaderTab({ cfg, update }) {
  const h   = cfg.header ?? {};
  const set = (k, v) => update("header", { ...h, [k]: v });

  return (
    <div className="space-y-4">
      {/* Global bg / text */}
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker label="ব্যাকগ্রাউন্ড রঙ" value={h.bg_color}   onChange={v => set("bg_color",   v)} />
        <ColorPicker label="ডিফল্ট টেক্সট রঙ" value={h.text_color} onChange={v => set("text_color", v)} />
      </div>

      {/* Badge */}
      <SubCard title="ব্যাজ">
        <Field label="টেক্সট">
          <TextInput value={h.badge_text} onChange={v => set("badge_text", v)} placeholder="⚡ এক্সক্লুসিভ অফার" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ফন্ট সাইজ">
            <PxInput value={h.badge_font_size} onChange={v => set("badge_font_size", v)} placeholder="12px" />
          </Field>
          <ColorPicker label="ফন্ট রঙ" value={h.badge_color} onChange={v => set("badge_color", v)} />
        </div>
      </SubCard>

      {/* Main Title */}
      <SubCard title="মূল শিরোনাম (Main Title)">
        <Field label="টেক্সট">
          <TextInput value={h.headline} onChange={v => set("headline", v)} placeholder="অপেক্ষা করুন! বিশেষ অফার মিস করবেন না" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ফন্ট সাইজ">
            <PxInput value={h.headline_font_size} onChange={v => set("headline_font_size", v)} placeholder="20px" />
          </Field>
          <ColorPicker label="ফন্ট রঙ" value={h.headline_color} onChange={v => set("headline_color", v)} />
        </div>
      </SubCard>

      {/* Sub Title */}
      <SubCard title="উপ-শিরোনাম (Sub Title)">
        <Field label="টেক্সট">
          <TextArea value={h.subheadline} onChange={v => set("subheadline", v)} placeholder="আপনার অর্ডার কনফার্ম হয়েছে। এখন এই একবারের অফারটি নিন।" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ফন্ট সাইজ">
            <PxInput value={h.subheadline_font_size} onChange={v => set("subheadline_font_size", v)} placeholder="14px" />
          </Field>
          <ColorPicker label="ফন্ট রঙ" value={h.subheadline_color} onChange={v => set("subheadline_color", v)} />
        </div>
      </SubCard>
    </div>
  );
}

function UrgencyTab({ cfg, update }) {
  const u   = cfg.urgency ?? {};
  const set = (k, v) => update("urgency", { ...u, [k]: v });

  return (
    <div className="space-y-4">
      <Toggle label="আর্জেন্সি ব্যানার দেখান" checked={u.enabled !== false} onChange={v => set("enabled", v)} />
      <Field label="ব্যানার টেক্সট">
        <TextInput value={u.text} onChange={v => set("text", v)} placeholder="🔥 সীমিত সময়ের অফার" />
      </Field>
      <Field label="ব্যানার ফন্ট সাইজ">
        <PxInput value={u.font_size} onChange={v => set("font_size", v)} placeholder="14px" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker label="ব্যাকগ্রাউন্ড" value={u.bg_color}   onChange={v => set("bg_color",   v)} />
        <ColorPicker label="টেক্সট রঙ"     value={u.text_color} onChange={v => set("text_color", v)} />
      </div>
    </div>
  );
}

function ScarcityTab({ cfg, update }) {
  const s   = cfg.scarcity ?? {};
  const set = (k, v) => update("scarcity", { ...s, [k]: v });

  return (
    <div className="space-y-4">
      <Toggle label="স্কার্সিটি সেকশন দেখান" checked={s.enabled !== false} onChange={v => set("enabled", v)} />
      <Field label="টেক্সট ({{count}} = র‍্যান্ডম সংখ্যা)">
        <TextInput value={s.text} onChange={v => set("text", v)} placeholder="মাত্র <strong>{{count}}</strong> জন এই অফারটি দেখছেন" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="ন্যূনতম সংখ্যা">
          <NumberInput value={s.count_min} onChange={v => set("count_min", v)} min={1} max={999} />
        </Field>
        <Field label="সর্বোচ্চ সংখ্যা">
          <NumberInput value={s.count_max} onChange={v => set("count_max", v)} min={1} max={999} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker label="ব্যাকগ্রাউন্ড" value={s.bg_color}   onChange={v => set("bg_color",   v)} />
        <ColorPicker label="টেক্সট রঙ"     value={s.text_color} onChange={v => set("text_color", v)} />
      </div>
    </div>
  );
}

function ProductTab({ cfg, update }) {
  const p   = cfg.product ?? {};
  const set = (k, v) => update("product", { ...p, [k]: v });

  return (
    <div className="space-y-4">
      {/* Visibility toggles */}
      <div className="grid grid-cols-2 gap-3">
        <Toggle label="ছবি দেখান"     checked={p.show_image    !== false} onChange={v => set("show_image",    v)} />
        <Toggle label="ব্যাজ দেখান"   checked={p.show_badge    !== false} onChange={v => set("show_badge",    v)} />
        <Toggle label="ট্যাগ দেখান"   checked={p.show_tag      !== false} onChange={v => set("show_tag",      v)} />
        <Toggle label="ফিচার দেখান"   checked={p.show_features !== false} onChange={v => set("show_features", v)} />
        <Toggle label="গ্যালারি দেখান" checked={p.show_gallery  === true}  onChange={v => set("show_gallery",  v)} />
      </div>

      {/* Product section size */}
      <SubCard title="প্রোডাক্ট সেকশন সাইজ">
        <WidthPair
          mobileVal={p.section_width_mobile}  onMobile={v => set("section_width_mobile",  v)}
          desktopVal={p.section_width_desktop} onDesktop={v => set("section_width_desktop", v)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="উচ্চতা — মোবাইল">
            <PxInput value={p.section_height_mobile} onChange={v => set("section_height_mobile", v)} placeholder="192px" />
          </Field>
          <Field label="উচ্চতা — ডেস্কটপ">
            <PxInput value={p.section_height_desktop} onChange={v => set("section_height_desktop", v)} placeholder="260px" />
          </Field>
        </div>
      </SubCard>

      {/* Image fit + position */}
      <SubCard title="প্রোডাক্ট ইমেজ">
        <Field label="ইমেজ ফিট (Object Fit)">
          <SelectInput
            value={p.image_fit ?? "contain"}
            onChange={v => set("image_fit", v)}
            options={[
              { value: "contain", label: "Contain — পুরো ছবি দেখাবে" },
              { value: "cover",   label: "Cover — বক্স ভরে যাবে" },
              { value: "fill",    label: "Fill — প্রসারিত করবে" },
            ]}
          />
        </Field>
        <Field label="ইমেজ পজিশন (Object Position)">
          <SelectInput
            value={p.image_position ?? "center"}
            onChange={v => set("image_position", v)}
            options={[
              { value: "top",    label: "Top — উপর থেকে" },
              { value: "center", label: "Center — মাঝখান" },
              { value: "bottom", label: "Bottom — নিচ থেকে" },
            ]}
          />
        </Field>
      </SubCard>

      {/* Product name alignment */}
      <Toggle
        label="প্রোডাক্ট নাম সেন্টার অ্যালাইন করুন"
        checked={p.name_center_align === true}
        onChange={v => set("name_center_align", v)}
      />

      {/* Image style */}
      <Field label="ছবির স্টাইল">
        <SelectInput
          value={p.image_style ?? "rounded"}
          onChange={v => set("image_style", v)}
          options={[
            { value: "rounded", label: "গোলাকার কোণ (Rounded)" },
            { value: "square",  label: "চতুর্ভুজ (Square)" },
            { value: "circle",  label: "বৃত্তাকার (Circle)" },
          ]}
        />
      </Field>

      <ColorPicker label="কার্ড ব্যাকগ্রাউন্ড" value={p.bg_color} onChange={v => set("bg_color", v)} />
    </div>
  );
}

function PricingTab({ cfg, update }) {
  const pr  = cfg.pricing ?? {};
  const set = (k, v) => update("pricing", { ...pr, [k]: v });

  return (
    <div className="space-y-4">
      <SubCard title="অফার লেবেল">
        <Toggle label="অফার লেবেল দেখান" checked={pr.show_offer_label !== false} onChange={v => set("show_offer_label", v)} />
        <Field label="টেক্সট">
          <TextInput value={pr.offer_label} onChange={v => set("offer_label", v)} placeholder="🎁 বিশেষ একবারের মূল্য" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ফন্ট সাইজ">
            <PxInput value={pr.offer_label_font_size} onChange={v => set("offer_label_font_size", v)} placeholder="12px" />
          </Field>
          <ColorPicker label="ফন্ট রঙ" value={pr.offer_label_color} onChange={v => set("offer_label_color", v)} />
        </div>
      </SubCard>
      <Field label="সাশ্রয় লেবেল">
        <TextInput value={pr.savings_label} onChange={v => set("savings_label", v)} placeholder="সাশ্রয়" />
      </Field>
      <Field label="মুদ্রা চিহ্ন">
        <TextInput value={pr.currency_symbol} onChange={v => set("currency_symbol", v)} placeholder="৳" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Toggle label="আসল মূল্য দেখান"   checked={pr.show_original !== false} onChange={v => set("show_original", v)} />
        <Toggle label="সাশ্রয় ব্যাজ দেখান" checked={pr.show_savings  !== false} onChange={v => set("show_savings",  v)} />
      </div>
      <ColorPicker label="অ্যাকসেন্ট রঙ" value={pr.accent_color} onChange={v => set("accent_color", v)} />

      {/* Size controls */}
      <SubCard title="প্রাইস সেকশন সাইজ">
        <WidthPair
          mobileVal={pr.width_mobile}  onMobile={v => set("width_mobile",  v)}
          desktopVal={pr.width_desktop} onDesktop={v => set("width_desktop", v)}
        />
      </SubCard>

      {/* Border */}
      <SubCard title="বর্ডার">
        <Field label="বর্ডার স্টাইল">
          <SelectInput
            value={pr.border_style ?? "solid"}
            onChange={v => set("border_style", v)}
            options={[
              { value: "solid",  label: "সলিড (━━━)" },
              { value: "dashed", label: "ড্যাশড (╌╌╌)" },
              { value: "dotted", label: "ডটেড (•••)" },
              { value: "double", label: "ডাবল (══)" },
              { value: "groove", label: "গ্রুভ (3D ভেতরে)" },
              { value: "ridge",  label: "রিজ (3D বাইরে)" },
              { value: "none",   label: "কোনো বর্ডার নেই" },
            ]}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="বর্ডার প্রস্থ">
            <PxInput value={pr.border_width} onChange={v => set("border_width", v)} placeholder="2px" />
          </Field>
          <ColorPicker label="বর্ডার রঙ" value={pr.border_color} onChange={v => set("border_color", v)} />
        </div>
      </SubCard>

      {/* Shadow + Background */}
      <div className="grid grid-cols-2 gap-4 items-end">
        <Toggle label="শ্যাডো দেখান" checked={pr.shadow !== false} onChange={v => set("shadow", v)} />
        <ColorPicker label="ব্যাকগ্রাউন্ড রঙ" value={pr.bg_color} onChange={v => set("bg_color", v)} />
      </div>
    </div>
  );
}

function TimerTab({ cfg, update }) {
  const t   = cfg.timer ?? {};
  const set = (k, v) => update("timer", { ...t, [k]: v });

  return (
    <div className="space-y-4">
      <Toggle label="কাউন্টডাউন টাইমার দেখান" checked={t.enabled !== false} onChange={v => set("enabled", v)} />
      <Field label="শিরোনাম">
        <TextInput value={t.headline} onChange={v => set("headline", v)} placeholder="⏳ অফার শেষ হবে" />
      </Field>
      <Field label="সময় (মিনিট)">
        <NumberInput value={t.minutes ?? 10} onChange={v => set("minutes", v)} min={1} max={60} />
      </Field>
      <Toggle label="প্রগ্রেস বার দেখান" checked={t.show_progress !== false} onChange={v => set("show_progress", v)} />

      {/* Timer size */}
      <SubCard title="টাইমার সাইজ">
        <WidthPair
          mobileVal={t.width_mobile}  onMobile={v => set("width_mobile",  v)}
          desktopVal={t.width_desktop} onDesktop={v => set("width_desktop", v)}
        />
      </SubCard>

      <div className="grid grid-cols-2 gap-4">
        <Toggle label="ব্যাকগ্রাউন্ড দেখান" checked={t.show_bg !== false}     onChange={v => set("show_bg",     v)} />
        <Toggle label="শ্যাডো দেখান"        checked={t.show_shadow !== false}  onChange={v => set("show_shadow",  v)} />
        <Toggle label="বর্ডার দেখান"        checked={t.show_border === true}   onChange={v => set("show_border",  v)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker label="ব্যাকগ্রাউন্ড"  value={t.bg_color}     onChange={v => set("bg_color",     v)} />
        <ColorPicker label="টেক্সট রঙ"      value={t.text_color}   onChange={v => set("text_color",   v)} />
        <ColorPicker label="অ্যাকসেন্ট রঙ"  value={t.accent_color} onChange={v => set("accent_color", v)} />
        <ColorPicker label="বর্ডার রঙ"      value={t.border_color} onChange={v => set("border_color", v)} />
      </div>
      <Field label="বর্ডার প্রস্থ">
        <PxInput value={t.border_width} onChange={v => set("border_width", v)} placeholder="1px" />
      </Field>
    </div>
  );
}

function CTATab({ cfg, update }) {
  const c   = cfg.cta ?? {};
  const set = (k, v) => update("cta", { ...c, [k]: v });

  return (
    <div className="space-y-4">
      <Field label="অ্যাকসেপ্ট বাটনের লেখা">
        <TextInput value={c.button_text} onChange={v => set("button_text", v)} placeholder="✅ হ্যাঁ! আমি এই অফারটি নিতে চাই" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker label="বাটন রঙ"      value={c.button_bg}         onChange={v => set("button_bg",         v)} />
        <ColorPicker label="বাটন টেক্সট"  value={c.button_text_color}  onChange={v => set("button_text_color", v)} />
      </div>

      {/* Button size */}
      <SubCard title="বাটন সাইজ">
        <WidthPair
          mobileVal={c.button_width_mobile}  onMobile={v => set("button_width_mobile",  v)}
          desktopVal={c.button_width_desktop} onDesktop={v => set("button_width_desktop", v)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="ফন্ট সাইজ — মোবাইল">
            <PxInput value={c.button_font_size_mobile} onChange={v => set("button_font_size_mobile", v)} placeholder="16px" />
          </Field>
          <Field label="ফন্ট সাইজ — ডেস্কটপ">
            <PxInput value={c.button_font_size_desktop} onChange={v => set("button_font_size_desktop", v)} placeholder="18px" />
          </Field>
        </div>
      </SubCard>

      <SubCard title="ডিক্লাইন লিঙ্ক">
        <Field label="লেখা">
          <TextInput value={c.decline_text} onChange={v => set("decline_text", v)} placeholder="না ধন্যবাদ, আমি এই বিশেষ ছাড় চাই না" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ফন্ট সাইজ">
            <PxInput value={c.decline_font_size} onChange={v => set("decline_font_size", v)} placeholder="12px" />
          </Field>
          <ColorPicker label="ফন্ট রঙ" value={c.decline_color} onChange={v => set("decline_color", v)} />
        </div>
      </SubCard>
      <Toggle label="গ্যারান্টি নোট দেখান" checked={c.show_guarantee !== false} onChange={v => set("show_guarantee", v)} />
      <Field label="গ্যারান্টি টেক্সট">
        <TextInput value={c.guarantee_text} onChange={v => set("guarantee_text", v)} placeholder="১০০% নিরাপদ | ক্যাশ অন ডেলিভারি" />
      </Field>
    </div>
  );
}

function TrustTab({ cfg, update }) {
  const t      = cfg.trust ?? {};
  const set    = (k, v) => update("trust", { ...t, [k]: v });
  const badges = Array.isArray(t.badges) ? t.badges : [];

  const updateBadge = (idx, val) => {
    const arr = [...badges]; arr[idx] = val; set("badges", arr);
  };
  const addBadge    = () => set("badges", [...badges, ""]);
  const removeBadge = (idx) => set("badges", badges.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <Field label="সেকশন শিরোনাম">
        <TextInput value={t.headline} onChange={v => set("headline", v)} placeholder="✅ কেন আমাদের বেছে নেবেন" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker label="ব্যাকগ্রাউন্ড" value={t.bg_color}   onChange={v => set("bg_color",   v)} />
        <ColorPicker label="টেক্সট রঙ"     value={t.text_color} onChange={v => set("text_color", v)} />
        <ColorPicker label="আইকন রঙ"       value={t.icon_color} onChange={v => set("icon_color", v)} />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">ব্যাজ তালিকা</label>
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={badge}
              onChange={e => updateBadge(i, e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={`ব্যাজ ${i + 1}`}
            />
            <button type="button" onClick={() => removeBadge(i)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 text-lg">
              &times;
            </button>
          </div>
        ))}
        <button type="button" onClick={addBadge} className="text-sm text-blue-500 font-semibold hover:underline">
          + ব্যাজ যোগ করুন
        </button>
      </div>
    </div>
  );
}

function DesignTab({ cfg, update }) {
  const d   = cfg.design ?? {};
  const f   = cfg.footer ?? {};
  const setD = (k, v) => update("design", { ...d, [k]: v });
  const setF = (k, v) => update("footer", { ...f, [k]: v });

  return (
    <div className="space-y-4">
      <Field label="পেজ সর্বোচ্চ প্রস্থ">
        <TextInput value={d.max_width} onChange={v => setD("max_width", v)} placeholder="480px" />
      </Field>
      <Field label="কার্ড কোণের বৃত্তাকার (border-radius)">
        <TextInput value={d.border_radius} onChange={v => setD("border_radius", v)} placeholder="16px" />
      </Field>
      <ColorPicker label="পেজ ব্যাকগ্রাউন্ড" value={d.page_bg} onChange={v => setD("page_bg", v)} />
      <Toggle label="কার্ডে শ্যাডো দেখান" checked={d.shadow !== false} onChange={v => setD("shadow", v)} />
      <hr className="border-gray-100" />
      <Field label="ফুটার নোট">
        <TextArea value={f.text} onChange={v => setF("text", v)} placeholder="এই অফারটি শুধুমাত্র এই পেজে এবং এই মুহূর্তে উপলব্ধ।" />
      </Field>
      <ColorPicker label="ফুটার টেক্সট রঙ" value={f.text_color} onChange={v => setF("text_color", v)} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UpsellSettings() {
  const [cfg,     setCfg]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);
  const [tab,     setTab]     = useState("layout");

  useEffect(() => {
    fetch(`${apiUrl}/upsell-settings`)
      .then(r => r.json())
      .then(d => setCfg(d.config ?? {}))
      .catch(() => setError("সেটিংস লোড ব্যর্থ হয়েছে"))
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback((key, value) => {
    setCfg(prev => ({ ...prev, [key]: value }));
    setSuccess(null);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res  = await fetch(`${apiUrl}/upsell-settings`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ config: cfg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "ত্রুটি হয়েছে");
      setCfg(data.config ?? cfg);
      setSuccess("সেটিংস সেভ হয়েছে ✓");
    } catch (err) {
      setError(err.message ?? "সেভ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500" />
      </div>
    );
  }

  if (!cfg) {
    return <p className="text-red-500 text-center py-8">{error ?? "লোড ব্যর্থ হয়েছে"}</p>;
  }

  const accentColor = cfg.pricing?.accent_color ?? cfg.cta?.button_bg ?? "#EF4444";

  const TAB_PANELS = {
    layout:   <LayoutTab   cfg={cfg} update={update} />,
    header:   <HeaderTab   cfg={cfg} update={update} />,
    urgency:  <UrgencyTab  cfg={cfg} update={update} />,
    scarcity: <ScarcityTab cfg={cfg} update={update} />,
    product:  <ProductTab  cfg={cfg} update={update} />,
    pricing:  <PricingTab  cfg={cfg} update={update} />,
    timer:    <TimerTab    cfg={cfg} update={update} />,
    cta:      <CTATab      cfg={cfg} update={update} />,
    trust:    <TrustTab    cfg={cfg} update={update} />,
    design:   <DesignTab   cfg={cfg} update={update} />,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">আপসেল পেজ সেটিংস</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-60"
          style={{ backgroundColor: accentColor }}
        >
          {saving ? "সেভ হচ্ছে…" : "সেভ করুন"}
        </button>
      </div>

      {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{success}</p>}

      {/* Live preview strip */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: accentColor + "44" }}>
        <div className="px-4 py-2 text-center text-white text-xs font-bold" style={{ backgroundColor: accentColor }}>
          লাইভ প্রিভিউ
        </div>
        <div className="p-4 bg-white text-center space-y-2">
          {cfg.header?.badge_text && (
            <span
              className="inline-block px-3 py-0.5 rounded-full text-white text-xs font-bold"
              style={{
                backgroundColor: accentColor,
                fontSize: cfg.header?.badge_font_size || undefined,
                color:    cfg.header?.badge_color     || "#ffffff",
              }}
            >
              {cfg.header.badge_text}
            </span>
          )}
          <p
            className="font-black text-gray-800 text-sm"
            style={{
              fontSize: cfg.header?.headline_font_size || undefined,
              color:    cfg.header?.headline_color     || undefined,
            }}
          >
            {cfg.header?.headline ?? "শিরোনাম"}
          </p>
          <p
            className="text-gray-400 text-xs"
            style={{
              fontSize: cfg.header?.subheadline_font_size || undefined,
              color:    cfg.header?.subheadline_color     || undefined,
            }}
          >
            {cfg.header?.subheadline ?? ""}
          </p>
          <button
            className="py-2 rounded-xl text-white text-xs font-bold mt-1"
            style={{
              backgroundColor: cfg.cta?.button_bg ?? accentColor,
              width: cfg.cta?.button_width_mobile || "100%",
            }}
          >
            {cfg.cta?.button_text ?? "অফার গ্রহণ করুন"}
          </button>
          <p className="text-gray-300 text-xs underline">{cfg.cta?.decline_text ?? "না ধন্যবাদ"}</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            style={tab === t.key
              ? { backgroundColor: accentColor, color: "#fff" }
              : { backgroundColor: "#F3F4F6", color: "#374151" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {TAB_PANELS[tab]}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl text-white font-bold text-sm transition disabled:opacity-60"
        style={{ backgroundColor: accentColor }}
      >
        {saving ? "সেভ হচ্ছে…" : "সেটিংস সেভ করুন"}
      </button>
    </div>
  );
}
