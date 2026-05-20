"use client";

import { config } from "@/config/config";
import { imageUrlFor } from "@/app/lib/seo/validators";

export default function SeoPreview({ settings, type = "search" }) {
  const title = settings.og_title || settings.twitter_title || settings.title || settings.site_title || config.siteName;
  const description = settings.og_description || settings.twitter_description || settings.description || "";
  const image = imageUrlFor(type === "twitter" ? settings.twitter_image : settings.og_image, config.apiStorageUrl);
  const host = (settings.og_url || settings.canonical_url || config.siteUrl).replace(/^https?:\/\//, "").replace(/\/.*$/, "").toUpperCase();

  if (type === "search") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-500">{settings.canonical_url || config.siteUrl}</p>
        <p className="mt-1 text-lg font-medium text-blue-700">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{description}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex aspect-[1.91/1] items-center justify-center bg-gray-100">
        {image ? (
          <img src={image} alt={`${type} preview`} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-gray-400">Image preview</span>
        )}
      </div>
      <div className="space-y-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{host}</p>
        <p className="line-clamp-1 text-sm font-semibold text-gray-900">{title}</p>
        <p className="line-clamp-2 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}
