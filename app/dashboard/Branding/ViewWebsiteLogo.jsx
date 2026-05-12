"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateWebsiteLogo from "./UpdateWebsiteLogo";
import { Globe, Pencil, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewWebsiteLogo = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLogo, setEditingLogo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ image: null, brand_slogan: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    axios.get(`${apiUrl}/websitelogos`)
      .then(r => setLogos(r.data || []))
      .catch(() => setError("Failed to load logos"))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/websitelogodelete/${deleteTarget}`);
      setLogos(prev => prev.filter(l => l.id !== deleteTarget));
    } catch { setError("Failed to delete logo"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (logo) => {
    setEditingLogo(logo.id);
    setFormData({ brand_slogan: logo.brand_slogan, image: null });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("_method", "PUT");
    data.append("brand_slogan", formData.brand_slogan);
    if (formData.image) data.append("image", formData.image);
    try {
      await axios.post(`${apiUrl}/websitelogosupdate/${editingLogo}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRefreshKey(k => k + 1);
      setEditingLogo(null);
    } catch (err) { setError(err.response?.data?.message || "Failed to update logo"); }
  };

  return (
    <div>
      <PageHeader
        title="Website Logo"
        icon={Globe}
        badge={logos.length}
        subtitle="Manage your brand logo and slogan"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Logo</TH>
            <TH>Brand Slogan</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={2} cols={3} />
          ) : logos.length === 0 ? (
            <tbody><tr><td colSpan={3}>
              <EmptyState icon={Globe} title="No logo" message="Upload your brand logo to display on the store." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {logos.map(logo => (
                  <motion.tr
                    key={logo.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <div className="w-20 h-12 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                        <img
                          src={`${imageUrl}/${logo.logo}?${refreshKey}`}
                          alt="Logo"
                          className="max-h-10 max-w-full object-contain"
                        />
                      </div>
                    </TD>
                    <TD>
                      <span className="font-medium text-gray-900 text-sm">{logo.brand_slogan}</span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(logo)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(logo.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        />
                      </div>
                    </TD>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          )}
        </Table>
      </SectionCard>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Logo"
        message="Are you sure you want to delete this logo?"
        confirmLabel="Delete"
      />

      {editingLogo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-lg bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Pencil size={15} className="text-indigo-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Logo</h2>
                </div>
                <button onClick={() => setEditingLogo(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateWebsiteLogo
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                  setEditingLogo={setEditingLogo}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewWebsiteLogo;
