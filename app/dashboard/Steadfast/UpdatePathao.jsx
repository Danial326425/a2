"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  FormField, Input, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const UpdatePathao = ({ formData, setFormData, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${apiUrl}/pathao/settings`, formData);
      onSuccess(response.data ? response.data.data : formData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update Pathao config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorBanner message={error} />

      <FormField label="Client ID" required>
        <Input
          name="pathao_client_id"
          value={formData.pathao_client_id}
          onChange={handleChange}
          required
          placeholder="Enter Client ID"
        />
      </FormField>

      <FormField label="Client Secret" required>
        <Input
          name="pathao_client_secret"
          value={formData.pathao_client_secret}
          onChange={handleChange}
          required
          placeholder="Enter Client Secret"
        />
      </FormField>

      <FormField label="Email" required>
        <Input
          type="email"
          name="pathao_email"
          value={formData.pathao_email}
          onChange={handleChange}
          required
          placeholder="pathao@example.com"
        />
      </FormField>

      <FormField label="Password" required>
        <Input
          type="password"
          name="pathao_password"
          value={formData.pathao_password}
          onChange={handleChange}
          required
          placeholder="••••••••"
        />
      </FormField>

      <FormField label="Store ID" required>
        <Input
          name="pathao_store_id"
          value={formData.pathao_store_id}
          onChange={handleChange}
          required
          placeholder="Enter Store ID"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</ActionBtn>
        <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
      </div>
    </form>
  );
};

export default UpdatePathao;
