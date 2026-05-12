"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { PartyPopper } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea,
  ActionBtn, ErrorBanner, SuccessAlert,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateCongratulation = ({ onCongratesCreated }) => {
  const [formData, setFormData] = useState({
    headline: "", subHeadline: "", paragraph: "", contactInfoText: "",
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
      await axios.post(`${apiUrl}/congratulations`, formData, { headers: { "Content-Type": "application/json" } });
      setSuccess("Congratulation page created!");
      setFormData({ headline: "", subHeadline: "", paragraph: "", contactInfoText: "" });
      setTimeout(() => { setSuccess(null); if (onCongratesCreated) onCongratesCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create congratulation");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Create Congratulation" icon={PartyPopper} subtitle="Customize the order success / thank you message" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Headline" required>
            <Input name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Order Placed Successfully!" required />
          </FormField>

          <FormField label="Sub Headline">
            <Input name="subHeadline" value={formData.subHeadline} onChange={handleChange} placeholder="e.g. Thank you for your order" />
          </FormField>

          <FormField label="Paragraph">
            <Textarea name="paragraph" value={formData.paragraph} onChange={handleChange} rows={4} placeholder="Additional message for customers…" />
          </FormField>

          <FormField label="Contact Info Text">
            <Input name="contactInfoText" value={formData.contactInfoText} onChange={handleChange} placeholder="e.g. Call us at 01XXXXXXXXX for any queries" />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Congratulation
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateCongratulation;
