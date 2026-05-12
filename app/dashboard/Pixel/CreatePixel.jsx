"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { BarChart2 } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Toggle,
  ActionBtn, ErrorBanner, SuccessAlert, InfoBox, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreatePixel = ({ onPixelCreated }) => {
  const [formData, setFormData] = useState({
    pixel_id: "", fb_access_token: "", test_event_code: "", is_purchase: true,
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
      await axios.post(`${apiUrl}/pixels`, formData);
      setSuccess("Facebook Pixel created!");
      setFormData({ pixel_id: "", fb_access_token: "", test_event_code: "", is_purchase: true });
      setTimeout(() => { setSuccess(null); if (onPixelCreated) onPixelCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create pixel");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Facebook Pixel" icon={BarChart2} subtitle="Track conversions and events with Facebook Pixel" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Facebook Pixel ID" required hint="Example: 123456789012345">
            <Input name="pixel_id" value={formData.pixel_id} onChange={handleChange} placeholder="Enter your Pixel ID" required />
          </FormField>

          <FormField label="Facebook Access Token" hint="Required for server-side events (Conversions API)">
            <Input name="fb_access_token" value={formData.fb_access_token} onChange={handleChange} placeholder="EAAxxxxx..." />
          </FormField>

          <FormField label="Test Event Code" hint="Optional — for testing events in Facebook Events Manager">
            <Input name="test_event_code" value={formData.test_event_code} onChange={handleChange} placeholder="TEST12345" />
          </FormField>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
            <p className="text-sm font-medium text-gray-700">Event Type</p>
            <Toggle
              name="is_purchase"
              id="is_purchase"
              checked={formData.is_purchase}
              onChange={handleChange}
              label={formData.is_purchase ? "Purchase Event (High Value)" : "Lead Event (Registration)"}
              description={formData.is_purchase
                ? "Fires the Purchase event on order confirmation — better for e-commerce ROAS"
                : "Fires the Lead event on order confirmation — use for lead-generation funnels"
              }
            />
          </div>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Pixel
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreatePixel;
