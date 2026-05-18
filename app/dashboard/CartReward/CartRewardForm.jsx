"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  SectionCard, FormField, Input, Select, Toggle,
  ErrorBanner, SuccessAlert, FormGrid, FormActions,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const EMPTY = {
  min_amount: "",
  discount_type: "percentage",
  discount_value: "",
  max_discount: "",
  label: "",
  sort_order: 0,
  is_active: true,
};

const CartRewardForm = ({ mode = "create", initial = null, onSaved, onCancel }) => {
  const [formData, setFormData] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setFormData({
      min_amount: initial.min_amount ?? "",
      discount_type: initial.discount_type || "percentage",
      discount_value: initial.discount_value ?? "",
      max_discount: initial.max_discount ?? "",
      label: initial.label || "",
      sort_order: initial.sort_order ?? 0,
      is_active: !!initial.is_active,
    });
  }, [initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (formData.min_amount === "" || parseFloat(formData.min_amount) <= 0) {
      return "Minimum cart amount must be greater than 0";
    }
    const dv = parseFloat(formData.discount_value);
    if (!Number.isFinite(dv) || dv <= 0) return "Discount value must be greater than 0";
    if (formData.discount_type === "percentage" && dv > 100) return "Percentage cannot exceed 100";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);

    const payload = {
      min_amount: parseFloat(formData.min_amount),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      max_discount:
        formData.discount_type === "percentage" && formData.max_discount !== ""
          ? parseFloat(formData.max_discount)
          : null,
      label: formData.label?.trim() || null,
      sort_order: parseInt(formData.sort_order || 0, 10),
      is_active: !!formData.is_active,
    };

    try {
      const res = mode === "edit" && initial
        ? await axios.put(`${apiUrl}/cart-rewards/${initial.id}`, payload)
        : await axios.post(`${apiUrl}/cart-rewards`, payload);
      setSuccess(mode === "edit" ? "Tier updated" : "Tier created");
      if (mode === "create") setFormData(EMPTY);
      setTimeout(() => { setSuccess(null); onSaved?.(res.data.reward); }, 800);
    } catch (err) {
      const e1 = err.response?.data;
      const first = e1?.errors ? Object.values(e1.errors)[0]?.[0] : null;
      setError(first || e1?.message || "Failed to save tier");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />

      <SectionCard>
        <FormGrid>
          <FormField label="Minimum Cart Amount (৳)" required hint="Customer qualifies for this tier when cart ≥ this amount">
            <Input
              type="number"
              name="min_amount"
              value={formData.min_amount}
              onChange={handleChange}
              placeholder="e.g. 5000"
              min="0"
              step="0.01"
              required
            />
          </FormField>
          <FormField label="Discount Type" required>
            <Select name="discount_type" value={formData.discount_type} onChange={handleChange}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (৳)</option>
            </Select>
          </FormField>
        </FormGrid>

        <FormGrid className="mt-4">
          <FormField
            label={formData.discount_type === "percentage" ? "Discount %" : "Discount Amount (৳)"}
            required
          >
            <Input
              type="number"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleChange}
              placeholder={formData.discount_type === "percentage" ? "e.g. 10" : "e.g. 200"}
              min="0"
              max={formData.discount_type === "percentage" ? "100" : undefined}
              step="0.01"
              required
            />
          </FormField>

          {formData.discount_type === "percentage" && (
            <FormField label="Max Discount Cap (৳)" hint="Optional cap on percentage discount">
              <Input
                type="number"
                name="max_discount"
                value={formData.max_discount}
                onChange={handleChange}
                placeholder="e.g. 1000"
                min="0"
                step="0.01"
              />
            </FormField>
          )}
        </FormGrid>

        <FormGrid className="mt-4">
          <FormField label="Customer-Facing Label" hint='Optional. e.g. "Buy ৳5000 → ৳500 off"'>
            <Input
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder='e.g. "৳5000-এ ১০% ছাড়"'
            />
          </FormField>
          <FormField label="Sort Order" hint="Lower number displays first">
            <Input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              min="0"
            />
          </FormField>
        </FormGrid>

        <div className="mt-5">
          <Toggle
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            label="Active"
            description="Tier counts toward the progress bar when active"
          />
        </div>
      </SectionCard>

      <FormActions
        submitLabel={mode === "edit" ? "Update Tier" : "Create Tier"}
        loading={submitting}
        onCancel={onCancel}
      />
    </form>
  );
};

export default CartRewardForm;
