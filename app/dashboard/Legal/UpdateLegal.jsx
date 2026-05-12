import React from "react";
import QuillEditor from "../../components/QuillEditor";
import {
  FormField, Input, ActionBtn, ErrorBanner,
} from "../../components/Dashboard/DashUI";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const UpdateLegal = ({
  formData, handleChange, handleQuillChange, handleSubmit, setEditingLegal, loading, error,
}) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Slug" required>
      <Input
        name="slug"
        value={formData.slug}
        onChange={handleChange}
        required
        placeholder="e.g. terms-conditions"
      />
    </FormField>

    <FormField label="Title" required>
      <Input
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="Enter page title"
      />
    </FormField>

    <FormField label="Content" required>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <QuillEditor
          value={formData.content || ""}
          onChange={handleQuillChange}
          modules={QUILL_MODULES}
        />
      </div>
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={() => setEditingLegal(null)} disabled={loading}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateLegal;
