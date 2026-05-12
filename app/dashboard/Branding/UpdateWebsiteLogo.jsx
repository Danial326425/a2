import React from "react";
import {
  FormField, Input, ActionBtn, ErrorBanner, FileUpload,
} from "../../components/Dashboard/DashUI";

const UpdateWebsiteLogo = ({
  formData, handleChange, handleSubmit, loading, error, setEditingLogo,
}) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Brand Slogan" required>
      <Input
        name="brand_slogan"
        value={formData.brand_slogan || ""}
        onChange={handleChange}
        placeholder="e.g. Quality You Can Trust"
        required
      />
    </FormField>

    <FormField label="Logo Image" hint="Leave blank to keep current logo. PNG or SVG recommended.">
      <FileUpload
        onChange={handleChange}
        hint="PNG, JPG, SVG · Transparent background works best"
        height="h-36"
        inputName="image"
      />
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={() => setEditingLogo(null)} disabled={loading}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateWebsiteLogo;
