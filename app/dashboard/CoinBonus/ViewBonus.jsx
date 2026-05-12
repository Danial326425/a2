"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateBonus from "./UpdateBonus";
import { Coins, Pencil, Trash2, Gift, Percent } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewBonus = () => {
  const [bonus, setBonus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBonus, setEditingBonus] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_reg_bonus: "", bonus_percentage: "", coin_name: "",
  });

  useEffect(() => {
    axios.get(`${apiUrl}/bonuscoins`)
      .then(r => setBonus(r.data?.[0] || null))
      .catch(() => setError("Failed to load bonus settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/bonuscoins/${bonus.id}`);
      setBonus(null);
    } catch { setError("Failed to delete bonus"); }
    finally { setDeleteOpen(false); }
  };

  const handleEditClick = () => {
    setEditingBonus(bonus.id);
    setFormData({
      first_reg_bonus: bonus.first_reg_bonus,
      bonus_percentage: bonus.bonus_percentage,
      coin_name: bonus.coin_name,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingBonus) return;
    try {
      await axios.put(`${apiUrl}/bonuscoins/${editingBonus}`, formData);
      setBonus(prev => ({ ...prev, ...formData }));
      setEditingBonus(null);
    } catch (err) { setError(err.response?.data?.message || "Failed to update bonus"); }
  };

  return (
    <div>
      <PageHeader
        title="Coin Bonus Settings"
        icon={Coins}
        subtitle="Configure registration bonus and purchase reward percentages"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Coin Name</TH>
            <TH>Welcome Bonus</TH>
            <TH>Purchase Bonus %</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={1} cols={4} />
          ) : !bonus ? (
            <tbody><tr><td colSpan={4}>
              <EmptyState icon={Coins} title="No bonus config" message="Configure coin bonus settings for your users." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <motion.tr
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="hover:bg-gray-50/80 transition-colors"
              >
                <TD>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                      <Coins size={13} className="text-yellow-600" />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{bonus.coin_name}</span>
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    <Gift size={13} className="text-emerald-500" />
                    <span className="font-medium text-gray-900">{bonus.first_reg_bonus} coins</span>
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    <Percent size={13} className="text-blue-500" />
                    <span className="font-medium text-gray-900">{bonus.bonus_percentage}%</span>
                  </div>
                </TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={handleEditClick} title="Edit" />
                    <ActionBtn
                      variant="ghost" size="sm" icon={Trash2}
                      onClick={() => setDeleteOpen(true)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    />
                  </div>
                </TD>
              </motion.tr>
            </tbody>
          )}
        </Table>
      </SectionCard>

      <ConfirmDialog
        isOpen={deleteOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        title="Delete Bonus Config"
        message="Are you sure you want to delete the coin bonus configuration?"
        confirmLabel="Delete"
      />

      {editingBonus && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-lg bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                    <Pencil size={15} className="text-yellow-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Bonus Settings</h2>
                </div>
                <button onClick={() => setEditingBonus(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateBonus
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingBonus(null)}
                  loading={loading}
                  setError={setError}
                  error={error}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBonus;
