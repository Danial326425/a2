"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTimesCircle, FaUndo } from "react-icons/fa";
import { config } from "../../../../config";

const apiUrl = config.apiUrl;

/**
 * Manual restock for Partial Delivered orders. Lists the order's items and lets
 * the admin enter how many of each came back; posts to the restock endpoint so
 * the returned quantities are added back to the right variant's stock.
 */
const PartialRestockModal = ({ order, onClose, onDone }) => {
  const [items, setItems] = useState([]);
  const [returns, setReturns] = useState({}); // itemId -> qty
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!order?.order_id) return;
    (async () => {
      try {
        const r = await axios.get(`${apiUrl}/customers/${order.order_id}`);
        const data = r.data?.customer || r.data || {};
        const list = (data.items || []).filter(
          i => !i.product_name?.startsWith("[Upsell]")
        );
        setItems(list);
      } catch {
        setError("অর্ডার আইটেম লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    })();
  }, [order]);

  const setQty = (id, max, value) => {
    let v = value === "" ? "" : Math.max(0, Math.min(max, parseInt(value, 10) || 0));
    setReturns(prev => ({ ...prev, [id]: v }));
  };

  const submit = async () => {
    const payload = Object.entries(returns)
      .map(([order_item_id, quantity]) => ({ order_item_id: Number(order_item_id), quantity: Number(quantity) }))
      .filter(r => r.quantity > 0);

    if (payload.length === 0) {
      setError("কমপক্ষে একটি আইটেমের ফেরত পরিমাণ দিন");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/customers/${order.order_id}/restock-returns`, { returns: payload });
      setSuccess("ফেরত পণ্য স্টকে যোগ হয়েছে");
      setTimeout(() => { if (onDone) onDone(); onClose(); }, 1200);
    } catch (e) {
      setError(e.response?.data?.message || "রিস্টক ব্যর্থ হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">ফেরত পণ্য রিস্টক</h3>
            <p className="text-xs text-gray-500">Order: {order?.order_id}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimesCircle className="text-xl" />
          </button>
        </div>

        <div className="p-5">
          {error && <div className="mb-3 p-2 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
          {success && <div className="mb-3 p-2 bg-green-50 text-green-700 rounded text-sm">{success}</div>}

          {loading ? (
            <p className="text-sm text-gray-500 py-6 text-center">লোড হচ্ছে...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">কোনো আইটেম নেই</p>
          ) : (
            <div className="space-y-3">
              {items.map(it => (
                <div key={it.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{it.product_name}</p>
                    <p className="text-xs text-gray-500">
                      {[it.color, it.size].filter(Boolean).join(" / ") || "—"} · অর্ডার: {it.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">ফেরত</span>
                    <input
                      type="number"
                      min={0}
                      max={it.quantity}
                      value={returns[it.id] ?? ""}
                      onChange={e => setQty(it.id, it.quantity, e.target.value)}
                      className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-right outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 text-sm">বাতিল</button>
          <button
            onClick={submit}
            disabled={submitting || loading || items.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50"
          >
            <FaUndo /> {submitting ? "প্রসেসিং..." : "স্টকে ফেরত যোগ করুন"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartialRestockModal;
