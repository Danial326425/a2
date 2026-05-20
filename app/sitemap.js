import { config } from '@/config/config';

/**
 * Storefront sitemap. Aggregates every public, indexable URL:
 *   - Static pages          (home, shop, contact, about)
 *   - All categories        (/category/{id})
 *   - All products          (/{slug}) — product pages live at the root
 *   - Published landing pages (/offer/{slug})
 *   - Published legal pages (/legal/{slug})
 *
 * Disallowed paths (checkout, thankyou, upsell, dashboard, api) are NOT
 * included here AND are blocked in robots.txt — belt + suspenders.
 *
 * Caching: hourly revalidation. Manual purge after publishing new content
 * is possible via /api/revalidate?tag=sitemap.
 */
export const revalidate = 3600;

const BASE = config.siteUrl;

async function safeJson(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function entry(path, lastmod, priority = 0.7, changefreq = 'weekly') {
  return {
    url: `${BASE}${path.startsWith('/') ? path : `/${path}`}`,
    lastModified: lastmod ? new Date(lastmod) : new Date(),
    changeFrequency: changefreq,
    priority,
  };
}

export default async function sitemap() {
  const [catsRes, prodsRes, landingsRes, legalsRes] = await Promise.all([
    safeJson(`${config.apiUrl}/category`),
    safeJson(`${config.apiUrl}/products`),
    safeJson(`${config.apiUrl}/landing-pages/published/all`),
    safeJson(`${config.apiUrl}/legalpages`),
  ]);

  // Static, hand-curated pages with deliberate priorities.
  const staticPages = [
    entry('/',        new Date(), 1.0, 'daily'),
    entry('/shop',    new Date(), 0.9, 'daily'),
    entry('/contact', new Date(), 0.5, 'monthly'),
    entry('/about',   new Date(), 0.5, 'monthly'),
  ];

  // Categories — API returns { categories: [...] } (current CategoryController shape)
  const categories = Array.isArray(catsRes?.categories) ? catsRes.categories : [];
  const categoryPages = categories
    .filter(c => c.id && !c.parent_id) // top-level only; child cats accessible via parent
    .map(c => entry(`/category/${c.id}`, c.updated_at, 0.8, 'weekly'));

  // Products — list may be a bare array OR { data: [...] }
  const products = Array.isArray(prodsRes) ? prodsRes : (prodsRes?.data || []);
  const productPages = products
    .filter(p => p?.slug)
    .map(p => entry(`/${p.slug}`, p.updated_at, 0.7, 'weekly'));

  // Published landing pages
  const landings = Array.isArray(landingsRes?.data) ? landingsRes.data : (Array.isArray(landingsRes) ? landingsRes : []);
  const landingPages = landings
    .filter(l => l?.slug)
    .map(l => entry(`/offer/${l.slug}`, l.updated_at || l.published_at, 0.6, 'monthly'));

  // Legal / policy pages
  const legals = Array.isArray(legalsRes) ? legalsRes : (legalsRes?.data || []);
  const legalPages = legals
    .filter(l => l?.slug)
    .map(l => entry(`/legal/${l.slug}`, l.updated_at, 0.3, 'yearly'));

  return [...staticPages, ...categoryPages, ...productPages, ...landingPages, ...legalPages];
}
