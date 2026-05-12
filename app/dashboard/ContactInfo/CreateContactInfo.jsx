"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Phone } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea,
  ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateContactInfo = ({ onContactInfoCreated }) => {
  const [formData, setFormData] = useState({ email: "", phone: "", address: "", tnx_number: "" });
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
      await axios.post(`${apiUrl}/contactinfos`, formData);
      setSuccess("Contact information created!");
      setFormData({ email: "", phone: "", address: "", tnx_number: "" });
      setTimeout(() => { setSuccess(null); if (onContactInfoCreated) onContactInfoCreated(); }, 1200);
    } catch (err) {
      const emailError = err.response?.data?.errors?.email?.[0];
      setError(emailError || err.response?.data?.message || "Failed to create contact info");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Contact Info" icon={Phone} subtitle="Set the contact details displayed on your store" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormGrid>
            <FormField label="Email Address" required hint="Must be unique">
              <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@example.com" required maxLength={255} />
            </FormField>
            <FormField label="Phone Number" required>
              <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+880XXXXXXXXX" required maxLength={20} />
            </FormField>
          </FormGrid>

          <FormField label="Transaction Number" required hint="bKash / Nagad / Rocket number for payments">
            <Input name="tnx_number" value={formData.tnx_number} onChange={handleChange} placeholder="01XXXXXXXXX" required maxLength={20} />
          </FormField>

          <FormField label="Address" hint="Max 500 characters">
            <Textarea name="address" value={formData.address} onChange={handleChange} rows={3} placeholder="Company address (optional)" maxLength={500} />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Contact Info
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateContactInfo;
