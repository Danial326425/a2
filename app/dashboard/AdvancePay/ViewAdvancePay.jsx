"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateAdvancePay from "./UpdateAdvancePay";
import { Wallet, Pencil, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog, Badge,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewAdvancePay = () => {
  const [codAdvances, setCodAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    title: "", sub_title: "", headline: "", pay_amount: "", is_active: true,
  });

  useEffect(() => {
    axios.get(`${apiUrl}/codadvances`)
      .then(r => setCodAdvances(r.data || []))
      .catch(() => setError("Failed to load COD Advances"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/codadvancedelete/${deleteTarget}`);
      setCodAdvances(prev => prev.filter(i => i.id !== deleteTarget));
    } catch { setError("Failed to delete COD Advance"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title, sub_title: item.sub_title, headline: item.headline,
      pay_amount: item.pay_amount, is_active: item.is_active,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await axios.put(`${apiUrl}/codadvancesupdate/${editingId}`, formData);
      setCodAdvances(prev => prev.map(i => i.id === editingId ? { ...i, ...formData } : i));
      setEditingId(null);
    } catch (err) { setError(err.response?.data?.message || "Failed to update COD Advance"); }
  };

  return (
    <div>
      <PageHeader
        title="Advance Pay (COD)"
        icon={Wallet}
        badge={codAdvances.length}
        subtitle="Manage advance payment options for cash-on-delivery orders"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Title</TH>
            <TH>Sub Title</TH>
            <TH>Headline</TH>
            <TH>Pay Amount</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={3} cols={6} />
          ) : codAdvances.length === 0 ? (
            <tbody><tr><td colSpan={6}>
              <EmptyState icon={Wallet} title="No COD advance data" message="Add advance payment options for your customers." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {codAdvances.map(item => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <span className="font-medium text-gray-900 text-sm">{item.title}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-600">{item.sub_title}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-600">{item.headline}</span>
                    </TD>
                    <TD>
                      <span className="font-semibold text-gray-900">৳{item.pay_amount}</span>
                    </TD>
                    <TD>
                      <Badge variant={item.is_active ? "success" : "danger"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(item)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        />
                      </div>
                    </TD>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          )}
        </Table>
      </SectionCard>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete COD Advance"
        message="Are you sure you want to delete this advance payment option?"
        confirmLabel="Delete"
      />

      {editingId && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit COD Advance</h2>
                </div>
                <button onClick={() => setEditingId(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateAdvancePay
                  formData={formData}
                  handleChange={handleChange}
                  handleCheckboxChange={handleCheckboxChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingId(null)}
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

export default ViewAdvancePay;
