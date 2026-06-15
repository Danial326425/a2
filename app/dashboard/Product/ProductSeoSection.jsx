"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ChevronDown, RotateCcw, Wand2 } from "lucide-react";
import { config } from "@/config/config";
import useSeoSettings from "@/app/hooks/useSeoSettings";
import { ActionBtn, FormField, InfoBox, Select, Textarea } from "@/app/components/Dashboard/DashUI";
import SeoInput from "@/app/dashboard/SeoSettings/shared/SeoInput";
import SeoTextarea from "@/app/dashboard/SeoSettings/shared/SeoTextarea";
import ImageUploadField from "@/app/dashboard/SeoSettings/shared/ImageUploadField";
import SeoPreview from "@/app/dashboard/SeoSettings/SeoPreview";
import JsonLdEditor from "@/app/dashboard/SeoSettings/shared/JsonLdEditor";
import { validateJson, isUrl, imageUrlFor } from "@/app/lib/seo/validators";

const apiUrl = config.apiUrl;
const reservedSlugs = ["admin", "api", "login", "register", "dashboard", "checkout", "cart", "shop"];

export const emptySeo = {
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
  og_image_existing: "",
  og_image_source: "global",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  twitter_image_existing: "",
  json_ld: "",
};

export const slugifyProduct = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const appendSeoToFormData = (data, seo = {}) => {
  const nullableFields = [
    "meta_title",
    "meta_description",
    "meta_keywords",
    "canonical_url",
    "og_title",
    "og_description",
    "og_image_source",
    "twitter_title",
    "twitter_description",
    "json_ld",
  ];

  nullableFields.forEach((field) => {
    data.append(`seo[${field}]`, seo[field] || "");
  });

  if (seo.og_image instanceof File) data.append("seo[og_image]", seo.og_image);
  else data.append("seo[og_image_existing]", seo.og_image_existing || "");

  if (seo.twitter_image instanceof File) data.append("seo[twitter_image]", seo.twitter_image);
  else data.append("seo[twitter_image_existing]", seo.twitter_image_existing || "");

  data.append("seo[robots_index]", "1");
  data.append("seo[robots_follow]", "1");
};

const productSchema = (product, image) => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name || "",
  image: image || "",
  description: product.seo?.meta_description || product.homepage?.paragraph || "",
  sku: product.id ? String(product.id) : "",
  brand: { "@type": "Brand", name: config.siteName },
  offers: {
    "@type": "Offer",
    price: product.discount_price || product.price || "",
    priceCurrency: "BDT",
    availability: "https://schema.org/InStock",
  },
}, null, 2);

const fieldValue = (seo, field, global) => seo?.[field] || global || "";

