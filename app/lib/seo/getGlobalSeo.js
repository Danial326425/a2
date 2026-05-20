/**
 * Cached global SEO settings fetcher.
 *
 * Source of truth: the dashboard SEO Settings module persists every site-wide
 * field under `page_key='home'` (see useSeoSettings + SeoSettingsSeeder).
 * There is NO separate 'global' page_key — `home` doubles as the global row
 * used by the root layout's metadata, favicon, and tracking scripts.
 *
 * Why this helper exists:
 *   1. A single cached fetch serves the whole render tree (root layout +
 *      every page + sitemap + robots).
 *   2. Dashboard saves can purge the cache instantly via `revalidateTag()`
 *      from /api/revalidate (no rolling restart needed).
 *   3. If the API is unreachable, callers get a sane empty object rather
 *      than the whole site crashing — every consumer should treat fields as
 *      optional and fall back to brand-level defaults.
 *
 * Tag: `seo-global`. Anyone updating the dashboard's SEO row should trigger
 * `revalidateTag('seo-global')`.
 */

import { unstable_cache } from 'next/cache';
import { config } from '@/config/config';

export const SEO_GLOBAL_CACHE_TAG = 'seo-global';

async function fetchGlobalSeo() {
  try {
    const res = await fetch(`${config.apiUrl}/seo/home`, {
      // We rely on unstable_cache for memoization; this request itself
      // shouldn't be additionally cached by Next's data cache because
      // unstable_cache already owns it via the wrapper below.
      cache: 'no-store',
    });
    if (!res.ok) return {};
    const json = await res.json();
    // Endpoint shape: { page_key: 'home', data: { field_key: value, ... } }
    return json?.data && typeof json.data === 'object' ? json.data : {};
  } catch {
    return {};
  }
}

/**
 * Memoized accessor. 1-hour TTL, but tag-driven invalidation lets dashboard
 * saves purge instantly. Returns an object whose keys mirror the dashboard's
 * field_key column — callers should pick what they need:
 *
 *   const seo = await getGlobalSeo();
 *   seo.meta_title, seo.og_image, seo.google_analytics_id, seo.favicon, ...
 */
export const getGlobalSeo = unstable_cache(
  fetchGlobalSeo,
  ['global-seo-v1'],
  { revalidate: 3600, tags: [SEO_GLOBAL_CACHE_TAG] }
);
