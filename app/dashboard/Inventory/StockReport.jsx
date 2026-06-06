"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { ClipboardList, Download, Search, AlertTriangle } from "lucide-react";
import {
  PageHeader, SectionCard, Input, ActionBtn, Spinner, ErrorBanner,
  EmptyState, Table, THead, TBody, TR, TH, TD, Badge, FilterSelect,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

// Flatten the nested inventory payload into one row per stock-holding leaf.
const flatten = (products) => {
  const rows = [];
  products.forEach(p => {
    if (!p.has_variants) {
      rows.push({
        product: p.name, color: "—", size: "—",
        stock: p.product_stock, low: p.product_low, threshold: p.low_stock_threshold,
      });
    }
    (p.colors || []).forEach(c => {
      if (c.has_sizes) {
        (c.sizes || []).forEach(s => rows.push({
          product: p.name, color: c.color, size: s.size,
          stock: s.stock, low: s.low, threshold: p.low_stock_threshold,
        }));
      } else {
        rows.push({
          product: p.name, color: c.color, size: "—",
          stock: c.stock, low: c.low, threshold: p.low_stock_threshold,
        });
      }
    });
    (p.single_sizes || []).forEach(s => rows.push({
      product: p.name, color: "—", size: s.size,
      stock: s.stock, low: s.low, threshold: p.low_stock_threshold,
    }));
  });
  return rows;
};

const StockReport = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all"); // all | low

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get(`${apiUrl}/inventory`);
        setProducts(r.data || []);
      } catch {
        setError("রিপোর্ট লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => flatten(products), [products]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter === "low") list = list.filter(r => r.low);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r =>
        r.product.toLowerCase().includes(q) ||
        (r.color || "").toLowerCase().includes(q) ||
        (r.size || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, search, filter]);

  const exportCsv = () => {
    const header = ["Product", "Color", "Size", "Stock", "Threshold", "Status"];
    const lines = filtered.map(r => [
      r.product, r.color, r.size, r.stock, r.threshold, r.low ? "Low" : "OK",
    ]);
    const csv = [header, ...lines]
      .map(cols => cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Stock Report"
        subtitle="প্রোডাক্ট, কালার ও সাইজভিত্তিক স্টক রিপোর্ট"
        icon={ClipboardList}
        action={<ActionBtn variant="secondary" icon={Download} onClick={exportCsv} disabled={filtered.length === 0}>CSV এক্সপোর্ট</ActionBtn>}
      />

      <ErrorBanner message={error} />

      <SectionCard>
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9" placeholder="প্রোডাক্ট/কালার/সাইজ..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <FilterSelect value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">সব স্টক</option>
            <option value="low">শুধু Low Stock</option>
          </FilterSelect>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={28} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="কোনো ডেটা নেই" message="এই ফিল্টারে কোনো স্টক রেকর্ড নেই।" />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>প্রোডাক্ট</TH>
                <TH>কালার</TH>
                <TH>সাইজ</TH>
                <TH className="text-right">স্টক</TH>
                <TH>স্ট্যাটাস</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((r, i) => (
                <TR key={i} className={r.low ? "bg-red-50/40" : ""}>
                  <TD className="font-medium text-gray-800">{r.product}</TD>
                  <TD>{r.color}</TD>
                  <TD>{r.size}</TD>
                  <TD className="text-right font-semibold">{r.stock}</TD>
                  <TD>
                    {r.low
                      ? <Badge variant="danger"><AlertTriangle className="h-3 w-3 mr-1" />Low</Badge>
                      : <Badge variant="success">OK</Badge>}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
};

export default StockReport;
