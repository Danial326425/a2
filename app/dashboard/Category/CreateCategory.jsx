"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Tag } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Select,
  FileUpload, Toggle, ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";
import imageCompression from "browser-image-compression";

const apiUrl = config.apiUrl;

const CreateCategory = ({ onCategoryCreated }) => {
  const [formData, setFormData] = useState({
    name: "", image: null, sort_order: 0, product_limit: 10, parent_id: "", show_on_homepage: false,
  });
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/category`)
      .then(r => setCategories(r.data.categories || []))
      .catch(() => setError("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: name === "parent_id" && value === "" ? null : value }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCompressing(true); setError(null);
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
    if (!formData.image) { setError("Please upload a category image"); return; }
    const exists = categories.some(c => c.name.toLowerCase() === formData.name.toLowerCase());
    if (exists) { setError("A category with this name already exists"); return; }
    setSubmitting(true); setError(null);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("image", formData.image);
    data.append("sort_order", formData.sort_order.toString());
    data.append("product_limit", formData.product_limit.toString());
    data.append("parent_id", formData.parent_id ? formData.parent_id.toString() : "");
    data.append("show_on_homepage", formData.show_on_homepage ? "1" : "0");
    try {
      await axios.post(`${apiUrl}/category`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Category created successfully!");
      setFormData({ name: "", image: null, sort_order: 0, product_limit: 10, parent_id: "", show_on_homepage: false });
      setPreview(null);
      setTimeout(() => { setSuccess(null); if (onCategoryCreated) onCategoryCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Category" icon={Tag} subtitle="Organise your products into a category" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Category Name" required>
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Men's Clothing" required />
          </FormField>

          <FormField label="Parent Category" hint="Optional — leave blank for a top-level category">
            <Select name="parent_id" value={formData.parent_id || ""} onChange={handleChange} disabled={loading}>
              <option value="">No Parent (Top Level)</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>

          <FormGrid>
            <FormField label="Sort Order" hint="Lower number = displayed first">
              <Input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} min={0} />
            </FormField>
            <FormField label="Product Limit" hint="Max products shown in this category">
              <Input type="number" name="product_limit" value={formData.product_limit} onChange={handleChange} min={1} />
            </FormField>
          </FormGrid>

          <Toggle
            name="show_on_homepage"
            id="show_on_homepage"
            checked={formData.show_on_homepage}
            onChange={handleChange}
            label="Show on Homepage"
            description="Display this category on the store homepage"
          />

          <FormField label="Category Image" required hint="Auto-compressed to WebP · Recommended 1:1 ratio">
            <FileUpload
              preview={preview}
              onChange={handleImageChange}
              onClear={() => { setPreview(null); setFormData(p => ({ ...p, image: null })); }}
              loading={compressing}
              hint="PNG, JPG or WebP · Square image recommended"
              height="h-48"
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Category
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateCategory;
