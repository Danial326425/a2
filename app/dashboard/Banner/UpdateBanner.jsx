"use client";

import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import {
  FormField, Input, Textarea, ActionBtn, ErrorBanner, Toggle, FileUpload, FormGrid,
} from "../../components/Dashboard/DashUI";

const UpdateBanner = ({
  formData, handleChange, handleSubmit,
  loading, error, setEditingBanner, previewUrl: initialPreviewUrl,
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl);
  const [localError, setLocalError] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCompressing(true); setLocalError(null);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true, fileType: "image/webp",
      });
      const webpFile = new File([compressed], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
        type: "image/webp", lastModified: Date.now(),
      });
      setPreviewUrl(URL.createObjectURL(webpFile));
      handleChange({ target: { name: "image", files: [webpFile] } });
    } catch { setLocalError("Failed to process image. Please try another."); }
    finally { setIsCompressing(false); }
  };

  const onCancel = () => {
    if (previewUrl && previewUrl !== initialPreviewUrl) URL.revokeObjectURL(previewUrl);
    setEditingBanner(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorBanner message={error || localError} />

      <FormField label="Banner Image" hint="Recommended: 1200×400px, WebP/PNG">
        <FileUpload
          preview={previewUrl}
          onChange={handleImageChange}
          onClear={() => { setPreviewUrl(null); handleChange({ target: { name: "image", files: null } }); }}
          hint="PNG, JPG, WebP · Will be compressed to WebP"
          height="h-44"
          loading={isCompressing}
        />
      </FormField>

      <FormGrid>
        <FormField label="Title">
          <Input name="title" value={formData.title || ""} onChange={handleChange} placeholder="Banner title" disabled={isCompressing} />
        </FormField>
        <FormField label="Link URL">
          <Input type="url" name="link" value={formData.link || ""} onChange={handleChange} placeholder="https://…" disabled={isCompressing} />
        </FormField>
      </FormGrid>

      <FormGrid>
        <FormField label="Sort Order">
          <Input type="number" name="sort_order" value={formData.sort_order || 0} onChange={handleChange} min={0} disabled={isCompressing} />
        </FormField>
        <FormField label="Status">
          <Toggle name="is_active" checked={!!formData.is_active} onChange={handleChange} label={formData.is_active ? "Active" : "Inactive"} />
        </FormField>
      </FormGrid>

      <FormField label="Description">
        <Textarea name="description" value={formData.description || ""} onChange={handleChange} rows={3} placeholder="Optional description…" disabled={isCompressing} />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <ActionBtn type="button" variant="secondary" onClick={onCancel} disabled={loading || isCompressing}>Cancel</ActionBtn>
        <ActionBtn type="submit" variant="primary" loading={loading || isCompressing}>Save Changes</ActionBtn>
      </div>
    </form>
  );
};

export default UpdateBanner;
