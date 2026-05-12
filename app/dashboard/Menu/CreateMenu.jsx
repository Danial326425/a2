"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Navigation } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Select,
  ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateMenu = ({ onMenuCreated }) => {
  const [formData, setFormData] = useState({ name: "", url: "", menu_type: "footer", order: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "order" ? parseInt(value) || 1 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/menus`, formData);
      setSuccess("Menu item created!");
      setFormData({ name: "", url: "", menu_type: "footer", order: 1 });
      setTimeout(() => { setSuccess(null); if (onMenuCreated) onMenuCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create menu");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Menu Item" icon={Navigation} subtitle="Add a navigation link to your site menus" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormGrid>
            <FormField label="Menu Name" required>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Privacy Policy" required maxLength={255} />
            </FormField>
            <FormField label="Menu Type" required>
              <Select name="menu_type" value={formData.menu_type} onChange={handleChange} required>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
                <option value="sidebar">Sidebar</option>
              </Select>
            </FormField>
          </FormGrid>

          <FormField label="URL" required>
            <Input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://example.com/page" required maxLength={500} />
          </FormField>

          <FormField label="Sort Order" hint="Lower numbers appear first">
            <Input type="number" name="order" value={formData.order} onChange={handleChange} min={1} />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Menu
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateMenu;
