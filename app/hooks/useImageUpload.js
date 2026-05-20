"use client";

import { useState } from "react";
import { uploadSeoImage, removeSeoImage } from "@/app/lib/seo/api";

export default function useImageUpload(updateField) {
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});

  const uploadImage = async (type, file) => {
    if (!file) return "";
    setUploading((current) => ({ ...current, [type]: true }));
    setErrors((current) => ({ ...current, [type]: "" }));
    try {
      const path = await uploadSeoImage(type, file);
      updateField(type, path || "");
      return path;
    } catch (error) {
      const message = error.response?.data?.message || "Image upload failed";
      setErrors((current) => ({ ...current, [type]: message }));
      throw error;
    } finally {
      setUploading((current) => ({ ...current, [type]: false }));
    }
  };

  const removeImage = async (type) => {
    setUploading((current) => ({ ...current, [type]: true }));
    setErrors((current) => ({ ...current, [type]: "" }));
    try {
      await removeSeoImage(type);
      updateField(type, "");
    } catch (error) {
      const message = error.response?.data?.message || "Image remove failed";
      setErrors((current) => ({ ...current, [type]: message }));
      throw error;
    } finally {
      setUploading((current) => ({ ...current, [type]: false }));
    }
  };

  return { uploadImage, removeImage, uploading, errors };
}
