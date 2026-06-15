"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  MessageCircle, LayoutGrid, FileText, Users, Megaphone, ShieldAlert,
  CheckCircle2, XCircle, Pause, Play, Plug, Power, PowerOff, ListChecks,
} from "lucide-react";
import {
  PageHeader, SectionCard, StatCard, TabBar, Toggle, Badge,
  ErrorBanner, SuccessAlert, Spinner, InfoBox,
} from "../../components/Dashboard/DashUI";
import MessagingTemplates from "./MessagingTemplates";
import MessagingSegments from "./MessagingSegments";
import MessagingCampaigns from "./MessagingCampaigns";
import MessagingConnection from "./MessagingConnection";
import MessagingStatusMessages from "./MessagingStatusMessages";

const apiUrl = config.apiUrl;

const QUALITY_VARIANT = { GREEN: "success", YELLOW: "warning", RED: "danger" };

const Messaging = () => {
  const [tab, setTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "status", label: "Status Messages", icon: ListChecks },
    { key: "templates", label: "Templates", icon: FileText },
    { key: "segments", label: "Segments", icon: Users },
    { key: "campaigns", label: "Campaigns", icon: Megaphone },
    { key: "connection", label: "Connection", icon: Plug },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="WhatsApp Messaging"
        subtitle="Lifecycle messaging — order updates, reviews & repurchase campaigns"
        icon={MessageCircle}
      />

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {tab === "overview" && <Overview />}
      {tab === "status" && <MessagingStatusMessages />}
      {tab === "templates" && <MessagingTemplates />}
      {tab === "segments" && <MessagingSegments />}
      {tab === "campaigns" && <MessagingCampaigns />}
      {tab === "connection" && <MessagingConnection />}
    </div>
  );
};

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiUrl}/messaging/settings`);
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load messaging settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async () => {
    if (!data) return;
    const next = !data.messaging_active;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.put(`${apiUrl}/messaging/settings/active`, { active: next });
      setData((d) => ({ ...d, messaging_active: res.data.messaging_active }));
      setSuccess(res.data.message);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update messaging state");
    } finally {
      setSaving(false);
    }
  };

  const togglePause = async () => {
    if (!data) return;
    const next = !data.marketing_paused;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.put(`${apiUrl}/messaging/settings/pause`, { paused: next });
      setData((d) => ({ ...d, marketing_paused: res.data.marketing_paused }));
      setSuccess(res.data.message);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update pause state");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size={28} /></div>;
  }
  if (error && !data) {
    return <ErrorBanner message={error} />;
  }

  const s = data.stats || {};
  const quality = data.wa_number_quality;

  return (
    <div className="space-y-5">
      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      {/* Master switch — when off, the WHOLE engine stops (utility + marketing). */}
      <div className={`rounded-xl border p-4 ${data.messaging_active ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60"}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {data.messaging_active
              ? <Power size={22} className="text-emerald-600" />
              : <PowerOff size={22} className="text-red-500" />}
            <div>
              <p className="text-sm font-bold text-gray-800">
                WhatsApp Messaging is {data.messaging_active ? "ACTIVE" : "INACTIVE"}
              </p>
              <p className="text-xs text-gray-500">
                {data.messaging_active
                  ? "All order & campaign messages can be sent."
                  : "Everything is paused — no message of any kind will be sent."}
              </p>
            </div>
          </div>
          <Toggle
            checked={!!data.messaging_active}
            onChange={toggleActive}
            label={saving ? "Saving…" : (data.messaging_active ? "Turn OFF" : "Turn ON")}
          />
        </div>
      </div>

      {!data.whatsapp_configured && (
        <InfoBox variant="warning">
          WhatsApp Cloud API credentials are not set yet. Messages will not be delivered until you
          add the access token and phone number ID in the <strong>Connection</strong> tab.
        </InfoBox>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard title="Contacts" value={s.contacts ?? 0} icon={Users} color="indigo" />
        <StatCard title="Opted-in" value={s.opted_in ?? 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Opted-out" value={s.opted_out ?? 0} icon={XCircle} color="red" />
        <StatCard title="Sent today" value={s.sent_today ?? 0} icon={MessageCircle} color="blue" />
        <StatCard title="Marketing today" value={s.marketing_today ?? 0} icon={Megaphone} color="amber" />
      </div>

      <SectionCard>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Number quality</p>
              <p className="text-xs text-gray-400">Last reported by WhatsApp Cloud API</p>
            </div>
          </div>
          {quality
            ? <Badge variant={QUALITY_VARIANT[quality] || "gray"}>{quality}</Badge>
            : <Badge variant="gray">Unknown</Badge>}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {data.marketing_paused
              ? <Pause size={20} className="text-red-500" />
              : <Play size={20} className="text-green-600" />}
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Marketing is {data.marketing_paused ? "paused" : "active"}
              </p>
              <p className="text-xs text-gray-400">
                Utility (order) messages always keep flowing — this only affects marketing sends.
              </p>
            </div>
          </div>
          <Toggle
            checked={!data.marketing_paused}
            onChange={togglePause}
            label={saving ? "Saving…" : (data.marketing_paused ? "Resume marketing" : "Pause marketing")}
          />
        </div>
        {data.env_paused && (
          <p className="mt-3 text-xs text-amber-600">
            Note: a server-level kill-switch (MESSAGING_MARKETING_PAUSED) is on — marketing stays
            paused regardless of this toggle.
          </p>
        )}
      </SectionCard>
    </div>
  );
};

export default Messaging;
