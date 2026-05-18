"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  SectionCard, FormField, Input, Select, Toggle, ActionBtn,
  ErrorBanner, SuccessAlert, FormGrid, InfoBox, FormActions,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const EMPTY = {
  code: "",
  type: "fixed",
  value: "",
  min_order_amount: "",
  max_discount: "",
  usage_limit: "",
  per_user_limit: "",
  valid_from: "",
  valid_to: "",
  is_active: true,
  category_ids: [],
  product_ids: [],
};

const toDtLocal = (v) => (v ? String(v).slice(0, 16) : "");

const CouponForm = ({ mode = "create", initial = null, onSaved, onCancel }) => {
  const [formData, setFormData] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [productFilter, setProductFilter] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/category`).catch(() => ({ data: { categories: [] } })),
      axios.get(`${apiUrl}/products`).catch(() => ({ data: { products: [] } })),
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data.categories || catRes.data || []);
      const list = prodRes.data.products?.data || prodRes.data.products || prodRes.data || [];
      setProducts(Array.isArray(list) ? list : []);
    });
  }, []);

  useEffect(() => {
    if (!initial) return;
    setFormData({
      code: initial.code || "",
      type: initial.type || "fixed",
      value: initial.value ?? "",
      min_order_amount: initial.min_order_amount ?? "",
      max_discount: initial.max_discount ?? "",
      usage_limit: initial.usage_limit ?? "",
      per_user_limit: initial.per_user_limit ?? "",
      valid_from: toDtLocal(initial.valid_from),
      valid_to: toDtLocal(initial.valid_to),
      is_active: !!initial.is_active,
      category_ids: (initial.categories || []).map((c) => c.id),
      product_ids: (initial.products || []).map((p) => p.id),
    });
  }, [initial]);

  const filteredProducts = useMemo(() => {
    const q = productFilter.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [products, productFilter]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleArr = (key, id) => {
    setFormData((prev) => {
      const has = prev[key].includes(id);
      return { ...prev, [key]: has ? prev[key].filter((x) => x !== id) : [...prev[key], id] };
    });
  };

  const validate = () => {
    if (!formData.code.trim()) return "Coupon code is required";
    if (formData.type !== "free_delivery") {
      const v = parseFloat(formData.value);
      if (!Number.isFinite(v) || v <= 0) return "Discount value must be greater than 0";
      if (formData.type === "percentage" && v > 100) return "Percentage cannot exceed 100";
    }
    if (formData.valid_from && formData.valid_to && formData.valid_from > formData.valid_to) {
      return "Valid to must be after valid from";
    }
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
      code: formData.code.trim(),
      type: formData.type,
      value: formData.type === "free_delivery" ? 0 : parseFloat(formData.value || 0),
      min_order_amount: formData.min_order_amount === "" ? null : parseFloat(formData.min_order_amount),
      max_discount:
        formData.type === "percentage" && formData.max_discount !== ""
          ? parseFloat(formData.max_discount)
          : null,
      usage_limit: formData.usage_limit === "" ? null : parseInt(formData.usage_limit, 10),
      per_user_limit: formData.per_user_limit === "" ? null : parseInt(formData.per_user_limit, 10),
      valid_from: formData.valid_from || null,
      valid_to: formData.valid_to || null,
      is_active: !!formData.is_active,
      category_ids: formData.category_ids,
      product_ids: formData.product_ids,
    };

    try {
      const res = mode === "edit" && initial
        ? await axios.put(`${apiUrl}/coupons/${initial.id}`, payload)
        : await axios.post(`${apiUrl}/coupons`, payload);

      setSuccess(mode === "edit" ? "Coupon updated successfully" : "Coupon created successfully");
      if (mode === "create") setFormData(EMPTY);
      setTimeout(() => { setSuccess(null); onSaved?.(res.data.coupon); }, 800);
    } catch (err) {
      const e1 = err.response?.data;
      const firstFieldErr = e1?.errors ? Object.values(e1.errors)[0]?.[0] : null;
      setError(firstFieldErr || e1?.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const showValue = formData.type !== "free_delivery";
  const showMaxDiscount = formData.type === "percentage";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />

      <SectionCard>
        <FormGrid>
          <FormField label="Coupon Code" required hint="Must be unique. Customers type this in the cart.">
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. SAVE50"
              required
              style={{ textTransform: "uppercase" }}
            />
          </FormField>

          <FormField label="Coupon Type" required>
            <Select name="type" value={formData.type} onChange={handleChange}>
              <option value="fixed">Fixed Amount (৳)</option>
              <option value="percentage">Percentage (%)</option>
              <option value="free_delivery">Free Delivery</option>
            </Select>
          </FormField>
        </FormGrid>

        {showValue && (
          <FormGrid className="mt-4">
            <FormField
              label={formData.type === "percentage" ? "Discount %" : "Discount Amount (৳)"}
              required
            >
              <Input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder={formData.type === "percentage" ? "e.g. 10" : "e.g. 100"}
                min="0"
                max={formData.type === "percentage" ? "100" : undefined}
                step="0.01"
                required
              />
            </FormField>

            {showMaxDiscount && (
              <FormField
                label="Max Discount Cap (৳)"
                hint="Cap on percentage discount. Leave blank for no cap."
              >
                <Input
                  type="number"
                  name="max_discount"
                  value={formData.max_discount}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  min="0"
                  step="0.01"
                />
              </FormField>
            )}
          </FormGrid>
        )}
      </SectionCard>

      <SectionCard>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Limits & Validity</h3>
        <FormGrid>
          <FormField label="Minimum Order Amount (৳)" hint="Leave blank for no minimum">
            <Input
              type="number"
              name="min_order_amount"
              value={formData.min_order_amount}
              onChange={handleChange}
              placeholder="e.g. 1000"
              min="0"
              step="0.01"
            />
          </FormField>
          <FormField label="Total Usage Limit" hint="Total number of times this coupon can be used">
            <Input
              type="number"
              name="usage_limit"
              value={formData.usage_limit}
              onChange={handleChange}
              placeholder="Unlimited if blank"
              min="1"
            />
          </FormField>
          <FormField label="Per-User Usage Limit" hint="Max uses per phone number">
            <Input
              type="number"
              name="per_user_limit"
              value={formData.per_user_limit}
              onChange={handleChange}
              placeholder="Unlimited if blank"
              min="1"
            />
          </FormField>
        </FormGrid>

        <FormGrid className="mt-4">
          <FormField label="Valid From">
            <Input
              type="datetime-local"
              name="valid_from"
              value={formData.valid_from}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Valid To">
            <Input
              type="datetime-local"
              name="valid_to"
              value={formData.valid_to}
              onChange={handleChange}
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
            description="Customers can apply this coupon when active"
          />
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Apply To Categories</h3>
        <p className="text-xs text-gray-500 mb-3">
          Select one or more categories. Leave empty to apply to all products.
        </p>
        {categories.length === 0 ? (
          <InfoBox variant="info">No categories available yet.</InfoBox>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
            {categories.map((c) => {
              const active = formData.category_ids.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleArr("category_ids", c.id)}
                  className={`px-3 py-2 rounded-lg text-xs text-left border transition-colors ${
                    active
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Apply To Specific Products (Optional)</h3>
        <p className="text-xs text-gray-500 mb-3">
          Optional — narrow the coupon to specific products. Category match alone is enough if left empty.
        </p>
        <Input
          placeholder="Search products by name…"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="mb-3"
        />
        {filteredProducts.length === 0 ? (
          <InfoBox variant="info">No products match.</InfoBox>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const active = formData.product_ids.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggleArr("product_ids", p.id)}
                  className={`px-3 py-2 rounded-lg text-xs text-left border transition-colors ${
                    active
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      <FormActions
        submitLabel={mode === "edit" ? "Update Coupon" : "Create Coupon"}
        loading={submitting}
        onCancel={onCancel}
      />
    </form>
  );
};

export default CouponForm;
