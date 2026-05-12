"use client";

import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Share2 } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Toggle,
  ActionBtn, ErrorBanner, SuccessAlert, InfoBox,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const ICON_LIST = "FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaGithub, FaTelegram, FaLinkedin, FaTiktok, FaTwitter, FaDiscord, FaReddit, FaSnapchat, FaPinterest";

const CreateSocial = ({ onSocialCreated }) => {
  const [formData, setFormData] = useState({ name: "", icon_class: "", url: "", status: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/sociallinks`, formData);
      setSuccess("Social link created!");
      setFormData({ name: "", icon_class: "", url: "", status: true });
      setTimeout(() => { setSuccess(null); if (onSocialCreated) onSocialCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create social link");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Social Link" icon={Share2} subtitle="Add a social media profile link" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />
      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Platform Name" required>
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Facebook" required maxLength={255} />
          </FormField>

          <FormField label="Icon Class" required hint="Use a React-Icons class name from the list below">
            <Input name="icon_class" value={formData.icon_class} onChange={handleChange} placeholder="e.g. FaFacebook" required maxLength={255} />
            <InfoBox variant="tip" className="mt-2">
              Available icons: {ICON_LIST}
            </InfoBox>
          </FormField>

          <FormField label="Profile URL" required>
            <Input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://facebook.com/yourpage" required maxLength={500} />
          </FormField>

          <Toggle
            name="status"
            id="status"
            checked={formData.status}
            onChange={handleChange}
            label="Active"
            description="Show this link on the website"
          />

          <div className="flex justify-end pt-2">
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              Create Social Link
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateSocial;
