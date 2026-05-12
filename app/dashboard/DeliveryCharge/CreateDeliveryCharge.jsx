"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Truck } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea,
  ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateDeliveryCharge = ({ onDeliveryChargeCreated }) => {
  const [formData, setFormData] = useState({
    district_name: "",
    delivery_charge: "",
    estimated_days: "",
    delivery_note: "",
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
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/deliverycharges`, formData);
      setSuccess("Delivery charge created!");
      setFormData({ district_name: "", delivery_charge: "", estimated_days: "", delivery_note: "" });
      setTimeout(() => { setSuccess(null); if (onDeliveryChargeCreated) onDeliveryChargeCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create delivery charge");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Delivery Charge" icon={Truck} subtitle="Set delivery cost and estimated time for a district" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="District Name" required hint="e.g. ঢাকার ভেতরে, সারা বাংলাদেশ">
            <Input name="district_name" value={formData.district_name} onChange={handleChange} placeholder="Enter district name" required />
          </FormField>

          <FormGrid>
            <FormField label="Delivery Charge (৳)" required>
              <Input type="number" name="delivery_charge" value={formData.delivery_charge} onChange={handleChange} placeholder="e.g. 80" min="0" required prefix="৳" />
            </FormField>

            <FormField label="Estimated Delivery Days" required>
              <Input type="number" name="estimated_days" value={formData.estimated_days} onChange={handleChange} placeholder="e.g. 2" min="1" required />
            </FormField>
          </FormGrid>

          <FormField label="Delivery Note" hint="Optional note shown to customers">
            <Textarea name="delivery_note" value={formData.delivery_note} onChange={handleChange} rows={3} placeholder="e.g. Delivered within Dhaka city" />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Delivery Charge
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateDeliveryCharge;
