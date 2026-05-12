"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { MessageSquare } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea, Toggle,
  ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateContact = ({ onContactCreated }) => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: "", status: true,
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
    setSubmitting(true); setError(null);
    try {
      await axios.post(`${apiUrl}/contacts`, formData);
      setSuccess("Contact created successfully!");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "", status: true });
      setTimeout(() => { setSuccess(null); if (onContactCreated) onContactCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create contact");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Create Contact" icon={MessageSquare} subtitle="Add a contact form entry manually" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormGrid>
            <FormField label="Full Name" required>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required maxLength={255} />
            </FormField>
            <FormField label="Email" required>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required maxLength={255} />
            </FormField>
            <FormField label="Phone Number" required>
              <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+880XXXXXXXXX" required maxLength={20} />
            </FormField>
            <FormField label="Subject" required>
              <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="Regarding your service" required maxLength={255} />
            </FormField>
          </FormGrid>

          <FormField label="Message" required hint="Minimum 10 characters">
            <Textarea name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Type your message here…" required minLength={10} />
          </FormField>

          <Toggle
            name="status"
            id="status"
            checked={formData.status}
            onChange={handleChange}
            label="Active"
            description="Mark this contact as active"
          />

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Contact
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateContact;
