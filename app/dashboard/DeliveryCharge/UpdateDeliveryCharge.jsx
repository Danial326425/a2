import React from "react";
import {
  FormField, Input, Textarea, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const UpdateDeliveryCharge = ({ formData, handleChange, handleSubmit, loading, error, onCancel }) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="District Name" required>
      <Input
        name="district_name"
        value={formData.district_name}
        onChange={handleChange}
        placeholder="e.g. Dhaka Inside"
      />
    </FormField>

    <FormField label="Delivery Charge (৳)" required>
      <Input
        type="number"
        name="delivery_charge"
        value={formData.delivery_charge}
        onChange={handleChange}
        placeholder="e.g. 60"
      />
    </FormField>

    <FormField label="Estimated Delivery Days" required>
      <Input
        type="number"
        name="estimated_days"
        value={formData.estimated_days}
        onChange={handleChange}
        placeholder="e.g. 2"
      />
    </FormField>

    <FormField label="Delivery Note">
      <Textarea
        name="delivery_note"
        value={formData.delivery_note}
        onChange={handleChange}
        rows={3}
        placeholder="Optional note…"
      />
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateDeliveryCharge;
