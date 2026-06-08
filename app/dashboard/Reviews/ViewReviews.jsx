"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const STARS = [1, 2, 3, 4, 5];

function StarDisplay({ rating, size = "text-base" }) {
  return (
    <span className="flex items-center gap-0.5">
      {STARS.map(i => (
        <span key={i} className={`${size} leading-none`} style={{ color: i <= rating ? "#FBBF24" : "#D1D5DB" }}>★</span>
      ))}
    </span>
  );
}

function ReviewCard({ review, onApprove, onDelete, onEdit, approving, deleting }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${review.is_approved ? "border-green-200" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {review.reviewer_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <span className="font-semibold text-gray-800 text-sm">{review.reviewer_name}</span>
              {review.reviewer_phone && (
                <span className="text-xs text-gray-400 ml-2">{review.reviewer_phone}</span>
              )}
            </div>
            <StarDisplay rating={review.rating} />
            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${review.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {review.is_approved ? "✓ অনুমোদিত" : "অপেক্ষমাণ"}
            </span>
          </div>

          {/* Product & Order */}
          <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-x-3">
            {review.product && (
              <span>📦 {review.product.name}</span>
            )}
            {review.order_id && (
              <span>🧾 Order: {review.order_id}</span>
            )}
            <span>🕐 {new Date(review.created_at).toLocaleDateString("bn-BD")}</span>
          </div>

          {/* Review text */}
          {review.review && (
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-3 py-2">
              "{review.review}"
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => onApprove(review.id)}
          disabled={approving}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
            review.is_approved
              ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
              : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
          } disabled:opacity-50`}
        >
          {approving ? "..." : review.is_approved ? "✗ প্রত্যাখ্যান করুন" : "✓ অনুমোদন করুন"}
        </button>
        <button
          onClick={() => onEdit(review)}
          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition"
        >
          ✎ এডিট
        </button>
        <button
          onClick={() => onDelete(review.id)}
          disabled={deleting}
          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition disabled:opacity-50"
        >
          {deleting ? "..." : "মুছুন"}
        </button>
      </div>
    </div>
  );
}

function EditReviewModal({ review, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    reviewer_name: review.reviewer_name || "",
    reviewer_phone: review.reviewer_phone || "",
    rating: review.rating || 5,
    review: review.review || "",
    is_approved: !!review.is_approved,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">রিভিউ এডিট</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">নাম</label>
            <input className={inp} value={form.reviewer_name} onChange={e => set("reviewer_name", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">মোবাইল নম্বর</label>
            <input className={inp} value={form.reviewer_phone} onChange={e => set("reviewer_phone", e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">রেটিং</label>
            <div className="flex items-center gap-1">
              {STARS.map(i => (
                <button key={i} type="button" onClick={() => set("rating", i)}
                  className="text-2xl leading-none transition-transform hover:scale-110"
                  style={{ color: i <= form.rating ? "#FBBF24" : "#D1D5DB" }}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">রিভিউ</label>
            <textarea className={inp} rows={3} value={form.review} onChange={e => set("review", e.target.value)} />
          </div>
          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 cursor-pointer">
            <span className="text-sm font-semibold text-gray-700">অনুমোদিত (Approved)</span>
            <input type="checkbox" checked={form.is_approved} onChange={e => set("is_approved", e.target.checked)} className="w-5 h-5 accent-green-600" />
          </label>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100">বাতিল</button>
          <button onClick={() => onSave(review.id, form)} disabled={saving}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ViewReviews() {
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all"); // all | pending | approved
  const [actionIds, setActionIds] = useState({ approving: null, deleting: null });
  const [editing, setEditing]     = useState(null); // review being edited
  const [savingEdit, setSavingEdit] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await axios.get(`${apiUrl}/admin/reviews`, { headers, params });
      setReviews(res.data.reviews || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    setActionIds(p => ({ ...p, approving: id }));
    try {
      const res = await axios.post(`${apiUrl}/admin/reviews/${id}/approve`, {}, { headers });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: res.data.is_approved } : r));
    } catch { /* ignore */ }
    finally { setActionIds(p => ({ ...p, approving: null })); }
  };

  const handleDelete = async (id) => {
    if (!confirm("এই রিভিউটি মুছে ফেলবেন?")) return;
    setActionIds(p => ({ ...p, deleting: id }));
    try {
      await axios.delete(`${apiUrl}/admin/reviews/${id}`, { headers });
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch { /* ignore */ }
    finally { setActionIds(p => ({ ...p, deleting: null })); }
  };

  const handleSaveEdit = async (id, form) => {
    setSavingEdit(true);
    try {
      const res = await axios.put(`${apiUrl}/admin/reviews/${id}`, form, { headers });
      const updated = res.data.review || { ...form, id };
      setReviews(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
      setEditing(null);
    } catch { /* ignore */ }
    finally { setSavingEdit(false); }
  };

  const filtered = filter === "all" ? reviews
    : filter === "approved" ? reviews.filter(r => r.is_approved)
    : reviews.filter(r => !r.is_approved);

  const pendingCount  = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">রিভিউ ম্যানেজমেন্ট</h1>
          <p className="text-sm text-gray-500 mt-0.5">কাস্টমারদের রিভিউ অনুমোদন ও পরিচালনা করুন</p>
        </div>
        <button onClick={load} className="text-sm text-blue-600 hover:underline font-medium">↻ রিফ্রেশ</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "মোট রিভিউ", count: reviews.length, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "অপেক্ষমাণ", count: pendingCount, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
          { label: "অনুমোদিত", count: approvedCount, color: "bg-green-50 text-green-700 border-green-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-3 text-center ${s.color}`}>
            <div className="text-2xl font-black">{s.count}</div>
            <div className="text-xs font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {[
          { key: "all",      label: "সব" },
          { key: "pending",  label: `অপেক্ষমাণ${pendingCount ? ` (${pendingCount})` : ""}` },
          { key: "approved", label: "অনুমোদিত" },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${filter === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-3 border-b-3 border-red-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">💬</div>
          <p className="font-medium">কোনো রিভিউ নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onApprove={handleApprove}
              onDelete={handleDelete}
              onEdit={setEditing}
              approving={actionIds.approving === review.id}
              deleting={actionIds.deleting === review.id}
            />
          ))}
        </div>
      )}

      {editing && (
        <EditReviewModal
          review={editing}
          saving={savingEdit}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
