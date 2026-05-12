"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import QuillEditor from "../../components/QuillEditor";
import imageCompression from "browser-image-compression";
import { Package, Palette, Tag, Percent, Layers, FileText, Plus, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Select, Textarea, Toggle,
  FileUpload, MultiFileUpload, ActionBtn, ErrorBanner, SuccessAlert,
  FormGrid, CollapsibleSection, RepeatableItem, DividerLabel,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const imgOpts = { maxSizeMB: 2, maxWidthOrHeight: 2560, useWebWorker: true, fileType: "image/webp", initialQuality: 0.95 };

const CreateProduct = ({ onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: "", price: "", discount_price: "",
    category_id: [], clothing: false, images: [],
    colors: [{ color: "", image: null, imagePreview: null, sizes: [{ size: "" }] }],
    bulk_discounts: [{ title: "", offer_quantity: "", discount_percentage: "" }],
    bumps: [{ bump_price: "", title: "", image: null, description: "" }],
    homepage: { headline: "", paragraph: "", description: "" },
    singleProductSizes: [{ size: "" }],
  });

  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [addColors, setAddColors] = useState(false);
  const [addOffer, setAddOffer] = useState(false);
  const [showHomepage, setShowHomepage] = useState(false);
  const [showBulkDiscounts, setShowBulkDiscounts] = useState(false);
  const [showBumps, setShowBumps] = useState(false);
  const [showSingleSizes, setShowSingleSizes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/category`)
      .then(r => setCategories(r.data.categories || []))
      .catch(() => setError("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    setCompressing(true);
    try {
      const compressed = await Promise.all(files.map(f => imageCompression(f, imgOpts)));
      setFormData(prev => ({ ...prev, images: compressed }));
      setImagePreviews(compressed.map(f => URL.createObjectURL(f)));
    } catch { setError("Image compression failed"); }
    finally { setCompressing(false); }
  };

  const handleColorImageChange = async (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, imgOpts);
      setFormData(prev => {
        const colors = [...prev.colors];
        colors[idx] = { ...colors[idx], image: compressed, imagePreview: URL.createObjectURL(compressed) };
        return { ...prev, colors };
      });
    } catch { setError("Color image compression failed"); }
  };

  const handleColorChange = (idx, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const colors = [...prev.colors];
      colors[idx] = { ...colors[idx], [name]: value };
      return { ...prev, colors };
    });
  };

  const addColor = () => setFormData(prev => ({
    ...prev, colors: [...prev.colors, { color: "", image: null, imagePreview: null, sizes: [{ size: "" }] }],
  }));

  const removeColor = (idx) => setFormData(prev => ({
    ...prev, colors: prev.colors.filter((_, i) => i !== idx),
  }));

  const handleSizeChange = (cIdx, sIdx, val) => {
    setFormData(prev => {
      const colors = [...prev.colors];
      colors[cIdx].sizes[sIdx].size = val;
      return { ...prev, colors };
    });
  };

  const addSize = (cIdx) => setFormData(prev => {
    const colors = [...prev.colors];
    colors[cIdx].sizes.push({ size: "" });
    return { ...prev, colors };
  });

  const removeSize = (cIdx, sIdx) => setFormData(prev => {
    const colors = [...prev.colors];
    colors[cIdx].sizes = colors[cIdx].sizes.filter((_, i) => i !== sIdx);
    return { ...prev, colors };
  });

  const handleBulkChange = (idx, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const bulk_discounts = [...prev.bulk_discounts];
      bulk_discounts[idx] = { ...bulk_discounts[idx], [name]: value };
      return { ...prev, bulk_discounts };
    });
  };

  const handleBumpChange = (idx, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const bumps = [...prev.bumps];
      bumps[idx] = { ...bumps[idx], [name]: value };
      return { ...prev, bumps };
    });
  };

  const handleBumpImageChange = async (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, imgOpts);
      setFormData(prev => {
        const bumps = [...prev.bumps];
        bumps[idx] = { ...bumps[idx], image: compressed };
        return { ...prev, bumps };
      });
    } catch { setError("Bump image compression failed"); }
  };

  const handleSingleSizeChange = (idx, val) => {
    setFormData(prev => {
      const singleProductSizes = [...prev.singleProductSizes];
      singleProductSizes[idx].size = val;
      return { ...prev, singleProductSizes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("discount_price", formData.discount_price || "");
    formData.category_id.forEach((id, i) => data.append(`categories[${i}]`, id));
    data.append("clothing", formData.clothing ? "1" : "0");

    if (showHomepage) {
      data.append("homepage[headline]", formData.homepage.headline);
      data.append("homepage[paragraph]", formData.homepage.paragraph);
      data.append("homepage[description]", formData.homepage.description);
    }

    if (showBulkDiscounts) {
      formData.bulk_discounts.forEach((d, i) => {
        if (d.title && d.offer_quantity && d.discount_percentage) {
          data.append(`bulk_discounts[${i}][title]`, d.title);
          data.append(`bulk_discounts[${i}][offer_quantity]`, d.offer_quantity);
          data.append(`bulk_discounts[${i}][discount_percentage]`, d.discount_percentage);
        }
      });
    }

    if (showBumps) {
      formData.bumps.forEach((b, i) => {
        if (b.bump_price && b.title && b.description) {
          data.append(`bumps[${i}][bump_price]`, b.bump_price);
          data.append(`bumps[${i}][title]`, b.title);
          data.append(`bumps[${i}][description]`, b.description);
          if (b.image) data.append(`bumps[${i}][image]`, b.image);
        }
      });
    }

    if (showSingleSizes) {
      formData.singleProductSizes.forEach((s, i) => {
        if (s.size) data.append(`singleProductSizes[${i}][size]`, s.size);
      });
    }

    if (!addColors) {
      formData.images.forEach((img, i) => data.append(`images[${i}]`, img));
    } else {
      formData.colors.forEach((c, i) => {
        if (c.color) {
          data.append(`colors[${i}][color]`, c.color);
          if (c.image) data.append(`colors[${i}][image]`, c.image);
          c.sizes.forEach((s, si) => { if (s.size) data.append(`colors[${i}][sizes][${si}][size]`, s.size); });
        }
      });
    }

    try {
      await axios.post(`${apiUrl}/products`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Product created successfully!");
      setTimeout(() => { setSuccess(null); if (onProductCreated) onProductCreated(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader title="Add Product" icon={Package} subtitle="Create a new product listing for your store" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Basic Info ───────────────────────────────────── */}
        <SectionCard>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Basic Information</p>
          <div className="space-y-4">
            <FormField label="Product Name" required>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter product name" required />
            </FormField>

            <FormField label="Category" required hint="Hold Ctrl / Cmd to select multiple">
              <Select
                multiple
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: Array.from(e.target.selectedOptions, o => o.value) }))}
                className="min-h-[80px]"
                disabled={loading}
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>

            <FormGrid>
              <FormField label="Price (৳)" required>
                <Input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" required prefix="৳" />
              </FormField>
              <div className="space-y-3">
                <Toggle name="clothing" id="clothing" checked={formData.clothing}
                  onChange={(e) => setFormData(p => ({ ...p, clothing: e.target.checked }))}
                  label="Clothing Item"
                  description="Upload in 3:4 ratio (960×1280) for best display"
                />
                <Toggle name="addOffer" id="addOffer" checked={addOffer}
                  onChange={(e) => setAddOffer(e.target.checked)}
                  label="Add Discount Price"
                />
              </div>
            </FormGrid>

            {addOffer && (
              <FormField label="Discount Price (৳)">
                <Input type="number" name="discount_price" value={formData.discount_price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" prefix="৳" />
              </FormField>
            )}
          </div>
        </SectionCard>

        {/* ── Feature Toggles ──────────────────────────────── */}
        <SectionCard>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Optional Features</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { state: addColors, set: setAddColors, label: "Colors & Sizes" },
              { state: showSingleSizes, set: setShowSingleSizes, label: "Sizes (No Color)" },
              { state: showHomepage, set: setShowHomepage, label: "Sales Letter" },
              { state: showBulkDiscounts, set: setShowBulkDiscounts, label: "Bulk Discounts" },
              { state: showBumps, set: setShowBumps, label: "Bump Offers" },
            ].map(({ state, set, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => set(s => !s)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  state
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${state ? "bg-white/30 border-white/50" : "border-gray-300"}`}>
                  {state && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </span>
                {label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── Product Images ───────────────────────────────── */}
        {!addColors && (
          <SectionCard>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Product Images</p>
            <MultiFileUpload
              files={imagePreviews}
              onChange={handleImagesChange}
              onRemove={(i) => {
                setImagePreviews(p => p.filter((_, idx) => idx !== i));
                setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
              }}
              loading={compressing}
              hint="Auto-compressed to WebP"
            />
          </SectionCard>
        )}

        {/* ── Colors & Sizes ───────────────────────────────── */}
        {addColors && (
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Colors & Sizes</p>
              <ActionBtn type="button" variant="secondary" size="sm" icon={Plus} onClick={addColor}>
                Add Color
              </ActionBtn>
            </div>
            <div className="space-y-4">
              {formData.colors.map((color, cIdx) => (
                <RepeatableItem key={cIdx} index={cIdx} onRemove={() => removeColor(cIdx)} canRemove={formData.colors.length > 1}>
                  <FormGrid>
                    <FormField label="Color Name" required>
                      <Input name="color" value={color.color} onChange={(e) => handleColorChange(cIdx, e)} placeholder="e.g. Sky Blue" required />
                    </FormField>
                    <FormField label="Color Image" required>
                      <FileUpload
                        preview={color.imagePreview}
                        onChange={(e) => handleColorImageChange(cIdx, e)}
                        onClear={() => setFormData(prev => {
                          const colors = [...prev.colors];
                          colors[cIdx] = { ...colors[cIdx], image: null, imagePreview: null };
                          return { ...prev, colors };
                        })}
                        hint="Auto-compressed to WebP"
                        height="h-28"
                      />
                    </FormField>
                  </FormGrid>
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Sizes</p>
                    <div className="space-y-2">
                      {color.sizes.map((size, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <Input
                            value={size.size}
                            onChange={(e) => handleSizeChange(cIdx, sIdx, e.target.value)}
                            placeholder="e.g. S, M, L"
                            className="flex-1"
                          />
                          {color.sizes.length > 1 && (
                            <button type="button" onClick={() => removeSize(cIdx, sIdx)}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      <ActionBtn type="button" variant="ghost" size="sm" icon={Plus} onClick={() => addSize(cIdx)}>
                        Add Size
                      </ActionBtn>
                    </div>
                  </div>
                </RepeatableItem>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Single Sizes ─────────────────────────────────── */}
        {showSingleSizes && (
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Sizes</p>
              <ActionBtn type="button" variant="secondary" size="sm" icon={Plus}
                onClick={() => setFormData(p => ({ ...p, singleProductSizes: [...p.singleProductSizes, { size: "" }] }))}>
                Add Size
              </ActionBtn>
            </div>
            <div className="space-y-2">
              {formData.singleProductSizes.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={s.size} onChange={(e) => handleSingleSizeChange(i, e.target.value)} placeholder="e.g. S, M, L, XL" className="flex-1" />
                  {formData.singleProductSizes.length > 1 && (
                    <button type="button"
                      onClick={() => setFormData(p => ({ ...p, singleProductSizes: p.singleProductSizes.filter((_, idx) => idx !== i) }))}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Bulk Discounts ───────────────────────────────── */}
        {showBulkDiscounts && (
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bulk Discounts</p>
              <ActionBtn type="button" variant="secondary" size="sm" icon={Plus}
                onClick={() => setFormData(p => ({ ...p, bulk_discounts: [...p.bulk_discounts, { title: "", offer_quantity: "", discount_percentage: "" }] }))}>
                Add Discount
              </ActionBtn>
            </div>
            <div className="space-y-4">
              {formData.bulk_discounts.map((d, i) => (
                <RepeatableItem key={i} index={i} onRemove={() => setFormData(p => ({ ...p, bulk_discounts: p.bulk_discounts.filter((_, idx) => idx !== i) }))} canRemove={formData.bulk_discounts.length > 1}>
                  <FormGrid cols={3}>
                    <FormField label="Title" required>
                      <Input name="title" value={d.title} onChange={(e) => handleBulkChange(i, e)} placeholder="e.g. Buy 3 Save 10%" required />
                    </FormField>
                    <FormField label="Qty Required" required>
                      <Input type="number" name="offer_quantity" value={d.offer_quantity} onChange={(e) => handleBulkChange(i, e)} placeholder="e.g. 3" min="1" required />
                    </FormField>
                    <FormField label="Discount %" required>
                      <Input type="number" name="discount_percentage" value={d.discount_percentage} onChange={(e) => handleBulkChange(i, e)} placeholder="e.g. 10" min="1" max="100" required />
                    </FormField>
                  </FormGrid>
                </RepeatableItem>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Bumps ────────────────────────────────────────── */}
        {showBumps && (
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bump Offers</p>
              <ActionBtn type="button" variant="secondary" size="sm" icon={Plus}
                onClick={() => setFormData(p => ({ ...p, bumps: [...p.bumps, { bump_price: "", title: "", image: null, description: "" }] }))}>
                Add Bump
              </ActionBtn>
            </div>
            <div className="space-y-4">
              {formData.bumps.map((b, i) => (
                <RepeatableItem key={i} index={i} onRemove={() => setFormData(p => ({ ...p, bumps: p.bumps.filter((_, idx) => idx !== i) }))} canRemove={formData.bumps.length > 1}>
                  <FormGrid>
                    <FormField label="Title" required>
                      <Input name="title" value={b.title} onChange={(e) => handleBumpChange(i, e)} placeholder="Bump offer title" required />
                    </FormField>
                    <FormField label="Price (৳)" required>
                      <Input type="number" name="bump_price" value={b.bump_price} onChange={(e) => handleBumpChange(i, e)} placeholder="0.00" min="0" required prefix="৳" />
                    </FormField>
                  </FormGrid>
                  <FormField label="Description" required className="mt-3">
                    <Textarea name="description" value={b.description} onChange={(e) => handleBumpChange(i, e)} rows={3} placeholder="Describe the bump offer…" required />
                  </FormField>
                  <FormField label="Bump Image" className="mt-3">
                    <FileUpload
                      preview={b.image ? URL.createObjectURL(b.image) : null}
                      onChange={(e) => handleBumpImageChange(i, e)}
                      onClear={() => setFormData(p => { const bumps = [...p.bumps]; bumps[i] = { ...bumps[i], image: null }; return { ...p, bumps }; })}
                      hint="Optional product image"
                      height="h-28"
                    />
                  </FormField>
                </RepeatableItem>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Sales Letter ─────────────────────────────────── */}
        {showHomepage && (
          <SectionCard>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Sales Letter / Content</p>
            <div className="space-y-4">
              <FormField label="Headline">
                <Input name="headline" value={formData.homepage.headline} onChange={(e) => setFormData(p => ({ ...p, homepage: { ...p.homepage, headline: e.target.value } }))} placeholder="Catchy headline…" />
              </FormField>
              <FormField label="Paragraph">
                <Textarea name="paragraph" value={formData.homepage.paragraph} onChange={(e) => setFormData(p => ({ ...p, homepage: { ...p.homepage, paragraph: e.target.value } }))} rows={3} placeholder="Short intro paragraph…" />
              </FormField>
              <FormField label="Description">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <QuillEditor
                    value={formData.homepage.description}
                    onChange={(v) => setFormData(p => ({ ...p, homepage: { ...p.homepage, description: v || "" } }))}
                    style={{ minHeight: 200 }}
                  />
                </div>
              </FormField>
            </div>
          </SectionCard>
        )}

        {/* ── Submit ───────────────────────────────────────── */}
        <div className="flex justify-end">
          <ActionBtn type="submit" variant="primary" loading={submitting} size="lg">
            Create Product
          </ActionBtn>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
