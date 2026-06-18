"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { ShoppingBag, Check, X, Save } from "lucide-react";
import {
  SectionCard, Badge, Select, Input, Toggle, ActionBtn,
  ErrorBanner, SuccessAlert, Spinner, InfoBox,
} from "../../components/Dashboard/DashUI";
import MessagingGuide from "./MessagingGuide";

const apiUrl = config.apiUrl;

// Sensible defaults used to pre-fill a freshly picked template's variable slots.
const DEFAULT_TOKENS = ["customer_name", "order_id", "product", "total"];

/**
 * Per-status WhatsApp message config. Pick an approved template for each order
 * trigger, then map EACH of the template's {{n}} variables to a dynamic token
 * (or custom text). The number of slots follows the template's own variable
 * count, so any approved template (0..N variables) works.
 */
const MessagingStatusMessages = () => {
  const [rules, setRules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [tokens, setTokens] = useState([]);
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
        setRules((res.data.rules || []).map((r) => ({
          ...r,
          variable_map: Array.isArray(r.variable_map) ? r.variable_map : [],
        })));
        setTemplates(res.data.templates || []);
        setTokens(res.data.tokens || []);
      } catch (e) {
        if (active) setError(e?.response?.data?.message || "Failed to load status messages");
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, []);

  const templateFor = (rule) => templates.find((t) => t.id === rule.template_id) || null;

  const patchRule = (id, patch) =>
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  // Picking a template resizes the variable map to its variable count, keeping
  // any existing choices and pre-filling new slots with sensible defaults.
  const onSelectTemplate = (rule) => (e) => {
    const template_id = e.target.value ? Number(e.target.value) : null;
    const tpl = templates.find((t) => t.id === template_id);
    const count = tpl?.variable_count || 0;
    const next = Array.from({ length: count }, (_, i) =>
      rule.variable_map?.[i] ?? DEFAULT_TOKENS[i] ?? ""
    );
    patchRule(rule.id, { template_id, variable_map: next });
  };

  const setVar = (rule, idx, value) => {
    const next = [...(rule.variable_map || [])];
    next[idx] = value;
    patchRule(rule.id, { variable_map: next });
  };

  const saveRule = async (rule, overrides = {}) => {
    setSavingId(rule.id);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        template_id: rule.template_id,
        variable_map: rule.variable_map || [],
        is_active: rule.is_active,
        ...overrides,
      };
      const res = await axios.put(`${apiUrl}/messaging/status-messages/${rule.id}`, payload);
      const updated = res.data.rule || {};
      patchRule(rule.id, {
        ...updated,
        variable_map: Array.isArray(updated.variable_map) ? updated.variable_map : (payload.variable_map),
      });
      setSuccess(`"${rule.label}" saved`);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  const onToggle = (rule) => () => {
    if (!rule.template_id && !rule.is_active) {
      setError(`Pick a template for "${rule.label}" before turning it on.`);
      return;
    }
    const is_active = !rule.is_active;
    patchRule(rule.id, { is_active });
    saveRule(rule, { is_active });
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
        Choose which WhatsApp message goes out at each order stage, then map the template&apos;s
        variables. The number of variable boxes follows the chosen template — sync templates from
        the <strong>Templates</strong> tab so the counts stay accurate.
      </InfoBox>

      {noTemplates && (
        <InfoBox variant="warning">
          No utility templates yet. Go to the <strong>Templates</strong> tab and click{" "}
          <strong>Sync from Meta</strong> first.
        </InfoBox>
      )}

      <SectionCard noPad>
        <div className="divide-y divide-gray-100">
          {rules.map((rule) => {
            const tpl = templateFor(rule);
            const count = tpl?.variable_count || 0;
            return (
              <div key={rule.id} className="p-4 space-y-3">
                <div className="flex items-center gap-4 flex-wrap">
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
                      onChange={onSelectTemplate(rule)}
                      disabled={savingId === rule.id || noTemplates}
                    >
                      <option value="">— No message —</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.language}, {t.variable_count} var)
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 min-w-[120px] justify-end">
                    {rule.is_active
                      ? <Badge variant="success"><Check size={12} className="inline -mt-0.5" /> On</Badge>
                      : <Badge variant="gray"><X size={12} className="inline -mt-0.5" /> Off</Badge>}
                    <Toggle checked={!!rule.is_active} onChange={onToggle(rule)} />
                  </div>
                </div>

                {/* Variable mapping — one row per {{n}} in the chosen template */}
                {rule.template_id && (
                  <div className="ml-[26px] pl-4 border-l-2 border-gray-100 space-y-2">
                    {tpl?.body && (
                      <p className="text-xs text-gray-500 bg-gray-50 rounded-md px-2.5 py-1.5 whitespace-pre-wrap">
                        {tpl.body}
                      </p>
                    )}

                    {count === 0 ? (
                      <p className="text-xs text-gray-400">This template has no variables — nothing to map.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.from({ length: count }).map((_, idx) => {
                          const entry = rule.variable_map?.[idx] ?? "";
                          const isLiteral = typeof entry === "string" && entry.startsWith("lit:");
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-xs font-mono text-gray-400 w-9 shrink-0">{`{{${idx + 1}}}`}</span>
                              <Select
                                value={isLiteral ? "__custom__" : entry}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setVar(rule, idx, v === "__custom__" ? "lit:" : v);
                                }}
                                disabled={savingId === rule.id}
                              >
                                <option value="">— select —</option>
                                {tokens.map((t) => (
                                  <option key={t.key} value={t.key}>{t.label}</option>
                                ))}
                                <option value="__custom__">Custom text…</option>
                              </Select>
                              {isLiteral && (
                                <Input
                                  value={entry.slice(4)}
                                  onChange={(e) => setVar(rule, idx, "lit:" + e.target.value)}
                                  placeholder="Type text"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <ActionBtn
                        size="sm"
                        icon={Save}
                        onClick={() => saveRule(rule)}
                        loading={savingId === rule.id}
                      >
                        Save message
                      </ActionBtn>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <p className="text-xs text-gray-400">
        Note: the whole engine still respects the master switch (Overview tab) and the spam filter.
        A live message also needs a registered number and a running queue worker.
      </p>
    </div>
  );
};

export default MessagingStatusMessages;
