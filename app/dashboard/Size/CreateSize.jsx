"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Ruler } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Select,
  ActionBtn, ErrorBanner, SuccessAlert,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateSize = ({ onSizeCreated }) => {
  const [formData, setFormData] = useState({ color_id: "", size: "" });
  const [colors, setColors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/colors`),
      axios.get(`${apiUrl}/products`),
    ]).then(([cRes, pRes]) => {
      setColors(cRes.data || []);
      setProducts(pRes.data || []);
    }).catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const getProductName = (productId) => products.find(p => p.id === productId)?.name || "Unknown";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/sizes`, formData);
      setSuccess("Size added successfully!");
      setFormData({ color_id: "", size: "" });
      setTimeout(() => { setSuccess(null); if (onSizeCreated) onSizeCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create size");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Size" icon={Ruler} subtitle="Add a size option for a product color variant" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Product / Color Variant" required>
            <Select name="color_id" value={formData.color_id} onChange={handleChange} required disabled={loading}>
              <option value="">{loading ? "Loading…" : "Select a product color"}</option>
              {colors.map(c => (
                <option key={c.id} value={c.id}>
                  {getProductName(c.product_id)} — {c.color}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Size" required hint='e.g. S, M, L, XL or numeric like 40, 42'>
            <Input name="size" value={formData.size} onChange={handleChange} placeholder="Enter size" required />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Add Size
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateSize;
