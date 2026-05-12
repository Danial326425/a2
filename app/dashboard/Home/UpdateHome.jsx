import React from "react";
import QuillEditor from "../../components/QuillEditor";
import {
  FormField, Input, Textarea, ActionBtn, ErrorBanner,
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

const UpdateHome = ({
  formData, handleChange, handleQuillChange, handleSubmit, onCancel, loading, error,
}) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <ErrorBanner message={error} />

    <FormField label="Headline" required>
      <Input
        name="headline"
        value={formData.headline}
        onChange={handleChange}
        required
        placeholder="Page headline"
      />
    </FormField>

    <FormField label="Slug" required>
      <Input
        name="slug"
        value={formData.slug}
        onChange={handleChange}
        required
        placeholder="e.g. home"
      />
    </FormField>

    <FormField label="Paragraph">
      <Textarea
        name="paragraph"
        value={formData.paragraph}
        onChange={handleChange}
        rows={3}
        placeholder="Short paragraph…"
      />
    </FormField>

    <FormField label="Description">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <QuillEditor
          value={formData.description}
          onChange={handleQuillChange}
          modules={QUILL_MODULES}
        />
      </div>
    </FormField>

    <div className="flex justify-end gap-3 pt-2">
      <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</ActionBtn>
      <ActionBtn type="submit" variant="primary" loading={loading}>Save Changes</ActionBtn>
    </div>
  </form>
);

export default UpdateHome;
