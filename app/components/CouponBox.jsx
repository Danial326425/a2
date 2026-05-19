'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTag } from 'react-icons/fa';

/**
 * Reusable coupon-code input + applied-state display.
 *
 * Parent owns the `coupon` state — this component is fully controlled.
 * Calls /coupons/validate against the supplied `items`, then bubbles the
 * validated payload up via `onApply(coupon)` or clears via `onRemove()`.
 *
 * Props:
 *   - apiUrl:   string  — base API URL
 *   - items:    Array   — cart items shaped as { product_id|id, quantity, price }
 *   - phone:    string? — optional customer phone (for per-user limit checks)
 *   - coupon:   { code, type, discount, free_delivery } | null
 *   - onApply:  (coupon) => void
 *   - onRemove: () => void
 *   - className: string? — wrapper class
 */
export default function CouponBox({
  apiUrl, items = [], phone, coupon, onApply, onRemove, className = '',
}) {
  const [code, setCode]       = useState(coupon?.code || '');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setCode(coupon?.code || '');
    if (coupon) { setError(null); setMessage(null); }
  }, [coupon]);

  const buildCart = () =>
    items
      .filter((i) => (i?.product_id || i?.id))
      .map((i) => {
        const qty   = Number(i.quantity) || 1;
        const price = Number(i.price)    || 0;
        return {
          product_id: i.product_id || i.id,
          quantity:   qty,
          price,
          line_total: qty * price,
        };
      });

  const apply = async () => {
    const trimmed = (code || '').trim();
    if (!trimmed) { setError('কুপন কোড লিখুন'); return; }
    if (buildCart().length === 0) { setError('কুপন প্রয়োগ করার আগে পণ্য সিলেক্ট করুন'); return; }

    setBusy(true); setError(null); setMessage(null);
    try {
      const res = await axios.post(`${apiUrl}/coupons/validate`, {
        code: trimmed,
        cart: buildCart(),
        ...(phone ? { phone_number: phone } : {}),
      });
      if (res.data?.ok) {
        onApply?.({
          code: res.data.coupon?.code || trimmed,
          type: res.data.coupon?.type,
          discount: Number(res.data.discount || 0),
          free_delivery: !!res.data.free_delivery,
        });
        setMessage(res.data.message || 'কুপন প্রয়োগ হয়েছে');
      } else {
        setError(res.data?.message || 'কুপন সঠিক নয়');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'কুপন যাচাই করা যায়নি');
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    onRemove?.();
    setCode('');
    setError(null);
    setMessage(null);
  };

  if (coupon) {
    return (
      <div className={`rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <FaCheckCircle className="text-emerald-500 text-sm shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-800 truncate">{coupon.code}</p>
            <p className="text-xs text-emerald-700">
              {coupon.free_delivery
                ? 'ফ্রি ডেলিভারি প্রযোজ্য'
                : `৳${Math.round(Number(coupon.discount || 0))} ছাড় প্রযোজ্য`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={remove}
          className="text-xs text-red-600 hover:text-red-700 font-semibold whitespace-nowrap"
        >
          সরান
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="flex items-center gap-2 text-base font-semibold mb-2 text-gray-700">
        <FaTag className="text-green-600" />
        কুপন কোড আছে?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
          placeholder="কুপন কোড লিখুন"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition uppercase tracking-wide"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={apply}
          disabled={busy || !code.trim()}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {busy ? '...' : 'প্রয়োগ'}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {message && <p className="mt-1.5 text-xs text-emerald-600">{message}</p>}
    </div>
  );
}
