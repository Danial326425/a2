"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Gift, Pencil, Trash2, Plus } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Badge, Table, THead, TH, TBody, TR, TD,
  TableSkeleton, EmptyState, ErrorBanner, Drawer, ConfirmDialog, Toggle, InfoBox,
} from "../../components/Dashboard/DashUI";
import CartRewardForm from "./CartRewardForm";

const apiUrl = config.apiUrl;

const ViewCartReward = ({ onCreateNew }) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/cart-rewards`);
      setRewards(res.data.rewards || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reward tiers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (r) => {
    try {
      await axios.put(`${apiUrl}/cart-rewards/${r.id}`, {
        min_amount: Number(r.min_amount),
        discount_type: r.discount_type,
        discount_value: Number(r.discount_value),
        max_discount: r.max_discount ?? null,
        label: r.label ?? null,
        sort_order: r.sort_order ?? 0,
        is_active: !r.is_active,
      });
      setRewards((prev) => prev.map((x) => x.id === r.id ? { ...x, is_active: !x.is_active } : x));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update tier");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await axios.delete(`${apiUrl}/cart-rewards/${toDelete.id}`);
      setRewards((prev) => prev.filter((r) => r.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete tier");
    }
  };

  return (
    <div>
      <PageHeader
        title="Cart Reward Tiers"
        subtitle="Automatic discounts based on cart total — drives the cart panel progress bar"
        icon={Gift}
        badge={rewards.length}
        action={
          <ActionBtn variant="primary" icon={Plus} onClick={onCreateNew}>
            Add Tier
          </ActionBtn>
        }
      />

      <ErrorBanner message={error} />

      <div className="mb-4">
        <InfoBox variant="tip">
          Tiers stack vertically — only the single highest tier the customer qualifies for is applied. Sort tiers by minimum amount for predictable behavior.
        </InfoBox>
      </div>

      <SectionCard>
        <Table>
          <THead>
            <TH>Min Cart Amount</TH>
            <TH>Discount Type</TH>
            <TH>Discount Value</TH>
            <TH>Max Cap</TH>
            <TH>Label</TH>
            <TH>Sort</TH>
            <TH>Active</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={4} cols={8} />
          ) : (
            <TBody>
              {rewards.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Gift}
                      title="No reward tiers yet"
                      message="Add your first cart-amount-based discount tier."
                      action={<ActionBtn variant="primary" icon={Plus} onClick={onCreateNew}>Add Tier</ActionBtn>}
                    />
                  </td>
                </tr>
              ) : rewards.map((r) => (
                <TR key={r.id}>
                  <TD className="font-semibold text-gray-900">৳{Number(r.min_amount).toFixed(0)}</TD>
                  <TD>
                    {r.discount_type === "percentage"
                      ? <Badge variant="purple">Percentage</Badge>
                      : <Badge variant="indigo">Fixed</Badge>}
                  </TD>
                  <TD>
                    {r.discount_type === "percentage"
                      ? `${Number(r.discount_value)}%`
                      : `৳${Number(r.discount_value).toFixed(0)}`}
                  </TD>
                  <TD>{r.max_discount ? `৳${Number(r.max_discount).toFixed(0)}` : "—"}</TD>
                  <TD className="text-xs text-gray-600 max-w-[200px] truncate">{r.label || "—"}</TD>
                  <TD>{r.sort_order ?? 0}</TD>
                  <TD>
                    <Toggle
                      checked={!!r.is_active}
                      onChange={() => toggleActive(r)}
                    />
                  </TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setEditing(r)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setToDelete(r)}
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
        title="Edit Cart Reward Tier"
        width="max-w-2xl"
      >
        {editing && (
          <CartRewardForm
            mode="edit"
            initial={editing}
            onSaved={() => { setEditing(null); load(); }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={!!toDelete}
        title="Delete Reward Tier"
        message={toDelete ? `Delete tier "৳${Number(toDelete.min_amount).toFixed(0)}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

export default ViewCartReward;
