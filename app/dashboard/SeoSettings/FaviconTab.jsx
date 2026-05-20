"use client";

import { config } from "@/config/config";
import { imageUrlFor } from "@/app/lib/seo/validators";
import ImageUploadField from "./shared/ImageUploadField";

export default function FaviconTab({ settings, imageUpload }) {
  const appleIcon = imageUrlFor(settings.apple_touch_icon || settings.favicon_png || settings.favicon, config.apiStorageUrl);
  const favicon = imageUrlFor(settings.favicon_png || settings.favicon, config.apiStorageUrl);

  const fields = [
    ["favicon", "Favicon .ico", "16x16 and 32x32 ICO", "image/x-icon,.ico"],
    ["favicon_png", "Favicon .png", "32x32 PNG", "image/png"],
    ["apple_touch_icon", "Apple Touch Icon", "180x180 PNG", "image/png"],
    ["android_chrome_192", "Android Chrome 192", "192x192 PNG", "image/png"],
    ["android_chrome_512", "Android Chrome 512", "512x512 PNG", "image/png"],
  ];

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {fields.map(([key, label, recommended, accept]) => (
          <ImageUploadField
            key={key}
            label={label}
            value={settings[key]}
            recommended={recommended}
            accept={accept}
            loading={imageUpload.uploading[key]}
            error={imageUpload.errors[key]}
            onUpload={(file) => imageUpload.uploadImage(key, file)}
            onRemove={() => imageUpload.removeImage(key)}
          />
        ))}
      </div>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">Browser Tab Preview</p>
          <div className="flex items-center gap-2 rounded-t-xl border border-gray-200 bg-gray-100 px-3 py-2">
            {favicon ? <img src={favicon} alt="Favicon preview" className="h-4 w-4 rounded-sm" /> : <span className="h-4 w-4 rounded-sm bg-gray-300" />}
            <span className="max-w-48 truncate text-xs text-gray-700">{settings.site_title || settings.title || "Website"}</span>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">Mobile Home Screen Preview</p>
          <div className="w-36 rounded-3xl border border-gray-200 bg-gray-50 p-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              {appleIcon ? <img src={appleIcon} alt="Apple touch icon preview" className="h-14 w-14 rounded-xl object-cover" /> : <span className="text-xs text-gray-400">Icon</span>}
            </div>
            <p className="mt-2 truncate text-xs font-medium text-gray-700">{settings.site_title || "Safwan"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
