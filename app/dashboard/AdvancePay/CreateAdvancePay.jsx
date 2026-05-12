"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { CreditCard } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea, Toggle,
  ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateAdvancePay = ({ onCodAdvanceCreated }) => {
  const [formData, setFormData] = useState({
    title: "", sub_title: "", headline: "", pay_amount: "", is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/codadvances`, formData);
      setSuccess("COD Advance created successfully!");
      setFormData({ title: "", sub_title: "", headline: "", pay_amount: "", is_active: true });
      setTimeout(() => { setSuccess(null); if (onCodAdvanceCreated) onCodAdvanceCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create COD advance");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Create COD Advance" icon={CreditCard} subtitle="Configure an advance payment option for cash-on-delivery orders" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormGrid>
            <FormField label="Title" required>
              <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Advance Booking" required maxLength={255} />
            </FormField>
            <FormField label="Sub Title" required>
              <Input name="sub_title" value={formData.sub_title} onChange={handleChange} placeholder="e.g. Pay ৳50 to confirm order" required maxLength={255} />
            </FormField>
          </FormGrid>

          <FormField label="Headline" hint="Optional short note shown to customers">
            <Textarea name="headline" value={formData.headline} onChange={handleChange} rows={3} placeholder="Enter headline text" />
          </FormField>

          <FormField label="Advance Amount (৳)" required>
            <Input type="number" name="pay_amount" value={formData.pay_amount} onChange={handleChange} placeholder="e.g. 50" min={0} required prefix="৳" />
          </FormField>

          <Toggle
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            label="Active"
            description="Enable this advance pay option on the checkout page"
          />

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create COD Advance
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateAdvancePay;
