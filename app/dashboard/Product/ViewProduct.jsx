"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { config } from "../../../config";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import UpdateProduct from "./UpdateProduct";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Pencil, Trash2, ExternalLink, Search, LayoutGrid,
  LayoutList, Tag, ShoppingBag, Plus
} from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Badge, Table, THead, TH,
  TBody, TR, TD, TableSkeleton, EmptyState, ErrorBanner,
  ConfirmDialog, SearchInput
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const imageCompressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  fileType: "image/webp",
};

const ViewProduct = () => {
  const [, setSearchParams] = useSearchParams();
  // ── state (unchanged from original) ──────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "", price: "", discount_price: "", max_per_order: "", category_id: [], clothing: false,
    images: [], colors: [{ color: "", image: null, sizes: [{ size: "" }] }],
    bulk_discounts: [{ title: "", offer_quantity: "", discount_percentage: "" }],
    bumps: [{ title: "", bump_price: "", image: null, description: "" }],
    homepage: { headline: "", paragraph: "", description: "" },
    singleProductSizes: [{ size: "" }],
    has_upsell: false, upsell_product_id: "",
  });
  const [showHomepageFields, setShowHomepageFields]       = useState(false);
  const [showBulkDiscounts, setShowBulkDiscounts]         = useState(false);
  const [showBumps, setShowBumps]                         = useState(false);
  const [showSingleProductSizes, setShowSingleProductSizes] = useState(false);
  const [showUpsell, setShowUpsell]                       = useState(false);
  const [upsellProducts, setUpsellProducts]               = useState([]);

  // ── UI-only state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterCat, setFilterCat] = useState("all");

  // ── fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, upsellRes] = await Promise.all([
          axios.get(`${apiUrl}/products`),
          axios.get(`${apiUrl}/category`),
          axios.get(`${apiUrl}/upsell-products`),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data.categories || []);
        setUpsellProducts(upsellRes.data.upsell_products || []);
      } catch (err) {
        setError("Failed to load products and categories");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── handlers (identical business logic) ──────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/productdelete/${deleteTarget}`);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget));
    } catch (err) {
      setError("Failed to delete product");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product.id);
    setFormData({
      slug: product.slug || "",
      name: product.name || "",
      price: product.price || "",
      discount_price: product.discount_price || "",
      max_per_order: product.max_per_order ?? "",
      category_id: product.categories?.map(c => c.id) || [],
      clothing: product.clothing || false,
      images: product.images || [],
      colors: product.colors?.map(color => ({
        id: color.id || null, color: color.color || "", image: color.image || null,
        sizes: color.sizes?.map(s => ({ id: s.id || null, size: s.size || "" })) || [],
      })) || [],
      bulk_discounts: product.bulk_discounts?.map(d => ({
        id: d.id || null, title: d.title || "",
        offer_quantity: d.offer_quantity || "", discount_percentage: d.discount_percentage || "",
      })) || [],
      bumps: product.bumps?.map(b => ({
        id: b.id || null, title: b.title || "",
        bump_price: b.bump_price || "", image: b.image || null, description: b.description || "",
      })) || [],
      singleProductSizes: product.single_product_sizes?.map(s => ({ id: s.id, size: s.size || "" })) || [],
      homepage: product.homepage || { headline: "", paragraph: "", description: "" },
      has_upsell: !!product.has_upsell,
      upsell_product_id: product.upsell_product_id ? String(product.upsell_product_id) : "",
    });
    setShowHomepageFields(!!product.homepage);
    setShowBulkDiscounts(product.bulk_discounts?.length > 0);
    setShowBumps(product.bumps?.length > 0);
    setShowSingleProductSizes(product.single_product_sizes?.length > 0);
    setShowUpsell(!!product.has_upsell);
  };

  const handleBumpImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const blob = await imageCompression(file, imageCompressionOptions);
      const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp", lastModified: Date.now() });
      const bumps = [...formData.bumps];
      bumps[index] = { ...bumps[index], image: compressed };
      setFormData(prev => ({ ...prev, bumps }));
    } catch {}
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const compressed = await Promise.all(files.map(async file => {
        const blob = await imageCompression(file, imageCompressionOptions);
        return new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp", lastModified: Date.now() });
      }));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...compressed] }));
    } catch {
      setError("Failed to compress images");
    }
  };

  const removeImage = (index) =>
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const handleColorImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const blob = await imageCompression(file, imageCompressionOptions);
      const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp", lastModified: Date.now() });
      const colors = [...formData.colors];
      colors[index].image = compressed;
      setFormData(prev => ({ ...prev, colors }));
    } catch {
      setError("Failed to compress color image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("discount_price", formData.discount_price || "");
      data.append("max_per_order", formData.max_per_order || "");
      formData.category_id.forEach((id, i) => data.append(`categories[${i}]`, id));
      data.append("slug", formData.slug);
      data.append("clothing", formData.clothing ? "1" : "0");
      data.append("has_upsell", showUpsell && formData.upsell_product_id ? "1" : "0");
      if (showUpsell && formData.upsell_product_id) {
        data.append("upsell_product_id", formData.upsell_product_id);
      }

      if (showHomepageFields) {
        data.append("homepage[headline]", formData.homepage.headline || "");
        data.append("homepage[paragraph]", formData.homepage.paragraph || "");
        data.append("homepage[description]", formData.homepage.description || "");
      }
      if (showBulkDiscounts) {
        formData.bulk_discounts.forEach((d, i) => {
          if (d.id) data.append(`bulk_discounts[${i}][id]`, d.id);
          data.append(`bulk_discounts[${i}][title]`, d.title || "");
          data.append(`bulk_discounts[${i}][offer_quantity]`, d.offer_quantity || "");
          data.append(`bulk_discounts[${i}][discount_percentage]`, d.discount_percentage || "");
        });
      }
      if (showBumps) {
        formData.bumps.forEach((b, i) => {
          if (b.id) data.append(`bumps[${i}][id]`, b.id);
          data.append(`bumps[${i}][title]`, b.title || "");
          data.append(`bumps[${i}][bump_price]`, b.bump_price || "");
          data.append(`bumps[${i}][description]`, b.description || "");
          if (b.image instanceof File) data.append(`bumps[${i}][image]`, b.image);
          else if (typeof b.image === "string") data.append(`bumps[${i}][existing_image]`, b.image);
        });
      }
      if (showSingleProductSizes) {
        formData.singleProductSizes.forEach((s, i) => {
          if (s.id) data.append(`singleProductSizes[${i}][id]`, s.id);
          data.append(`singleProductSizes[${i}][size]`, s.size || "");
        });
      }
      if (!formData.clothing) {
        formData.images.forEach((img, i) => {
          if (img instanceof File) data.append(`images[${i}]`, img);
          else if (typeof img === "string") data.append(`existing_images[${i}]`, img);
          else if (img?.image) data.append(`existing_images[${i}]`, img.image);
        });
      }
      formData.colors.forEach((c, i) => {
        if (c.id) data.append(`colors[${i}][id]`, c.id);
        data.append(`colors[${i}][color]`, c.color || "");
        if (c.image instanceof File) data.append(`colors[${i}][image]`, c.image);
        else if (c.image) data.append(`colors[${i}][existing_image]`, c.image);
        c.sizes.forEach((s, si) => {
          if (s.id) data.append(`colors[${i}][sizes][${si}][id]`, s.id);
          data.append(`colors[${i}][sizes][${si}][size]`, s.size || "");
        });
      });

      await axios.post(`${apiUrl}/productsupdate/${editingProduct}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product updated successfully!");
      const res = await axios.get(`${apiUrl}/products`);
      setProducts(res.data);
      setEditingProduct(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    }
  };

  // ── filtered / searched list ──────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...products].reverse();
    if (filterCat !== "all") list = list.filter(p => p.categories?.some(c => String(c.id) === filterCat));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q));
    }
    return list;
  }, [products, search, filterCat]);

  // ── first product image helper ────────────────────────────────────────────
  const getFirstImage = (p) => {
    if (p.images?.[0]) return typeof p.images[0] === "string" ? `${imageUrl}/${p.images[0]}` : `${imageUrl}/${p.images[0].image}`;
    if (p.colors?.[0]?.image) return `${imageUrl}/${p.colors[0].image}`;
    return null;
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Products"
        icon={Package}
        badge={products.length}
        subtitle="Manage your product catalogue"
        action={
          <ActionBtn variant="primary" icon={Plus} onClick={() => setSearchParams({ menu: "createProduct" })}>
            Add Product
          </ActionBtn>
        }
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1"
          />
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-700"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              title="List view"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {/* List view */}
        {viewMode === "list" && (
          <Table>
            <THead>
              <TH className="w-12">#</TH>
              <TH>Product</TH>
              <TH>Category</TH>
              <TH>Price</TH>
              <TH>Type</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            {loading ? (
              <TableSkeleton rows={6} cols={6} />
            ) : displayed.length === 0 ? (
              <TBody>
                <tr><td colSpan={6}>
                  <EmptyState icon={Package} title="No products found" message="Add your first product to get started." />
                </td></tr>
              </TBody>
            ) : (
              <TBody>
                <AnimatePresence initial={false}>
                  {displayed.map((product, idx) => {
                    const thumb = getFirstImage(product);
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                      >
                        <TD className="text-gray-400 text-xs font-medium w-12">{idx + 1}</TD>
                        <TD>
                          <div className="flex items-center gap-3">
                            {thumb ? (
                              <img src={thumb} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <Package size={16} className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                              <p className="text-xs text-gray-400">{product.slug}</p>
                            </div>
                          </div>
                        </TD>
                        <TD>
                          <div className="flex flex-wrap gap-1">
                            {product.categories?.length ? product.categories.map(c => (
                              <Badge key={c.id} variant="indigo">{c.name}</Badge>
                            )) : <span className="text-gray-400 text-xs">—</span>}
                          </div>
                        </TD>
                        <TD>
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-400 line-through">৳{product.price}</p>
                            {product.discount_price && (
                              <p className="text-sm font-semibold text-emerald-600">৳{product.discount_price}</p>
                            )}
                          </div>
                        </TD>
                        <TD>
                          <Badge variant={product.clothing ? "purple" : "gray"}>
                            {product.clothing ? "Clothing" : "Standard"}
                          </Badge>
                        </TD>
                        <TD className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <ActionBtn
                              variant="ghost"
                              size="sm"
                              icon={Pencil}
                              onClick={() => handleEditClick(product)}
                              title="Edit"
                            />
                            <ActionBtn
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => setDeleteTarget(product.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            />
                            {product?.slug && (
                              <Link href={`/${product.slug}`} target="_blank">
                                <ActionBtn variant="ghost" size="sm" icon={ExternalLink} title="View on site" />
                              </Link>
                            )}
                          </div>
                        </TD>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TBody>
            )}
          </Table>
        )}

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="p-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <EmptyState icon={Package} title="No products found" message="Adjust your search or add a product." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence initial={false}>
                  {displayed.map((product, idx) => {
                    const thumb = getFirstImage(product);
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="aspect-square bg-gray-50 relative overflow-hidden">
                          {thumb ? (
                            <img src={thumb} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={32} className="text-gray-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product.id)}
                              className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <div>
                              {product.discount_price ? (
                                <p className="text-sm font-semibold text-emerald-600">৳{product.discount_price}</p>
                              ) : (
                                <p className="text-sm font-semibold text-gray-700">৳{product.price}</p>
                              )}
                            </div>
                            {product?.slug && (
                              <Link href={`/${product.slug}`} target="_blank" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                <ExternalLink size={14} />
                              </Link>
                            )}
                          </div>
                          {product.categories?.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {product.categories.slice(0, 2).map(c => (
                                <Badge key={c.id} variant="indigo">{c.name}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Footer count */}
        {!loading && displayed.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            Showing {displayed.length} of {products.length} products
          </div>
        )}
      </SectionCard>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Product"
        message="This will permanently remove the product and all its data. This action cannot be undone."
        confirmLabel="Delete Product"
      />

      {/* Edit drawer */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-3xl bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Pencil size={15} className="text-indigo-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Product</h2>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <UpdateProduct
                  formData={formData}
                  setFormData={setFormData}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingProduct(null)}
                  categories={categories}
                  showHomepageFields={showHomepageFields}
                  setShowHomepageFields={setShowHomepageFields}
                  showBulkDiscounts={showBulkDiscounts}
                  setShowBulkDiscounts={setShowBulkDiscounts}
                  showBumps={showBumps}
                  setShowBumps={setShowBumps}
                  handleImageChange={handleImageChange}
                  handleColorImageChange={handleColorImageChange}
                  handleBumpImageChange={handleBumpImageChange}
                  showSingleProductSizes={showSingleProductSizes}
                  setShowSingleProductSizes={setShowSingleProductSizes}
                  removeImage={removeImage}
                  showUpsell={showUpsell}
                  setShowUpsell={setShowUpsell}
                  upsellProducts={upsellProducts}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProduct;
