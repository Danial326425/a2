import React from "react";
import {
  FormField, Input, ActionBtn, ErrorBanner, Toggle,
} from "../../components/Dashboard/DashUI";

const UpdatePackage = ({ formData, setFormData, handleChange, handleSubmit, onCancel, loading, error }) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Package Name" required>
      <Input
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        maxLength={255}
        placeholder="e.g. Eid Special"
      />
    </FormField>

    <FormField label="Package Coins" required>
      <Input
        name="coins"
        value={formData.coins}
        onChange={handleChange}
        required
        maxLength={20}
        placeholder="e.g. 500"
      />
    </FormField>

    <FormField label="Package Price (৳)" required>
      <Input
        name="price"
        value={formData.price}
        onChange={handleChange}
        required
        maxLength={20}
        placeholder="e.g. 100"
      />
    </FormField>

    <FormField label="Status">
      <Toggle
        name="is_active"
        checked={!!formData.is_active}
        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        label={formData.is_active ? "Active" : "Inactive"}
      />
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdatePackage;
