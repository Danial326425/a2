"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateCategory from "./UpdateCategory";
import imageCompression from "browser-image-compression";
import { Tag, Pencil, Trash2, Home, ArrowUpDown } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Badge, Table, THead, TH,
  TBody, TR, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const imageCompressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1080,
  useWebWorker: true,
  fileType: "image/webp",
};

const ViewCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    name: "", image: null, sort_order: 0,
    product_limit: 10, parent_id: "", show_on_homepage: false, free_delivery: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/category`);
        setCategories(response.data.categories || []);
      } catch {
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [refreshKey]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/categorydelete/${deleteTarget}`);
      setRefreshKey(prev => prev + 1);
    } catch {
      setError("Failed to delete category");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEditClick = (cat) => {
    setEditingCat(cat.id);
    setFormData({
      name: cat.name, image: null, sort_order: cat.sort_order,
      product_limit: cat.product_limit, parent_id: cat.parent_id || "",
      show_on_homepage: cat.show_on_homepage,
      free_delivery: !!cat.free_delivery,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      const processed = name === "parent_id" && value === "" ? null : value;
      setFormData(prev => ({ ...prev, [name]: processed }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const blob = await imageCompression(file, imageCompressionOptions);
      const compressed = new File(
        [blob],
        file.name.replace(/\.[^/.]+$/, "") + ".webp",
        { type: "image/webp", lastModified: Date.now() }
      );
      setFormData(prev => ({ ...prev, image: compressed }));
      setError(null);
    } catch {
      setError("Failed to compress image. Please try another.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingCat) return;
    const data = new FormData();
    data.append("_method", "PUT");
    data.append("name", formData.name);
    data.append("sort_order", formData.sort_order.toString());
    data.append("product_limit", formData.product_limit.toString());
    data.append("parent_id", formData.parent_id ? formData.parent_id.toString() : "");
    data.append("show_on_homepage", formData.show_on_homepage ? "1" : "0");
    data.append("free_delivery", formData.free_delivery ? "1" : "0");
    if (formData.image) data.append("image", formData.image);
    try {
      await axios.post(`${apiUrl}/categoryupdate/${editingCat}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Category updated successfully");
      setRefreshKey(prev => prev + 1);
      setEditingCat(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        icon={Tag}
        badge={categories.length}
        subtitle="Organise your product catalogue into categories"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Category</TH>
            <TH>Parent</TH>
            <TH>
              <span className="flex items-center gap-1"><ArrowUpDown size={12} />Sort</span>
            </TH>
            <TH>Limit</TH>
            <TH>Homepage</TH>
            <TH>Free Delivery</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : categories.length === 0 ? (
            <TBody>
              <tr><td colSpan={7}>
                <EmptyState icon={Tag} title="No categories" message="Create your first product category." />
              </td></tr>
            </TBody>
          ) : (
            <TBody>
              <AnimatePresence initial={false}>
                {categories.map(cat => {
                  const parentName = cat.parent_id
                    ? categories.find(c => c.id === cat.parent_id)?.name
                    : null;
                  return (
                    <motion.tr
                      key={cat.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                    >
                      <TD>
                        <div className="flex items-center gap-3">
                          {cat.image ? (
                            <img
                              src={`${imageUrl}/${cat.image}`}
                              alt={cat.name}
                              loading="lazy"
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Tag size={16} className="text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                        </div>
                      </TD>
                      <TD>
                        {parentName ? (
                          <Badge variant="gray">{parentName}</Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TD>
                      <TD>
                        <span className="text-sm font-medium text-gray-700">{cat.sort_order}</span>
                      </TD>
                      <TD>
                        <span className="text-sm text-gray-600">{cat.product_limit}</span>
                      </TD>
                      <TD>
                        {cat.show_on_homepage ? (
                          <Badge variant="success">
                            <Home size={10} className="mr-1" />Yes
                          </Badge>
                        ) : (
                          <Badge variant="gray">No</Badge>
                        )}
                      </TD>
                      <TD>
                        {cat.free_delivery ? (
                          <Badge variant="info">Free</Badge>
                        ) : (
                          <Badge variant="gray">No</Badge>
                        )}
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionBtn
                            variant="ghost" size="sm" icon={Pencil}
                            onClick={() => handleEditClick(cat)} title="Edit"
                          />
                          <ActionBtn
                            variant="ghost" size="sm" icon={Trash2}
                            onClick={() => setDeleteTarget(cat.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          />
                        </div>
                      </TD>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TBody>
          )}
        </Table>
      </SectionCard>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Category"
        message="Deleting this category may affect products assigned to it. This cannot be undone."
        confirmLabel="Delete Category"
      />

      {editingCat && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Category</h2>
                </div>
                <button
                  onClick={() => setEditingCat(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <UpdateCategory
                  formData={formData}
                  handleImageChange={handleImageChange}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingCat(null)}
                  loading={loading}
                  error={error}
                  categories={categories}
                  editingCat={editingCat}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCategory;
