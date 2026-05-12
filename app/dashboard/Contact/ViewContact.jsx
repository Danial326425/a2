"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateContact from "./UpdateContact";
import { Mail, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog, Badge,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: "", status: true,
  });

  useEffect(() => {
    axios.get(`${apiUrl}/contacts`)
      .then(r => {
        const data = r.data;
        setContacts(Array.isArray(data) ? data : data ? [data] : []);
      })
      .catch(() => setError("Failed to load contacts"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/contactdelete/${deleteTarget}`);
      setContacts(prev => prev.filter(c => c.id !== deleteTarget));
    } catch { setError("Failed to delete contact"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact.id);
    setFormData({
      id: contact.id, name: contact.name, email: contact.email,
      phone: contact.phone, subject: contact.subject, message: contact.message, status: contact.status,
    });
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    try {
      await axios.put(`${apiUrl}/contactsupdate/${id}`, { status: updatedStatus });
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status: updatedStatus } : c));
    } catch { setError("Failed to update status"); }
  };

  const truncate = (str, n = 45) => str && str.length > n ? str.slice(0, n) + "…" : (str || "—");

  return (
    <div>
      <PageHeader
        title="Contact Messages"
        icon={Mail}
        badge={contacts.length}
        subtitle="View and manage customer contact form submissions"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH>Phone</TH>
            <TH>Subject</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : contacts.length === 0 ? (
            <tbody><tr><td colSpan={6}>
              <EmptyState icon={Mail} title="No messages" message="Contact form submissions will appear here." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {contacts.map(contact => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <span className="font-medium text-gray-900 text-sm">{contact.name}</span>
                    </TD>
                    <TD>
                      <a href={`mailto:${contact.email}`} className="text-sm text-indigo-600 hover:underline">
                        {contact.email}
                      </a>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-600">{contact.phone}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-600">{truncate(contact.subject)}</span>
                    </TD>
                    <TD>
                      <button
                        onClick={() => handleStatusToggle(contact.id, contact.status)}
                        className="flex items-center gap-1.5 group"
                        title="Toggle status"
                      >
                        {contact.status ? (
                          <ToggleRight size={20} className="text-emerald-500 group-hover:text-emerald-600" />
                        ) : (
                          <ToggleLeft size={20} className="text-gray-300 group-hover:text-gray-400" />
                        )}
                        <Badge variant={contact.status ? "success" : "danger"}>
                          {contact.status ? "Active" : "Inactive"}
                        </Badge>
                      </button>
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
        title="Delete Contact"
        message="Are you sure you want to delete this contact message?"
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Contact</h2>
                </div>
                <button onClick={() => setEditingContact(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateContact
                  formData={formData}
                  setFormData={setFormData}
                  onUpdate={() => {
                    setContacts(prev => prev.map(c => c.id === editingContact ? { ...c, ...formData } : c));
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

export default ViewContact;
