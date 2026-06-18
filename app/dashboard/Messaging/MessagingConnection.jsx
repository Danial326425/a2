"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { KeyRound, Plug, Copy, Check, ShieldCheck } from "lucide-react";
import {
  SectionCard, ActionBtn, Badge, FormField, Input, Textarea,
  ErrorBanner, SuccessAlert, Spinner, InfoBox,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;
const webhookUrl = `${config.backendUrl}/api/webhooks/whatsapp`;

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const EMPTY = {
  token: "", phone_number_id: "", business_account_id: "",
  api_version: "v21.0", webhook_verify_token: "", app_secret: "",
};

const MessagingConnection = () => {
  const [form, setForm] = useState(EMPTY);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pin, setPin] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${apiUrl}/admin/whatsapp/settings`, { headers: authHeaders() });
        if (!active) return;
        const s = res.data.settings || {};
        setForm({
          token: s.token || "",
          phone_number_id: s.phone_number_id || "",
          business_account_id: s.business_account_id || "",
          api_version: s.api_version || "v21.0",
          webhook_verify_token: s.webhook_verify_token || "",
          app_secret: s.app_secret || "",
        });
        setConfigured(!!s.configured);
      } catch (e) {
        if (active) setError(
          e?.response?.status === 401
            ? "Session expired — please log in again to manage credentials."
            : (e?.response?.data?.message || "Failed to load WhatsApp settings")
        );
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.put(`${apiUrl}/admin/whatsapp/settings`, form, { headers: authHeaders() });
      setConfigured(!!res.data.configured);
      setSuccess("WhatsApp settings saved");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save WhatsApp settings");
    } finally {
      setSaving(false);
    }
  };

  const registerNumber = async () => {
    setError(null);
    setSuccess(null);
    if (!/^\d{6}$/.test(pin)) {
      setError("PIN must be exactly 6 digits.");
      return;
    }
    setRegistering(true);
    try {
      const res = await axios.post(
        `${apiUrl}/admin/whatsapp/register`,
        { pin },
        { headers: authHeaders() }
      );
      setSuccess(res.data.message || "Phone number registered on Cloud API.");
      setConfigured(true);
      setPin("");
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Registration failed. Make sure the token + phone number ID are saved and the number is on the Cloud API."
      );
    } finally {
      setRegistering(false);
    }
  };

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size={28} /></div>;
  }

  return (
    <div className="space-y-5">
      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      <SectionCard>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Plug size={18} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">Cloud API Credentials</h3>
          </div>
          <Badge variant={configured ? "success" : "warning"}>
            {configured ? "Connected" : "Not configured"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField label="Permanent access token" required hint="System-user token from Meta. Stored securely on the server.">
            <Textarea rows={3} value={form.token} onChange={set("token")} placeholder="EAAG..." />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Phone number ID" required>
              <Input value={form.phone_number_id} onChange={set("phone_number_id")} placeholder="1234567890" />
            </FormField>
            <FormField label="Business account ID" hint="WhatsApp Business Account (WABA) ID.">
              <Input value={form.business_account_id} onChange={set("business_account_id")} placeholder="1234567890" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="API version">
              <Input value={form.api_version} onChange={set("api_version")} placeholder="v21.0" />
            </FormField>
            <FormField label="App secret" hint="Used to verify webhook signatures.">
              <Input value={form.app_secret} onChange={set("app_secret")} placeholder="••••••••" />
            </FormField>
          </div>

          <FormField label="Webhook verify token" hint="Any secret string — paste the same value into Meta's webhook setup.">
            <Input value={form.webhook_verify_token} onChange={set("webhook_verify_token")} placeholder="my-verify-token" />
          </FormField>

          <div className="flex justify-end">
            <ActionBtn icon={KeyRound} onClick={save} loading={saving}>Save Credentials</ActionBtn>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center gap-2.5 mb-4">
          <ShieldCheck size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">Register on Cloud API</h3>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          One-time step: registers the saved phone number on the WhatsApp Cloud API and sets its
          two-step verification PIN. Required before the number can send. Save your credentials
          above first.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <FormField label="6-digit PIN" hint="Choose any 6 digits — this becomes the number's two-step PIN. Write it down.">
            <Input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
            />
          </FormField>
          <ActionBtn icon={ShieldCheck} onClick={registerNumber} loading={registering}>
            Register Number
          </ActionBtn>
        </div>

        <InfoBox variant="info" className="mt-3">
          If Meta replies that the number is an <code>SMB</code> / On-Premise account, it isn&apos;t on
          the Cloud API yet — add &amp; verify it in WhatsApp Manager first, then register here.
        </InfoBox>
      </SectionCard>

      <SectionCard>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Webhook setup (in Meta)</h3>
        <p className="text-xs text-gray-500 mb-2">
          In Meta → WhatsApp → Configuration, set the Callback URL below and the Verify Token above,
          then subscribe to <code>messages</code>, <code>message_template_status_update</code> and{" "}
          <code>phone_number_quality_update</code>.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 break-all">
            {webhookUrl}
          </code>
          <ActionBtn size="sm" variant="secondary" icon={copied ? Check : Copy} onClick={copyWebhook}>
            {copied ? "Copied" : "Copy"}
          </ActionBtn>
        </div>
        <InfoBox variant="info" className="mt-3">
          These credentials are stored in the database and take priority over server <code>.env</code>{" "}
          values — no redeploy needed.
        </InfoBox>
      </SectionCard>
    </div>
  );
};

export default MessagingConnection;
