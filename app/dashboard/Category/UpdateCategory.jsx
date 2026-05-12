import React from "react";
import {
  FormField, Input, Select, ActionBtn, ErrorBanner, Toggle, FileUpload,
} from "../../components/Dashboard/DashUI";

const UpdateCategory = ({
  formData, handleImageChange, handleChange, handleSubmit,
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

    <FormField label="Category Image" hint="Will be compressed to WebP (max 0.5 MB). Leave blank to keep current.">
      <FileUpload
        onChange={handleImageChange}
        hint="PNG, JPG, WebP · Will be compressed to WebP"
        height="h-32"
        inputName="image"
      />
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateCategory;
