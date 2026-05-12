import React from "react";
import {
  FormField, Input, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const UpdateBonus = ({ formData, handleChange, handleSubmit, onCancel, loading, error }) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="First Registration Bonus" required>
      <Input
        type="number"
        name="first_reg_bonus"
        value={formData.first_reg_bonus}
        onChange={handleChange}
        required
        placeholder="e.g. 50"
      />
    </FormField>

    <FormField label="Purchase Bonus (%)" required>
      <Input
        type="number"
        name="bonus_percentage"
        value={formData.bonus_percentage}
        onChange={handleChange}
        required
        placeholder="e.g. 5"
      />
    </FormField>

    <FormField label="Coin Name" required>
      <Input
        name="coin_name"
        value={formData.coin_name}
        onChange={handleChange}
        required
        placeholder="e.g. Coins"
      />
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateBonus;
