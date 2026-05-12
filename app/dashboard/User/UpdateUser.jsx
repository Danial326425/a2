import React from "react";
import {
  FormField, Input, Select, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const UpdateUser = ({ formData, handleChange, handleSubmit, loading, error, setEditingUers }) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Name" required>
      <Input
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Full name"
      />
    </FormField>

    <FormField label="Mobile Number" required hint="Phone number cannot be changed">
      <Input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        required
        readOnly
        className="bg-gray-50 cursor-not-allowed"
      />
    </FormField>

    <FormField label="Points" required>
      <Input
        type="number"
        name="points"
        value={formData.points}
        onChange={handleChange}
        required
      />
    </FormField>

    <FormField label="Role">
      <Select
        name="type"
        value={formData.type}
        onChange={handleChange}
        disabled={formData.type === "admin"}
      >
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
        <option value="admin">Admin</option>
      </Select>
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={() => setEditingUers(false)} disabled={loading}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateUser;
