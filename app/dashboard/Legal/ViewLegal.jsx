"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateLegal from "./UpdateLegal";
import Link from "next/link";
import { FileText, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewLegal = () => {
  const [legalPages, setLegalPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLegal, setEditingLegal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ id: "", title: "", content: "", slug: "" });

  useEffect(() => {
    axios.get(`${apiUrl}/legalpages`)
      .then(r => setLegalPages(r.data || []))
      .catch(() => setError("Failed to load legal pages"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/legalpagedelete/${deleteTarget}`);
      setLegalPages(prev => prev.filter(l => l.id !== deleteTarget));
    } catch { setError("Failed to delete legal page"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (legal) => {
    setEditingLegal(legal.id);
    setFormData({ id: legal.id, slug: legal.slug, title: legal.title, content: legal.content });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => setFormData(prev => ({ ...prev, content: value || "" }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/legalpagesupdate/${formData.id}`, formData);
      setLegalPages(prev => prev.map(l => l.id === formData.id ? { ...l, ...formData } : l));
      setEditingLegal(null);
    } catch (err) { setError(err.response?.data?.message || "Failed to update legal page"); }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > 70 ? text.slice(0, 70) + "…" : text;
  };

  return (
    <div>
      <PageHeader
        title="Legal Pages"
        icon={FileText}
        badge={legalPages.length}
        subtitle="Manage privacy policy, terms of service, and other legal documents"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Title</TH>
            <TH>Slug</TH>
            <TH>Preview</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={3} cols={4} />
          ) : legalPages.length === 0 ? (
            <tbody><tr><td colSpan={4}>
              <EmptyState icon={FileText} title="No legal pages" message="Create legal pages like Privacy Policy or Terms of Service." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {legalPages.map(legal => (
                  <motion.tr
                    key={legal.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <span className="font-medium text-gray-900 text-sm">{legal.title}</span>
                    </TD>
                    <TD>
                      <code className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded font-mono">{legal.slug}</code>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-500">{stripHtml(legal.content)}</span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/legal/${legal.slug}`} target="_blank">
                          <ActionBtn variant="ghost" size="sm" icon={ExternalLink} title="View Page" />
                        </Link>
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(legal)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(legal.id)}
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
        title="Delete Legal Page"
        message="Are you sure you want to delete this legal page?"
        confirmLabel="Delete"
      />

      {editingLegal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-xl bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Pencil size={15} className="text-indigo-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Legal Page</h2>
                </div>
                <button onClick={() => setEditingLegal(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateLegal
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  handleQuillChange={handleQuillChange}
                  setEditingLegal={setEditingLegal}
                  onCancel={() => setEditingLegal(null)}
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

export default ViewLegal;
