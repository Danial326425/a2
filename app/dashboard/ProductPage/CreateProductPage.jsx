"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Store } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input,
  ActionBtn, ErrorBanner, SuccessAlert,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateProductPage = ({ onProductPageCreated }) => {
  const [formData, setFormData] = useState({ headline: "", paragraph: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/productpages`).then(r => {
      if ((r.data || []).length > 0) {
        if (onProductPageCreated) onProductPageCreated();
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await axios.post(`${apiUrl}/productpages`, formData);
      setSuccess("Product page settings saved!");
      setTimeout(() => { setSuccess(null); if (onProductPageCreated) onProductPageCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product page");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Product Page Settings" icon={Store} subtitle="Configure headline and description for your product listing page" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Headline">
            <Input name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Our Best Products" />
          </FormField>

          <FormField label="Paragraph">
            <Input name="paragraph" value={formData.paragraph} onChange={handleChange} placeholder="Short description below the headline" />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Save Settings
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateProductPage;
