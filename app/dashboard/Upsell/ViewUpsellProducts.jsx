"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { config } from "../../../config";

const apiUrl   = config.apiUrl;
const imageUrl = config.imageUrl;
const imgOpts  = { maxSizeMB: 2, maxWidthOrHeight: 2560, useWebWorker: true, fileType: "image/webp", initialQuality: 0.92 };

// ─── Inline Edit Modal ────────────────────────────────────────────────────────
function EditModal({ product, onClose, onSaved }) {
  const [form, setForm]        = useState({
    name:           product.name,
    description:    product.description || "",
    original_price: product.original_price,
    offer_price:    product.offer_price,
    is_active:      product.is_active,
    cta_text:       product.cta_text  || "",
    badge_text:     product.badge_text || "",
    tag:            product.tag    || "",
    label:          product.label  || "",
  });
  const [features, setFeatures] = useState(Array.isArray(product.features) && product.features.length ? product.features : [""]);
  const [sizes, setSizes]       = useState(Array.isArray(product.sizes) && product.sizes.length ? product.sizes : [""]);
  const [image, setImage]      = useState(null);
  const [preview, setPreview]  = useState(null);
  const [saving, setSaving]    = useState(false);
  const [compressing, setComp] = useState(false);
  const [error, setError]      = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setComp(true);
    try {
      const compressed = await imageCompression(file, imgOpts);
      setImage(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch { setError("ছবি প্রসেস ব্যর্থ হয়েছে"); }
    finally { setComp(false); }
  };

  const updateFeature = (i, val) => { const arr = [...features]; arr[i] = val; setFeatures(arr); };
  const addFeature    = () => setFeatures(f => [...f, ""]);
  const removeFeature = (i) => setFeatures(f => f.filter((_, idx) => idx !== i));

  const updateSize = (i, val) => { const arr = [...sizes]; arr[i] = val; setSizes(arr); };
  const addSize    = () => setSizes(s => [...s, ""]);
  const removeSize = (i) => setSizes(s => s.filter((_, idx) => idx !== i));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData();
    fd.append("name",           form.name);
    fd.append("description",    form.description);
    fd.append("original_price", form.original_price);
    fd.append("offer_price",    form.offer_price);
    fd.append("is_active",      form.is_active ? "1" : "0");
    fd.append("cta_text",       form.cta_text);
    fd.append("badge_text",     form.badge_text);
    fd.append("tag",            form.tag);
    fd.append("label",          form.label);
    const cleanFeatures = features.filter(f => f.trim());
    if (cleanFeatures.length) fd.append("features", JSON.stringify(cleanFeatures));
    const cleanSizes = sizes.filter(s => s.trim());
    if (cleanSizes.length) fd.append("sizes", JSON.stringify(cleanSizes));
    if (image) fd.append("image", image, "upsell.webp");

    try {
      await axios.post(`${apiUrl}/upsell-products/${product.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "সেভ ব্যর্থ হয়েছে");
      setSaving(false);
    }
  };

  const inputCls = "w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">আপসেল পণ্য সম্পাদনা</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">নাম *</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">বিবরণ</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={inputCls + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">আসল মূল্য *</label>
              <input name="original_price" type="number" min="0" value={form.original_price} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">অফার মূল্য *</label>
              <input name="offer_price" type="number" min="0" value={form.offer_price} onChange={handleChange} required className={inputCls} />
            </div>
          </div>

          {/* Extra customisation fields */}
          <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">বাটন টেক্সট</label>
              <input name="cta_text" value={form.cta_text} onChange={handleChange} className={inputCls} placeholder="✅ এখনই নিন" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">ব্যাজ টেক্সট</label>
              <input name="badge_text" value={form.badge_text} onChange={handleChange} className={inputCls} placeholder="বেস্টসেলার" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">ট্যাগ</label>
              <input name="tag" value={form.tag} onChange={handleChange} className={inputCls} placeholder="নতুন" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">লেবেল</label>
              <input name="label" value={form.label} onChange={handleChange} className={inputCls} placeholder="সীমিত স্টক" />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ফিচার তালিকা</label>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={f} onChange={e => updateFeature(i, e.target.value)} className={inputCls} placeholder={`ফিচার ${i + 1}`} />
                  <button type="button" onClick={() => removeFeature(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 text-lg flex-shrink-0">
                    &times;
                  </button>
                </div>
              ))}
              <button type="button" onClick={addFeature} className="text-xs text-red-500 font-semibold hover:underline">+ যোগ করুন</button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">সাইজ অপশন (ঐচ্ছিক)</label>
            <div className="space-y-2">
              {sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={s} onChange={e => updateSize(i, e.target.value)} className={inputCls} placeholder="যেমন: S, M, L, XL" />
                  <button type="button" onClick={() => removeSize(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 text-lg flex-shrink-0">
                    &times;
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSize} className="text-xs text-red-500 font-semibold hover:underline">+ সাইজ যোগ করুন</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">নতুন ছবি (ঐচ্ছিক)</label>
            {(preview || product.image) && (
              <img src={preview || `${imageUrl}/${product.image}`} alt="preview" className="w-24 h-24 object-contain rounded-xl border mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleImage}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100" />
            {compressing && <p className="text-xs text-gray-400 mt-1">ছবি কম্প্রেস হচ্ছে...</p>}
          </div>

          <div className="flex items-center gap-2">
            <input id="edit_is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded accent-red-500" />
            <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700">সক্রিয়</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || compressing}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition disabled:opacity-60">
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition">
              বাতিল
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function ViewUpsellProducts({ onCreateNew }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/upsell-products`);
      setProducts(res.data.upsell_products || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("এই আপসেল পণ্যটি ডিলিট করবেন?")) return;
    setDeleting(id);
    try {
      await axios.delete(`${apiUrl}/upsell-products/${id}`);
      setProducts(p => p.filter(x => x.id !== id));
    } catch { alert("ডিলিট ব্যর্থ হয়েছে"); }
    finally { setDeleting(null); }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-red-500" /></div>;
  }

  return (
    <div>
      {editing && (
        <EditModal product={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">আপসেল পণ্যসমূহ ({products.length})</h2>
        <button onClick={onCreateNew} className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
          + নতুন পণ্য
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p className="font-medium">কোনো আপসেল পণ্য নেই।</p>
          <button onClick={onCreateNew} className="mt-4 text-red-500 underline text-sm font-semibold">
            প্রথম পণ্য তৈরি করুন
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="relative h-40 bg-gray-50 flex items-center justify-center">
                {product.image ? (
                  <img src={`${imageUrl}/${product.image}`} alt={product.name} className="h-full w-full object-contain p-3" />
                ) : (
                  <span className="text-gray-300 text-4xl">📦</span>
                )}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
                {product.badge_text && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    {product.badge_text}
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                )}
                {Array.isArray(product.features) && product.features.length > 0 && (
                  <ul className="mb-2 space-y-0.5">
                    {product.features.slice(0, 2).map((f, i) => (
                      <li key={i} className="flex items-center gap-1 text-xs text-gray-600">
                        <span className="text-green-500">✓</span>{f}
                      </li>
                    ))}
                    {product.features.length > 2 && (
                      <li className="text-xs text-gray-400">+{product.features.length - 2} আরও...</li>
                    )}
                  </ul>
                )}

                <div className="flex items-center gap-2 mt-auto mb-3">
                  <span className="text-gray-400 line-through text-sm">৳{Number(product.original_price).toLocaleString()}</span>
                  <span className="text-red-500 font-black text-base">৳{Number(product.offer_price).toLocaleString()}</span>
                  <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                    {Math.round(((product.original_price - product.offer_price) / product.original_price) * 100)}% ছাড়
                  </span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setEditing(product)}
                    className="flex-1 text-sm font-semibold py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
                    সম্পাদনা
                  </button>
                  <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                    className="flex-1 text-sm font-semibold py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                    {deleting === product.id ? "..." : "ডিলিট"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
