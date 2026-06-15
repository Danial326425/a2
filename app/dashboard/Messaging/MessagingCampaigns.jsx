"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Megaphone, Plus, Trash2, Play, Pause } from "lucide-react";
import {
  SectionCard, ActionBtn, Badge, Table, THead, TH, TBody, TR, TD,
  TableSkeleton, EmptyState, ErrorBanner, SuccessAlert, Drawer,
  ConfirmDialog, FormField, Input, Select, InfoBox,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const STATUS_VARIANT = {
  draft: "gray", scheduled: "info", running: "success",
  completed: "purple", paused: "warning",
};

const MessagingCampaigns = () => {
  const [items, setItems] = useState([]);
  const [segments, setSegments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ name: "", segment_id: "", template_id: "", scheduled_at: "" });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, s, t] = await Promise.all([
        axios.get(`${apiUrl}/campaigns`),
        axios.get(`${apiUrl}/segments`),
        axios.get(`${apiUrl}/message-templates`),
      ]);
      setItems(c.data.campaigns || []);
      setSegments(s.data.segments || []);
      // Campaigns send marketing templates only.
      setTemplates((t.data.templates || []).filter((x) => x.category === "marketing"));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        segment_id: form.segment_id,
        template_id: form.template_id,
        channel: "whatsapp",
      };
      if (form.scheduled_at) payload.scheduled_at = form.scheduled_at;
      await axios.post(`${apiUrl}/campaigns`, payload);
      setSuccess("Campaign created");
      setDrawer(false);
      setForm({ name: "", segment_id: "", template_id: "", scheduled_at: "" });
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (campaign, status) => {
    setError(null);
    try {
      await axios.put(`${apiUrl}/campaigns/${campaign.id}/status`, { status });
      setSuccess(`Campaign ${status}`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update campaign");
    }
  };

  const remove = async () => {
    try {
      await axios.delete(`${apiUrl}/campaigns/${toDelete.id}`);
      setSuccess("Campaign deleted");
      setToDelete(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete campaign");
      setToDelete(null);
    }
  };

  const canCreate = segments.length > 0 && templates.length > 0;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      <div className="flex justify-end">
        <ActionBtn icon={Plus} onClick={() => setDrawer(true)} disabled={!canCreate}>New Campaign</ActionBtn>
      </div>

      {!canCreate && !loading && (
        <InfoBox variant="warning">
          You need at least one segment and one <strong>marketing</strong> template before creating a
          campaign.
        </InfoBox>
      )}

      <SectionCard noPad>
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : items.length === 0 ? (
          <EmptyState icon={Megaphone} title="No campaigns yet" message="Create a campaign to drip an approved marketing template to a segment." />
        ) : (
          <Table>
            <THead><TR>
              <TH>Name</TH><TH>Segment</TH><TH>Template</TH><TH>Sent</TH>
              <TH>Status</TH><TH className="text-right">Actions</TH>
            </TR></THead>
            <TBody>
              {items.map((c) => (
                <TR key={c.id}>
                  <TD><span className="font-medium text-gray-800">{c.name}</span></TD>
                  <TD>{c.segment?.name || "—"}</TD>
                  <TD>{c.template?.name || "—"}</TD>
                  <TD>{c.logs_count ?? 0}</TD>
                  <TD><Badge variant={STATUS_VARIANT[c.status] || "gray"}>{c.status}</Badge></TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-1.5">
                      {(c.status === "draft" || c.status === "paused") && (
                        <ActionBtn size="sm" variant="success" icon={Play} onClick={() => setStatus(c, "running")}>Start</ActionBtn>
                      )}
                      {c.status === "running" && (
                        <ActionBtn size="sm" variant="warning" icon={Pause} onClick={() => setStatus(c, "paused")}>Pause</ActionBtn>
                      )}
                      <ActionBtn size="sm" variant="danger" icon={Trash2} onClick={() => setToDelete(c)}>Delete</ActionBtn>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </SectionCard>

      <Drawer isOpen={drawer} onClose={() => setDrawer(false)} title="New Campaign">
        <div className="space-y-4">
          <FormField label="Campaign name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Eid Collection Launch" />
          </FormField>
          <FormField label="Segment" required>
            <Select value={form.segment_id} onChange={(e) => setForm({ ...form, segment_id: e.target.value })}>
              <option value="">Select a segment…</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.contacts_count ?? 0})</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Marketing template" required>
            <Select value={form.template_id} onChange={(e) => setForm({ ...form, template_id: e.target.value })}>
              <option value="">Select a template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Schedule (optional)" hint="Leave empty to start manually. The drip respects daily warm-up caps regardless.">
            <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
          </FormField>
          <InfoBox variant="info">
            Only opted-in, not-opted-out contacts are messaged. Sending is throttled by the server
            warm-up caps and auto-pauses if number quality drops.
          </InfoBox>
          <div className="flex justify-end gap-2 pt-2">
            <ActionBtn variant="secondary" onClick={() => setDrawer(false)}>Cancel</ActionBtn>
            <ActionBtn onClick={create} loading={saving} disabled={!form.name || !form.segment_id || !form.template_id}>Create</ActionBtn>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
        title="Delete campaign?"
        message={`"${toDelete?.name}" and its send logs will be removed.`}
      />
    </div>
  );
};

export default MessagingCampaigns;
