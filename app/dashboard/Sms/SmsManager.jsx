"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  MessageSquare, Send, Plug, History as HistoryIcon, KeyRound, Wallet,
  Users, Clock, ListChecks, ShoppingBag, Check, X, Save,
} from "lucide-react";
import {
  PageHeader, TabBar, SectionCard, FormField, Input, Textarea, Select,
  ActionBtn, Badge, InfoBox, ErrorBanner, SuccessAlert, Spinner, Toggle,
  Table, THead, TH, TBody, TR, TD,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Audiences the operator can target. "manual" = single / bulk / selected numbers.
const TARGETS = [
  { key: "manual",    label: "Paste numbers (single / bulk / selected)" },
  { key: "delivered", label: "Delivered customers" },
  { key: "partial",   label: "Partial Delivered customers" },
  { key: "confirmed", label: "Confirmed customers" },
  { key: "all",       label: "All customers" },
];

const isUnicode = (s) => /[^\x00-\x7F]/.test(s || "");
const smsSegments = (s) => {
  const len = (s || "").length;
  if (len === 0) return 0;
  const per = isUnicode(s) ? 70 : 160;
  return Math.ceil(len / per);
};

const SmsManager = () => {
  const [tab, setTab] = useState("compose");

  const tabs = [
    { key: "compose", label: "Send SMS", icon: Send },
    { key: "auto", label: "Auto SMS", icon: ListChecks },
    { key: "connection", label: "Connection", icon: Plug },
    { key: "history", label: "History", icon: HistoryIcon },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="SMS"
        subtitle="Send single, bulk & scheduled SMS to customers (Automas gateway)"
        icon={MessageSquare}
      />
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      {tab === "compose" && <Compose />}
      {tab === "auto" && <AutoSms />}
      {tab === "connection" && <Connection />}
      {tab === "history" && <HistoryTab />}
    </div>
  );
};

/* ── Cron setup note (only the "Order Placed" SMS needs it) ───────────────── */

const CRON_CMD =
  "/usr/bin/php /home/u527331782/domains/safwangalaxy.com/public_html/hero/artisan schedule:run >> /dev/null 2>&1";

const PlacedCronNote = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CRON_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-amber-800">
          <Clock size={15} /> “Order Placed” SMS-এর জন্য একটি cron দরকার (একবারই সেট করুন)
        </span>
        <span className="text-amber-700 text-xs">{open ? "লুকান" : "বিস্তারিত"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2 text-amber-900/90 text-[13px] leading-relaxed">
          <p>
            <strong>Delivered / Confirmed ইত্যাদি status SMS আর Schedule SMS</strong>-এর জন্য cron
            লাগে না — ওগুলো সঙ্গে সঙ্গে যায়। শুধু <strong>নতুন অর্ডারের (Order Placed)</strong> SMS
            একটি queue দিয়ে যায়, তাই সার্ভারে প্রতি মিনিটে একটি cron চালু থাকতে হবে।
          </p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Hostinger <strong>hPanel → Advanced → Cron Jobs</strong> এ যান।</li>
            <li>“Custom” বেছে <strong>Command</strong> ঘরে নিচের লাইনটি বসান।</li>
            <li>সময়: <strong>Every Minute</strong> (অথবা Minute/Hour/Day/Month/Weekday সবগুলোতে <code>*</code>)।</li>
            <li><strong>Save</strong> করুন — ব্যস, একবারই।</li>
          </ol>

          <div className="flex items-start gap-2">
            <code className="flex-1 block text-[11px] bg-white border border-amber-200 rounded-md px-2.5 py-2 text-gray-700 break-all">
              {CRON_CMD}
            </code>
            <ActionBtn size="sm" variant="secondary" icon={copied ? Check : ListChecks} onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </ActionBtn>
          </div>

          <p className="text-[12px] text-amber-700">
            নোট: PHP path <code>/usr/bin/php</code> কাজ না করলে hPanel → PHP Configuration থেকে সঠিক
            path বসান। এই একই cron WhatsApp status message ও campaign-ও চালায়।
          </p>
        </div>
      )}
    </div>
  );
};

/* ── Auto SMS (per order status) ──────────────────────────────────────────── */

