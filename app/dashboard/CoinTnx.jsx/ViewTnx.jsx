"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateTnx from "./UpdateTnx";
import { ArrowRightLeft, Pencil, Trash2, Plus, Coins, CheckCircle2 } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog, Badge,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewTnx = () => {
  const [tnxes, setTnxes] = useState([]);
  const [packageCoin, setPackageCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTnx, setEditingTnx] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: "", phone: "", wallet_number: "", coin_package_id: "", status: "",
  });

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/coinpackages`),
      axios.get(`${apiUrl}/cointransactions`),
    ])
      .then(([pr, tr]) => {
        setPackageCoin(pr.data || []);
        setTnxes(tr.data || []);
      })
      .catch(() => setError("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/cointransactions/${deleteTarget}`);
      setTnxes(prev => prev.filter(t => t.id !== deleteTarget));
    } catch { setError("Failed to delete transaction"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (tnx) => {
    setEditingTnx(tnx.id);
    setFormData({
      name: tnx.name, phone: tnx.phone, wallet_number: tnx.wallet_number,
      coin_package_id: tnx.coin_package_id, status: tnx.status,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPoints = async (tnx) => {
    const pack = packageCoin.find(p => p.id === tnx.coin_package_id);
    if (!pack) { setError("Package not found"); return; }
    try {
      const pointsRes = await axios.post(`${apiUrl}/users/${tnx.phone}/add-points`, { points: pack.coins });
      await axios.put(`${apiUrl}/cointransactions/${tnx.id}/update-status`);
      setTnxes(prev => prev.map(t => t.id === tnx.id ? { ...t, status: true } : t));
      setError(null);
    } catch (err) { setError(err.response?.data?.message || "Failed to add points"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingTnx) return;
    try {
      await axios.put(`${apiUrl}/cointransactions/${editingTnx}`, formData);
      setTnxes(prev => prev.map(t => t.id === editingTnx ? { ...t, ...formData } : t));
      setEditingTnx(null);
    } catch (err) { setError(err.response?.data?.message || "Failed to update transaction"); }
  };

  const getPkg = (id) => packageCoin.find(p => p.id === id);

  return (
    <div>
      <PageHeader
        title="Coin Transactions"
        icon={ArrowRightLeft}
        badge={tnxes.length}
        subtitle="Manage user coin purchase transactions"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Customer</TH>
            <TH>Wallet</TH>
            <TH>Package</TH>
            <TH>Coins / Price</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : tnxes.length === 0 ? (
            <tbody><tr><td colSpan={6}>
              <EmptyState icon={ArrowRightLeft} title="No transactions" message="Coin purchase transactions will appear here." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {tnxes.map(tnx => {
                  const pkg = getPkg(tnx.coin_package_id);
                  return (
                    <motion.tr
                      key={tnx.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                    >
                      <TD>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{tnx.name}</p>
                          <p className="text-xs text-gray-500">{tnx.phone}</p>
                        </div>
                      </TD>
                      <TD>
                        <span className="font-mono text-sm text-gray-700">{tnx.wallet_number}</span>
                      </TD>
                      <TD>
                        <span className="text-sm text-gray-700">{pkg?.name || "—"}</span>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-1.5">
                          <Coins size={13} className="text-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">{pkg?.coins || "—"}</span>
                          <span className="text-xs text-gray-400">/ ৳{pkg?.price || "—"}</span>
                        </div>
                      </TD>
                      <TD>
                        {tnx.status ? (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 size={14} />
                            <Badge variant="success">Added</Badge>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddPoints(tnx)}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Plus size={12} />
                            Add Points
                          </button>
                        )}
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(tnx)} title="Edit" />
                          <ActionBtn
                            variant="ghost" size="sm" icon={Trash2}
                            onClick={() => setDeleteTarget(tnx.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          />
                        </div>
                      </TD>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          )}
        </Table>
      </SectionCard>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        confirmLabel="Delete"
      />

      {editingTnx && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-lg bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Pencil size={15} className="text-indigo-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Transaction</h2>
                </div>
                <button onClick={() => setEditingTnx(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateTnx
                  formData={formData}
                  setFormData={setFormData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingTnx(null)}
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

export default ViewTnx;
