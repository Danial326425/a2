"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  HelpCircle, Plus, Pencil, Trash2, ChevronUp, ChevronDown, GripVertical,
} from "lucide-react";
import {
  SectionCard, FormField, Input, Textarea, Toggle, ActionBtn, Badge,
  ErrorBanner, SuccessAlert, EmptyState, ConfirmDialog, Drawer, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const EMPTY = { question: "", answer: "", sort_order: "", is_active: true };

const FaqForm = ({ mode, initial, onSaved, onCancel }) => {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initial) { setForm(EMPTY); return; }
    setForm({
      question:   initial.question   || "",
      answer:     initial.answer     || "",
      sort_order: initial.sort_order ?? "",
      is_active:  !!initial.is_active,
    });
  }, [initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.question.trim()) { setError("Question required"); return; }
    if (!form.answer.trim())   { setError("Answer required");   return; }
    setSubmitting(true);

    const payload = {
      question:   form.question.trim(),
      answer:     form.answer.trim(),
      sort_order: form.sort_order === "" ? null : parseInt(form.sort_order, 10),
      is_active:  !!form.is_active,
    };

    try {
      const res = mode === "edit" && initial
        ? await axios.put(`${apiUrl}/faqs/${initial.id}`, payload)
        : await axios.post(`${apiUrl}/faqs`, payload);
      onSaved?.(res.data?.data);
    } catch (err) {
      const data = err.response?.data;
      const first = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
      setError(first || data?.message || "Failed to save FAQ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorBanner message={error} />

      <FormField label="Question" required>
        <Input
          name="question"
          value={form.question}
          onChange={handleChange}
          placeholder="e.g. কীভাবে অর্ডার করব?"
          maxLength={500}
          required
        />
      </FormField>

      <FormField label="Answer" required hint="Multi-line text — shown when customer clicks the question">
        <Textarea
          name="answer"
          value={form.answer}
          onChange={handleChange}
          rows={6}
          placeholder="বিস্তারিত উত্তর..."
          required
        />
      </FormField>

      <FormGrid>
        <FormField label="Sort Order" hint="Lower number shows first. Leave blank to add to end.">
          <Input
            type="number"
            name="sort_order"
            value={form.sort_order}
            onChange={handleChange}
            placeholder="Auto"
            min="0"
          />
        </FormField>
        <div className="flex items-end">
          <Toggle
            id="is_active"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            label="Active"
            description="Inactive FAQs are hidden from customers"
          />
        </div>
      </FormGrid>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </ActionBtn>
        )}
        <ActionBtn type="submit" variant="primary" loading={submitting}>
          {mode === "edit" ? "Update FAQ" : "Create FAQ"}
        </ActionBtn>
      </div>
    </form>
  );
};

const FaqManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/admin/faqs`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setFaqs(list);
    } catch {
      setError("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2500);
  };

  const toggleActive = async (faq) => {
    try {
      await axios.put(`${apiUrl}/faqs/${faq.id}`, { is_active: !faq.is_active });
      setFaqs((prev) => prev.map((f) => f.id === faq.id ? { ...f, is_active: !f.is_active } : f));
    } catch {
      setError("Failed to update FAQ");
    }
  };

  const move = async (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= faqs.length) return;
    const reordered = [...faqs];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    const items = reordered.map((f, i) => ({ id: f.id, sort_order: i + 1 }));
    setFaqs(reordered.map((f, i) => ({ ...f, sort_order: i + 1 })));
    try {
      await axios.post(`${apiUrl}/faqs/reorder`, { items });
    } catch {
      setError("Failed to reorder FAQs");
      load();
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await axios.delete(`${apiUrl}/faqs/${toDelete.id}`);
      setFaqs((prev) => prev.filter((f) => f.id !== toDelete.id));
      setToDelete(null);
      flashSuccess("FAQ deleted");
    } catch {
      setError("Failed to delete FAQ");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          এই FAQs আপনার Contact Us page-এ accordion হিসেবে দেখানো হবে।
        </p>
        <ActionBtn
          variant="primary"
          icon={Plus}
          onClick={() => { setShowAdd(true); setEditing(null); }}
        >
          Add FAQ
        </ActionBtn>
      </div>

      <ErrorBanner message={error} />
      {success && <SuccessAlert message={success} />}

      {showAdd && (
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">New FAQ</h3>
          <FaqForm
            mode="create"
            initial={null}
            onSaved={() => { setShowAdd(false); load(); flashSuccess("FAQ created"); }}
            onCancel={() => setShowAdd(false)}
          />
        </SectionCard>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
        </div>
      ) : faqs.length === 0 && !showAdd ? (
        <SectionCard>
          <EmptyState
            icon={HelpCircle}
            title="No FAQs yet"
            message="Add frequently asked questions to help customers find answers quickly."
            action={
              <ActionBtn variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>
                Add Your First FAQ
              </ActionBtn>
            }
          />
        </SectionCard>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <SectionCard key={faq.id} className="!p-0 overflow-hidden">
              <div className="flex items-start gap-3 p-4">
                <div className="flex flex-col items-center gap-0.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <GripVertical size={12} className="text-gray-300" />
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === faqs.length - 1}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h4 className="text-sm font-semibold text-gray-900 leading-snug break-words">
                      {faq.question}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={faq.is_active ? "success" : "gray"}>
                        {faq.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="gray">#{faq.sort_order}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-3">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(faq)}
                      className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setToDelete(faq)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Toggle
                    checked={!!faq.is_active}
                    onChange={() => toggleActive(faq)}
                  />
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      <Drawer
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? "Edit FAQ" : ""}
        width="max-w-2xl"
      >
        {editing && (
          <FaqForm
            mode="edit"
            initial={editing}
            onSaved={() => { setEditing(null); load(); flashSuccess("FAQ updated"); }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={!!toDelete}
        title="Delete FAQ"
        message={toDelete ? `Delete "${toDelete.question}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

export default FaqManager;
