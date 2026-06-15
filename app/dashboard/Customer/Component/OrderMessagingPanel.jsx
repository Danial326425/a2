"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../../config";
import { MessageCircle, Check, Loader2 } from "lucide-react";

const apiUrl = config.apiUrl;

/**
 * Self-contained WhatsApp marketing panel for a single order's phone number.
 * Loads + saves the messaging contact (opt-in + baby birth month) on its own,
 * independent of the order-update form, so the order flow stays untouched.
 *
 * baby_birth_month is captured over the phone (no checkout field). We edit it as
 * a month (YYYY-MM) and persist it as the first day of that month.
 */
const OrderMessagingPanel = ({ phone }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const [optedOut, setOptedOut] = useState(false);
  const [birthMonth, setBirthMonth] = useState(""); // YYYY-MM for <input type="month">

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${apiUrl}/messaging/contacts/by-phone/${encodeURIComponent(phone)}`);
        if (!active) return;
        const c = res.data.contact || {};
        setOptIn(!!c.wa_opt_in);
        setOptedOut(!!c.opted_out);
        setBirthMonth(c.baby_birth_month ? c.baby_birth_month.slice(0, 7) : "");
      } catch (e) {
        if (active) setError(e?.response?.data?.message || "Could not load messaging info");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (phone) run();
    return () => { active = false; };
  }, [phone]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await axios.put(`${apiUrl}/messaging/contacts/by-phone`, {
        phone,
        wa_opt_in: optIn,
        baby_birth_month: birthMonth ? `${birthMonth}-01` : null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save messaging info");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="md:col-span-2 mt-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-emerald-600" />
        <h3 className="text-sm font-semibold text-gray-800">WhatsApp Marketing</h3>
        {optedOut && (
          <span className="ml-auto text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
            Opted out (STOP)
          </span>
        )}
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          {/* Opt-in */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-700">Customer agreed to promotions</span>
              <span className="block text-xs text-gray-400">
                Required for repurchase / collection campaigns over WhatsApp.
              </span>
            </span>
          </label>

          {/* Baby birth month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Baby birth month</label>
            <input
              type="month"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-gray-400 mt-1">Personalizes the size range in repurchase messages.</p>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
              {saving ? "Saving…" : saved ? "Saved" : "Save Messaging Info"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderMessagingPanel;
