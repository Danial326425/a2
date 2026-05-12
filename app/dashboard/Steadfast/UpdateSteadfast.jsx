"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  FormField, Input, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const UpdateSteadfast = ({ formData, setFormData, onCancel, onSuccess, id }) => {
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
      const response = await axios.put(`${apiUrl}/steadfastsupdate/${id}`, formData);
      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update Steadfast config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorBanner message={error} />

      <FormField label="API Key" required>
        <Input
          name="apiKey"
          value={formData.apiKey}
          onChange={handleChange}
          required
          placeholder="Enter API Key"
        />
      </FormField>

      <FormField label="Secret Key" required>
        <Input
          name="secretKey"
          value={formData.secretKey}
          onChange={handleChange}
          required
          placeholder="Enter Secret Key"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</ActionBtn>
        <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
      </div>
    </form>
  );
};

export default UpdateSteadfast;
