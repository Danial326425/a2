"use client";

import { FormGrid, FormField, Select } from "@/app/components/Dashboard/DashUI";
import SeoInput from "./shared/SeoInput";
import SeoTextarea from "./shared/SeoTextarea";
import ImageUploadField from "./shared/ImageUploadField";
import SeoPreview from "./SeoPreview";

export default function OpenGraphTab({ settings, updateField, imageUpload, errors }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <FormGrid>
          <SeoInput label="OG Title" value={settings.og_title} onChange={(v) => updateField("og_title", v)} maxLength={60} recommendedRange={[50, 60]} helpText="Title used when shared on Facebook and messaging apps." />
          <SeoInput label="OG URL" value={settings.og_url} onChange={(v) => updateField("og_url", v)} helpText="Canonical sharing URL." error={errors.og_url} />
        </FormGrid>
        <SeoTextarea label="OG Description" value={settings.og_description} onChange={(v) => updateField("og_description", v)} maxLength={160} recommendedRange={[150, 160]} helpText="Social sharing description." />
        <FormGrid>
          <FormField label="OG Type">
            <Select value={settings.og_type} onChange={(event) => updateField("og_type", event.target.value)}>
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="product">product</option>
            </Select>
          </FormField>
          <SeoInput label="Facebook App ID" value={settings.facebook_app_id} onChange={(v) => updateField("facebook_app_id", v.replace(/\D/g, ""))} helpText="Numeric Facebook app ID." />
        </FormGrid>
        <ImageUploadField
          label="OG Image"
          value={settings.og_image}
          recommended="1200x630 recommended"
          loading={imageUpload.uploading.og_image}
          error={imageUpload.errors.og_image}
          onUpload={(file) => imageUpload.uploadImage("og_image", file)}
          onRemove={() => imageUpload.removeImage("og_image")}
        />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-800">Facebook Share Preview</p>
        <SeoPreview settings={settings} type="facebook" />
      </div>
    </div>
  );
}
