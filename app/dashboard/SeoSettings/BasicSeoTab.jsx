"use client";

import { FormGrid, FormField, Select, Input } from "@/app/components/Dashboard/DashUI";
import SeoInput from "./shared/SeoInput";
import SeoTextarea from "./shared/SeoTextarea";
import SeoPreview from "./SeoPreview";

export default function BasicSeoTab({ settings, updateField, errors }) {
  const robots = `${settings.robots_index === "0" ? "noindex" : "index"},${settings.robots_follow === "0" ? "nofollow" : "follow"}`;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <FormGrid>
          <SeoInput label="Website Title" value={settings.site_title} onChange={(v) => updateField("site_title", v)} maxLength={60} recommendedRange={[50, 60]} helpText="Used as the global site name." />
          <SeoInput label="Default Meta Title" value={settings.title} onChange={(v) => updateField("title", v)} maxLength={60} recommendedRange={[50, 60]} helpText="Appears as the main title in search results." />
        </FormGrid>
        <SeoTextarea label="Default Meta Description" value={settings.description} onChange={(v) => updateField("description", v)} maxLength={160} recommendedRange={[150, 160]} helpText="Appears under the title in search results." />
        <FormGrid>
          <SeoInput label="Default Meta Keywords" value={settings.keywords} onChange={(v) => updateField("keywords", v)} helpText="Comma-separated keywords." />
          <SeoInput label="Canonical URL" value={settings.canonical_url} onChange={(v) => updateField("canonical_url", v)} helpText="Preferred public URL for the homepage." error={errors.canonical_url} />
          <FormField label="Robots Meta" hint="Controls crawler index/follow behavior.">
            <Select
              value={robots}
              onChange={(event) => {
                const [index, follow] = event.target.value.split(",");
                updateField("robots_index", index === "noindex" ? "0" : "1");
                updateField("robots_follow", follow === "nofollow" ? "0" : "1");
              }}
            >
              <option value="index,follow">index, follow</option>
              <option value="index,nofollow">index, nofollow</option>
              <option value="noindex,follow">noindex, follow</option>
              <option value="noindex,nofollow">noindex, nofollow</option>
            </Select>
          </FormField>
          <SeoInput label="Author Name" value={settings.author_name} onChange={(v) => updateField("author_name", v)} helpText="Optional author meta value." />
          <FormField label="Language" hint="Used by frontend metadata and structured data.">
            <Select value={settings.language} onChange={(event) => updateField("language", event.target.value)}>
              <option value="bn">Bangla</option>
              <option value="en">English</option>
              <option value="en-BD">English Bangladesh</option>
            </Select>
          </FormField>
          <FormField label="Theme Color" error={errors.theme_color} hint="Browser UI color on supported devices.">
            <div className="flex gap-2">
              <input type="color" value={settings.theme_color || "#111827"} onChange={(event) => updateField("theme_color", event.target.value)} className="h-10 w-12 rounded-lg border border-gray-200 bg-white" />
              <Input value={settings.theme_color || ""} onChange={(event) => updateField("theme_color", event.target.value)} />
            </div>
          </FormField>
        </FormGrid>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-800">Search Preview</p>
        <SeoPreview settings={settings} />
      </div>
    </div>
  );
}
