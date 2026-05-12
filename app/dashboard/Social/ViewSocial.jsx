"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateSocial from "./UpdateSocial";
import { Share2, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog, Badge,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewSocial = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: "", icon_class: "", url: "", status: true,
  });

  useEffect(() => {
    axios.get(`${apiUrl}/sociallinks`)
      .then(r => setSocialLinks(r.data || []))
      .catch(() => setError("Failed to load social links"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/sociallinkdelete/${deleteTarget}`);
      setSocialLinks(prev => prev.filter(l => l.id !== deleteTarget));
    } catch { setError("Failed to delete social link"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (link) => {
    setEditingLink(link.id);
    setFormData({ name: link.name, icon_class: link.icon_class, url: link.url, status: link.status });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingLink) return;
    try {
      await axios.put(`${apiUrl}/sociallinksupdate/${editingLink}`, formData);
      setSocialLinks(prev => prev.map(l => l.id === editingLink ? { ...l, ...formData } : l));
      setEditingLink(null);
    } catch { setError("Failed to update social link"); }
  };

  const truncateUrl = (url) => url && url.length > 32 ? url.slice(0, 32) + "…" : url;

  return (
    <div>
      <PageHeader
        title="Social Links"
        icon={Share2}
        badge={socialLinks.length}
        subtitle="Manage your store's social media profile links"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Platform</TH>
            <TH>Icon Class</TH>
            <TH>URL</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : socialLinks.length === 0 ? (
            <tbody><tr><td colSpan={5}>
              <EmptyState icon={Share2} title="No social links" message="Add your social media profiles to display on the store." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {socialLinks.map(link => (
                  <motion.tr
                    key={link.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <i className={`${link.icon_class} text-indigo-600 text-xs`} />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{link.name}</span>
                      </div>
                    </TD>
                    <TD>
                      <code className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{link.icon_class}</code>
                    </TD>
                    <TD>
                      <a
                        href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        <span>{truncateUrl(link.url)}</span>
                        <ExternalLink size={11} />
                      </a>
                    </TD>
                    <TD>
                      <Badge variant={link.status ? "success" : "danger"}>
                        {link.status ? "Active" : "Inactive"}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(link)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(link.id)}
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
        title="Delete Social Link"
        message="Are you sure you want to delete this social link?"
        confirmLabel="Delete"
      />

      {editingLink && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Social Link</h2>
                </div>
                <button onClick={() => setEditingLink(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateSocial
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingLink(null)}
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

export default ViewSocial;
