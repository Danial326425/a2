"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "@/config/config";
import { normalizeBnPhone, isValidBdPhone } from "@/app/lib/phone";
import {
  Package, CheckCircle2, ClipboardList, Boxes, Truck, Home,
  Search, Loader2, XCircle, Clock,
} from "lucide-react";

const apiUrl = config.apiUrl;

// The 5-step happy path shown in the timeline.
const STEPS = [
  { n: 1, label: "অর্ডার পেয়েছি", icon: ClipboardList },
  { n: 2, label: "কনফার্মড", icon: CheckCircle2 },
  { n: 3, label: "প্যাকড", icon: Boxes },
  { n: 4, label: "পথে", icon: Truck },
  { n: 5, label: "ডেলিভার্ড", icon: Home },
];

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
};

export default function TrackClient() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);  // { found, order?, message? }
  const [error, setError] = useState("");
  const [trackDays, setTrackDays] = useState(7);

  useEffect(() => {
    let active = true;
    axios.get(`${apiUrl}/track-settings`)
      .then((res) => { if (active && res.data?.tracking_days) setTrackDays(res.data.tracking_days); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const submit = async (e) => {
    e?.preventDefault();
    const clean = normalizeBnPhone(phone);
    if (!isValidBdPhone(clean)) {
      setError("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)");
      setResult(null);
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.get(`${apiUrl}/track-order/${clean}`);
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 mb-3">
            <Package size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">অর্ডার ট্র্যাকিং</h1>
          <p className="text-sm text-gray-500 mt-1">
            আপনার মোবাইল নম্বর দিন — সর্বশেষ অর্ডারের বর্তমান অবস্থা দেখুন।
          </p>
        </div>

        {/* Search */}
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-2">
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="আপনার মোবাইল নম্বর"
            className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-gray-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 whitespace-nowrap inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            ট্র্যাক
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* Result */}
        {result && !result.found && (
          <div className="mt-5 bg-white rounded-2xl border border-amber-100 p-6 text-center">
            <Clock size={32} className="text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{result.message}</p>
          </div>
        )}

        {result?.found && (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-gray-500">
              গত {trackDays} দিনে <strong className="text-gray-700">{result.count}</strong> টি অর্ডার পাওয়া গেছে
            </p>
            {result.orders.map((order, i) => (
              <StatusCard key={order.order_id || i} order={order} index={result.orders.length - i} />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          শুধুমাত্র গত {trackDays} দিনের অর্ডার ট্র্যাক করা যায়।
        </p>
      </div>
    </div>
  );
}

function StatusCard({ order, index }) {
  const failed = order.state === "failed";
  const currentStep = order.step || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Status banner */}
      <div
        className={`px-5 py-4 ${
          order.state === "success"
            ? "bg-emerald-50 text-emerald-700"
            : failed
              ? "bg-red-50 text-red-700"
              : order.state === "neutral"
                ? "bg-amber-50 text-amber-700"
                : "bg-indigo-50 text-indigo-700"
        }`}
      >
        <p className="text-xs opacity-70">
          {index ? `অর্ডার #${index} — ` : ""}বর্তমান অবস্থা
        </p>
        <p className="text-lg font-bold flex items-center gap-2">
          {failed && <XCircle size={20} />}
          {order.status}
        </p>
      </div>

      {/* Timeline (hidden for failed/returned orders) */}
      {!failed && (
        <div className="px-5 py-6">
          <div className="flex items-start justify-between">
            {STEPS.map((s, i) => {
              const done = currentStep >= s.n;
              const active = currentStep === s.n;
              const Icon = s.icon;
              return (
                <React.Fragment key={s.n}>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        done ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                      } ${active ? "ring-4 ring-indigo-100" : ""}`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className={`mt-2 text-[11px] text-center ${done ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mt-4 ${currentStep > s.n ? "bg-indigo-600" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="border-t border-gray-100 px-5 py-4 space-y-2 text-sm">
        {order.product && (
          <Row label="পণ্য" value={`${order.product}${order.quantity ? ` (${order.quantity} টি)` : ""}`} />
        )}
        {order.order_id && <Row label="অর্ডার নং" value={order.order_id} />}
        {order.ordered_at && <Row label="অর্ডারের তারিখ" value={fmtDate(order.ordered_at)} />}
        {order.courier && <Row label="কুরিয়ার" value={order.courier} />}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 font-medium text-right">{value}</span>
    </div>
  );
}
