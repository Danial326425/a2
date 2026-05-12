"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import QuillEditor from "../../components/QuillEditor";
import { LayoutTemplate } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea, Select,
  ActionBtn, ErrorBanner, SuccessAlert, FormSkeleton,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateHome = ({ onHomeCreated }) => {
  const [formData, setFormData] = useState({ slug: "", headline: "", paragraph: "", description: "" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await axios.post(`${apiUrl}/homepages`, formData);
      setSuccess("Landing page created!");
      setFormData({ slug: "", headline: "", paragraph: "", description: "" });
      setTimeout(() => { setSuccess(null); if (onHomeCreated) onHomeCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create landing page");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Create Landing Page" icon={LayoutTemplate} subtitle="Build a product-specific landing page with custom content" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        {loading ? <FormSkeleton fields={4} /> : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Select Product" required>
              <Select name="slug" value={formData.slug} onChange={handleChange} required>
                <option value="">Choose a product</option>
                {products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </Select>
            </FormField>

            <FormField label="Headline" required>
              <Input name="headline" value={formData.headline} onChange={handleChange} placeholder="Catchy headline for this page" required />
            </FormField>

            <FormField label="Paragraph">
              <Textarea name="paragraph" value={formData.paragraph} onChange={handleChange} rows={4} placeholder="Introductory paragraph…" />
            </FormField>

            <FormField label="Description">
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <QuillEditor
                  value={formData.description}
                  onChange={(v) => setFormData(p => ({ ...p, description: v || "" }))}
                  style={{ minHeight: 220 }}
                />
              </div>
            </FormField>

            <div className="flex justify-end pt-2">
              <ActionBtn type="submit" variant="primary" loading={submitting}>
                Create Landing Page
              </ActionBtn>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
};

export default CreateHome;
