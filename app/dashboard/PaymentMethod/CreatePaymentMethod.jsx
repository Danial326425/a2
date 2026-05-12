"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Wallet } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Select,
  FileUpload, ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";
import imageCompression from "browser-image-compression";

const apiUrl = config.apiUrl;

const CreatePaymentMethod = ({ onPaymentCreated }) => {
  const [formData, setFormData] = useState({ payment_method: "", payment_number: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCompressing(true);
    setError(null);
    try {
      const blob = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true, fileType: "image/webp" });
      const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });
      setImage(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch { setError("Image compression failed"); }
    finally { setCompressing(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData();
    if (image) data.append("image", image);
    data.append("payment_method", formData.payment_method);
    data.append("payment_number", formData.payment_number);
    try {
      await axios.post(`${apiUrl}/paymentmethod`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Payment method added!");
      setFormData({ payment_method: "", payment_number: "" });
      setImage(null);
      setPreview(null);
      setTimeout(() => { setSuccess(null); if (onPaymentCreated) onPaymentCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create payment method");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Payment Method" icon={Wallet} subtitle="Configure a mobile banking option for your checkout" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormGrid>
            <FormField label="Payment Method" required>
              <Select name="payment_method" value={formData.payment_method} onChange={handleChange} required>
                <option value="">Select method</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
              </Select>
            </FormField>

            <FormField label="Account Number" required hint="e.g. 01XXXXXXXXX">
              <Input name="payment_number" value={formData.payment_number} onChange={handleChange} placeholder="01XXXXXXXXX" required />
            </FormField>
          </FormGrid>

          <FormField label="QR Code / Logo" hint="Auto-compressed to WebP · max 0.5 MB">
            <FileUpload
              preview={preview}
              onChange={handleImageChange}
              onClear={() => { setPreview(null); setImage(null); }}
              loading={compressing}
              hint="PNG, JPG or WebP · Square image preferred"
              height="h-44"
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Add Payment Method
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreatePaymentMethod;
