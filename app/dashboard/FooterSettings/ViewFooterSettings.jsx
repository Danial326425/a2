"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Copyright, Eye } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Textarea, ActionBtn,
  ErrorBanner, SuccessAlert, InfoBox,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

/**
 * Dedicated Footer settings page. Currently just the copyright editor — kept
 * as its own page (instead of nested under Contact Us) so admins can find it
 * with one click from the sidebar.
 *
 * Persists to the existing `contact_infos.copyright_html` column; reuses the
 * existing `flushHomepageCache()` server-side so updates appear instantly on
 * the storefront footer without a manual refresh.
 */
const ViewFooterSettings = () => {
  const [copyrightHtml, setCopyrightHtml] = useState("");
  const [currentId, setCurrentId]         = useState(null);
  const [otherFields, setOtherFields]     = useState(null); // preserve email/phone/address on save
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/contactinfos`)
      .then((res) => {
        const list  = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const first = list[0];
        if (first) {
          setCurrentId(first.id);
          setCopyrightHtml(first.copyright_html || "");
          // Hold onto the other fields so we don't accidentally blank them on save
          setOtherFields({
            email:      first.email      || "",
            phone:      first.phone      || "",
            address:    first.address    || "",
            tnx_number: first.tnx_number || "",
          });
        }
      })
      .catch(() => setError("Failed to load footer settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const payload = {
      ...(otherFields || {}),
      copyright_html: copyrightHtml,
    };

    try {
      const res = currentId
        ? await axios.put(`${apiUrl}/contactinfosupdate/${currentId}`, payload)
        : await axios.post(`${apiUrl}/contactinfos`, payload);
      const saved = res.data?.data;
      if (saved?.id) setCurrentId(saved.id);
      setSuccess("Copyright text saved — storefront footer updated.");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      const d = err.response?.data;
      setError(d?.errors ? Object.values(d.errors)[0]?.[0] : (d?.message || "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Footer Settings"
        subtitle="Copyright text shown at the bottom of every storefront page"
        icon={Copyright}
      />

      <ErrorBanner message={error} />
      {success && <SuccessAlert message={success} />}

      <InfoBox variant="tip">
        HTML allowed inside the copyright text. Use{" "}
        <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-indigo-200">
          &lt;a href="..."&gt;...&lt;/a&gt;
        </code>{" "}
        for clickable links. Leave blank to fall back to a generated default
        (<code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-indigo-200">
          &copy; {currentYear} All Rights Reserved.
        </code>).
      </InfoBox>

      <SectionCard>
        <form onSubmit={handleSave} className="space-y-5">
          <FormField
            label="Copyright Text"
            hint='Example: &copy; 2026 Your Store. Built with love by <a href="https://example.com">Team X</a>.'
          >
            <Textarea
              value={copyrightHtml}
              onChange={(e) => setCopyrightHtml(e.target.value)}
              rows={4}
              placeholder={`&copy; ${currentYear} Your Store. All rights reserved.`}
              className="font-mono text-xs"
            />
          </FormField>

          {/* Live preview matching the actual footer's dark-gradient look so
              admin can see exactly what the customer will see. */}
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              <Eye size={12} /> Live Preview
            </p>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#0c2240] via-[#1a3453] to-[#001f41] p-5">
              <div className="border-t border-white/10 pt-3">
                <div
                  className="text-center text-sm text-gray-300 [&_a]:text-white [&_a]:font-semibold [&_a:hover]:text-green-300 [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{
                    __html: copyrightHtml?.trim()
                      ? copyrightHtml
                      : `&copy; ${currentYear} All Rights Reserved.`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {currentId ? `Editing record · ID #${currentId}` : "Creating new record"}
            </p>
            <ActionBtn type="submit" variant="primary" loading={saving}>
              Save Copyright Text
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default ViewFooterSettings;
