"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import QuillEditor from "../../components/QuillEditor";
import { FileText } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input,
  ActionBtn, ErrorBanner, SuccessAlert,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateLegal = ({ onLegalCreated }) => {
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await axios.post(`${apiUrl}/legalpages`, formData);
      setSuccess("Legal page created!");
      setFormData({ title: "", content: "" });
      setTimeout(() => { setSuccess(null); if (onLegalCreated) onLegalCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create legal page");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Create Legal Page" icon={FileText} subtitle="Add a privacy policy, terms of service, or other legal page" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Page Title" required>
            <Input
              name="title"
              value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Privacy Policy"
              required
            />
          </FormField>

          <FormField label="Content" required>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <QuillEditor
                value={formData.content}
                onChange={(v) => setFormData(p => ({ ...p, content: v || "" }))}
                style={{ minHeight: 280 }}
              />
            </div>
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Legal Page
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateLegal;
