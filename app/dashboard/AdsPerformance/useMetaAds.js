'use client';

// Data hooks for the Ads Performance dashboard. Native fetch via axios +
// useState/useEffect (no SWR/React Query dependency in this project).

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { config } from '@/config/config';

const apiUrl = config.apiUrl;

const authHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function getJson(path, { signal } = {}) {
  const res = await axios.get(`${apiUrl}${path}`, { headers: authHeaders(), signal });
  return res.data;
}

// ─── Settings (credentials stored in DB, managed from the dashboard) ───────────
export async function fetchAdsSettings() {
  const res = await axios.get(`${apiUrl}/admin/meta-ads/settings`, { headers: authHeaders() });
  return res.data?.settings || {};
}

export async function saveAdsSettings(payload) {
  const res = await axios.put(`${apiUrl}/admin/meta-ads/settings`, payload, { headers: authHeaders() });
  return res.data;
}

/**
 * Account summary + the daily trend, with a manual refresh and a 15-minute
 * background auto-refresh. `meta` carries { mock, fetched_at, date_preset }.
 */
export function useAdsOverview(datePreset) {
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);
    try {
      const [s, d] = await Promise.all([
        getJson(`/admin/meta-ads/summary?date_preset=${datePreset}`, { signal: controller.signal }),
        getJson(`/admin/meta-ads/daily-breakdown?date_preset=${datePreset}`, { signal: controller.signal }),
      ]);
      if (!s?.success) throw new Error(s?.message || 'Summary লোড করা যায়নি');
      setSummary(s.data || null);
      setMeta(s.meta || null);
      setDaily(Array.isArray(d?.data) ? d.data : []);
      setFetchedAt(new Date());
    } catch (err) {
      if (axios.isCancel?.(err) || err?.name === 'CanceledError') return;
      setError(err?.response?.data?.message || err?.message || 'তথ্য লোড করা যায়নি');
    } finally {
      setIsLoading(false);
    }
  }, [datePreset]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15 * 60 * 1000); // background auto-refresh
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [load]);

  return { summary, daily, meta, isLoading, error, fetchedAt, refetch: load };
}

export function useCampaigns(datePreset) {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getJson(`/admin/meta-ads/campaigns?date_preset=${datePreset}`, { signal: controller.signal });
      if (!res?.success) throw new Error(res?.message || 'Campaign লোড করা যায়নি');
      setCampaigns(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (axios.isCancel?.(err) || err?.name === 'CanceledError') return;
      setError(err?.response?.data?.message || err?.message || 'Campaign লোড করা যায়নি');
    } finally {
      setIsLoading(false);
    }
  }, [datePreset]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { campaigns, isLoading, error, refetch: load };
}

/**
 * Lazy child loader for drilldown rows (ad sets under a campaign, ads under an
 * ad set). Pass `enabled=false` to skip fetching until the row is expanded.
 */
export function useChildren(kind, parentId, datePreset, enabled) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadedKey = useRef(null);

  useEffect(() => {
    if (!enabled || !parentId) return;
    const key = `${kind}:${parentId}:${datePreset}`;
    if (loadedKey.current === key && rows.length) return; // already have it

    const controller = new AbortController();
    const path = kind === 'adsets'
      ? `/admin/meta-ads/adsets/${parentId}?date_preset=${datePreset}`
      : `/admin/meta-ads/ads/${parentId}?date_preset=${datePreset}`;

    setIsLoading(true);
    setError(null);
    getJson(path, { signal: controller.signal })
      .then((res) => {
        if (!res?.success) throw new Error(res?.message || 'লোড করা যায়নি');
        setRows(Array.isArray(res.data) ? res.data : []);
        loadedKey.current = key;
      })
      .catch((err) => {
        if (axios.isCancel?.(err) || err?.name === 'CanceledError') return;
        setError(err?.response?.data?.message || err?.message || 'লোড করা যায়নি');
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [kind, parentId, datePreset, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { rows, isLoading, error };
}
