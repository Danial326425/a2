"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Image as ImageIcon } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea, Toggle,
  FileUpload, ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";
import imageCompression from "browser-image-compression";

const apiUrl = config.apiUrl;

const CreateBanner = ({ onBannerCreated }) => {
  const [formData, setFormData] = useState({
    title: "", description: "", image: null, link: "", is_active: true, sort_order: 0,
  });
  const [preview, setPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCompressing(true); setError(null);
    try {
      // Banner is the homepage LCP image — compress aggressively. 1600px is
      // plenty for a full-width 16:5 banner; ~0.35MB webp keeps LCP fast.
      const blob = await imageCompression(file, { maxSizeMB: 0.35, maxWidthOrHeight: 1600, useWebWorker: true, fileType: "image/webp", initialQuality: 0.72 });
      const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });
      setFormData(prev => ({ ...prev, image: compressed }));
      setPreview(URL.createObjectURL(compressed));
    } catch { setError("Image compression failed"); }
    finally { setCompressing(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) { setError("Please upload a banner image"); return; }
    setSubmitting(true); setError(null);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("image", formData.image);
    data.append("link", formData.link);
    data.append("is_active", formData.is_active ? "1" : "0");
    data.append("sort_order", formData.sort_order);
    try {
      await axios.post(`${apiUrl}/banners`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Banner created successfully!");
      setFormData({ title: "", description: "", image: null, link: "", is_active: true, sort_order: 0 });
      setPreview(null);
      setTimeout(() => { setSuccess(null); if (onBannerCreated) onBannerCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create banner");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Create Banner" icon={ImageIcon} subtitle="Upload a promotional banner for your storefront" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Banner Image" required hint="Auto-compressed · Recommended 16:9 or 3:1 ratio">
            <FileUpload
              preview={preview}
              onChange={handleImageChange}
              onClear={() => { setPreview(null); setFormData(p => ({ ...p, image: null })); }}
              loading={compressing}
              hint="PNG, JPG or WebP · Wide/landscape images work best"
              height="h-52"
            />
          </FormField>

          <FormGrid>
            <FormField label="Title">
              <Input name="title" value={formData.title} onChange={handleChange} placeholder="Banner title (optional)" />
            </FormField>
            <FormField label="Link URL">
              <Input type="url" name="link" value={formData.link} onChange={handleChange} placeholder="https://example.com" />
            </FormField>
          </FormGrid>

          <FormField label="Description">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Short banner description (optional)" />
          </FormField>

          <FormGrid>
            <FormField label="Sort Order" hint="Lower numbers displayed first">
              <Input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} min={0} />
            </FormField>
            <div className="flex items-end pb-1">
              <Toggle
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                label="Active"
                description="Show this banner on the website"
              />
            </div>
          </FormGrid>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Banner
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateBanner;
