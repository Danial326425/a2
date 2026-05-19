"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Phone, Mail, MapPin, CreditCard, Copyright } from "lucide-react";
import {
  SectionCard, FormField, Input, Textarea, ActionBtn,
  ErrorBanner, SuccessAlert, FormGrid,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const EMPTY = { email: "", phone: "", address: "", tnx_number: "", copyright_html: "" };

const ContactSettings = () => {
  const [formData, setFormData] = useState(EMPTY);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/contactinfos`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const first = list[0];
        if (first) {
          setCurrentId(first.id);
          setFormData({
            email:          first.email          || "",
            phone:          first.phone          || "",
            address:        first.address        || "",
            tnx_number:     first.tnx_number     || "",
            copyright_html: first.copyright_html || "",
          });
        }
      })
      .catch(() => setError("Failed to load contact info"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = currentId
        ? await axios.put(`${apiUrl}/contactinfosupdate/${currentId}`, formData)
        : await axios.post(`${apiUrl}/contactinfos`, formData);

      const saved = res.data?.data;
      if (saved?.id) setCurrentId(saved.id);
      setSuccess(currentId ? "Contact info updated successfully" : "Contact info saved successfully");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      const data = err.response?.data;
      const first = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
      setError(first || data?.message || "Failed to save contact info");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        এই information আপনার storefront-এর header, footer এবং Contact Us page-এ দেখানো হবে।
      </p>

      <ErrorBanner message={error} />
      {success && <SuccessAlert message={success} />}

      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormGrid>
            <FormField label="Email Address" required hint="Must be unique. Used for customer contact.">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@yourstore.com"
                  required
                  maxLength={255}
                  className="pl-9"
                />
              </div>
            </FormField>

            <FormField label="Phone Number" required hint="Shown as clickable tel: link">
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+880XXXXXXXXX"
                  required
                  maxLength={20}
                  className="pl-9"
                />
              </div>
            </FormField>
          </FormGrid>

          <FormField label="Transaction Number" required hint="bKash / Nagad / Rocket number for COD advance payments">
            <div className="relative">
              <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                name="tnx_number"
                value={formData.tnx_number}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                required
                maxLength={20}
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField label="Address" hint="Full address — shown on Contact page (max 500 characters)">
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
              <Textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="House, Road, Area, City"
                maxLength={500}
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField
            label="Footer Copyright Text"
            hint={
              <>
                Shown at the bottom of every page. HTML allowed (e.g. <code className="text-[11px] bg-gray-50 px-1 rounded">&copy; {new Date().getFullYear()} Your Store. All rights reserved.</code>). Leave blank for default.
              </>
            }
          >
            <div className="relative">
              <Copyright size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
              <Textarea
                name="copyright_html"
                value={formData.copyright_html}
                onChange={handleChange}
                rows={3}
                placeholder={`&copy; ${new Date().getFullYear()} Your Store. All rights reserved.`}
                className="pl-9 font-mono text-xs"
              />
            </div>
            {formData.copyright_html && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-gray-200 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Preview</span>
                <div
                  className="[&_a]:text-white [&_a]:font-semibold [&_a]:underline [&_a:hover]:text-green-300"
                  dangerouslySetInnerHTML={{ __html: formData.copyright_html }}
                />
              </div>
            )}
          </FormField>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {currentId ? `Editing existing record · ID #${currentId}` : "Creating new contact info"}
            </p>
            <ActionBtn type="submit" variant="primary" loading={submitting}>
              {currentId ? "Update Contact Info" : "Save Contact Info"}
            </ActionBtn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default ContactSettings;
