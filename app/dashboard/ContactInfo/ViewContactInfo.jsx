"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateContactInfo from "./UpdateContactInfo";
import { Phone, Pencil, Trash2, MapPin, Mail } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewContactInfo = () => {
  const [contactInfos, setContactInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ email: "", phone: "", address: "", tnx_number: "" });

  useEffect(() => {
    axios.get(`${apiUrl}/contactinfos`)
      .then(r => setContactInfos(r.data || []))
      .catch(() => setError("Failed to load contact information"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/contactinfodelete/${deleteTarget}`);
      setContactInfos(prev => prev.filter(c => c.id !== deleteTarget));
    } catch { setError("Failed to delete contact information"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact.id);
    setFormData({
      id: contact.id, email: contact.email, phone: contact.phone,
      address: contact.address, tnx_number: contact.tnx_number,
    });
  };

  return (
    <div>
      <PageHeader
        title="Contact Information"
        icon={Phone}
        badge={contactInfos.length}
        subtitle="Manage your store's contact details and transaction number"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Email</TH>
            <TH>Phone</TH>
            <TH>Address</TH>
            <TH>Tnx Number</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={3} cols={5} />
          ) : contactInfos.length === 0 ? (
            <tbody><tr><td colSpan={5}>
              <EmptyState icon={Phone} title="No contact info" message="Add your store's contact information." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {contactInfos.map(contact => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-gray-400 shrink-0" />
                        <a href={`mailto:${contact.email}`} className="text-sm text-indigo-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700">{contact.phone}</span>
                      </div>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-600">{contact.address || "—"}</span>
                      </div>
                    </TD>
                    <TD>
                      <span className="font-mono text-sm text-gray-700">{contact.tnx_number || "—"}</span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(contact)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(contact.id)}
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
        title="Delete Contact Info"
        message="Are you sure you want to delete this contact information?"
        confirmLabel="Delete"
      />

      {editingContact && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Contact Info</h2>
                </div>
                <button onClick={() => setEditingContact(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateContactInfo
                  formData={formData}
                  setFormData={setFormData}
                  onUpdate={() => {
                    setContactInfos(prev => prev.map(c => c.id === editingContact ? { ...c, ...formData } : c));
                    setEditingContact(null);
                  }}
                  onCancel={() => setEditingContact(null)}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewContactInfo;
