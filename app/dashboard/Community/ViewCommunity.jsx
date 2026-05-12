"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateCommunity from "./UpdateCommunity";
import { Users, Pencil, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewCommunity = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    icon: null, name: "", description: "", image: null,
    banner: null, button_text: "", url: "",
  });

  useEffect(() => {
    axios.get(`${apiUrl}/communities`)
      .then(r => setCommunities(r.data || []))
      .catch(() => setError("Failed to load communities"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/communitydelete/${deleteTarget}`);
      setCommunities(prev => prev.filter(c => c.id !== deleteTarget));
    } catch { setError("Failed to delete community"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (community) => {
    setEditingCommunity(community.id);
    setFormData({
      icon: community.icon, name: community.name, description: community.description,
      image: community.image, banner: community.banner,
      button_text: community.button_text, url: community.url,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setImage = (file) => setFormData(prev => ({ ...prev, image: file }));
  const setBanner = (file) => setFormData(prev => ({ ...prev, banner: file }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingCommunity) return;
    const data = new FormData();
    data.append("_method", "PUT");
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if ((key === "image" || key === "banner") && value instanceof File) {
        data.append(key, value);
      } else if (key !== "image" && key !== "banner" && value !== null) {
        data.append(key, value);
      }
    });
    try {
      await axios.post(`${apiUrl}/communitiesupdate/${editingCommunity}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCommunities(prev => prev.map(c => c.id === editingCommunity ? { ...c, ...formData } : c));
      setEditingCommunity(null);
    } catch (err) { setError(err?.response?.data?.message || "Failed to update community"); }
  };

  const truncate = (str, n = 45) => str && str.length > n ? str.slice(0, n) + "…" : (str || "—");

  const ThumbCell = ({ src }) => src ? (
    <img src={`${imageUrl}/${src}`} alt="" className="h-9 w-9 rounded-lg object-cover border border-gray-100" />
  ) : (
    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
      <ImageIcon size={13} className="text-gray-300" />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Communities"
        icon={Users}
        badge={communities.length}
        subtitle="Manage community cards displayed on your store"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Name</TH>
            <TH>Description</TH>
            <TH>Button</TH>
            <TH>Image</TH>
            <TH>Banner</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={4} cols={6} />
          ) : communities.length === 0 ? (
            <tbody><tr><td colSpan={6}>
              <EmptyState icon={Users} title="No communities" message="Add community sections to your store." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {communities.map(community => (
                  <motion.tr
                    key={community.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <span className="font-medium text-gray-900 text-sm">{community.name}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-500">{truncate(community.description)}</span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-700">{community.button_text}</span>
                        {community.url && (
                          <a href={community.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={11} className="text-indigo-400" />
                          </a>
                        )}
                      </div>
                    </TD>
                    <TD><ThumbCell src={community.image} /></TD>
                    <TD><ThumbCell src={community.banner} /></TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(community)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(community.id)}
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
        title="Delete Community"
        message="Are you sure you want to delete this community?"
        confirmLabel="Delete"
      />

      {editingCommunity && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Community</h2>
                </div>
                <button onClick={() => setEditingCommunity(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateCommunity
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  setImage={setImage}
                  setBanner={setBanner}
                  onCancel={() => setEditingCommunity(null)}
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

export default ViewCommunity;
