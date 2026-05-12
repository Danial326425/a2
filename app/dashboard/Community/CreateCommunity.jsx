"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Users } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea,
  FileUpload, ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateCommunity = ({ onCommunityCreated }) => {
  const [formData, setFormData] = useState({
    icon: "", name: "", description: "", image: null, banner: null, button_text: "", url: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field, setPreview) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, [field]: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    const data = new FormData();
    Object.keys(formData).forEach(k => { if (formData[k] !== null && formData[k] !== "") data.append(k, formData[k]); });
    try {
      await axios.post(`${apiUrl}/communities`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Community created successfully!");
      setFormData({ icon: "", name: "", description: "", image: null, banner: null, button_text: "", url: "" });
      setImagePreview(null); setBannerPreview(null);
      setTimeout(() => { setSuccess(null); if (onCommunityCreated) onCommunityCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create community");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Create Community" icon={Users} subtitle="Set up a community group or channel link" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormGrid>
            <FormField label="Community Name" required>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. WhatsApp Group" required />
            </FormField>
            <FormField label="Button Text">
              <Input name="button_text" value={formData.button_text} onChange={handleChange} placeholder="e.g. Join Now" />
            </FormField>
          </FormGrid>

          <FormField label="Join URL">
            <Input name="url" value={formData.url} onChange={handleChange} placeholder="https://chat.whatsapp.com/..." />
          </FormField>

          <FormField label="Icon" hint="e.g. FaWhatsapp, FaTelegram, FaFacebook">
            <Input name="icon" value={formData.icon} onChange={handleChange} placeholder="FaWhatsapp" />
          </FormField>

          <FormField label="Description">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Brief description of the community…" />
          </FormField>

          <FormGrid>
            <FormField label="Community Image">
              <FileUpload
                preview={imagePreview}
                onChange={handleFileChange("image", setImagePreview)}
                onClear={() => { setImagePreview(null); setFormData(p => ({ ...p, image: null })); }}
                hint="Square image recommended"
                height="h-36"
              />
            </FormField>
            <FormField label="Banner Image">
              <FileUpload
                preview={bannerPreview}
                onChange={handleFileChange("banner", setBannerPreview)}
                onClear={() => { setBannerPreview(null); setFormData(p => ({ ...p, banner: null })); }}
                hint="Wide banner image"
                height="h-36"
              />
            </FormField>
          </FormGrid>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Community
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateCommunity;
