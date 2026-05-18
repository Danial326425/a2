"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Layers, Plus, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, ErrorBanner, SuccessAlert,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const VariationLibrary = () => {
  const [colorPresets, setColorPresets]   = useState([]);
  const [sizePresets, setSizePresets]     = useState([]);
  const [sizeGroups, setSizeGroups]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState(null);

  const [newColor, setNewColor]           = useState("");
  const [newSize, setNewSize]             = useState("");
  const [newGroupName, setNewGroupName]   = useState("");
  const [newGroupSizes, setNewGroupSizes] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/color-presets`),
      axios.get(`${apiUrl}/size-presets`),
      axios.get(`${apiUrl}/size-group-presets`),
    ])
      .then(([cr, sr, sgr]) => {
        setColorPresets(cr.data || []);
        setSizePresets(sr.data || []);
        setSizeGroups(sgr.data || []);
      })
      .catch(() => setError("Failed to load presets"))
      .finally(() => setLoading(false));
  }, []);

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2000);
  };

  const saveColor = async () => {
    const name = newColor.trim();
    if (!name) return;
    try {
      const res = await axios.post(`${apiUrl}/color-presets`, { name });
      setColorPresets(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewColor("");
      flash("Color saved!");
    } catch { setError("Color already exists or could not be saved"); }
  };

  const deleteColor = async (id) => {
    try {
      await axios.delete(`${apiUrl}/color-presets/${id}`);
      setColorPresets(prev => prev.filter(c => c.id !== id));
    } catch { setError("Failed to delete color"); }
  };

  const saveSize = async () => {
    const name = newSize.trim();
    if (!name) return;
    try {
      const res = await axios.post(`${apiUrl}/size-presets`, { name });
      setSizePresets(prev => [...prev, res.data]);
      setNewSize("");
      flash("Size saved!");
    } catch { setError("Size already exists or could not be saved"); }
  };

  const deleteSize = async (id) => {
    try {
      await axios.delete(`${apiUrl}/size-presets/${id}`);
      setSizePresets(prev => prev.filter(s => s.id !== id));
    } catch { setError("Failed to delete size"); }
  };

  const saveGroup = async () => {
    const name  = newGroupName.trim();
    const sizes = newGroupSizes.split(",").map(s => s.trim()).filter(Boolean);
    if (!name || sizes.length === 0) return;
    try {
      const res = await axios.post(`${apiUrl}/size-group-presets`, { name, sizes });
      setSizeGroups(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewGroupName("");
      setNewGroupSizes("");
      flash("Size group saved!");
    } catch { setError("Group already exists or could not be saved"); }
  };

  const deleteGroup = async (id) => {
    try {
      await axios.delete(`${apiUrl}/size-group-presets/${id}`);
      setSizeGroups(prev => prev.filter(g => g.id !== id));
    } catch { setError("Failed to delete size group"); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Variation Library"
        icon={Layers}
        subtitle="Save colors and sizes once — reuse them in any product with one click"
      />

      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <SuccessAlert message={success} />

      {/* ── Color Presets ──────────────────────────────────────────────── */}
      <SectionCard>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Saved Colors
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), saveColor())}
            placeholder="e.g. Sky Blue, Coral Red, Forest Green…"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <ActionBtn type="button" variant="primary" size="sm" icon={Plus} onClick={saveColor}>
            Save Color
          </ActionBtn>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : colorPresets.length === 0 ? (
          <p className="text-sm text-gray-400">No saved colors yet. Type a color name above and click Save.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {colorPresets.map(c => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {c.name}
                <button
                  type="button"
                  onClick={() => deleteColor(c.id)}
                  className="text-indigo-300 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Size Presets ───────────────────────────────────────────────── */}
      <SectionCard>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Saved Sizes
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSize}
            onChange={e => setNewSize(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), saveSize())}
            placeholder="e.g. S, M, L, XL, 36, 38, Free Size…"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <ActionBtn type="button" variant="primary" size="sm" icon={Plus} onClick={saveSize}>
            Save Size
          </ActionBtn>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : sizePresets.length === 0 ? (
          <p className="text-sm text-gray-400">No saved sizes yet. Type a size above and click Save.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sizePresets.map(s => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {s.name}
                <button
                  type="button"
                  onClick={() => deleteSize(s.id)}
                  className="text-emerald-300 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Size Groups ────────────────────────────────────────────────── */}
      <SectionCard>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Size Groups
        </p>
        <p className="text-xs text-gray-500 mb-4">
          A size group applies all its sizes to a color at once with a single click when adding a product.
        </p>

        <div className="space-y-2 mb-4">
          <input
            type="text"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            placeholder="Group name (e.g. Standard Clothing, Shoe Sizes)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newGroupSizes}
              onChange={e => setNewGroupSizes(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), saveGroup())}
              placeholder="Comma-separated sizes: S, M, L, XL, XXL"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <ActionBtn type="button" variant="primary" size="sm" icon={Plus} onClick={saveGroup}>
              Save Group
            </ActionBtn>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : sizeGroups.length === 0 ? (
          <p className="text-sm text-gray-400">No size groups yet.</p>
        ) : (
          <div className="space-y-2">
            {sizeGroups.map(g => (
              <div
                key={g.id}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{g.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(g.sizes || []).map((sz, i) => (
                      <span
                        key={i}
                        className="inline-block bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full text-xs font-medium"
                      >
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteGroup(g.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1 ml-4 shrink-0"
                  title="Delete group"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default VariationLibrary;
