"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Palette } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Select,
  FileUpload, ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";
import imageCompression from "browser-image-compression";

const apiUrl = config.apiUrl;

const CreateColor = ({ onColorCreated }) => {
  const [formData, setFormData] = useState({ product_id: "", color: "", image: null });
  const [products, setProducts] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/products`)
      .then(r => setProducts(r.data || []))
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

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
      const blob = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1080, useWebWorker: true, fileType: "image/webp" });
      const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });
      setFormData(prev => ({ ...prev, image: compressed }));
      setPreview(URL.createObjectURL(compressed));
    } catch { setError("Image compression failed"); }
    finally { setCompressing(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) { setError("Please select an image"); return; }
    setSubmitting(true);
    setError(null);
    const data = new FormData();
    Object.keys(formData).forEach(k => formData[k] && data.append(k, formData[k]));
    try {
      await axios.post(`${apiUrl}/colors`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Color variant created successfully!");
      setFormData({ product_id: "", color: "", image: null });
      setPreview(null);
      setTimeout(() => { setSuccess(null); if (onColorCreated) onColorCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create color");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Color Variant" icon={Palette} subtitle="Assign a color and image to a product" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Product" required>
            <Select name="product_id" value={formData.product_id} onChange={handleChange} required disabled={loading}>
              <option value="">{loading ? "Loading products…" : "Select a product"}</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FormField>

          <FormField label="Color Name" required>
            <Input name="color" value={formData.color} onChange={handleChange} placeholder="e.g. Sky Blue" required />
          </FormField>

          <FormField label="Color Image" required hint="Auto-compressed to WebP · max 0.5 MB">
            <FileUpload
              preview={preview}
              onChange={handleImageChange}
              onClear={() => { setPreview(null); setFormData(p => ({ ...p, image: null })); }}
              loading={compressing}
              hint="PNG, JPG or WebP"
              height="h-44"
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Color
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateColor;
