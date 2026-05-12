"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateProductPage from "./UpdateProductPage";
import { Store, Pencil, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewProductPage = () => {
  const [productPages, setProductPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ headline: "", paragraph: "" });

  useEffect(() => {
    axios.get(`${apiUrl}/productpages`)
      .then(r => setProductPages(r.data || []))
      .catch(() => setError("Failed to load product page settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/productpagedelete/${deleteTarget}`);
      setProductPages(prev => prev.filter(p => p.id !== deleteTarget));
    } catch { setError("Failed to delete product page settings"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (page) => {
    setEditingPage(page.id);
    setFormData({ headline: page.headline, paragraph: page.paragraph });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPage) return;
    try {
      await axios.put(`${apiUrl}/productpagesupdate/${editingPage}`, formData);
      setProductPages(prev => prev.map(p => p.id === editingPage ? { ...p, ...formData } : p));
      setEditingPage(null);
    } catch { setError("Failed to update product page settings"); }
  };

  const truncate = (str, n = 60) => str && str.length > n ? str.slice(0, n) + "…" : (str || "—");

  return (
    <div>
      <PageHeader
        title="Product Page Settings"
        icon={Store}
        badge={productPages.length}
        subtitle="Configure the headline and description for your product listing page"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Headline</TH>
            <TH>Paragraph</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={2} cols={3} />
          ) : productPages.length === 0 ? (
            <tbody><tr><td colSpan={3}>
              <EmptyState icon={Store} title="No product page settings" message="Configure your product listing page headline and description." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {productPages.map(page => (
                  <motion.tr
                    key={page.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <span className="font-medium text-gray-900 text-sm">{truncate(page.headline, 45)}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-500">{truncate(page.paragraph)}</span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(page)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(page.id)}
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
        title="Delete Product Page Settings"
        message="Are you sure you want to delete these product page settings?"
        confirmLabel="Delete"
      />

      {editingPage && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Product Page Settings</h2>
                </div>
                <button onClick={() => setEditingPage(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateProductPage
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingPage(null)}
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

export default ViewProductPage;
