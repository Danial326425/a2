"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "@/config/config";
import { normalizeBnPhone, isValidBdPhone } from "@/app/lib/phone";
import { RefreshCw, Search, Loader2, CheckCircle2, Clock, ImagePlus } from "lucide-react";

const apiUrl = config.apiUrl;

const fmtDate = (iso) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long" }); }
  catch { return ""; }
};

export default function ExchangeClient() {
  const [settings, setSettings] = useState(null);   // { enabled, instructions }
  const [bootLoading, setBootLoading] = useState(true);

  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [orders, setOrders] = useState(null);        // null = not searched yet
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get(`${apiUrl}/exchange/settings`);
        if (active) setSettings(res.data);
      } catch {
        if (active) setSettings({ enabled: false });
      } finally {
        if (active) setBootLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const searchOrders = async (e) => {
    e?.preventDefault();
    const clean = normalizeBnPhone(phone);
    if (!isValidBdPhone(clean)) {
      setError("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।");
      return;
    }
    setError("");
    setSearching(true);
    setOrders(null);
    setSelected("");
    try {
      const res = await axios.get(`${apiUrl}/exchange/orders/${clean}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err?.response?.data?.message || "সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setSearching(false);
    }
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!selected) { setError("একটি অর্ডার নির্বাচন করুন।"); return; }
    if (note.trim().length < 5) { setError("কেন এক্সচেঞ্জ করতে চান একটু বিস্তারিত লিখুন।"); return; }
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("phone", normalizeBnPhone(phone));
      fd.append("order_id", selected);
      fd.append("note", note.trim());
      if (photo) fd.append("photo", photo);
      await axios.post(`${apiUrl}/exchange-requests`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || "জমা দেওয়া যায়নি, আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  if (bootLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={28} /></div>;
  }

  if (!settings?.enabled) {
    return (
      <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md">
          <Clock size={32} className="text-amber-500 mx-auto mb-2" />
          <h1 className="text-lg font-bold text-gray-800">এক্সচেঞ্জ সেবা বন্ধ</h1>
          <p className="text-sm text-gray-500 mt-1">এই মুহূর্তে অনলাইনে এক্সচেঞ্জ রিকোয়েস্ট নেওয়া হচ্ছে না।</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center max-w-md">
          <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-gray-800">রিকোয়েস্ট জমা হয়েছে! 🎉</h1>
          <p className="text-sm text-gray-500 mt-1">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ধন্যবাদ।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 mb-3">
            <RefreshCw size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">এক্সচেঞ্জ রিকোয়েস্ট</h1>
          <p className="text-sm text-gray-500 mt-1">মোবাইল নম্বর দিয়ে আপনার অর্ডার খুঁজুন, তারপর এক্সচেঞ্জের অনুরোধ পাঠান।</p>
        </div>

        {settings.instructions && (
          <div className="mb-4 text-sm text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 whitespace-pre-wrap">
            {settings.instructions}
          </div>
        )}

        {/* Phone search */}
        <form onSubmit={searchOrders} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-2">
          <input
            type="tel" inputMode="numeric" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="আপনার মোবাইল নম্বর"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-gray-800"
          />
          <button type="submit" disabled={searching}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            খুঁজুন
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

        {/* Orders */}
        {orders && orders.length === 0 && (
          <div className="mt-5 bg-white rounded-2xl border border-amber-100 p-6 text-center">
            <Clock size={30} className="text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">এক্সচেঞ্জের যোগ্য কোনো অর্ডার পাওয়া যায়নি।</p>
          </div>
        )}

        {orders && orders.length > 0 && (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">কোন অর্ডারটি এক্সচেঞ্জ করতে চান?</p>
              <div className="space-y-2">
                {orders.map((o) => (
                  <label key={o.order_id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selected === o.order_id ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
                    }`}>
                    <input type="radio" name="order" value={o.order_id}
                      checked={selected === o.order_id}
                      onChange={() => setSelected(o.order_id)}
                      className="text-indigo-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{o.product || "পণ্য"}</p>
                      <p className="text-xs text-gray-400">অর্ডার #{o.order_id} • {fmtDate(o.ordered_at)} • {o.status}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">কেন এক্সচেঞ্জ করতে চান? <span className="text-red-500">*</span></label>
                <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: সাইজ ছোট হয়েছে, বড় সাইজ লাগবে / রং ভিন্ন চাই / পণ্যে সমস্যা…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-gray-800" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">পণ্যের ছবি (ঐচ্ছিক)</label>
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm cursor-pointer hover:bg-gray-50">
                  <ImagePlus size={18} />
                  {photo ? photo.name : "ছবি যোগ করুন"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                </label>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
                {submitting && <Loader2 size={18} className="animate-spin" />}
                রিকোয়েস্ট জমা দিন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
