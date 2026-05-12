"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { ClipboardList } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input,
  ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateForm = ({ onFormCreated }) => {
  const [formData, setFormData] = useState({
    slug: "", leadHeadline: "", leadButtonHeadline: "", leadButtonSubHeadline: "", redirectPage: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await axios.post(`${apiUrl}/leads`, formData, { headers: { "Content-Type": "application/json" } });
      setSuccess("Lead form created!");
      setFormData({ slug: "", leadHeadline: "", leadButtonHeadline: "", leadButtonSubHeadline: "", redirectPage: "" });
      setTimeout(() => { setSuccess(null); if (onFormCreated) onFormCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lead form");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Create Lead Form" icon={ClipboardList} subtitle="Configure a lead capture form for a product" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Product Slug" required hint="The URL slug of the product this form is for">
            <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. my-product" required />
          </FormField>

          <FormField label="Lead Headline" required hint="Shown above the form">
            <Input name="leadHeadline" value={formData.leadHeadline} onChange={handleChange} placeholder="e.g. Get Your Free Sample!" required />
          </FormField>

          <FormGrid>
            <FormField label="Button Headline" required>
              <Input name="leadButtonHeadline" value={formData.leadButtonHeadline} onChange={handleChange} placeholder="e.g. Order Now" required />
            </FormField>
            <FormField label="Button Sub Headline">
              <Input name="leadButtonSubHeadline" value={formData.leadButtonSubHeadline} onChange={handleChange} placeholder="e.g. Free Delivery" />
            </FormField>
          </FormGrid>

          <FormField label="Redirect Page" required hint="URL to redirect after form submission">
            <Input name="redirectPage" value={formData.redirectPage} onChange={handleChange} placeholder="https://example.com/thank-you" required />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Lead Form
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateForm;
