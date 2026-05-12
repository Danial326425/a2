"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Zap, Key } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, PasswordInput,
  ActionBtn, ErrorBanner, SuccessAlert, FormGrid, TabBar, InfoBox,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const CreateSteadfast = ({ onSteadfastCreated }) => {
  const [tab, setTab] = useState("steadfast");

  const [steadfastForm, setSteadfastForm] = useState({ apiKey: "", secretKey: "" });
  const [pathaoForm, setPathaoForm] = useState({
    pathao_client_id: "", pathao_client_secret: "",
    pathao_email: "", pathao_password: "", pathao_store_id: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSteadChange = (e) => {
    const { name, value } = e.target;
    setSteadfastForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePathaoChange = (e) => {
    const { name, value } = e.target;
    setPathaoForm(prev => ({ ...prev, [name]: value }));
  };

  const submitSteadfast = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await axios.post(`${apiUrl}/steadfasts`, steadfastForm);
      setSuccess("Steadfast configuration saved!");
      setTimeout(() => { setSuccess(null); if (onSteadfastCreated) onSteadfastCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save Steadfast config");
    } finally { setSubmitting(false); }
  };

  const submitPathao = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await axios.post(`${apiUrl}/pathao/settings`, pathaoForm);
      setSuccess("Pathao configuration saved!");
      setTimeout(() => { setSuccess(null); if (onSteadfastCreated) onSteadfastCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save Pathao config");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Courier Configuration" icon={Zap} subtitle="Set up your delivery partner API credentials" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />

      <SectionCard>
        <div className="mb-6">
          <TabBar
            tabs={[
              { key: "steadfast", label: "Steadfast" },
              { key: "pathao", label: "Pathao" },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === "steadfast" && (
          <form onSubmit={submitSteadfast} className="space-y-5">
            <InfoBox variant="tip">
              Get your Steadfast API credentials from the <strong>Steadfast Courier</strong> merchant panel.
            </InfoBox>
            <FormGrid>
              <FormField label="API Key" required>
                <Input name="apiKey" value={steadfastForm.apiKey} onChange={handleSteadChange} placeholder="Enter API Key" required />
              </FormField>
              <FormField label="Secret Key" required>
                <Input name="secretKey" value={steadfastForm.secretKey} onChange={handleSteadChange} placeholder="Enter Secret Key" required />
              </FormField>
            </FormGrid>
            <div className="flex justify-end pt-2">
              <ActionBtn type="submit" variant="primary" loading={submitting} icon={Key}>
                Save Steadfast Config
              </ActionBtn>
            </div>
          </form>
        )}

        {tab === "pathao" && (
          <form onSubmit={submitPathao} className="space-y-5">
            <InfoBox variant="tip">
              Get your Pathao credentials from the <strong>Pathao for Business</strong> merchant panel.
            </InfoBox>
            <FormGrid>
              <FormField label="Client ID" required>
                <Input name="pathao_client_id" value={pathaoForm.pathao_client_id} onChange={handlePathaoChange} placeholder="Client ID" required />
              </FormField>
              <FormField label="Client Secret" required>
                <Input name="pathao_client_secret" value={pathaoForm.pathao_client_secret} onChange={handlePathaoChange} placeholder="Client Secret" required />
              </FormField>
              <FormField label="Merchant Email" required>
                <Input type="email" name="pathao_email" value={pathaoForm.pathao_email} onChange={handlePathaoChange} placeholder="email@example.com" required />
              </FormField>
              <FormField label="Password" required>
                <PasswordInput name="pathao_password" value={pathaoForm.pathao_password} onChange={handlePathaoChange} placeholder="Your Pathao password" required />
              </FormField>
              <FormField label="Store ID" required>
                <Input name="pathao_store_id" value={pathaoForm.pathao_store_id} onChange={handlePathaoChange} placeholder="Store ID" required />
              </FormField>
            </FormGrid>
            <div className="flex justify-end pt-2">
              <ActionBtn type="submit" variant="primary" loading={submitting} icon={Key}>
                Save Pathao Config
              </ActionBtn>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
};

export default CreateSteadfast;
