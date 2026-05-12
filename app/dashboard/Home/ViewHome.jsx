"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateHome from "./UpdateHome";
import Link from "next/link";
import { LayoutTemplate, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewHome = () => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingHome, setEditingHome] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    headline: "", slug: "", paragraph: "", description: "",
  });

  useEffect(() => {
    axios.get(`${apiUrl}/homepages`)
      .then(r => setHomes(r.data?.homePages || r.data || []))
      .catch(() => setError("Failed to load landing pages"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/homepagedelete/${deleteTarget}`);
      setHomes(prev => prev.filter(h => h.id !== deleteTarget));
    } catch { setError("Failed to delete landing page"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (home) => {
    setEditingHome(home.id);
    setFormData({ headline: home.headline, slug: home.slug, paragraph: home.paragraph, description: home.description });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => setFormData(prev => ({ ...prev, description: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingHome) return;
    try {
      await axios.put(`${apiUrl}/homepagesupdate/${editingHome}`, formData);
      setHomes(prev => prev.map(h => h.id === editingHome ? { ...h, ...formData } : h));
      setEditingHome(null);
    } catch (err) { setError(err.response?.data?.message || "Failed to update landing page"); }
  };

  const truncate = (str, n = 60) => str && str.length > n ? str.slice(0, n) + "…" : (str || "");

  return (
    <div>
      <PageHeader
        title="Landing Pages"
        icon={LayoutTemplate}
        badge={homes.length}
        subtitle="Manage product-specific landing pages with custom content"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Slug</TH>
            <TH>Headline</TH>
            <TH>Paragraph</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={4} cols={4} />
          ) : homes.length === 0 ? (
            <tbody><tr><td colSpan={4}>
              <EmptyState icon={LayoutTemplate} title="No landing pages" message="Create landing pages for your products." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {homes.map(home => (
                  <motion.tr
                    key={home.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <code className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">{home.slug}</code>
                    </TD>
                    <TD>
                      <span className="text-sm font-medium text-gray-900">{truncate(home.headline, 40)}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-500">{truncate(home.paragraph, 55)}</span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/${home.slug}`} target="_blank">
                          <ActionBtn variant="ghost" size="sm" icon={ExternalLink} title="View Page" />
                        </Link>
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(home)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(home.id)}
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
        title="Delete Landing Page"
        message="Are you sure you want to delete this landing page?"
        confirmLabel="Delete"
      />

      {editingHome && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Landing Page</h2>
                </div>
                <button onClick={() => setEditingHome(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateHome
                  formData={formData}
                  handleChange={handleChange}
                  handleQuillChange={handleQuillChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingHome(null)}
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

export default ViewHome;
