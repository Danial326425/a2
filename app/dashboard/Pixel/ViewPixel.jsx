"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdatePixel from "./UpdatePixel";
import { Activity, Pencil, Trash2, Code } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog, Badge,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewPixel = () => {
  const [pixels, setPixels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPixel, setEditingPixel] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    pixel_id: "", fb_access_token: "", test_event_code: "", is_purchase: true,
  });

  // Pixel routes are auth:sanctum protected. Helper produces the Bearer
  // header from the admin's stored token so every call (list / delete / update)
  // authenticates correctly. Without this we get "Unauthenticated." 401s.
  const authHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    axios.get(`${apiUrl}/pixels`, { headers: authHeaders() })
      .then(r => setPixels(r.data?.pixels || r.data || []))
      .catch((err) => {
        const status = err.response?.status;
        setError(status === 401 || status === 403
          ? "Session expired. Please log in again."
          : "Failed to load pixels");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/pixeldelete/${deleteTarget}`, { headers: authHeaders() });
      setPixels(prev => prev.filter(p => p.id !== deleteTarget));
    } catch { setError("Failed to delete pixel"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (pixel) => {
    setEditingPixel(pixel.id);
    setFormData({
      pixel_id: pixel.pixel_id,
      fb_access_token: pixel.fb_access_token,
      test_event_code: pixel.test_event_code,
      is_purchase: pixel.is_purchase ?? true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPixel) return;
    try {
      await axios.put(`${apiUrl}/pixelsupdate/${editingPixel}`, formData, { headers: authHeaders() });
      setPixels(prev => prev.map(p => p.id === editingPixel ? { ...p, ...formData } : p));
      setEditingPixel(null);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 401 || status === 403
        ? "Session expired. Please log in again."
        : (err.response?.data?.message || "Failed to update pixel"));
    }
  };

  const truncate = (str, n = 28) => str && str.length > n ? str.slice(0, n) + "…" : str;

  return (
    <div>
      <PageHeader
        title="Facebook Pixels"
        icon={Activity}
        badge={pixels.length}
        subtitle="Manage your Facebook Pixel IDs and conversion events"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Pixel ID</TH>
            <TH>Access Token</TH>
            <TH>Test Event Code</TH>
            <TH>Event Type</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : pixels.length === 0 ? (
            <tbody><tr><td colSpan={5}>
              <EmptyState icon={Activity} title="No pixels" message="Add your first Facebook Pixel to start tracking." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {pixels.map(pixel => (
                  <motion.tr
                    key={pixel.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Code size={13} className="text-blue-600" />
                        </div>
                        <span className="font-mono text-sm font-medium text-gray-900">{pixel.pixel_id}</span>
                      </div>
                    </TD>
                    <TD>
                      <span className="font-mono text-xs text-gray-500">{truncate(pixel.fb_access_token) || "—"}</span>
                    </TD>
                    <TD>
                      <span className="font-mono text-xs text-gray-500">{pixel.test_event_code || "—"}</span>
                    </TD>
                    <TD>
                      <Badge variant={pixel.is_purchase ? "success" : "info"}>
                        {pixel.is_purchase ? "Purchase" : "Lead"}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(pixel)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(pixel.id)}
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
        title="Delete Pixel"
        message="Are you sure you want to delete this Facebook Pixel?"
        confirmLabel="Delete"
      />

      {editingPixel && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-lg bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Pencil size={15} className="text-blue-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Pixel</h2>
                </div>
                <button onClick={() => setEditingPixel(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdatePixel
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingPixel(null)}
                  loading={loading}
                  error={error}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPixel;
