"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Gift } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateBonus = ({ onCoinCreated }) => {
  const [formData, setFormData] = useState({ first_reg_bonus: "", bonus_percentage: "", coin_name: "" });
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
      await axios.post(`${apiUrl}/bonuscoins`, formData);
      if (onCoinCreated) onCoinCreated();
      setFormData({ first_reg_bonus: "", bonus_percentage: "", coin_name: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create bonus coins.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Coin Bonus"
        icon={Gift}
        subtitle="Configure first registration and purchase bonus coins"
      />

      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          <ErrorBanner message={error} />

          <FormField label="First Registration Bonus" required hint="Coins awarded on first registration">
            <Input
              name="first_reg_bonus"
              value={formData.first_reg_bonus}
              onChange={handleChange}
              required
              placeholder="e.g. 100"
            />
          </FormField>

          <FormField label="Purchase Bonus (%)" required hint="Percentage of purchase value awarded as coins">
            <Input
              name="bonus_percentage"
              value={formData.bonus_percentage}
              onChange={handleChange}
              required
              placeholder="e.g. 5"
            />
          </FormField>

          <FormField label="Coin Name" required>
            <Input
              name="coin_name"
              value={formData.coin_name}
              onChange={handleChange}
              required
              maxLength={20}
              placeholder="e.g. Sunnah Coin"
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={isSubmitting}>Create Bonus</ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateBonus;
