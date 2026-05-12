import React from "react";
import {
  FormField, Input, ActionBtn, ErrorBanner, Toggle,
} from "../../components/Dashboard/DashUI";

const UpdateSocial = ({ formData, handleChange, handleSubmit, onCancel, loading, error }) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Platform Name" required>
      <Input name="name" value={formData.name} onChange={handleChange} required maxLength={255} placeholder="e.g. Facebook, Instagram" />
    </FormField>

    <FormField label="Icon Class" required hint="Use Font Awesome class names, e.g. fab fa-facebook">
      <div className="flex items-center gap-3">
        {formData.icon_class && <i className={`${formData.icon_class} text-lg text-gray-500`} />}
        <Input name="icon_class" value={formData.icon_class} onChange={handleChange} required maxLength={255} placeholder="fab fa-facebook" className="flex-1" />
      </div>
    </FormField>

    <FormField label="Profile URL" required>
      <Input type="url" name="url" value={formData.url} onChange={handleChange} required maxLength={500} placeholder="https://facebook.com/yourpage" />
    </FormField>

    <FormField label="Status">
      <Toggle
        name="status"
        checked={!!formData.status}
        onChange={handleChange}
        label={formData.status ? "Active" : "Inactive"}
      />
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateSocial;
