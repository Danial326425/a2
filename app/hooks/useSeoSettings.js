"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSeoSettings, saveSeoSettings as persistSeoSettings } from "@/app/lib/seo/api";
import { validateSeoSettings } from "@/app/lib/seo/validators";

const DEFAULT_SETTINGS = {
  site_title: "",
  title: "",
  description: "",
  keywords: "",
  canonical_url: "",
  robots_index: "1",
  robots_follow: "1",
  author_name: "",
  language: "bn",
  theme_color: "#111827",
  og_title: "",
  og_description: "",
  og_image: "",
  og_url: "",
  og_type: "website",
  facebook_app_id: "",
  twitter_card: "summary_large_image",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  twitter_handle: "",
  twitter_creator: "",
  favicon: "",
  favicon_png: "",
  apple_touch_icon: "",
  android_chrome_192: "",
  android_chrome_512: "",
  google_verification: "",
  bing_verification: "",
  ga4_id: "",
  ga4_active: "0",
  gtm_id: "",
  gtm_active: "0",
  facebook_pixel_id: "",
  facebook_pixel_active: "0",
  header_scripts: "",
  footer_scripts: "",
  json_ld: "",
  robots_txt: "",
  sitemap_additions: "",
};

const normalize = (data) => ({ ...DEFAULT_SETTINGS, ...(data || {}) });

export default function useSeoSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = normalize(await fetchSeoSettings());
      setSettings(data);
      setSavedSettings(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  const validationErrors = useMemo(() => validateSeoSettings(settings), [settings]);

  const updateField = useCallback((field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }, []);

  const saveSettings = useCallback(async () => {
    const errors = validateSeoSettings(settings);
    if (Object.keys(errors).length) {
      setError("Please fix the highlighted fields before saving");
      return { ok: false, errors };
    }

    const beforeSave = savedSettings;
    setSaving(true);
    setError("");
    setSuccess("");
    setSavedSettings(settings);

    try {
      const persisted = normalize(await persistSeoSettings(settings));
      const next = { ...settings, ...persisted };
      setSettings(next);
      setSavedSettings(next);
      setSuccess("Settings saved successfully");
      return { ok: true };
    } catch (err) {
      setSavedSettings(beforeSave);
      setError(err.response?.data?.message || "Failed to save SEO settings");
      return { ok: false };
    } finally {
      setSaving(false);
    }
  }, [savedSettings, settings]);

  const resetChanges = useCallback(() => {
    setSettings(savedSettings);
    setError("");
    setSuccess("");
  }, [savedSettings]);

  return {
    settings,
    loading,
    saving,
    isDirty,
    updateField,
    saveSettings,
    resetChanges,
    error,
    success,
    validationErrors,
    reload: load,
  };
}
