"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import QuillEditor from "../../components/QuillEditor";
import imageCompression from "browser-image-compression";
import { Package, Plus, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Select, Textarea, Toggle,
  FileUpload, MultiFileUpload, ActionBtn, ErrorBanner, SuccessAlert,
  FormGrid, RepeatableItem,
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;
const imgOpts = { maxSizeMB: 2, maxWidthOrHeight: 2560, useWebWorker: true, fileType: "image/webp", initialQuality: 0.95 };

const CreateProduct = ({ onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: "", price: "", discount_price: "", max_per_order: "",
    free_delivery_enabled: false, free_delivery_min_qty: "",
    category_id: [], images: [],
    colors: [{ color: "", image: null, imagePreview: null, sizes: [{ size: "" }] }],
    bulk_discounts: [{ title: "", offer_quantity: "", discount_percentage: "" }],
    bumps: [{ bump_price: "", title: "", image: null, description: "" }],
    homepage: { headline: "", paragraph: "", description: "" },
    singleProductSizes: [{ size: "" }],
    has_upsell: false,
    upsell_product_id: "",
  });

  const [categories, setCategories]             = useState([]);
  const [upsellProducts, setUpsellProducts]     = useState([]);
  const [colorPresets, setColorPresets]         = useState([]);
  const [sizePresets, setSizePresets]           = useState([]);
  const [sizeGroupPresets, setSizeGroupPresets] = useState([]);
  const [imagePreviews, setImagePreviews]       = useState([]);
  const [addColors, setAddColors]               = useState(false);
  const [addOffer, setAddOffer]                 = useState(false);
  const [showHomepage, setShowHomepage]         = useState(false);
  const [showBulkDiscounts, setShowBulkDiscounts] = useState(false);
  const [showBumps, setShowBumps]               = useState(false);
  const [showSingleSizes, setShowSingleSizes]   = useState(false);
  const [showUpsell, setShowUpsell]             = useState(false);
  const [loading, setLoading]                   = useState(true);
  const [submitting, setSubmitting]             = useState(false);
  const [compressing, setCompressing]           = useState(false);
  const [error, setError]                       = useState(null);
  const [success, setSuccess]                   = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/category`).then(r => setCategories(r.data.categories || [])),
      axios.get(`${apiUrl}/upsell-products`).then(r => setUpsellProducts(r.data.upsell_products || [])),
      axios.get(`${apiUrl}/color-presets`).then(r => setColorPresets(r.data || [])),
      axios.get(`${apiUrl}/size-presets`).then(r => setSizePresets(r.data || [])),
      axios.get(`${apiUrl}/size-group-presets`).then(r => setSizeGroupPresets(r.data || [])),
    ])
      .catch(() => setError("Failed to load form data"))
      .finally(() => setLoading(false));
  }, []);

  /* ── Image handlers ─────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Checkboxes need `checked` (boolean), not `value` (which is the literal
    // "on" string for unkeyed checkboxes). Bug fix: without this the
    // free_delivery_enabled toggle couldn't be turned off after enabling.
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

  /* ── Color handlers ─────────────────────────────────────────────── */
  const handleColorChange = (idx, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const colors = [...prev.colors];
      colors[idx] = { ...colors[idx], [name]: value };
      return { ...prev, colors };
    });
  };

  const addColor = () => setFormData(prev => ({
    ...prev,
    colors: [...prev.colors, { color: "", image: null, imagePreview: null, sizes: [{ size: "" }] }],
  }));

  const addColorFromPreset = (colorName) => setFormData(prev => ({
    ...prev,
    colors: [...prev.colors, { color: colorName, image: null, imagePreview: null, sizes: [{ size: "" }] }],
  }));

  const removeColor = (idx) => setFormData(prev => ({
    ...prev,
    colors: prev.colors.filter((_, i) => i !== idx),
  }));

  /* ── Size handlers ──────────────────────────────────────────────── */
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

  const addSizeFromPreset = (cIdx, sizeName) => {
    setFormData(prev => {
      const colors = [...prev.colors];
      const sizes = [...colors[cIdx].sizes];
      const lastIdx = sizes.length - 1;
      if (sizes[lastIdx].size === "") {
        sizes[lastIdx] = { size: sizeName };
      } else {
        sizes.push({ size: sizeName });
      }
      colors[cIdx] = { ...colors[cIdx], sizes };
      return { ...prev, colors };
    });
  };

  const addSizeGroupToColor = (cIdx, groupSizes) => {
    setFormData(prev => {
      const colors = [...prev.colors];
      const existingSizes = colors[cIdx].sizes.filter(s => s.size !== "");
      colors[cIdx] = {
        ...colors[cIdx],
        sizes: [...existingSizes, ...groupSizes.map(sz => ({ size: sz }))],
      };
      return { ...prev, colors };
    });
  };

  const removeSize = (cIdx, sIdx) => setFormData(prev => {
    const colors = [...prev.colors];
    colors[cIdx].sizes = colors[cIdx].sizes.filter((_, i) => i !== sIdx);
    return { ...prev, colors };
  });

  /* ── Single size handlers ───────────────────────────────────────── */
  const handleSingleSizeChange = (idx, val) => {
    setFormData(prev => {
      const singleProductSizes = [...prev.singleProductSizes];
      singleProductSizes[idx].size = val;
      return { ...prev, singleProductSizes };
    });
  };

  const addSingleSizeFromPreset = (sizeName) => {
    setFormData(prev => {
      const sizes = [...prev.singleProductSizes];
      const lastIdx = sizes.length - 1;
      if (sizes[lastIdx].size === "") {
        sizes[lastIdx] = { size: sizeName };
      } else {
        sizes.push({ size: sizeName });
      }
      return { ...prev, singleProductSizes: sizes };
    });
  };

  /* ── Bump/bulk handlers ─────────────────────────────────────────── */
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

  /* ── Submit ─────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: bulk free-delivery is only meaningful with a positive min qty.
    if (formData.free_delivery_enabled) {
      const n = parseInt(formData.free_delivery_min_qty, 10);
      if (!Number.isFinite(n) || n < 1) {
        setError("Free Delivery on Bulk Purchase enable করতে হলে Minimum Quantity (≥1) দিতে হবে");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("discount_price", formData.discount_price || "");
    data.append("max_per_order", formData.max_per_order || "");
    data.append("free_delivery_enabled", formData.free_delivery_enabled ? "1" : "0");
    data.append("free_delivery_min_qty", formData.free_delivery_min_qty || "");
    formData.category_id.forEach((id, i) => data.append(`categories[${i}]`, id));
    data.append("has_upsell", showUpsell && formData.upsell_product_id ? "1" : "0");
    if (showUpsell && formData.upsell_product_id) {
      data.append("upsell_product_id", formData.upsell_product_id);
    }

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
          c.sizes.forEach((s, si) => {
            if (s.size) data.append(`colors[${i}][sizes][${si}][size]`, s.size);
          });
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

  /* ── Preset chip helpers ─────────────────────────────────────────── */
  const ColorPresetChips = ({ onSelect }) => {
    if (colorPresets.length === 0) return null;
    return (
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">Saved colors — click to add:</p>
        <div className="flex flex-wrap gap-1.5">
          {colorPresets.map(cp => (
            <button
              key={cp.id}
              type="button"
              onClick={() => onSelect(cp.name)}
              className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              + {cp.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const SizePresetChips = ({ onSelectSize, onSelectGroup }) => {
    if (sizePresets.length === 0 && sizeGroupPresets.length === 0) return null;
    return (
      <div className="mb-2">
        <p className="text-xs text-gray-400 mb-1.5">Quick add size:</p>
        <div className="flex flex-wrap gap-1.5">
          {sizePresets.map(sp => (
            <button
              key={sp.id}
              type="button"
              onClick={() => onSelectSize(sp.name)}
              className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              + {sp.name}
            </button>
          ))}
          {sizeGroupPresets.map(sg => (
            <button
              key={sg.id}
              type="button"
              onClick={() => onSelectGroup(sg.sizes)}
              className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 rounded-full hover:bg-violet-100 transition-colors cursor-pointer"
              title={`Apply group: ${(sg.sizes || []).join(", ")}`}
            >
              ⚡ {sg.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const SingleSizePresetChips = () => {
    if (sizePresets.length === 0 && sizeGroupPresets.length === 0) return null;
    return (
      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-1.5">Quick add size:</p>
        <div className="flex flex-wrap gap-1.5">
          {sizePresets.map(sp => (
            <button
              key={sp.id}
              type="button"
              onClick={() => addSingleSizeFromPreset(sp.name)}
              className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              + {sp.name}
            </button>
          ))}
          {sizeGroupPresets.map(sg => (
            <button
              key={sg.id}
              type="button"
              onClick={() => {
                setFormData(prev => {
                  const existing = prev.singleProductSizes.filter(s => s.size !== "");
                  return { ...prev, singleProductSizes: [...existing, ...(sg.sizes || []).map(sz => ({ size: sz }))] };
                });
              }}
              className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 rounded-full hover:bg-violet-100 transition-colors cursor-pointer"
              title={`Apply group: ${(sg.sizes || []).join(", ")}`}
            >
              ⚡ {sg.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div>
      <PageHeader title="Add Product" icon={Package} subtitle="Create a new product listing for your store" />
      <ErrorBanner message={error} />
      <SuccessAlert message={success} />

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Basic Info ───────────────────────────────────────── */}
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
                onChange={e => setFormData(prev => ({ ...prev, category_id: Array.from(e.target.selectedOptions, o => o.value) }))}
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
              <FormField label="">
                <Toggle name="addOffer" id="addOffer" checked={addOffer}
                  onChange={e => setAddOffer(e.target.checked)}
                  label="Add Discount Price"
                />
              </FormField>
            </FormGrid>

            {addOffer && (
              <FormField label="Discount Price (৳)">
                <Input type="number" name="discount_price" value={formData.discount_price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" prefix="৳" />
              </FormField>
            )}

            <FormField label="Max Qty per Order" hint="Leave blank to use the global limit from Order Settings">
              <Input type="number" name="max_per_order" value={formData.max_per_order} onChange={handleChange} placeholder="e.g. 5" min="1" max="1000" />
            </FormField>

            <div className="pt-2 border-t border-gray-100">
              <Toggle
                id="free_delivery_enabled"
                name="free_delivery_enabled"
                checked={formData.free_delivery_enabled}
                onChange={handleChange}
                label="Free Delivery on Bulk Purchase"
                description="Customer gets free delivery when they buy a minimum quantity of this product"
              />
              {formData.free_delivery_enabled && (
                <FormField className="mt-3" label="Minimum Quantity for Free Delivery" required>
                  <Input
                    type="number"
                    name="free_delivery_min_qty"
                    value={formData.free_delivery_min_qty}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    min="1"
                    max="1000"
                  />
                </FormField>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Feature Toggles ──────────────────────────────────── */}
        <SectionCard>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Optional Features</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { state: addColors,          set: setAddColors,          label: "Colors & Sizes" },
              { state: showSingleSizes,    set: setShowSingleSizes,    label: "Sizes (No Color)" },
              { state: showHomepage,       set: setShowHomepage,       label: "Sales Letter" },
              { state: showBulkDiscounts,  set: setShowBulkDiscounts,  label: "Bulk Discounts" },
              { state: showBumps,          set: setShowBumps,          label: "Bump Offers" },
              { state: showUpsell,         set: setShowUpsell,         label: "Upsell Offer" },
            ].map(({ state, set, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => set(s => !s)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
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

        {/* ── Product Images ───────────────────────────────────── */}
        {!addColors && (
          <SectionCard>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Product Images</p>
            <MultiFileUpload
              files={imagePreviews}
              onChange={handleImagesChange}
              onRemove={i => {
                setImagePreviews(p => p.filter((_, idx) => idx !== i));
                setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
              }}
              loading={compressing}
              hint="Auto-compressed to WebP"
            />
          </SectionCard>
        )}

        {/* ── Colors & Sizes ───────────────────────────────────── */}
        {addColors && (
          <SectionCard>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Colors & Sizes</p>
              <ActionBtn type="button" variant="secondary" size="sm" icon={Plus} onClick={addColor}>
                Add Color
              </ActionBtn>
            </div>

            {/* Color preset chips */}
            <ColorPresetChips onSelect={addColorFromPreset} />

            <div className="space-y-4">
              {formData.colors.map((color, cIdx) => (
                <RepeatableItem key={cIdx} index={cIdx} onRemove={() => removeColor(cIdx)} canRemove={formData.colors.length > 1}>
                  <FormGrid>
                    <FormField label="Color Name" required>
                      <Input
                        name="color"
                        value={color.color}
                        onChange={e => handleColorChange(cIdx, e)}
                        placeholder="e.g. Sky Blue"
                        required
                      />
                    </FormField>
                    <FormField label="Color Image" required>
                      <FileUpload
                        preview={color.imagePreview}
                        onChange={e => handleColorImageChange(cIdx, e)}
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

                  {/* Sizes for this color */}
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Sizes</p>

                    {/* Size preset chips */}
                    <SizePresetChips
                      onSelectSize={sizeName => addSizeFromPreset(cIdx, sizeName)}
                      onSelectGroup={groupSizes => addSizeGroupToColor(cIdx, groupSizes)}
                    />

                    <div className="space-y-2">
                      {color.sizes.map((size, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <Input
                            value={size.size}
                            onChange={e => handleSizeChange(cIdx, sIdx, e.target.value)}
                            placeholder="e.g. S, M, L"
                            className="flex-1"
                          />
                          {color.sizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSize(cIdx, sIdx)}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center cursor-pointer"
                            >
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

        {/* ── Single Sizes ─────────────────────────────────────── */}
        {showSingleSizes && (
          <SectionCard>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Sizes</p>
              <ActionBtn type="button" variant="secondary" size="sm" icon={Plus}
                onClick={() => setFormData(p => ({ ...p, singleProductSizes: [...p.singleProductSizes, { size: "" }] }))}>
                Add Size
              </ActionBtn>
            </div>

            {/* Size preset chips */}
            <SingleSizePresetChips />

            <div className="space-y-2">
              {formData.singleProductSizes.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={s.size}
                    onChange={e => handleSingleSizeChange(i, e.target.value)}
                    placeholder="e.g. S, M, L, XL"
                    className="flex-1"
                  />
                  {formData.singleProductSizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, singleProductSizes: p.singleProductSizes.filter((_, idx) => idx !== i) }))}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Bulk Discounts ───────────────────────────────────── */}
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
                <RepeatableItem key={i} index={i}
                  onRemove={() => setFormData(p => ({ ...p, bulk_discounts: p.bulk_discounts.filter((_, idx) => idx !== i) }))}
                  canRemove={formData.bulk_discounts.length > 1}>
                  <FormGrid cols={3}>
                    <FormField label="Title" required>
                      <Input name="title" value={d.title} onChange={e => handleBulkChange(i, e)} placeholder="e.g. Buy 3 Save 10%" required />
                    </FormField>
                    <FormField label="Qty Required" required>
                      <Input type="number" name="offer_quantity" value={d.offer_quantity} onChange={e => handleBulkChange(i, e)} placeholder="e.g. 3" min="1" required />
                    </FormField>
                    <FormField label="Discount %" required>
                      <Input type="number" name="discount_percentage" value={d.discount_percentage} onChange={e => handleBulkChange(i, e)} placeholder="e.g. 10" min="1" max="100" required />
                    </FormField>
                  </FormGrid>
                </RepeatableItem>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Bump Offers ──────────────────────────────────────── */}
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
                <RepeatableItem key={i} index={i}
                  onRemove={() => setFormData(p => ({ ...p, bumps: p.bumps.filter((_, idx) => idx !== i) }))}
                  canRemove={formData.bumps.length > 1}>
                  <FormGrid>
                    <FormField label="Title" required>
                      <Input name="title" value={b.title} onChange={e => handleBumpChange(i, e)} placeholder="Bump offer title" required />
                    </FormField>
                    <FormField label="Price (৳)" required>
                      <Input type="number" name="bump_price" value={b.bump_price} onChange={e => handleBumpChange(i, e)} placeholder="0.00" min="0" required prefix="৳" />
                    </FormField>
                  </FormGrid>
                  <FormField label="Description" required className="mt-3">
                    <Textarea name="description" value={b.description} onChange={e => handleBumpChange(i, e)} rows={3} placeholder="Describe the bump offer…" required />
                  </FormField>
                  <FormField label="Bump Image" className="mt-3">
                    <FileUpload
                      preview={b.image ? URL.createObjectURL(b.image) : null}
                      onChange={e => handleBumpImageChange(i, e)}
                      onClear={() => setFormData(p => { const bumps = [...p.bumps]; bumps[i] = { ...bumps[i], image: null }; return { ...p, bumps }; })}
                      hint="Optional bump image"
                      height="h-28"
                    />
                  </FormField>
                </RepeatableItem>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Upsell Offer ─────────────────────────────────────── */}
        {showUpsell && (
          <SectionCard>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Upsell Offer (Post-Order)</p>
            <p className="text-xs text-gray-500 mb-3">অর্ডার সম্পন্ন হলে কাস্টমারকে এই আপসেল পেজে নিয়ে যাওয়া হবে।</p>
            <FormField label="Upsell Product" required>
              <Select
                value={formData.upsell_product_id}
                onChange={e => setFormData(p => ({ ...p, upsell_product_id: e.target.value }))}
              >
                <option value="">-- আপসেল পণ্য বেছে নিন --</option>
                {upsellProducts.filter(u => u.is_active).map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} (৳{Number(u.offer_price).toLocaleString()})
                  </option>
                ))}
              </Select>
            </FormField>
            {upsellProducts.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                কোনো সক্রিয় আপসেল পণ্য নেই। Dashboard → Upsell থেকে আগে পণ্য তৈরি করুন।
              </p>
            )}
          </SectionCard>
        )}

        {/* ── Sales Letter ─────────────────────────────────────── */}
        {showHomepage && (
          <SectionCard>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Sales Letter / Content</p>
            <div className="space-y-4">
              <FormField label="Headline">
                <Input name="headline" value={formData.homepage.headline}
                  onChange={e => setFormData(p => ({ ...p, homepage: { ...p.homepage, headline: e.target.value } }))}
                  placeholder="Catchy headline…" />
              </FormField>
              <FormField label="Paragraph">
                <Textarea name="paragraph" value={formData.homepage.paragraph}
                  onChange={e => setFormData(p => ({ ...p, homepage: { ...p.homepage, paragraph: e.target.value } }))}
                  rows={3} placeholder="Short intro paragraph…" />
              </FormField>
              <FormField label="Description">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <QuillEditor
                    value={formData.homepage.description}
                    onChange={v => setFormData(p => ({ ...p, homepage: { ...p.homepage, description: v || "" } }))}
                    style={{ minHeight: 200 }}
                  />
                </div>
              </FormField>
            </div>
          </SectionCard>
        )}

        {/* ── Submit ───────────────────────────────────────────── */}
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
