"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  FormField, Input, Textarea, ActionBtn, ErrorBanner, Toggle, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const UpdateContact = ({ formData, setFormData, onUpdate, onCancel }) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id) { setError("No contact ID provided for update"); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.put(`${apiUrl}/contactsupdate/${formData.id}`, formData);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update contact. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorBanner message={error} />

      <FormGrid>
        <FormField label="Full Name" required>
          <Input name="name" value={formData.name} onChange={handleChange} required maxLength={255} />
        </FormField>
        <FormField label="Email" required>
          <Input type="email" name="email" value={formData.email} onChange={handleChange} required maxLength={255} />
        </FormField>
      </FormGrid>

      <FormGrid>
        <FormField label="Phone" required>
          <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required maxLength={20} />
        </FormField>
        <FormField label="Subject" required>
          <Input name="subject" value={formData.subject} onChange={handleChange} required maxLength={255} />
        </FormField>
      </FormGrid>

      <FormField label="Message" required>
        <Textarea name="message" value={formData.message} onChange={handleChange} required rows={4} minLength={10} />
      </FormField>

      <FormField label="Status">
        <Toggle
          name="status"
          checked={!!formData.status}
          onChange={handleChange}
          label={formData.status ? "Active" : "Inactive"}
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</ActionBtn>
        <ActionBtn type="submit" variant="primary" loading={isSubmitting}>Save Changes</ActionBtn>
      </div>
    </form>
  );
};

export default UpdateContact;
