/**
 * Server-side, cached fetch of the storefront's global homepage data
 * (products, categories, banners, menus, logo, contact, pixels).
 *
 * Why this exists: previously ProductProvider fetched /homepage-data ONLY on
 * the client (after mount), so first-time visitors saw a blank/skeleton until
 * that round-trip finished — wrecking LCP (the banner/products are the largest
 * paint) and causing a loading→content layout shift (CLS).
 *
 * Fetching here (server) lets the root layout pass the result as `seed` to
 * ProductProvider, so the banner + product grid are in the INITIAL HTML.
 *
 * Cached via unstable_cache (5-min revalidate + tag) so it's one shared fetch
 * across requests; dashboard saves can purge it with revalidateTag('homepage-data').
 */

import { unstable_cache } from 'next/cache';
import { config } from '@/config/config';

export const HOMEPAGE_CACHE_TAG = 'homepage-data';

async function fetchHomepage() {
  try {
    const res = await fetch(`${config.apiUrl}/homepage-data`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json?.data) return null;

    const d = json.data;
    const pixelList = Array.isArray(d.pixels) ? d.pixels : [];

    // Shape mirrors the client-side cache so ProductProvider can seed state directly.
    return {
      products:      d.products      || [],
      categories:    d.categories    || [],
      banners:       d.banners       || [],
      footer_menus:  d.footer_menus  || [],
      contact_info:  d.contact_info  || {},
      logo:          d.logo          || {},
      social_links:  d.social_links  || [],
      pixel:         pixelList.map((p) => p.pixel_id),
      testEventCode: pixelList.map((p) => p.test_event_code),
      isPurchase:    pixelList.length > 0 ? (pixelList[0].is_purchase ?? false) : false,
    };
  } catch {
    return null;
  }
}

export const getHomepageData = unstable_cache(
  fetchHomepage,
  ['homepage-data-v1'],
  { revalidate: 300, tags: [HOMEPAGE_CACHE_TAG] }
);
