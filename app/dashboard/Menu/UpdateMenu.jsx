import React from "react";
import {
  FormField, Input, Select, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const UpdateMenu = ({ formData, handleChange, handleSubmit, onCancel, loading, error }) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Name" required>
      <Input name="name" value={formData.name} onChange={handleChange} required maxLength={255} placeholder="Menu item name" />
    </FormField>

    <FormField label="URL" required>
      <Input type="url" name="url" value={formData.url} onChange={handleChange} required maxLength={500} placeholder="https://example.com/page" />
    </FormField>

    <FormField label="Menu Type" required>
      <Select name="menu_type" value={formData.menu_type} onChange={handleChange} required>
        <option value="header">Header</option>
        <option value="footer">Footer</option>
        <option value="sidebar">Sidebar</option>
      </Select>
    </FormField>

    <FormField label="Order" required>
      <Input type="number" name="order" value={formData.order} onChange={handleChange} min={1} required />
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateMenu;
