"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  FormField, Input, Textarea, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const UpdateContactInfo = ({ formData, setFormData, onUpdate, onCancel }) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id) { setError("No contact ID provided for update"); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.put(`${apiUrl}/contactinfosupdate/${formData.id}`, formData);
      onUpdate();
    } catch (err) {
      const emailErr = err.response?.data?.errors?.email?.[0];
      setError(emailErr || err.response?.data?.message || "Failed to update contact information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorBanner message={error} />

      <FormField label="Email" required>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          maxLength={255}
          placeholder="contact@example.com"
        />
      </FormField>

      <FormField label="Phone" required>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          maxLength={20}
          placeholder="+880 1XXX-XXXXXX"
        />
      </FormField>

      <FormField label="Transaction Number">
        <Input
          name="tnx_number"
          value={formData.tnx_number}
          onChange={handleChange}
          maxLength={20}
          placeholder="+1234567890"
        />
      </FormField>

      <FormField label="Address">
        <Textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          maxLength={500}
          placeholder="Full address…"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</ActionBtn>
        <ActionBtn type="submit" variant="primary" loading={isSubmitting}>Save Changes</ActionBtn>
      </div>
    </form>
  );
};

export default UpdateContactInfo;
