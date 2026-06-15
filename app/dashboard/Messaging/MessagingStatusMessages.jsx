"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { ListChecks, ShoppingBag, Check, X } from "lucide-react";
import {
  SectionCard, Badge, Select, Toggle, ErrorBanner, SuccessAlert,
  Spinner, InfoBox,
} from "../../components/Dashboard/DashUI";
import MessagingGuide from "./MessagingGuide";

const apiUrl = config.apiUrl;

/**
 * Per-status WhatsApp message config: pick a template for each order trigger
 * (placement + each delivery status) and switch it on/off. Saves per row.
 */
const MessagingStatusMessages = () => {
  const [rules, setRules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/messaging/status-messages`);
        if (!active) return;
        setRules(res.data.rules || []);
        setTemplates(res.data.templates || []);
      } catch (e) {
        if (active) setError(e?.response?.data?.message || "Failed to load status messages");
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, []);

  const saveRule = async (rule, patch) => {
    setSavingId(rule.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.put(`${apiUrl}/messaging/status-messages/${rule.id}`, patch);
      const updated = res.data.rule;
      setRules((rs) => rs.map((r) => (r.id === rule.id ? { ...r, ...updated } : r)));
      setSuccess(`"${rule.label}" updated`);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  const onTemplate = (rule) => (e) => {
    const template_id = e.target.value ? Number(e.target.value) : null;
    saveRule(rule, { template_id, is_active: rule.is_active && !!template_id });
  };

  const onToggle = (rule) => () => {
    if (!rule.template_id && !rule.is_active) {
      setError(`Pick a template for "${rule.label}" before turning it on.`);
      return;
    }
    saveRule(rule, { is_active: !rule.is_active });
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size={28} /></div>;
  }

  const noTemplates = templates.length === 0;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      <MessagingGuide variant="status" />

      <InfoBox variant="info">
        Choose which WhatsApp message goes out at each stage of an order. Only <strong>utility</strong>{" "}
        templates appear here.
      </InfoBox>

      {noTemplates && (
        <InfoBox variant="warning">
          You have no utility templates yet. Create one in the <strong>Templates</strong> tab first.
        </InfoBox>
      )}

      <SectionCard noPad>
        <div className="divide-y divide-gray-100">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-4 p-4 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-[170px]">
                <ShoppingBag size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{rule.label}</p>
                  <p className="text-[11px] text-gray-400">trigger: {rule.trigger}</p>
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <Select
                  value={rule.template_id ?? ""}
                  onChange={onTemplate(rule)}
                  disabled={savingId === rule.id || noTemplates}
                >
                  <option value="">— No message —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center gap-2 min-w-[120px] justify-end">
                {rule.is_active
                  ? <Badge variant="success"><Check size={12} className="inline -mt-0.5" /> On</Badge>
                  : <Badge variant="gray"><X size={12} className="inline -mt-0.5" /> Off</Badge>}
                <Toggle
                  checked={!!rule.is_active}
                  onChange={onToggle(rule)}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <p className="text-xs text-gray-400">
        Note: the whole engine still respects the master switch (Overview tab) and the spam filter.
      </p>
    </div>
  );
};

export default MessagingStatusMessages;
