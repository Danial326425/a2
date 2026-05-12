import React from "react";
import {
  FormField, Input, Textarea, ActionBtn, ErrorBanner, Toggle,
} from "../../components/Dashboard/DashUI";

const UpdateAdvancePay = ({
  formData, handleChange, handleCheckboxChange,
  handleSubmit, onCancel, loading, error,
}) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Title" required>
      <Input name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Advance Payment" />
    </FormField>

    <FormField label="Sub Title" required>
      <Input name="sub_title" value={formData.sub_title} onChange={handleChange} required placeholder="e.g. Pay a small amount now" />
    </FormField>

    <FormField label="Headline" required>
      <Textarea name="headline" value={formData.headline} onChange={handleChange} required rows={3} placeholder="Detailed description…" />
    </FormField>

    <FormField label="Pay Amount (৳)" required>
      <Input type="number" name="pay_amount" value={formData.pay_amount} onChange={handleChange} required placeholder="e.g. 100" />
    </FormField>

    <FormField label="Status">
      <Toggle
        name="is_active"
        checked={!!formData.is_active}
        onChange={handleCheckboxChange}
        label={formData.is_active ? "Active" : "Inactive"}
      />
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateAdvancePay;
