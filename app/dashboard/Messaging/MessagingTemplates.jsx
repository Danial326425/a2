"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { FileText, Plus, Trash2, Pencil } from "lucide-react";
import {
  SectionCard, ActionBtn, Badge, Table, THead, TH, TBody, TR, TD,
  TableSkeleton, EmptyState, ErrorBanner, SuccessAlert, Drawer,
  ConfirmDialog, FormField, Input, Select, Textarea,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const EMPTY = {
  name: "", meta_template_name: "", category: "utility",
  channel: "whatsapp", language: "en", status: "approved", body_text: "",
};

const MessagingTemplates = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/message-templates`);
      setItems(res.data.templates || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDrawer(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name || "",
      meta_template_name: t.meta_template_name || "",
      category: t.category || "utility",
      channel: t.channel || "whatsapp",
      language: t.language || "en",
      status: t.status || "approved",
      body_text: t.body_params_schema?.text || "",
    });
    setDrawer(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        meta_template_name: form.meta_template_name,
        category: form.category,
        channel: form.channel,
        language: form.language,
        status: form.status,
        body_params_schema: form.body_text ? { text: form.body_text } : null,
      };
      if (editing) {
        await axios.put(`${apiUrl}/message-templates/${editing.id}`, payload);
        setSuccess("Template updated");
      } else {
        await axios.post(`${apiUrl}/message-templates`, payload);
        setSuccess("Template created");
      }
      setDrawer(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await axios.delete(`${apiUrl}/message-templates/${toDelete.id}`);
      setSuccess("Template deleted");
      setToDelete(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete template");
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      <div className="flex justify-end">
        <ActionBtn icon={Plus} onClick={openCreate}>New Template</ActionBtn>
      </div>

      <SectionCard noPad>
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No templates yet"
            message="Add the Meta-approved templates used for order updates and campaigns."
          />
        ) : (
          <Table>
            <THead><TR>
              <TH>Name</TH><TH>Meta name</TH><TH>Category</TH><TH>Channel</TH>
              <TH>Status</TH><TH className="text-right">Actions</TH>
            </TR></THead>
            <TBody>
              {items.map((t) => (
                <TR key={t.id}>
                  <TD><span className="font-medium text-gray-800">{t.name}</span></TD>
                  <TD>{t.meta_template_name || "—"}</TD>
                  <TD>
                    <Badge variant={t.category === "marketing" ? "orange" : "info"}>
                      {t.category}
                    </Badge>
                  </TD>
                  <TD>{t.channel}</TD>
                  <TD>
                    <Badge variant={t.status === "approved" ? "success" : t.status === "rejected" ? "danger" : "warning"}>
                      {t.status}
                    </Badge>
                  </TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-1.5">
                      <ActionBtn size="sm" variant="secondary" icon={Pencil} onClick={() => openEdit(t)}>Edit</ActionBtn>
                      <ActionBtn size="sm" variant="danger" icon={Trash2} onClick={() => setToDelete(t)}>Delete</ActionBtn>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </SectionCard>

      <Drawer isOpen={drawer} onClose={() => setDrawer(false)} title={editing ? "Edit Template" : "New Template"}>
        <div className="space-y-4">
          <FormField label="Internal name" required hint="Used by the engine (e.g. order_confirmation, growth_repurchase).">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="order_confirmation" />
          </FormField>
          <FormField label="Meta template name" hint="Exact approved template name in WhatsApp Manager.">
            <Input value={form.meta_template_name} onChange={(e) => setForm({ ...form, meta_template_name: e.target.value })} placeholder="order_confirmation" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category" required>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="utility">Utility (order)</option>
                <option value="marketing">Marketing</option>
              </Select>
            </FormField>
            <FormField label="Channel">
              <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Language">
              <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="en" />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </Select>
            </FormField>
          </div>
          <FormField label="SMS body text" hint="Only used for the SMS channel. Use {{1}}, {{2}} for variables.">
            <Textarea rows={3} value={form.body_text} onChange={(e) => setForm({ ...form, body_text: e.target.value })} placeholder="Hi {{1}}, ..." />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <ActionBtn variant="secondary" onClick={() => setDrawer(false)}>Cancel</ActionBtn>
            <ActionBtn onClick={save} loading={saving}>{editing ? "Update" : "Create"}</ActionBtn>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
        title="Delete template?"
        message={`"${toDelete?.name}" will be permanently removed.`}
      />
    </div>
  );
};

export default MessagingTemplates;
