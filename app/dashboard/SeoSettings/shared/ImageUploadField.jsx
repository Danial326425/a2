"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { config } from "@/config/config";
import { imageUrlFor } from "@/app/lib/seo/validators";

export default function ImageUploadField({
  label,
  value,
  onUpload,
  onRemove,
  recommended,
  accept = "image/png,image/jpeg,image/webp,image/gif,image/x-icon,.ico",
  maxSize = "4 MB",
  loading = false,
  error,
}) {
  const [dragging, setDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const preview = useMemo(
    () => localPreview || imageUrlFor(value, config.apiStorageUrl),
    [localPreview, value]
  );

  const pickFile = async (file) => {
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    try {
      await onUpload(file);
    } catch {
      setLocalPreview("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <p className="text-xs text-gray-400">{recommended} · Max {maxSize}</p>
        </div>
        {preview && (
          <button
            type="button"
            onClick={() => {
              setLocalPreview("");
              onRemove?.();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={13} />
            Remove
          </button>
        )}
      </div>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pickFile(event.dataTransfer.files?.[0]);
        }}
        className={`flex min-h-36 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50 hover:border-indigo-300"
        }`}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => pickFile(event.target.files?.[0])}
        />
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
            Uploading image
          </div>
        ) : preview ? (
          <img src={preview} alt={`${label} preview`} className="max-h-48 w-full rounded-lg object-contain p-3" />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Upload size={18} />
            </div>
            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <ImageIcon size={12} />
              {accept.replaceAll(",", ", ")}
            </p>
          </div>
        )}
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