export default function ProductSeoSection({
  formData,
  setFormData,
  productId,
  productMainImage,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [slugState, setSlugState] = useState({ checking: false, available: null, message: "" });
  const globalSeo = useSeoSettings();
  const seo = formData.seo || emptySeo;

  const updateSeo = (field, value) => {
    setFormData((prev) => ({ ...prev, seo: { ...(prev.seo || emptySeo), [field]: value } }));
  };

  const updateSlug = (slug, manual = true) => {
    setFormData((prev) => ({ ...prev, slug, slugEdited: manual || prev.slugEdited }));
  };

  useEffect(() => {
    if (!formData.slugEdited && formData.name) {
      updateSlug(slugifyProduct(formData.name), false);
    }
  }, [formData.name]);

  useEffect(() => {
    const slug = formData.slug || "";
    if (!slug) {
      setSlugState({ checking: false, available: false, message: "Slug is required." });
      return;
    }
    if (reservedSlugs.includes(slug)) {
      setSlugState({ checking: false, available: false, message: "This slug is reserved." });
      return;
    }
    if (!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug)) {
      setSlugState({ checking: false, available: false, message: "Use lowercase words separated by hyphens." });
      return;
    }

    const t = setTimeout(async () => {
      setSlugState({ checking: true, available: null, message: "Checking availability..." });
      try {
        const res = await axios.get(`${apiUrl}/products/check-slug`, {
          params: { slug, ignore_id: productId || undefined },
        });
        setSlugState({
          checking: false,
          available: !!res.data.available,
          message: res.data.available ? "Slug is available." : "Slug is already used.",
        });
      } catch {
        setSlugState({ checking: false, available: null, message: "Could not check slug right now." });
      }
    }, 450);
    return () => clearTimeout(t);
  }, [formData.slug, productId]);

  const effectiveImage = useMemo(() => {
    if (seo.og_image_source === "custom") return seo.og_image || seo.og_image_existing;
    if (seo.og_image_source === "product") return productMainImage;
    return globalSeo.settings.og_image;
  }, [globalSeo.settings.og_image, productMainImage, seo]);

  // Canonical / slug-preview base: the dashboard "Site URL" (Global SEO →
  // Advanced) wins, else the build-time config. This is what keeps the preview
  // and auto-generated canonical off localhost without a rebuild.
  const siteBase = (globalSeo.settings?.site_url || config.siteUrl || "").replace(/\/+$/, "");

  const previewSettings = {
    site_title: globalSeo.settings.site_title,
    title: fieldValue(seo, "meta_title", globalSeo.settings.title || formData.name),
    description: fieldValue(seo, "meta_description", globalSeo.settings.description),
    canonical_url: seo.canonical_url || `${siteBase}/${formData.slug || ""}`,
    og_title: fieldValue(seo, "og_title", seo.meta_title || globalSeo.settings.og_title || formData.name),
    og_description: fieldValue(seo, "og_description", seo.meta_description || globalSeo.settings.og_description),
    og_image: effectiveImage,
  };

  const errors = {
    canonical_url: isUrl(seo.canonical_url) ? "" : "Enter a valid URL",
    json_ld: validateJson(seo.json_ld).valid ? "" : validateJson(seo.json_ld).message,
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-white">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-t-xl bg-indigo-50/60 px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-gray-800">SEO Settings</p>
          <p className="text-xs text-gray-500">Empty fields use Global SEO fallback.</p>
        </div>
        <ChevronDown size={16} className={`text-indigo-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-5 p-4">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SeoInput label="Meta Title" value={seo.meta_title} onChange={(v) => updateSeo("meta_title", v)} maxLength={60} recommendedRange={[50, 60]} placeholder={globalSeo.settings.title || "Use global default"} />
                <SeoInput label="SEO Slug" value={formData.slug || ""} onChange={(v) => updateSlug(slugifyProduct(v))} helpText="Auto-generated from name, editable." />
              </div>
              <div className={`rounded-lg border px-3 py-2 text-xs ${slugState.available === false ? "border-red-200 bg-red-50 text-red-700" : slugState.available ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                {slugState.message} URL: {siteBase}/{formData.slug || "product-slug"}
                {productId && <span className="ml-2 text-amber-700">Changing slug may break existing links. Add a 301 redirect if the old URL is already public.</span>}
              </div>
              <SeoTextarea label="Meta Description" value={seo.meta_description} onChange={(v) => updateSeo("meta_description", v)} maxLength={160} recommendedRange={[150, 160]} placeholder={globalSeo.settings.description || "Use global default"} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SeoInput label="Meta Keywords" value={seo.meta_keywords} onChange={(v) => updateSeo("meta_keywords", v)} placeholder={globalSeo.settings.keywords || "Use global default"} />
                <SeoInput label="Canonical URL" value={seo.canonical_url} onChange={(v) => updateSeo("canonical_url", v)} error={errors.canonical_url} placeholder={`${siteBase}/${formData.slug || ""}`} />
              </div>
              <div className="flex justify-end">
                <ActionBtn type="button" variant="secondary" size="sm" icon={Wand2} onClick={() => updateSeo("canonical_url", `${siteBase}/${formData.slug || ""}`)}>
                  Auto-generate canonical
                </ActionBtn>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SeoInput label="OG Title" value={seo.og_title} onChange={(v) => updateSeo("og_title", v)} maxLength={60} recommendedRange={[50, 60]} placeholder={globalSeo.settings.og_title || "Use meta/global title"} />
                <SeoInput label="Twitter Title" value={seo.twitter_title} onChange={(v) => updateSeo("twitter_title", v)} maxLength={60} recommendedRange={[50, 60]} placeholder="Use OG title fallback" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SeoTextarea label="OG Description" value={seo.og_description} onChange={(v) => updateSeo("og_description", v)} maxLength={160} recommendedRange={[150, 160]} placeholder={globalSeo.settings.og_description || "Use meta/global description"} />
                <SeoTextarea label="Twitter Description" value={seo.twitter_description} onChange={(v) => updateSeo("twitter_description", v)} maxLength={160} recommendedRange={[150, 160]} placeholder="Use OG description fallback" />
              </div>

              <FormField label="OG Image Source">
                <Select value={seo.og_image_source || "global"} onChange={(e) => updateSeo("og_image_source", e.target.value)}>
                  <option value="custom">Upload custom image</option>
                  <option value="product">Use product main image</option>
                  <option value="global">Use global default</option>
                </Select>
              </FormField>
              {seo.og_image_source === "custom" && (
                <ImageUploadField
                  label="Custom OG Image"
                  value={seo.og_image_existing || ""}
                  recommended="1200x630 recommended"
                  onUpload={async (file) => updateSeo("og_image", file)}
                  onRemove={() => {
                    updateSeo("og_image", "");
                    updateSeo("og_image_existing", "");
                  }}
                />
              )}

              <ImageUploadField
                label="Twitter Image"
                value={seo.twitter_image_existing || ""}
                recommended="1200x630 recommended"
                onUpload={async (file) => updateSeo("twitter_image", file)}
                onRemove={() => {
                  updateSeo("twitter_image", "");
                  updateSeo("twitter_image_existing", "");
                }}
              />

              <JsonLdEditor value={seo.json_ld} onChange={(v) => updateSeo("json_ld", v)} />
              {errors.json_ld && <p className="text-xs text-red-600">{errors.json_ld}</p>}
              <div className="flex flex-wrap gap-2">
                <ActionBtn type="button" variant="secondary" size="sm" icon={Wand2} onClick={() => updateSeo("json_ld", productSchema(formData, imageUrlFor(effectiveImage, config.apiStorageUrl)))}>
                  Fill Product schema
                </ActionBtn>
                {["meta_title", "meta_description", "meta_keywords", "canonical_url", "og_title", "og_description", "twitter_title", "twitter_description"].map((field) => (
                  <ActionBtn key={field} type="button" variant="ghost" size="sm" icon={RotateCcw} onClick={() => updateSeo(field, "")}>
                    Reset {field.replaceAll("_", " ")}
                  </ActionBtn>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <InfoBox variant="tip">Fallbacks are previewed from Global SEO settings. Save empty values as blank to keep fallback behavior.</InfoBox>
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-800">Google Preview</p>
                <SeoPreview settings={previewSettings} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-800">Facebook Preview</p>
                <SeoPreview settings={previewSettings} type="facebook" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
