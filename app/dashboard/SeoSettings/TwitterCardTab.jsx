"use client";

import { Copy } from "lucide-react";
import { ActionBtn, FormGrid, FormField, Select } from "@/app/components/Dashboard/DashUI";
import SeoInput from "./shared/SeoInput";
import SeoTextarea from "./shared/SeoTextarea";
import ImageUploadField from "./shared/ImageUploadField";
import SeoPreview from "./SeoPreview";

export default function TwitterCardTab({ settings, updateField, imageUpload, errors }) {
  const copyFromOg = () => {
    updateField("twitter_title", settings.og_title || settings.title || "");
    updateField("twitter_description", settings.og_description || settings.description || "");
    updateField("twitter_image", settings.og_image || "");
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="flex justify-end">
          <ActionBtn type="button" variant="secondary" icon={Copy} onClick={copyFromOg}>Copy from Open Graph</ActionBtn>
        </div>
        <FormGrid>
          <FormField label="Card Type">
            <Select value={settings.twitter_card} onChange={(event) => updateField("twitter_card", event.target.value)}>
              <option value="summary">summary</option>
              <option value="summary_large_image">summary_large_image</option>
            </Select>
          </FormField>
          <SeoInput label="Twitter Username" value={settings.twitter_handle} onChange={(v) => updateField("twitter_handle", v)} helpText="Brand @handle." error={errors.twitter_handle} />
        </FormGrid>
        <FormGrid>
          <SeoInput label="Twitter Title" value={settings.twitter_title} onChange={(v) => updateField("twitter_title", v)} maxLength={60} recommendedRange={[50, 60]} />
          <SeoInput label="Twitter Creator" value={settings.twitter_creator} onChange={(v) => updateField("twitter_creator", v)} helpText="Creator @handle." error={errors.twitter_creator} />
        </FormGrid>
        <SeoTextarea label="Twitter Description" value={settings.twitter_description} onChange={(v) => updateField("twitter_description", v)} maxLength={160} recommendedRange={[150, 160]} />
        <ImageUploadField
          label="Twitter Image"
          value={settings.twitter_image}
          recommended="1200x630 for large summary cards"
          loading={imageUpload.uploading.twitter_image}
          error={imageUpload.errors.twitter_image}
          onUpload={(file) => imageUpload.uploadImage("twitter_image", file)}
          onRemove={() => imageUpload.removeImage("twitter_image")}
        />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-800">Twitter Card Preview</p>
        <SeoPreview settings={settings} type="twitter" />
      </div>
    </div>
  );
}
