import React from "react";
import {
  FormField, Input, ActionBtn, ErrorBanner, Toggle,
} from "../../components/Dashboard/DashUI";

const UpdatePixel = ({ formData, handleChange, handleSubmit, onCancel, loading, error }) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Pixel ID" required hint="Your Facebook Pixel ID, e.g. 123456789012345">
      <Input name="pixel_id" value={formData.pixel_id} onChange={handleChange} required placeholder="Enter Pixel ID" />
    </FormField>

    <FormField label="Access Token" hint="Your Facebook Conversions API access token">
      <Input name="fb_access_token" value={formData.fb_access_token} onChange={handleChange} placeholder="EAAGmxxxxxxxx…" />
    </FormField>

    <FormField label="Test Event Code" hint="Optional: for testing events, e.g. TEST1234">
      <Input name="test_event_code" value={formData.test_event_code} onChange={handleChange} placeholder="TEST1234" />
    </FormField>

    <FormField label="Event Type">
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <Toggle
          name="is_purchase"
          checked={!!formData.is_purchase}
          onChange={handleChange}
          label={formData.is_purchase ? "Purchase Event" : "Lead Event"}
          description={formData.is_purchase ? "Fires Purchase conversion event" : "Fires Lead conversion event"}
        />
      </div>
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdatePixel;
