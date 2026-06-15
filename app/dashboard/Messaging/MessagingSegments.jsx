"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Users, Plus, Trash2, UserPlus, ShoppingBag, Baby } from "lucide-react";
import {
  SectionCard, ActionBtn, Badge, Table, THead, TH, TBody, TR, TD,
  TableSkeleton, EmptyState, ErrorBanner, SuccessAlert, Drawer,
  ConfirmDialog, FormField, Input, Select, Textarea, Toggle, InfoBox,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const MessagingSegments = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [createDrawer, setCreateDrawer] = useState(false);
  const [form, setForm] = useState({ name: "", type: "manual", description: "" });
  const [saving, setSaving] = useState(false);

  const [attachFor, setAttachFor] = useState(null);
  const [phones, setPhones] = useState("");
  const [attachOptIn, setAttachOptIn] = useState(false);
  const [attaching, setAttaching] = useState(false);

  // "Add from orders" — bulk import filtered customers.
  const [importFor, setImportFor] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [totalPhones, setTotalPhones] = useState(0);
  const [importStatus, setImportStatus] = useState("all");
  const [importOptIn, setImportOptIn] = useState(false);
  const [importing, setImporting] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  // "Add by baby age" — target by baby_birth_month age range.
  const [ageFor, setAgeFor] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [withDob, setWithDob] = useState(0);
  const [ageBucket, setAgeBucket] = useState("");
  const [ageOptIn, setAgeOptIn] = useState(false);
  const [importingAge, setImportingAge] = useState(false);
  const [loadingBuckets, setLoadingBuckets] = useState(false);
  // Custom, manually-entered age range
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [customUnit, setCustomUnit] = useState("years");
  const [customCount, setCustomCount] = useState(null);
  const [checkingCount, setCheckingCount] = useState(false);

  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/segments`);
      setItems(res.data.segments || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load segments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/segments`, form);
      setSuccess("Segment created");
      setCreateDrawer(false);
      setForm({ name: "", type: "manual", description: "" });
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create segment");
    } finally {
      setSaving(false);
    }
  };

  const attach = async () => {
    const list = phones.split(/[\s,\n]+/).map((p) => p.trim()).filter(Boolean);
    if (list.length === 0) return;
    setAttaching(true);
    setError(null);
    try {
      const res = await axios.post(`${apiUrl}/segments/${attachFor.id}/contacts`, {
        phones: list,
        wa_opt_in: attachOptIn,
      });
      const skipped = res.data.skipped?.length || 0;
      setSuccess(`${res.data.attached} contact(s) attached${skipped ? `, ${skipped} skipped (invalid)` : ""}`);
      setAttachFor(null);
      setPhones("");
      setAttachOptIn(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to attach contacts");
    } finally {
      setAttaching(false);
    }
  };

  const openImport = async (segment) => {
    setImportFor(segment);
    setImportStatus("all");
    setImportOptIn(false);
    setLoadingStatuses(true);
    try {
      const res = await axios.get(`${apiUrl}/messaging/customer-statuses`);
      setStatuses(res.data.statuses || []);
      setTotalPhones(res.data.total || 0);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load order statuses");
    } finally {
      setLoadingStatuses(false);
    }
  };

  const runImport = async () => {
    setImporting(true);
    setError(null);
    try {
      const res = await axios.post(`${apiUrl}/segments/${importFor.id}/import-customers`, {
        status: importStatus,
        wa_opt_in: importOptIn,
      });
      const skipped = res.data.skipped ? `, ${res.data.skipped} skipped (invalid)` : "";
      setSuccess(`${res.data.attached} customer(s) added to segment${skipped}`);
      setImportFor(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add customers");
    } finally {
      setImporting(false);
    }
  };

  const openAgeImport = async (segment) => {
    setAgeFor(segment);
    setAgeBucket("");
    setAgeOptIn(false);
    setCustomFrom(""); setCustomTo(""); setCustomUnit("years"); setCustomCount(null);
    setLoadingBuckets(true);
    try {
      const res = await axios.get(`${apiUrl}/messaging/age-buckets`);
      setBuckets(res.data.buckets || []);
      setWithDob(res.data.with_birth_month || 0);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load age buckets");
    } finally {
      setLoadingBuckets(false);
    }
  };

  // Resolve the active range (in months) from either a preset or custom inputs.
  const customRange = () => {
    const mult = customUnit === "years" ? 12 : 1;
    if (customFrom === "" || isNaN(Number(customFrom))) return null;
    const min = Math.round(Number(customFrom) * mult);
    const max = customTo === "" || isNaN(Number(customTo)) ? null : Math.round(Number(customTo) * mult);
    return { min, max };
  };

  const onCustomChange = (field, value) => {
    const from = field === "from" ? value : customFrom;
    const to = field === "to" ? value : customTo;
    const unit = field === "unit" ? value : customUnit;
    if (field === "from") setCustomFrom(value);
    if (field === "to") setCustomTo(value);
    if (field === "unit") setCustomUnit(value);

    const mult = unit === "years" ? 12 : 1;
    if (from === "" || isNaN(Number(from))) { setCustomCount(null); return; }
    const min = Math.round(Number(from) * mult);
    const max = to === "" || isNaN(Number(to)) ? null : Math.round(Number(to) * mult);
    fetchCustomCount(min, max);
  };

  const fetchCustomCount = async (min, max) => {
    setCheckingCount(true);
    try {
      const params = { min_months: min };
      if (max !== null) params.max_months = max;
      const res = await axios.get(`${apiUrl}/messaging/age-count`, { params });
      setCustomCount(res.data.count);
    } catch {
      setCustomCount(null);
    } finally {
      setCheckingCount(false);
    }
  };

  const runAgeImport = async () => {
    let range;
    if (ageBucket === "custom") {
      range = customRange();
    } else {
      const b = buckets.find((x) => x.key === ageBucket);
      range = b ? { min: b.min, max: b.max } : null;
    }
    if (!range) return;

    setImportingAge(true);
    setError(null);
    try {
      const res = await axios.post(`${apiUrl}/segments/${ageFor.id}/import-by-age`, {
        min_months: range.min,
        max_months: range.max,
        wa_opt_in: ageOptIn,
      });
      setSuccess(`${res.data.attached} customer(s) added to segment`);
      setAgeFor(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add by age");
    } finally {
      setImportingAge(false);
    }
  };

  const isCustom = ageBucket === "custom";
  const ageSelectedCount = isCustom
    ? (customCount ?? 0)
    : (buckets.find((x) => x.key === ageBucket)?.count ?? 0);

  // Count shown for the currently-selected filter.
  const selectedCount =
    importStatus === "all"
      ? totalPhones
      : (statuses.find((s) => (s.status ?? "__none__") === importStatus)?.phones ?? 0);

  const remove = async () => {
    try {
      await axios.delete(`${apiUrl}/segments/${toDelete.id}`);
      setSuccess("Segment deleted");
      setToDelete(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete segment");
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {success && <SuccessAlert message={success} />}

      <div className="flex justify-end">
        <ActionBtn icon={Plus} onClick={() => setCreateDrawer(true)}>New Segment</ActionBtn>
      </div>

      <SectionCard noPad>
        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={Users} title="No segments yet" message="Create a segment, then attach opted-in contacts to target with campaigns." />
        ) : (
          <Table>
            <THead><TR>
              <TH>Name</TH><TH>Type</TH><TH>Contacts</TH><TH className="text-right">Actions</TH>
            </TR></THead>
            <TBody>
              {items.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <span className="font-medium text-gray-800">{s.name}</span>
                    {s.description && <p className="text-xs text-gray-400">{s.description}</p>}
                  </TD>
                  <TD><Badge variant={s.type === "bulk" ? "orange" : s.type === "lifecycle" ? "purple" : "gray"}>{s.type}</Badge></TD>
                  <TD>{s.contacts_count ?? 0}</TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-1.5">
                      <ActionBtn size="sm" variant="secondary" icon={ShoppingBag} onClick={() => openImport(s)}>Add from orders</ActionBtn>
                      <ActionBtn size="sm" variant="secondary" icon={Baby} onClick={() => openAgeImport(s)}>Add by age</ActionBtn>
                      <ActionBtn size="sm" variant="secondary" icon={UserPlus} onClick={() => { setAttachFor(s); setPhones(""); setAttachOptIn(false); }}>Add phones</ActionBtn>
                      <ActionBtn size="sm" variant="danger" icon={Trash2} onClick={() => setToDelete(s)}>Delete</ActionBtn>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </SectionCard>

      {/* Create segment */}
      <Drawer isOpen={createDrawer} onClose={() => setCreateDrawer(false)} title="New Segment">
        <div className="space-y-4">
          <FormField label="Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Eid Promo — Opted-in" />
          </FormField>
          <FormField label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="manual">Manual</option>
              <option value="bulk">Bulk (cold / SMS)</option>
              <option value="lifecycle">Lifecycle</option>
            </Select>
          </FormField>
          <FormField label="Description">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <ActionBtn variant="secondary" onClick={() => setCreateDrawer(false)}>Cancel</ActionBtn>
            <ActionBtn onClick={create} loading={saving}>Create</ActionBtn>
          </div>
        </div>
      </Drawer>

      {/* Attach contacts */}
      <Drawer isOpen={!!attachFor} onClose={() => setAttachFor(null)} title={`Add contacts → ${attachFor?.name || ""}`}>
        <div className="space-y-4">
          <FormField label="Phone numbers" required hint="One per line or comma-separated. Invalid BD numbers are skipped.">
            <Textarea rows={6} value={phones} onChange={(e) => setPhones(e.target.value)} placeholder={"01711111111\n01822222222"} />
          </FormField>
          <Toggle
            checked={attachOptIn}
            onChange={() => setAttachOptIn((v) => !v)}
            label="These contacts have opted in to marketing"
            description="Only enable for genuinely opted-in lists. Cold lists must stay off — they will route to SMS, never WhatsApp marketing."
          />
          {!attachOptIn && (
            <InfoBox variant="info">
              Without opt-in, these contacts can receive utility messages and SMS only — never
              WhatsApp marketing.
            </InfoBox>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <ActionBtn variant="secondary" onClick={() => setAttachFor(null)}>Cancel</ActionBtn>
            <ActionBtn onClick={attach} loading={attaching}>Attach</ActionBtn>
          </div>
        </div>
      </Drawer>

      {/* Add by baby age */}
      <Drawer isOpen={!!ageFor} onClose={() => setAgeFor(null)} title={`Add by baby age → ${ageFor?.name || ""}`}>
        <div className="space-y-4">
          <FormField label="Baby age range" hint="Age is calculated from the baby's birth month (entered on the order).">
            <Select value={ageBucket} onChange={(e) => setAgeBucket(e.target.value)} disabled={loadingBuckets}>
              <option value="">Select an age range…</option>
              {buckets.map((b) => (
                <option key={b.key} value={b.key}>{b.label} ({b.count})</option>
              ))}
              <option value="custom">✏️ Custom range…</option>
            </Select>
          </FormField>

          {isCustom && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
              <div className="grid grid-cols-3 gap-2 items-end">
                <FormField label="From">
                  <Input type="number" min="0" value={customFrom} onChange={(e) => onCustomChange("from", e.target.value)} placeholder="1" />
                </FormField>
                <FormField label="To (optional)">
                  <Input type="number" min="0" value={customTo} onChange={(e) => onCustomChange("to", e.target.value)} placeholder="2" />
                </FormField>
                <FormField label="Unit">
                  <Select value={customUnit} onChange={(e) => onCustomChange("unit", e.target.value)}>
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </Select>
                </FormField>
              </div>
              <p className="text-xs text-gray-400">
                e.g. <strong>1–2 years</strong> → From 1, To 2. Leave <strong>To</strong> empty for “1 year and above”.
              </p>
            </div>
          )}

          {withDob === 0 ? (
            <InfoBox variant="warning">
              No customer has a baby birth month saved yet. Add it on an order (Orders → edit → WhatsApp
              Marketing) by asking the customer over the phone — then they’ll show up here.
            </InfoBox>
          ) : (
            <InfoBox variant={ageSelectedCount > 0 ? "info" : "warning"}>
              {(loadingBuckets || checkingCount)
                ? "Checking…"
                : ageBucket
                  ? `${ageSelectedCount} customer(s) in this age range will be added.`
                  : `${withDob} customer(s) have a birth month saved. Pick a range above.`}
            </InfoBox>
          )}

          <Toggle
            checked={ageOptIn}
            onChange={() => setAgeOptIn((v) => !v)}
            label="Mark these customers as opted in to marketing"
            description="Needed to send them WhatsApp campaigns. Enable only if they consented."
          />

          <div className="flex justify-end gap-2 pt-2">
            <ActionBtn variant="secondary" onClick={() => setAgeFor(null)}>Cancel</ActionBtn>
            <ActionBtn onClick={runAgeImport} loading={importingAge} disabled={!ageBucket || ageSelectedCount === 0}>
              Add {ageSelectedCount > 0 ? ageSelectedCount : ""} to segment
            </ActionBtn>
          </div>
        </div>
      </Drawer>

      {/* Add from orders (bulk import by status) */}
      <Drawer isOpen={!!importFor} onClose={() => setImportFor(null)} title={`Add from orders → ${importFor?.name || ""}`}>
        <div className="space-y-4">
          <FormField label="Which orders?" hint="Customers are deduped by phone — repeat buyers count once.">
            <Select value={importStatus} onChange={(e) => setImportStatus(e.target.value)} disabled={loadingStatuses}>
              <option value="all">All orders ({totalPhones})</option>
              {statuses.map((s) => (
                <option key={s.status ?? "__none__"} value={s.status ?? "__none__"}>
                  {(s.status ?? "No status")} ({s.phones})
                </option>
              ))}
            </Select>
          </FormField>

          <InfoBox variant={selectedCount > 0 ? "info" : "warning"}>
            {loadingStatuses
              ? "Loading order counts…"
              : `${selectedCount} unique customer(s) will be added to this segment.`}
          </InfoBox>

          <Toggle
            checked={importOptIn}
            onChange={() => setImportOptIn((v) => !v)}
            label="Mark these customers as opted in to marketing"
            description="Only enable if they consented. Without opt-in they can receive utility + SMS, but never WhatsApp marketing."
          />

          <div className="flex justify-end gap-2 pt-2">
            <ActionBtn variant="secondary" onClick={() => setImportFor(null)}>Cancel</ActionBtn>
            <ActionBtn onClick={runImport} loading={importing} disabled={loadingStatuses || selectedCount === 0}>
              Add {selectedCount > 0 ? selectedCount : ""} to segment
            </ActionBtn>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
        title="Delete segment?"
        message={`"${toDelete?.name}" and its contact memberships will be removed.`}
      />
    </div>
  );
};

export default MessagingSegments;
