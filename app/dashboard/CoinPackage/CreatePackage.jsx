"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Package } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, ActionBtn, ErrorBanner, Toggle,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreatePackage = ({ onPackageCreated }) => {
  const [formData, setFormData] = useState({ name: "", coins: "", price: "", is_active: false });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/coinpackages`, formData);
      if (onPackageCreated) onPackageCreated();
      setFormData({ name: "", coins: "", price: "", is_active: false });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Coin Package"
        icon={Package}
        subtitle="Add a new purchasable coin package for customers"
      />

      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          <ErrorBanner message={error} />

          <FormField label="Package Name" required>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="e.g. Eid Special"
            />
          </FormField>

          <FormField label="Package Coins" required>
            <Input
              name="coins"
              value={formData.coins}
              onChange={handleChange}
              required
              maxLength={20}
              placeholder="e.g. 500"
            />
          </FormField>

          <FormField label="Package Price (৳)" required>
            <Input
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              maxLength={20}
              placeholder="e.g. 100"
            />
          </FormField>

          <FormField label="Status">
            <Toggle
              name="is_active"
              checked={!!formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              label={formData.is_active ? "Active" : "Inactive"}
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={isSubmitting}>Create Package</ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreatePackage;
