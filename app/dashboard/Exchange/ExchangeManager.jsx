"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { RefreshCw, Save, Trash2, Eye, Power, PowerOff, Image as ImageIcon } from "lucide-react";
import {
  PageHeader, SectionCard, StatCard, ActionBtn, Badge, Table, THead, TH, TBody, TR, TD,
  TableSkeleton, EmptyState, ErrorBanner, SuccessAlert, Drawer, ConfirmDialog,
  FormField, Input, Textarea, Select, Toggle, FilterSelect,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const STATUS_VARIANT = { pending: "warning", approved: "info", completed: "success", rejected: "danger" };
const fmtDate = (v) => (v ? new Date(v).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");

const ExchangeManager = () => {
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [managing, setManaging] = useState(null);
  const [mStatus, setMStatus] = useState("pending");
  const [mNote, setMNote] = useState("");
  const [savingReq, setSavingReq] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const loadRequests = async (status = filter) => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/admin/exchange-requests`, { params: status ? { status } : {} });
      setRequests(res.data.requests || []);
      setCounts(res.data.counts || {});
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await axios.get(`${apiUrl}/admin/exchange-settings`);
        if (active) setSettings(s.data.settings);
      } catch { /* ignore */ }
      if (active) loadRequests("");
    })();
    return () => { active = false; };
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.put(`${apiUrl}/admin/exchange-settings`, settings);
      setSuccess("এক্সচেঞ্জ সেটিংস সেভ হয়েছে");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const applyFilter = (val) => { setFilter(val); loadRequests(val); };

  const openManage = (r) => { setManaging(r); setMStatus(r.status); setMNote(r.admin_note || ""); };

  const saveReq = async () => {
    setSavingReq(true);
    setError(null);
    try {
      await axios.put(`${apiUrl}/admin/exchange-requests/${managing.id}`, { status: mStatus, admin_note: mNote });
      setSuccess("রিকোয়েস্ট আপডেট হয়েছে");
      setManaging(null);
      loadRequests();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update");
    } finally {
      setSavingReq(false);
    }
  };

  const removeReq = async () => {
    try {
      await axios.delete(`${apiUrl}/admin/exchange-requests/${toDelete.id}`);
      setSuccess("Deleted");
      setToDelete(null);
      loadRequests();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete");
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Exchange Requests" subtitle="কাস্টমারের পণ্য এক্সচেঞ্জ অনুরোধ ও সেটিংস" icon={RefreshCw} />

      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      {/* Settings */}
      {settings && (
        <SectionCard>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              {settings.enabled ? <Power size={20} className="text-emerald-600" /> : <PowerOff size={20} className="text-red-500" />}
              <div>
                <p className="text-sm font-semibold text-gray-800">এক্সচেঞ্জ সেবা {settings.enabled ? "চালু" : "বন্ধ"}</p>
                <p className="text-xs text-gray-400">বন্ধ থাকলে ওয়েবসাইট/ফুটারে এক্সচেঞ্জ লিংক দেখাবে না।</p>
              </div>
            </div>
            <Toggle
              checked={!!settings.enabled}
              onChange={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
              label={settings.enabled ? "চালু" : "বন্ধ"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="এক্সচেঞ্জের সময়সীমা (দিন)" hint="অর্ডারের কত দিনের মধ্যে এক্সচেঞ্জ করা যাবে।">
              <Input type="number" min="1" max="90" value={settings.eligibility_days}
                onChange={(e) => setSettings((s) => ({ ...s, eligibility_days: Number(e.target.value) }))} />
            </FormField>
            <FormField label="শুধু Delivered অর্ডার?">
              <div className="pt-2">
                <Toggle
                  checked={!!settings.only_delivered}
                  onChange={() => setSettings((s) => ({ ...s, only_delivered: !s.only_delivered }))}
                  label={settings.only_delivered ? "শুধু Delivered / Partial" : "যেকোনো সাম্প্রতিক অর্ডার"}
                />
              </div>
            </FormField>
          </div>

          <FormField label="নির্দেশনা (ঐচ্ছিক)" hint="এক্সচেঞ্জ ফর্মের উপরে কাস্টমারকে দেখানো হবে।" className="mt-4">
            <Textarea rows={2} value={settings.instructions || ""}
              onChange={(e) => setSettings((s) => ({ ...s, instructions: e.target.value }))}
              placeholder="যেমন: পণ্য অব্যবহৃত ও ট্যাগ সহ থাকতে হবে।" />
          </FormField>

          <div className="flex justify-end mt-4">
            <ActionBtn icon={Save} onClick={saveSettings} loading={savingSettings}>সেটিংস সেভ</ActionBtn>
          </div>
        </SectionCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Pending" value={counts.pending ?? 0} color="amber" />
        <StatCard title="Approved" value={counts.approved ?? 0} color="blue" />
        <StatCard title="Completed" value={counts.completed ?? 0} color="emerald" />
        <StatCard title="Rejected" value={counts.rejected ?? 0} color="red" />
      </div>

      {/* Requests */}
      <div className="flex justify-end">
        <FilterSelect value={filter} onChange={(e) => applyFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </FilterSelect>
      </div>

      <SectionCard noPad>
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : requests.length === 0 ? (
          <EmptyState icon={RefreshCw} title="কোনো রিকোয়েস্ট নেই" message="কাস্টমার এক্সচেঞ্জ রিকোয়েস্ট পাঠালে এখানে দেখাবে।" />
        ) : (
          <Table>
            <THead><TR>
              <TH>কাস্টমার</TH><TH>পণ্য</TH><TH>কারণ</TH><TH>স্ট্যাটাস</TH><TH>সময়</TH><TH className="text-right">অ্যাকশন</TH>
            </TR></THead>
            <TBody>
              {requests.map((r) => (
                <TR key={r.id}>
                  <TD>
                    <span className="font-medium text-gray-800">{r.customer_name || "—"}</span>
                    <p className="text-xs text-gray-400">{r.phone_number} • #{r.order_id}</p>
                  </TD>
                  <TD>{r.product || "—"}</TD>
                  <TD><span className="line-clamp-2 max-w-[220px] text-gray-600">{r.note}</span></TD>
                  <TD><Badge variant={STATUS_VARIANT[r.status] || "gray"}>{r.status}</Badge></TD>
                  <TD className="whitespace-nowrap text-xs text-gray-500">{fmtDate(r.created_at)}</TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-1.5">
                      <ActionBtn size="sm" variant="secondary" icon={Eye} onClick={() => openManage(r)}>দেখুন</ActionBtn>
                      <ActionBtn size="sm" variant="danger" icon={Trash2} onClick={() => setToDelete(r)}>মুছুন</ActionBtn>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </SectionCard>

      {/* Manage drawer */}
      <Drawer isOpen={!!managing} onClose={() => setManaging(null)} title="এক্সচেঞ্জ রিকোয়েস্ট">
        {managing && (
          <div className="space-y-4">
            <div className="text-sm space-y-1">
              <p><span className="text-gray-400">কাস্টমার:</span> <span className="font-medium">{managing.customer_name || "—"}</span></p>
              <p><span className="text-gray-400">ফোন:</span> {managing.phone_number}</p>
              <p><span className="text-gray-400">অর্ডার:</span> #{managing.order_id} — {managing.product || "—"}</p>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
              <p className="text-xs text-gray-400 mb-1">কাস্টমারের কারণ</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{managing.note}</p>
            </div>

            {managing.photo && (
              <a href={`${imageUrl}/${managing.photo}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                <ImageIcon size={16} /> পণ্যের ছবি দেখুন
              </a>
            )}

            <FormField label="স্ট্যাটাস">
              <Select value={mStatus} onChange={(e) => setMStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </Select>
            </FormField>

            <FormField label="অ্যাডমিন নোট (ঐচ্ছিক)">
              <Textarea rows={3} value={mNote} onChange={(e) => setMNote(e.target.value)} placeholder="অভ্যন্তরীণ নোট…" />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <ActionBtn variant="secondary" onClick={() => setManaging(null)}>বাতিল</ActionBtn>
              <ActionBtn onClick={saveReq} loading={savingReq}>সেভ</ActionBtn>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={removeReq}
        title="রিকোয়েস্ট মুছবেন?"
        message="এই এক্সচেঞ্জ রিকোয়েস্টটি স্থায়ীভাবে মুছে যাবে।"
      />
    </div>
  );
};

export default ExchangeManager;
