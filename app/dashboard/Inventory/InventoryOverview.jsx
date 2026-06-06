"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  Boxes, ChevronDown, ChevronRight, AlertTriangle, Search, Save, RefreshCw,
} from "lucide-react";
import {
  PageHeader, SectionCard, StatCard, Input, ActionBtn, TabBar,
  EmptyState, Spinner, ErrorBanner, SuccessAlert, Badge,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

// Stable key for an editable stock cell.
const cellKey = (type, id) => `${type}:${id}`;

const InventoryOverview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState({});      // productId -> bool
  const [edits, setEdits]       = useState({});      // cellKey -> value
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await axios.get(`${apiUrl}/inventory`);
      setProducts(r.data || []);
    } catch {
      setError("ইনভেন্টরি লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((s, p) => s + (p.total_stock || 0), 0);
    const lowCount = products.filter(p => p.has_low_stock).length;
    return { totalProducts, totalUnits, lowCount };
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeTab === "low") list = list.filter(p => p.has_low_stock);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => (p.name || "").toLowerCase().includes(q));
    }
    return list;
  }, [products, activeTab, search]);

  const tabs = [
    { key: "all", label: `All Products (${products.length})` },
    { key: "low", label: `Low Stock (${stats.lowCount})` },
  ];

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const setEdit = (type, id, value) => {
    const v = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);
    setEdits(prev => ({ ...prev, [cellKey(type, id)]: v }));
  };

  const getVal = (type, id, fallback) => {
    const k = cellKey(type, id);
    return Object.prototype.hasOwnProperty.call(edits, k) ? edits[k] : fallback;
  };

  // Collect changed cells for a single product into the PUT payload.
  const collectItems = (p) => {
    const items = [];
    const push = (type, id, original) => {
      const k = cellKey(type, id);
      if (Object.prototype.hasOwnProperty.call(edits, k) && edits[k] !== "" && edits[k] !== original) {
        items.push({ variant_type: type, id, stock: edits[k] });
      }
    };

    if (!p.has_variants) {
      push("product", p.id, p.product_stock);
    }
    (p.colors || []).forEach(c => {
      if (c.has_sizes) {
        (c.sizes || []).forEach(s => push("size", s.id, s.stock));
      } else {
        push("color", c.id, c.stock);
      }
    });
    (p.single_sizes || []).forEach(s => push("single_size", s.id, s.stock));
    return items;
  };

  const saveProduct = async (p) => {
    const items = collectItems(p);
    if (items.length === 0) { setSuccess("কোনো পরিবর্তন নেই"); setTimeout(() => setSuccess(null), 1200); return; }
    setSavingId(p.id);
    setError(null);
    try {
      await axios.put(`${apiUrl}/inventory/stock`, { items });
      setSuccess(`"${p.name}" এর স্টক আপডেট হয়েছে`);
      // Clear edits for this product's cells and refresh from server.
      setEdits(prev => {
        const next = { ...prev };
        items.forEach(it => delete next[cellKey(it.variant_type, it.id)]);
        return next;
      });
      await load();
      setTimeout(() => setSuccess(null), 1500);
    } catch {
      setError("স্টক আপডেট ব্যর্থ হয়েছে");
    } finally {
      setSavingId(null);
    }
  };

  const StockInput = ({ type, id, value, low }) => (
    <input
      type="number"
      min={0}
      value={getVal(type, id, value)}
      onChange={e => setEdit(type, id, e.target.value)}
      className={`w-24 rounded-lg border px-2 py-1.5 text-sm text-right outline-none focus:ring-2 focus:ring-indigo-200 ${
        low ? "border-red-300 bg-red-50 text-red-700" : "border-gray-300"
      }`}
    />
  );

  return (
    <div>
      <PageHeader
        title="Inventory / স্টক ম্যানেজমেন্ট"
        subtitle="প্রতিটি প্রোডাক্ট ও ভ্যারিয়েন্টের স্টক দেখুন ও আপডেট করুন"
        icon={Boxes}
        action={
          <ActionBtn variant="secondary" onClick={load} icon={RefreshCw}>রিফ্রেশ</ActionBtn>
        }
      />

      <ErrorBanner message={error} />
      <SuccessAlert message={success} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard title="মোট প্রোডাক্ট" value={stats.totalProducts} icon={Boxes} color="indigo" />
        <StatCard title="মোট ইউনিট (স্টক)" value={stats.totalUnits} icon={Boxes} color="emerald" />
        <StatCard title="Low Stock" value={stats.lowCount} icon={AlertTriangle} color="red" />
      </div>

      <SectionCard>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="প্রোডাক্ট খুঁজুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={28} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Boxes} title="কোনো প্রোডাক্ট নেই" message="এই ফিল্টারে কোনো প্রোডাক্ট পাওয়া যায়নি।" />
        ) : (
          <div className="space-y-3">
            {filtered.map(p => {
              const isOpen = !!expanded[p.id];
              return (
                <div key={p.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggle(p.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isOpen ? <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" /> : <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />}
                      <span className="font-medium text-gray-800 truncate">{p.name}</span>
                      {p.has_low_stock && (
                        <Badge variant="danger" className="ml-1">Low</Badge>
                      )}
                      {!p.has_variants && (
                        <Badge variant="gray" className="ml-1">No variant</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-gray-500">মোট: <span className="font-semibold text-gray-800">{p.total_stock}</span></span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 py-4 space-y-4">
                      {/* No-variant product stock */}
                      {!p.has_variants && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-40">প্রোডাক্ট স্টক (মোট)</span>
                          <StockInput type="product" id={p.id} value={p.product_stock} low={p.product_low} />
                        </div>
                      )}

                      {/* Colors (and their sizes) */}
                      {(p.colors || []).map(c => (
                        <div key={`c-${c.id}`} className="rounded-lg border border-gray-100 p-3">
                          <div className="flex items-center gap-3 mb-2">
                            {c.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={`${imageUrl}/${c.image}`} alt={c.color} className="h-8 w-8 rounded object-cover border" />
                            )}
                            <span className="font-medium text-gray-800">{c.color}</span>
                            {!c.has_sizes && (
                              <div className="ml-auto">
                                <StockInput type="color" id={c.id} value={c.stock} low={c.low} />
                              </div>
                            )}
                          </div>
                          {c.has_sizes && (
                            <div className="flex flex-wrap gap-3">
                              {(c.sizes || []).map(s => (
                                <div key={`s-${s.id}`} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 min-w-[2.5rem]">{s.size}</span>
                                  <StockInput type="size" id={s.id} value={s.stock} low={s.low} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Single sizes (no color) */}
                      {(p.single_sizes || []).length > 0 && (
                        <div className="rounded-lg border border-gray-100 p-3">
                          <span className="text-sm font-medium text-gray-700">সাইজ (কালার ছাড়া)</span>
                          <div className="flex flex-wrap gap-3 mt-2">
                            {p.single_sizes.map(s => (
                              <div key={`ss-${s.id}`} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 min-w-[2.5rem]">{s.size}</span>
                                <StockInput type="single_size" id={s.id} value={s.stock} low={s.low} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <ActionBtn
                          variant="primary"
                          icon={Save}
                          loading={savingId === p.id}
                          onClick={() => saveProduct(p)}
                        >
                          স্টক সেভ করুন
                        </ActionBtn>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default InventoryOverview;
