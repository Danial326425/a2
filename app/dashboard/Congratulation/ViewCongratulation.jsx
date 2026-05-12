"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateCongratulation from "./UpdateCongratulation";
import { PartyPopper, Pencil, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewCongratulation = () => {
  const [congratulations, setCongratulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    headline: "", subHeadline: "", paragraph: "", contactInfoText: "",
  });

  useEffect(() => {
    axios.get(`${apiUrl}/congratulations`)
      .then(r => setCongratulations(r.data?.congratulations || r.data || []))
      .catch(() => setError("Failed to load congratulations"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/congratulationdelete/${deleteTarget}`);
      setCongratulations(prev => prev.filter(i => i.id !== deleteTarget));
    } catch { setError("Failed to delete entry"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (item) => {
    setEditingItem(item.id);
    setFormData({
      headline: item.headline, subHeadline: item.subHeadline,
      paragraph: item.paragraph, contactInfoText: item.contactInfoText,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await axios.put(`${apiUrl}/congratulationsupdate/${editingItem}`, formData);
      setCongratulations(prev => prev.map(i => i.id === editingItem ? { ...i, ...formData } : i));
      setEditingItem(null);
    } catch { setError("Failed to update entry"); }
  };

  const truncate = (str, n = 50) => str && str.length > n ? str.slice(0, n) + "…" : (str || "—");

  return (
    <div>
      <PageHeader
        title="Congratulation Pages"
        icon={PartyPopper}
        badge={congratulations.length}
        subtitle="Manage post-order congratulation messages for customers"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Headline</TH>
            <TH>Sub Headline</TH>
            <TH>Paragraph</TH>
            <TH>Contact Info</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={3} cols={5} />
          ) : congratulations.length === 0 ? (
            <tbody><tr><td colSpan={5}>
              <EmptyState icon={PartyPopper} title="No congratulation pages" message="Create a post-order congratulation message." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {congratulations.map(item => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <span className="font-medium text-gray-900 text-sm">{truncate(item.headline, 35)}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-600">{truncate(item.subHeadline, 35)}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-500">{truncate(item.paragraph)}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-500">{truncate(item.contactInfoText)}</span>
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
        title="Delete Entry"
        message="Are you sure you want to delete this congratulation page?"
        confirmLabel="Delete"
      />

      {editingItem && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Congratulation</h2>
                </div>
                <button onClick={() => setEditingItem(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateCongratulation
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingItem(null)}
                  loading={loading}
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

export default ViewCongratulation;
