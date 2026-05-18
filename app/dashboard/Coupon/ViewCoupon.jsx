"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Ticket, Pencil, Trash2, Plus, Search } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Badge, Table, THead, TH, TBody, TR, TD,
  TableSkeleton, EmptyState, ErrorBanner, Drawer, ConfirmDialog, SearchInput, Toggle,
} from "../../components/Dashboard/DashUI";
import CouponForm from "./CouponForm";

const apiUrl = config.apiUrl;

const formatDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const typeBadge = (type) => {
  if (type === "percentage") return <Badge variant="purple">Percentage</Badge>;
  if (type === "free_delivery") return <Badge variant="info">Free Delivery</Badge>;
  return <Badge variant="indigo">Fixed</Badge>;
};

const ViewCoupon = ({ onCreateNew }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/coupons`);
      setCoupons(res.data.coupons || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((c) =>
      (c.code || "").toLowerCase().includes(q) ||
      (c.type || "").toLowerCase().includes(q)
    );
  }, [coupons, search]);

  const toggleActive = async (coupon) => {
    try {
      await axios.put(`${apiUrl}/coupons/${coupon.id}`, {
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value) || 0,
        min_order_amount: coupon.min_order_amount ?? null,
        max_discount: coupon.max_discount ?? null,
        usage_limit: coupon.usage_limit ?? null,
        per_user_limit: coupon.per_user_limit ?? null,
        valid_from: coupon.valid_from,
        valid_to: coupon.valid_to,
        is_active: !coupon.is_active,
        category_ids: (coupon.categories || []).map((c) => c.id),
        product_ids: (coupon.products || []).map((p) => p.id),
      });
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update coupon");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await axios.delete(`${apiUrl}/coupons/${toDelete.id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle="Manage discount and free-delivery coupons"
        icon={Ticket}
        badge={coupons.length}
        action={
          <ActionBtn variant="primary" icon={Plus} onClick={onCreateNew}>
            Add Coupon
          </ActionBtn>
        }
      />

      <ErrorBanner message={error} />

      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or type…"
            className="max-w-xs"
          />
        </div>

        <Table>
          <THead>
            <TH>Code</TH>
            <TH>Type</TH>
            <TH>Value</TH>
            <TH>Min Order</TH>
            <TH>Categories</TH>
            <TH>Validity</TH>
            <TH>Usage</TH>
            <TH>Active</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={5} cols={9} />
          ) : (
            <TBody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={Ticket}
                      title="No coupons yet"
                      message="Create your first coupon to start offering discounts."
                      action={<ActionBtn variant="primary" icon={Plus} onClick={onCreateNew}>Add Coupon</ActionBtn>}
                    />
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <TR key={c.id}>
                  <TD className="font-mono font-semibold text-gray-900">{c.code}</TD>
                  <TD>{typeBadge(c.type)}</TD>
                  <TD>
                    {c.type === "free_delivery" ? "—"
                      : c.type === "percentage" ? `${Number(c.value)}%`
                      : `৳${Number(c.value).toFixed(0)}`}
                  </TD>
                  <TD>{c.min_order_amount ? `৳${Number(c.min_order_amount).toFixed(0)}` : "—"}</TD>
                  <TD>
                    {(c.categories || []).length === 0
                      ? <span className="text-gray-400 text-xs">All</span>
                      : (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {c.categories.slice(0, 2).map((cat) => (
                            <Badge key={cat.id} variant="gray">{cat.name}</Badge>
                          ))}
                          {c.categories.length > 2 && (
                            <Badge variant="gray">+{c.categories.length - 2}</Badge>
                          )}
                        </div>
                      )}
                  </TD>
                  <TD className="text-xs">
                    <div>{formatDate(c.valid_from)}</div>
                    <div className="text-gray-400">→ {formatDate(c.valid_to)}</div>
                  </TD>
                  <TD className="text-xs">
                    {c.used_count || 0}{c.usage_limit ? ` / ${c.usage_limit}` : ""}
                  </TD>
                  <TD>
                    <Toggle
                      checked={!!c.is_active}
                      onChange={() => toggleActive(c)}
                    />
                  </TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setEditing(c)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setToDelete(c)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          )}
        </Table>
      </SectionCard>

      <Drawer
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit Coupon · ${editing.code}` : "Edit Coupon"}
        width="max-w-3xl"
      >
        {editing && (
          <CouponForm
            mode="edit"
            initial={editing}
            onSaved={() => { setEditing(null); load(); }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={!!toDelete}
        title="Delete Coupon"
        message={toDelete ? `Delete coupon "${toDelete.code}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

export default ViewCoupon;
