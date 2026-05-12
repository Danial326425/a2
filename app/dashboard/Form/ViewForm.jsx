"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateForm from "./UpdateForm";
import Link from "next/link";
import { ClipboardList, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewForm = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    slug: "", leadHeadline: "", leadButtonHeadline: "", leadButtonSubHeadline: "", redirectPage: "",
  });

  useEffect(() => {
    axios.get(`${apiUrl}/leads`)
      .then(r => setLeads(r.data?.leads || r.data || []))
      .catch(() => setError("Failed to load lead forms"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/leaddelete/${deleteTarget}`);
      setLeads(prev => prev.filter(l => l.id !== deleteTarget));
    } catch { setError("Failed to delete lead form"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (lead) => {
    setEditingLead(lead.id);
    setFormData({
      slug: lead.slug, leadHeadline: lead.leadHeadline,
      leadButtonHeadline: lead.leadButtonHeadline,
      leadButtonSubHeadline: lead.leadButtonSubHeadline, redirectPage: lead.redirectPage,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      await axios.put(`${apiUrl}/leadsupdate/${editingLead}`, formData);
      setLeads(prev => prev.map(l => l.id === editingLead ? { ...l, ...formData } : l));
      setEditingLead(null);
    } catch { setError("Failed to update lead form"); }
  };

  const truncate = (str, n = 40) => str && str.length > n ? str.slice(0, n) + "…" : (str || "—");

  return (
    <div>
      <PageHeader
        title="Lead Forms"
        icon={ClipboardList}
        badge={leads.length}
        subtitle="Manage lead capture forms attached to your products"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Slug</TH>
            <TH>Headline</TH>
            <TH>Button</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={4} cols={4} />
          ) : leads.length === 0 ? (
            <tbody><tr><td colSpan={4}>
              <EmptyState icon={ClipboardList} title="No lead forms" message="Create lead forms to capture customer inquiries." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {leads.map(lead => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <code className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">{lead.slug}</code>
                    </TD>
                    <TD>
                      <span className="text-sm font-medium text-gray-900">{truncate(lead.leadHeadline)}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-600">{truncate(lead.leadButtonHeadline)}</span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/${lead.slug}`} target="_blank">
                          <ActionBtn variant="ghost" size="sm" icon={ExternalLink} title="View Page" />
                        </Link>
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(lead)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(lead.id)}
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
        title="Delete Lead Form"
        message="Are you sure you want to delete this lead form?"
        confirmLabel="Delete"
      />

      {editingLead && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Lead Form</h2>
                </div>
                <button onClick={() => setEditingLead(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingLead(null)}
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

export default ViewForm;
