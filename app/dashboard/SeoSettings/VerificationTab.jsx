"use client";

import { ExternalLink } from "lucide-react";
import { FormGrid, Toggle } from "@/app/components/Dashboard/DashUI";
import SeoInput from "./shared/SeoInput";

const LinkHint = ({ href }) => (
  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
    Where to find
    <ExternalLink size={11} />
  </a>
);

export default function VerificationTab({ settings, updateField, errors }) {
  const toggle = (key) => ({
    checked: settings[key] === "1",
    onChange: (event) => updateField(key, event.target.checked ? "1" : "0"),
  });

  return (
    <div className="space-y-5">
      <FormGrid>
        <SeoInput label="Google Search Console" value={settings.google_verification} onChange={(v) => updateField("google_verification", v)} helpText="Paste only the content value from the meta tag." />
        <SeoInput label="Bing Verification Code" value={settings.bing_verification} onChange={(v) => updateField("bing_verification", v)} helpText="Paste only the verification content value." />
      </FormGrid>
      <FormGrid>
        <SeoInput
          label="Facebook Domain Verification"
          value={settings.facebook_domain_verification}
          onChange={(v) => updateField("facebook_domain_verification", v.trim())}
          helpText='শুধু content মানটি দিন (পুরো meta-tag নয়)। যেমন: psshow7j8a0vb1naxhhsjfrjkuz7k4'
        />
      </FormGrid>
      <FormGrid>
        <div className="space-y-3 rounded-xl border border-gray-200 p-4">
          <SeoInput label="Google Analytics ID" value={settings.ga4_id} onChange={(v) => updateField("ga4_id", v.toUpperCase())} error={errors.ga4_id} helpText="G-XXXXXXXXXX format." />
          <Toggle {...toggle("ga4_active")} label="Google Analytics active" description={<LinkHint href="https://analytics.google.com/" />} />
        </div>
        <div className="space-y-3 rounded-xl border border-gray-200 p-4">
          <SeoInput label="Google Tag Manager ID" value={settings.gtm_id} onChange={(v) => updateField("gtm_id", v.toUpperCase())} error={errors.gtm_id} helpText="GTM-XXXXXXX format." />
          <Toggle {...toggle("gtm_active")} label="Google Tag Manager active" description={<LinkHint href="https://tagmanager.google.com/" />} />
        </div>
        <div className="space-y-3 rounded-xl border border-gray-200 p-4">
          <SeoInput label="Facebook Pixel ID" value={settings.facebook_pixel_id} onChange={(v) => updateField("facebook_pixel_id", v.replace(/\D/g, ""))} error={errors.facebook_pixel_id} helpText="Numeric Meta Pixel ID." />
          <Toggle {...toggle("facebook_pixel_active")} label="Facebook Pixel active" description={<LinkHint href="https://business.facebook.com/events_manager" />} />
        </div>
      </FormGrid>
    </div>
  );
}
