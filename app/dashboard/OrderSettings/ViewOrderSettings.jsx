"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Settings2, RefreshCw, ShieldAlert, Truck } from "lucide-react";
import { config } from "../../../config";
import {
  PageHeader, SectionCard, FormField, Input, Toggle, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

/* ── Courier stats progress bar ─────────────────────────────────────────────── */
function CourierStatsBar({ stats, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded w-48" />
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        No dispatched orders found yet.
      </p>
    );
  }

  const { total, delivered, failed, pending, delivered_pct, failed_pct } = stats;
  const pendingPct = Math.max(0, 100 - delivered_pct - failed_pct);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
        {delivered_pct > 0 && (
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${delivered_pct}%` }}
            title={`Delivered: ${delivered_pct}%`}
          />
        )}
        {failed_pct > 0 && (
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${failed_pct}%` }}
            title={`Returned/Cancelled: ${failed_pct}%`}
          />
        )}
        {pendingPct > 0 && (
          <div
            className="h-full bg-gray-300 transition-all duration-500"
            style={{ width: `${pendingPct}%` }}
            title={`Pending: ${pendingPct.toFixed(1)}%`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
          Delivered {delivered_pct}% ({delivered})
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
          Returned/Cancelled {failed_pct}% ({failed})
        </span>
        {pending > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
            Pending ({pending})
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-800">{total}</span> orders dispatched &mdash;&nbsp;
        <span className="font-semibold text-green-700">{delivered}</span> delivered,&nbsp;
        <span className="font-semibold text-red-700">{failed}</span> returned/cancelled
      </p>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
const ViewOrderSettings = () => {
  const [settings, setSettings] = useState({
    ip_limit_enabled: false,
    max_orders_per_ip_per_day: "",
    quantity_limit_enabled: false,
    global_max_per_order: "",
    fraud_percentage_limit: "",
    order_id_prefix: "",
  });
  const [stats, setStats]         = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(false);

  const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    axios
      .get(`${apiUrl}/courier-stats`, { headers: authHeader })
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/order-settings`, { headers: authHeader }),
      axios.get(`${apiUrl}/courier-stats`,  { headers: authHeader }),
    ])
      .then(([settingsRes, statsRes]) => {
        const d = settingsRes.data;
        setSettings({
          ip_limit_enabled:          !!d.ip_limit_enabled,
          max_orders_per_ip_per_day: d.max_orders_per_ip_per_day ?? "",
          quantity_limit_enabled:    !!d.quantity_limit_enabled,
          global_max_per_order:      d.global_max_per_order ?? "",
          fraud_percentage_limit:    d.fraud_percentage_limit ?? "",
          order_id_prefix:           d.order_id_prefix ?? "",
        });
        setStats(statsRes.data);
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => { setLoading(false); setStatsLoading(false); });
  }, []); // eslint-disable-line

  const handleToggle = (key) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await axios.put(
        `${apiUrl}/order-settings`,
        {
          ip_limit_enabled:          settings.ip_limit_enabled,
          max_orders_per_ip_per_day: settings.max_orders_per_ip_per_day !== "" ? Number(settings.max_orders_per_ip_per_day) : null,
          quantity_limit_enabled:    settings.quantity_limit_enabled,
          global_max_per_order:      settings.global_max_per_order !== "" ? Number(settings.global_max_per_order) : null,
          fraud_percentage_limit:    settings.fraud_percentage_limit !== "" ? Number(settings.fraud_percentage_limit) : null,
          order_id_prefix:           settings.order_id_prefix.trim() !== "" ? settings.order_id_prefix.trim().toUpperCase() : null,
        },
        { headers: authHeader }
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Settings"
        subtitle="IP limits, quantity limits, and fraud protection"
        icon={Settings2}
      />

      <ErrorBanner message={error} />

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── IP Order Limit ─────────────────────────────────── */}
        <SectionCard>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">IP-Based Daily Order Limit</h3>
              <p className="text-xs text-gray-500">
                Restrict how many orders a single IP address can place within 24 hours.
              </p>
            </div>
            <Toggle
              id="ip_limit_enabled"
              name="ip_limit_enabled"
              checked={settings.ip_limit_enabled}
              onChange={() => handleToggle("ip_limit_enabled")}
              label="Enable IP order limit"
              description="Block customers who exceed the daily limit from the same IP"
            />
            {settings.ip_limit_enabled && (
              <FormField
                label="Max orders per IP per day"
                hint="Orders from the same IP within the last 24 hours"
              >
                <Input
                  type="number"
                  name="max_orders_per_ip_per_day"
                  value={settings.max_orders_per_ip_per_day}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  min="1"
                  max="1000"
                />
              </FormField>
            )}
          </div>
        </SectionCard>

        {/* ── Quantity Limit ─────────────────────────────────── */}
        <SectionCard>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Per-Order Quantity Limit</h3>
              <p className="text-xs text-gray-500">
                Limit how many units of a product can be ordered at once. Each product can also have its own override.
              </p>
            </div>
            <Toggle
              id="quantity_limit_enabled"
              name="quantity_limit_enabled"
              checked={settings.quantity_limit_enabled}
              onChange={() => handleToggle("quantity_limit_enabled")}
              label="Enable quantity limit"
              description="Reject orders where quantity exceeds the allowed maximum"
            />
            {settings.quantity_limit_enabled && (
              <FormField
                label="Global max quantity per order"
                hint="Applied when a product has no individual override"
              >
                <Input
                  type="number"
                  name="global_max_per_order"
                  value={settings.global_max_per_order}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  min="1"
                  max="1000"
                />
              </FormField>
            )}
          </div>
        </SectionCard>

        {/* ── Order ID Prefix ────────────────────────────────── */}
        <SectionCard>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Order ID Prefix</h3>
              <p className="text-xs text-gray-500">
                অর্ডার আইডির শুরুতে যে অক্ষরগুলো বসবে (যেমন <strong>A2C</strong>1234)। শুধু অক্ষর ও সংখ্যা, সর্বোচ্চ ১০ অক্ষর। খালি রাখলে ডিফল্ট ব্যবহার হবে।
              </p>
            </div>
            <FormField
              label="Prefix"
              hint="e.g. A2C, HA, SHOP — অর্ডার আইডি হবে যেমন A2C12345"
            >
              <Input
                type="text"
                name="order_id_prefix"
                value={settings.order_id_prefix}
                onChange={(e) => setSettings(prev => ({ ...prev, order_id_prefix: e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10) }))}
                placeholder="e.g. A2C"
                maxLength={10}
              />
            </FormField>
            {settings.order_id_prefix.trim() !== "" && (
              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                নতুন অর্ডার আইডি দেখতে হবে যেমন:{" "}
                <strong>{settings.order_id_prefix.trim().toUpperCase()}12345</strong>
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── Fraud Protection ───────────────────────────────── */}
        <SectionCard>
          <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-semibold text-gray-800">Fraud Protection</h3>
              </div>
              <button
                type="button"
                onClick={fetchStats}
                disabled={statsLoading}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-40"
              >
                <RefreshCw className={`w-3 h-3 ${statsLoading ? 'animate-spin' : ''}`} />
                Refresh stats
              </button>
            </div>

            {/* Courier delivery performance */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Courier Delivery Performance
                </span>
              </div>
              <CourierStatsBar stats={stats} loading={statsLoading} />
            </div>

            {/* Spam detection threshold */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Spam Customer Detection</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  A customer is flagged as spam when their delivery success rate (delivered / total finalized) is
                  below this threshold. Requires at least 3 finalized orders before flagging.
                </p>
              </div>
              <FormField
                label="Fraud customer percentage limit (%)"
                hint='Set to 0 or leave blank to disable spam detection'
              >
                <Input
                  type="number"
                  name="fraud_percentage_limit"
                  value={settings.fraud_percentage_limit}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                  min="0"
                  max="100"
                />
              </FormField>
              {settings.fraud_percentage_limit > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-2">
                  Orders from customers with a delivery success rate below{" "}
                  <strong>{settings.fraud_percentage_limit}%</strong> will be automatically tagged as Spam.
                </p>
              )}
            </div>

          </div>
        </SectionCard>

        <div className="flex justify-end">
          <ActionBtn type="submit" loading={saving}>
            Save Settings
          </ActionBtn>
        </div>

      </form>
    </div>
  );
};

export default ViewOrderSettings;