const AutoSms = () => {
  const [rules, setRules] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${apiUrl}/admin/sms/status-messages`, { headers: authHeaders() });
        setRules(res.data.rules || []);
        setTokens(res.data.tokens || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load auto SMS");
      } finally { setLoading(false); }
    })();
  }, []);

  const patch = (id, p) => setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const save = async (rule, overrides = {}) => {
    setSavingId(rule.id); setError(null); setSuccess(null);
    try {
      const payload = { message: rule.message, is_active: rule.is_active, ...overrides };
      const res = await axios.put(`${apiUrl}/admin/sms/status-messages/${rule.id}`, payload, { headers: authHeaders() });
      patch(rule.id, res.data.rule || payload);
      setSuccess(`"${rule.label}" saved`);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save");
    } finally { setSavingId(null); }
  };

  const toggle = (rule) => () => {
    if (!rule.is_active && !rule.message?.trim()) {
      setError(`Write a message for "${rule.label}" before turning it on.`);
      return;
    }
    const is_active = !rule.is_active;
    patch(rule.id, { is_active });
    save(rule, { is_active });
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size={28} /></div>;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      <InfoBox variant="info">
        Turn on an SMS for each order stage and write its text. Use placeholders{" "}
        {tokens.map((t) => <code key={t} className="mx-0.5 text-[11px] bg-gray-100 px-1 rounded">{t}</code>)}
        — they are filled per order.
      </InfoBox>

      <PlacedCronNote />

      <SectionCard noPad>
        <div className="divide-y divide-gray-100">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag size={16} className="text-gray-400 shrink-0" />
                  <p className="text-sm font-semibold text-gray-800">{rule.label}</p>
                  <span className="text-[11px] text-gray-400">({rule.trigger})</span>
                </div>
                <div className="flex items-center gap-2">
                  {rule.is_active
                    ? <Badge variant="success"><Check size={12} className="inline -mt-0.5" /> On</Badge>
                    : <Badge variant="gray"><X size={12} className="inline -mt-0.5" /> Off</Badge>}
                  <Toggle checked={!!rule.is_active} onChange={toggle(rule)} />
                </div>
              </div>

              <Textarea
                rows={2}
                value={rule.message || ""}
                onChange={(e) => patch(rule.id, { message: e.target.value })}
                placeholder="SMS text…"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  {(rule.message || "").length} chars · {/[^\x00-\x7F]/.test(rule.message || "") ? "Bangla (70/part)" : "English (160/part)"}
                </span>
                <ActionBtn size="sm" icon={Save} onClick={() => save(rule)} loading={savingId === rule.id}>
                  Save
                </ActionBtn>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

/* ── Compose ──────────────────────────────────────────────────────────────── */

const Compose = () => {
  const [target, setTarget] = useState("manual");
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [audienceCount, setAudienceCount] = useState(null);
  const [counting, setCounting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isManual = target === "manual";

  // Live audience count for customer targets (re-runs on target/date change).
  const refreshCount = useCallback(async (t, f, d) => {
    if (t === "manual") { setAudienceCount(null); return; }
    setCounting(true);
    try {
      const params = { target: t };
      if (f) params.from = f;
      if (d) params.to = d;
      const res = await axios.post(`${apiUrl}/admin/sms/audience-count`, params, { headers: authHeaders() });
      setAudienceCount(res.data.count ?? 0);
    } catch {
      setAudienceCount(null);
    } finally {
      setCounting(false);
    }
  }, []);

  useEffect(() => { refreshCount(target, from, to); }, [target, from, to, refreshCount]);

  const manualCount = numbers
    .split(/[\s,;]+/)
    .map((s) => s.replace(/\D/g, ""))
    .filter((s) => /^(0?1[3-9]\d{8}|8801[3-9]\d{8})$/.test(s)).length;

  const recipientCount = isManual ? manualCount : (audienceCount ?? 0);

  const send = async () => {
    setError(null);
    setSuccess(null);
    if (!message.trim()) { setError("Message is required."); return; }
    if (isManual && manualCount === 0) { setError("Enter at least one valid number."); return; }
    if (!isManual && recipientCount === 0) { setError("No customers match this selection."); return; }

    setSending(true);
    try {
      const payload = { message, target };
      if (isManual) payload.numbers = numbers;
      else { if (from) payload.from = from; if (to) payload.to = to; }
      if (scheduledAt) payload.scheduled_at = scheduledAt;

      const res = await axios.post(`${apiUrl}/admin/sms/send`, payload, { headers: authHeaders() });
      setSuccess(res.data.message || "SMS sent");
      if (isManual) setNumbers("");
      setMessage("");
      setScheduledAt("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      <SectionCard>
        <div className="flex items-center gap-2.5 mb-4">
          <Users size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">Recipients</h3>
        </div>

        <FormField label="Send to">
          <Select value={target} onChange={(e) => setTarget(e.target.value)}>
            {TARGETS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </Select>
        </FormField>

        {isManual ? (
          <FormField label="Numbers" hint="One or many — separate by comma, space or new line. Repeat numbers count once.">
            <Textarea rows={4} value={numbers} onChange={(e) => setNumbers(e.target.value)} placeholder="01886888816, 01712345678 …" />
          </FormField>
        ) : (
          <FormField label="Order date range (optional)" hint="Filters the audience by order date. Leave empty for all-time.">
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} max={to || undefined} />
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} min={from || undefined} />
            </div>
          </FormField>
        )}

        <InfoBox variant={recipientCount > 0 ? "info" : "warning"} className="mt-1">
          {counting ? "Counting recipients…" : `${recipientCount} recipient(s) will get this SMS.`}
        </InfoBox>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center gap-2.5 mb-4">
          <MessageSquare size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">Message</h3>
        </div>

        <FormField label="SMS text">
          <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="আপনার মেসেজ লিখুন…" />
        </FormField>
        <div className="flex items-center gap-3 text-xs text-gray-500 -mt-2">
          <span>{message.length} chars</span>
          <span>·</span>
          <span>{smsSegments(message)} SMS part(s)</span>
          <Badge variant={isUnicode(message) ? "orange" : "gray"}>
            {isUnicode(message) ? "Unicode / Bangla (70/part)" : "English (160/part)"}
          </Badge>
        </div>

        <FormField label="Schedule (optional)" hint="Leave empty to send now. Bangladesh time. Scheduled sends need the server cron running (see Auto SMS tab)." className="mt-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400 shrink-0" />
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
        </FormField>

        <div className="flex justify-end pt-2">
          <ActionBtn icon={Send} onClick={send} loading={sending} disabled={recipientCount === 0 || !message.trim()}>
            {scheduledAt ? "Schedule" : "Send"} to {recipientCount || 0}
          </ActionBtn>
        </div>
      </SectionCard>
    </div>
  );
};

/* ── Connection ───────────────────────────────────────────────────────────── */

const Connection = () => {
  const [form, setForm] = useState({ api_key: "", sender_id: "" });
  const [configured, setConfigured] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/admin/sms/settings`, { headers: authHeaders() });
      const s = res.data.settings || {};
      setForm({ api_key: s.api_key || "", sender_id: s.sender_id || "" });
      setConfigured(!!s.configured);
      if (s.configured) {
        try {
          const b = await axios.get(`${apiUrl}/admin/sms/balance`, { headers: authHeaders() });
          setBalance(b.data.balance);
        } catch { /* balance is best-effort */ }
      }
    } catch (e) {
      setError(e?.response?.status === 401
        ? "Session expired — log in again to manage SMS settings."
        : (e?.response?.data?.message || "Failed to load SMS settings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true); setError(null); setSuccess(null);
    try {
      const res = await axios.put(`${apiUrl}/admin/sms/settings`, form, { headers: authHeaders() });
      setConfigured(!!res.data.configured);
      setSuccess("SMS settings saved");
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save SMS settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size={28} /></div>;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      <SectionCard>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Plug size={18} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">Automas SMS credentials</h3>
          </div>
          <div className="flex items-center gap-2">
            {balance != null && (
              <Badge variant="info"><Wallet size={12} className="inline -mt-0.5" /> Balance: {balance}</Badge>
            )}
            <Badge variant={configured ? "success" : "warning"}>{configured ? "Connected" : "Not configured"}</Badge>
          </div>
        </div>

        <FormField label="API key" required hint="From your Automas panel (api-key generate).">
          <Input value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} placeholder="d6a3493c…" />
        </FormField>
        <FormField label="Sender ID" required hint="Approved sender / masking ID (e.g. 8809617632463).">
          <Input value={form.sender_id} onChange={(e) => setForm({ ...form, sender_id: e.target.value })} placeholder="8809617632463" />
        </FormField>

        <div className="flex justify-end">
          <ActionBtn icon={KeyRound} onClick={save} loading={saving}>Save Credentials</ActionBtn>
        </div>

        <InfoBox variant="info" className="mt-3">
          Stored securely in the database. Bangla messages are sent as Unicode automatically.
        </InfoBox>
      </SectionCard>
    </div>
  );
};

/* ── History ──────────────────────────────────────────────────────────────── */

const STATUS_VARIANT = { sent: "success", scheduled: "info", failed: "danger" };

const HistoryTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${apiUrl}/admin/sms/history`, { headers: authHeaders() });
        setLogs(res.data.logs || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={28} /></div>;

  return (
    <SectionCard noPad>
      <Table>
        <THead><TR>
          <TH>When</TH><TH>Target</TH><TH>Recipients</TH><TH>Sent</TH>
          <TH>Status</TH><TH>Message</TH>
        </TR></THead>
        <TBody>
          {logs.length === 0 ? (
            <TR><TD colSpan={6}><span className="text-gray-400">No SMS sent yet.</span></TD></TR>
          ) : logs.map((l) => (
            <TR key={l.id}>
              <TD>{new Date(l.created_at).toLocaleString()}</TD>
              <TD>{l.target}</TD>
              <TD>{l.recipients}</TD>
              <TD>{l.sent}{l.failed ? ` / ${l.failed} failed` : ""}</TD>
              <TD><Badge variant={STATUS_VARIANT[l.status] || "gray"}>{l.status}</Badge></TD>
              <TD><span className="text-gray-600 line-clamp-1 max-w-[240px] inline-block align-bottom">{l.message}</span></TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </SectionCard>
  );
};

export default SmsManager;
