"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import imageCompression from "browser-image-compression";

const apiUrl  = config.apiUrl;
const imgOpts = { maxSizeMB: 2, maxWidthOrHeight: 2560, useWebWorker: true, fileType: "image/webp", initialQuality: 0.92 };

const INITIAL = {
  name: "", description: "", original_price: "", offer_price: "",
  is_active: true, cta_text: "", badge_text: "", tag: "", label: "",
};

export default function CreateUpsellProduct({ onCreated, onCancel }) {
  const [form, setForm]        = useState(INITIAL);
  const [features, setFeatures] = useState([""]);
  const [sizes, setSizes]      = useState([""]);
  const [image, setImage]      = useState(null);
  const [preview, setPreview]  = useState(null);
  const [submitting, setSub]   = useState(false);
  const [compressing, setComp] = useState(false);
  const [error, setError]      = useState(null);
  const [success, setSuccess]  = useState(null);

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
    } catch { setError("Image compression failed"); }
    finally { setComp(false); }
  };

  const updateFeature = (i, val) => {
    const arr = [...features]; arr[i] = val; setFeatures(arr);
  };
  const addFeature    = () => setFeatures(f => [...f, ""]);
  const removeFeature = (i) => setFeatures(f => f.filter((_, idx) => idx !== i));

  const updateSize = (i, val) => { const arr = [...sizes]; arr[i] = val; setSizes(arr); };
  const addSize    = () => setSizes(s => [...s, ""]);
  const removeSize = (i) => setSizes(s => s.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())    return setError("পণ্যের নাম লিখুন");
    if (!form.original_price) return setError("আসল মূল্য লিখুন");
    if (!form.offer_price)    return setError("অফার মূল্য লিখুন");

    setSub(true);
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
      await axios.post(`${apiUrl}/upsell-products`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("আপসেল পণ্য তৈরি হয়েছে!");
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setSub(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-xl w-full mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">নতুন আপসেল পণ্য তৈরি করুন</h2>

      {error   && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
      {success && <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Core fields */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">পণ্যের নাম *</label>
          <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="যেমন: প্রিমিয়াম কেস কভার" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">বিবরণ</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputCls + " resize-none"} placeholder="পণ্যের সংক্ষিপ্ত বিবরণ..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">আসল মূল্য (৳) *</label>
            <input name="original_price" type="number" min="0" value={form.original_price} onChange={handleChange} required className={inputCls} placeholder="1500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">অফার মূল্য (৳) *</label>
            <input name="offer_price" type="number" min="0" value={form.offer_price} onChange={handleChange} required className={inputCls} placeholder="999" />
          </div>
        </div>

        {/* Page customisation fields */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide">পেজ কাস্টমাইজেশন (ঐচ্ছিক)</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">বাটন টেক্সট</label>
              <input name="cta_text" value={form.cta_text} onChange={handleChange} className={inputCls} placeholder="✅ এখনই নিন" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ব্যাজ টেক্সট</label>
              <input name="badge_text" value={form.badge_text} onChange={handleChange} className={inputCls} placeholder="বেস্টসেলার" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ট্যাগ</label>
              <input name="tag" value={form.tag} onChange={handleChange} className={inputCls} placeholder="নতুন" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">লেবেল</label>
              <input name="label" value={form.label} onChange={handleChange} className={inputCls} placeholder="সীমিত স্টক" />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ফিচার তালিকা</label>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={f}
                    onChange={e => updateFeature(i, e.target.value)}
                    className={inputCls}
                    placeholder={`ফিচার ${i + 1}`}
                  />
                  <button type="button" onClick={() => removeFeature(i)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 text-lg flex-shrink-0">
                    &times;
                  </button>
                </div>
              ))}
              <button type="button" onClick={addFeature} className="text-sm text-red-500 font-semibold hover:underline">
                + ফিচার যোগ করুন
              </button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">সাইজ অপশন (ঐচ্ছিক)</label>
            <p className="text-xs text-gray-400 mb-2">যদি এই পণ্যের সাইজ থাকে তাহলে যোগ করুন। যেমন: S, M, L, XL</p>
            <div className="space-y-2">
              {sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s}
                    onChange={e => updateSize(i, e.target.value)}
                    className={inputCls}
                    placeholder={`যেমন: S, M, L, XL`}
                  />
                  <button type="button" onClick={() => removeSize(i)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 text-lg flex-shrink-0">
                    &times;
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSize} className="text-sm text-red-500 font-semibold hover:underline">
                + সাইজ যোগ করুন
              </button>
            </div>
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">পণ্যের ছবি</label>
          {preview && <img src={preview} alt="preview" className="w-32 h-32 object-contain rounded-xl border mb-2" />}
          <input type="file" accept="image/*" onChange={handleImage}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100" />
          {compressing && <p className="text-xs text-gray-400 mt-1">ছবি কম্প্রেস হচ্ছে...</p>}
        </div>

        <div className="flex items-center gap-2">
          <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded accent-red-500" />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">সক্রিয় (Active)</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting || compressing}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
            {submitting ? "সেভ হচ্ছে..." : "পণ্য তৈরি করুন"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition">
              বাতিল
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
