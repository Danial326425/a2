// Server component — exports SEO metadata for the storefront homepage.
// All interactive UI lives in HomeClient (a sibling client component).

import HomeClient from './HomeClient';
import { buildSEO } from './lib/seo';
import { config } from '@/config/config';

const SEO_REVALIDATE = 600; // seconds — admin can tweak the per-page SEO row infrequently

async function getHomeSeo() {
  try {
    const res = await fetch(`${config.apiUrl}/seo/home`, {
      next: { revalidate: SEO_REVALIDATE },
    });
    if (!res.ok) return {};
    const data = await res.json();
    // /seo/{pageKey} returns { field_key: value, ... } per SeoSetting model
    return data?.data || data || {};
  } catch {
    return {};
  }
}

export async function generateMetadata() {
  const s = await getHomeSeo();
  return buildSEO({
    title:       s.meta_title       || `${config.siteName} — Cash on Delivery Shopping in Bangladesh`,
    description: s.meta_description || `Browse ${config.siteName}'s catalog of clothing, accessories, and lifestyle products. Fast cash-on-delivery shipping across Bangladesh.`,
    keywords:    s.meta_keywords ? s.meta_keywords.split(',').map(k => k.trim()) : undefined,
    image:       s.og_image,
    path:        '/',
    type:        'website',
  });
}

export default function Page() {
  return <HomeClient />;
}
