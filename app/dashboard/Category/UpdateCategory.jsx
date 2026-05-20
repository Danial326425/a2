import React from "react";
import {
  FormField, Input, Textarea, Select, ActionBtn, ErrorBanner, Toggle, FileUpload,
} from "../../components/Dashboard/DashUI";

const UpdateCategory = ({
  formData, handleImageChange, handleOgImageChange, handleChange, handleSubmit,
  onCancel, loading, error, categories, editingCat,
}) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Category Name" required>
      <Input
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="e.g. Electronics"
      />
    </FormField>

    <FormField label="Parent Category">
      <Select name="parent_id" value={formData.parent_id || ""} onChange={handleChange}>
        <option value="">No Parent</option>
        {categories.filter(cat => cat.id !== editingCat).map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </Select>
    </FormField>

    <FormField label="Sort Order">
      <Input
        type="number"
        name="sort_order"
        value={formData.sort_order}
        onChange={handleChange}
        min={0}
      />
    </FormField>

    <FormField label="Product Limit">
      <Input
        type="number"
        name="product_limit"
        value={formData.product_limit}
        onChange={handleChange}
        min={1}
      />
    </FormField>

    <FormField label="Show on Homepage">
      <Toggle
        name="show_on_homepage"
        checked={!!formData.show_on_homepage}
        onChange={handleChange}
        label={formData.show_on_homepage ? "Visible on homepage" : "Hidden from homepage"}
      />
    </FormField>

    <FormField label="Free Delivery">
      <Toggle
        name="free_delivery"
        checked={!!formData.free_delivery}
        onChange={handleChange}
        label={formData.free_delivery ? "All products in this category ship free" : "Standard delivery charge applies"}
        description="Overrides district-based charges for any product in this category"
      />
    </FormField>

    <FormField label="Category Image" hint="Will be compressed to WebP (max 0.5 MB). Leave blank to keep current.">
      <FileUpload
        onChange={handleImageChange}
        hint="PNG, JPG, WebP · Will be compressed to WebP"
        height="h-32"
        inputName="image"
      />
    </FormField>

    {/* ── SEO Section ─────────────────────────────────────────────────── */}
    <div className="border-t border-gray-100 pt-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">SEO Settings</p>

      <div className="space-y-4">
        <FormField label="Meta Title" hint="Shown in browser tab and Google results. Leave blank to use category name.">
          <Input
            name="meta_title"
            value={formData.meta_title || ""}
            onChange={handleChange}
            placeholder={`${formData.name || "Category"} — ${typeof window !== "undefined" ? "" : ""}`}
            maxLength={70}
          />
          <p className="text-xs text-gray-400 mt-1">{(formData.meta_title || "").length}/70 characters</p>
        </FormField>

        <FormField label="Meta Description" hint="Shown below the title in Google results. 120–160 characters recommended.">
          <Textarea
            name="meta_description"
            value={formData.meta_description || ""}
            onChange={handleChange}
            placeholder="Describe this category for search engines..."
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-gray-400 mt-1">{(formData.meta_description || "").length}/160 characters</p>
        </FormField>

        <FormField label="Meta Keywords" hint="Comma-separated keywords (optional).">
          <Input
            name="meta_keywords"
            value={formData.meta_keywords || ""}
            onChange={handleChange}
            placeholder="e.g. electronics, gadgets, mobile"
          />
        </FormField>

        <FormField label="OG Image" hint="Image shown when this category is shared on Facebook/WhatsApp. 1200×630px recommended. Leave blank to use category image.">
          {formData.og_image_preview && (
            <div className="mb-2 flex items-center gap-3">
              <img
                src={formData.og_image_preview}
                alt="OG preview"
                className="h-16 w-28 rounded object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleChange({ target: { name: "remove_og_image", value: "1", type: "text" } })}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}
          <FileUpload
            onChange={handleOgImageChange}
            hint="PNG, JPG · 1200×630px recommended"
            height="h-24"
            inputName="og_image"
          />
        </FormField>
      </div>
    </div>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateCategory;
