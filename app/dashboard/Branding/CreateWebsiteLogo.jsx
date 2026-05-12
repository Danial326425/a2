"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Globe } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input,
  FileUpload, ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateWebsiteLogo = ({ onLogoCreated }) => {
  const [brandSlogan, setBrandSlogan] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError("Please select a logo image"); return; }
    setSubmitting(true); setError(null);
    const data = new FormData();
    data.append("image", image);
    data.append("brand_slogan", brandSlogan);
    try {
      await axios.post(`${apiUrl}/websitelogos`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Logo created successfully!");
      setTimeout(() => { setSuccess(null); if (onLogoCreated) onLogoCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create logo");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Upload Logo" icon={Globe} subtitle="Set your store's brand logo and slogan" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Brand Slogan" required>
            <Input value={brandSlogan} onChange={(e) => setBrandSlogan(e.target.value)} placeholder="e.g. Quality You Can Trust" required />
          </FormField>

          <FormField label="Logo Image" required hint="PNG or SVG with transparent background recommended">
            <FileUpload
              preview={preview}
              onChange={handleImageChange}
              onClear={() => { setPreview(null); setImage(null); }}
              hint="PNG, JPG, SVG · Transparent background works best"
              height="h-44"
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Save Logo
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateWebsiteLogo;
