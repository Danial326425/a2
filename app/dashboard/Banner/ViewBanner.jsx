"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateBanner from "./UpdateBanner";
import { Image, Pencil, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog, Badge,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    title: "", description: "", image: null, link: "", is_active: true, sort_order: 0,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    axios.get(`${apiUrl}/banners`)
      .then(r => setBanners(r.data || []))
      .catch(() => setError("Failed to load banners"))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/bannerdelete/${deleteTarget}`);
      setBanners(prev => prev.filter(b => b.id !== deleteTarget));
    } catch { setError("Failed to delete banner"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (banner) => {
    setEditingBanner(banner.id);
    setFormData({
      title: banner.title || "", description: banner.description || "", link: banner.link || "",
      is_active: banner.is_active, sort_order: banner.sort_order ?? 0, image: null,
    });
    setPreviewUrl(`${imageUrl}/${banner.image}`);
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const data = new FormData();
    data.append("_method", "PUT");
    // Coalesce null/undefined to "" — otherwise FormData sends the literal
    // string "null", which fails the backend `link => nullable|url` rule and
    // forces the user to enter a link just to update the image.
    data.append("title", formData.title || "");
    data.append("description", formData.description || "");
    if (formData.image) data.append("image", formData.image);
    data.append("link", formData.link || "");
    data.append("is_active", formData.is_active ? "1" : "0");
    data.append("sort_order", formData.sort_order || 0);
    try {
      await axios.post(`${apiUrl}/bannersupdate/${editingBanner}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRefreshKey(k => k + 1);
      setEditingBanner(null);
    } catch (err) { setError(err.response?.data?.message || "Failed to update banner"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader
        title="Banners"
        icon={Image}
        badge={banners.length}
        subtitle="Manage homepage banner slides"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Banner</TH>
            <TH>Title</TH>
            <TH>Status</TH>
            <TH>Sort</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : banners.length === 0 ? (
            <tbody><tr><td colSpan={5}>
              <EmptyState icon={Image} title="No banners" message="Add banner images to display on your homepage." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {banners.map(banner => (
                  <motion.tr
                    key={banner.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <img
                          src={`${imageUrl}/${banner.image}?${refreshKey}`}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TD>
                    <TD>
                      <span className="font-medium text-gray-900 text-sm">{banner.title || "—"}</span>
                    </TD>
                    <TD>
                      <Badge variant={banner.is_active ? "success" : "danger"}>
                        {banner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-600">{banner.sort_order}</span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(banner)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(banner.id)}
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
        title="Delete Banner"
        message="Are you sure you want to delete this banner?"
        confirmLabel="Delete"
      />

      {editingBanner && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Banner</h2>
                </div>
                <button onClick={() => setEditingBanner(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateBanner
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                  setEditingBanner={setEditingBanner}
                  previewUrl={previewUrl}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBanner;
