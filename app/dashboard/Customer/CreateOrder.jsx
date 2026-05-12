"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { config } from "../../../config";
import { ShoppingCart } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea, Select,
  ActionBtn, ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const generateOrderId = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${yy}${mm}${dd}-${rand}`;
};

const CreateOrder = ({ onOrderCreated }) => {
  const [deliveryCharges, setDeliveryCharges] = useState([]);
  const [formData, setFormData] = useState({
    order_id: generateOrderId(),
    customer_name: "",
    customer_address: "",
    phone_number: "",
    product_name: "",
    color: "",
    size: "",
    quantity: "1",
    total: "",
    delivery_charge: "",
    payment_method: "cash",
    payment_number: "",
    delivery_note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/deliverycharges`)
      .then(r => setDeliveryCharges(r.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (e) => {
    const charge = deliveryCharges.find(d => String(d.id) === e.target.value);
    setFormData(prev => ({
      ...prev,
      delivery_charge: charge ? charge.delivery_charge : "",
      customer_address: charge
        ? prev.customer_address || charge.district_name
        : prev.customer_address,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/customers`, formData);
      setSuccess(`Order ${formData.order_id} created successfully!`);
      setTimeout(() => {
        setSuccess(null);
        if (onOrderCreated) onOrderCreated();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Order"
        icon={ShoppingCart}
        subtitle="Manually create a customer order"
      />

      <ErrorBanner message={error} />
      <SuccessAlert message={success} />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Order ID */}
        <SectionCard>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Order Details</p>
          <FormGrid>
            <FormField label="Order ID" required hint="Auto-generated — edit if needed">
              <Input
                name="order_id"
                value={formData.order_id}
                onChange={handleChange}
                required
                placeholder="ORD-YYMMDD-XXXX"
              />
            </FormField>
            <FormField label="Payment Method">
              <Select name="payment_method" value={formData.payment_method} onChange={handleChange}>
                <option value="cash">Cash on Delivery</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="bank">Bank Transfer</option>
              </Select>
            </FormField>
          </FormGrid>
          {(formData.payment_method === "bkash" || formData.payment_method === "nagad" || formData.payment_method === "rocket") && (
            <FormField label="Payment Number / Transaction ID">
              <Input
                name="payment_number"
                value={formData.payment_number}
                onChange={handleChange}
                placeholder="e.g. 01XXXXXXXXX or TXN123"
              />
            </FormField>
          )}
        </SectionCard>

        {/* Customer Info */}
        <SectionCard>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Customer Information</p>
          <div className="space-y-4">
            <FormGrid>
              <FormField label="Customer Name" required>
                <Input
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                />
              </FormField>
              <FormField label="Phone Number" required>
                <Input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  placeholder="01XXXXXXXXX"
                />
              </FormField>
            </FormGrid>
            <FormField label="Delivery Area">
              <Select onChange={handleDeliveryChange} defaultValue="">
                <option value="">— Select district for charge —</option>
                {deliveryCharges.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.district_name} — ৳{d.delivery_charge}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Customer Address" required>
              <Input
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                required
                placeholder="Full delivery address"
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Product Info */}
        <SectionCard>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Product Information</p>
          <div className="space-y-4">
            <FormField label="Product Name" required>
              <Input
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
                placeholder="Product name"
              />
            </FormField>
            <FormGrid>
              <FormField label="Color">
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g. Red"
                />
              </FormField>
              <FormField label="Size">
                <Input
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="e.g. M, L, XL"
                />
              </FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Quantity" required>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="1"
                />
              </FormField>
              <FormField label="Delivery Charge (৳)">
                <Input
                  type="number"
                  name="delivery_charge"
                  value={formData.delivery_charge}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </FormField>
            </FormGrid>
            <FormField label="Total Amount (৳)" required>
              <Input
                type="number"
                name="total"
                value={formData.total}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 650"
              />
            </FormField>
            <FormField label="Delivery Note">
              <Textarea
                name="delivery_note"
                value={formData.delivery_note}
                onChange={handleChange}
                rows={2}
                placeholder="Optional instructions for delivery…"
              />
            </FormField>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3 pt-2">
          <ActionBtn
            type="button"
            variant="secondary"
            onClick={() => { if (onOrderCreated) onOrderCreated(); }}
            disabled={loading}
          >
            Cancel
          </ActionBtn>
          <ActionBtn type="submit" variant="primary" loading={loading}>
            Create Order
          </ActionBtn>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
