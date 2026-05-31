/**
 * Single source of truth for page metadata. Every server page should derive
 * its Next.js `metadata` (or `generateMetadata` return value) from this
 * builder so titles, descriptions, canonical URLs, Open Graph, and Twitter
 * Card tags stay consistent across the storefront.
 *
 * Inputs are intentionally minimal — pass only what's different from the
 * defaults. Anything you omit (image, locale, etc.) falls back to a sensible
 * default sourced from config.js.
 *
 * Usage:
 *   // Static page
 *   export const metadata = buildSEO({ title: 'Shop', path: '/shop' });
 *
 *   // Dynamic page
 *   export async function generateMetadata({ params }) {
 *     const product = await fetchProduct(params.slug);
 *     return buildSEO({
 *       title:       product.name,
 *       description: product.short_description,
 *       image:       product.image,
 *       path:        `/${product.slug}`,
 *       type:        'website',
 *       price:       { amount: product.price, currency: 'BDT' },
 *     });
 *   }
 */

import { config } from '@/config/config';

const DEFAULT_DESC =
  'Cash on delivery shopping in Bangladesh — quality products, fast doorstep delivery.';
const DEFAULT_OG_IMAGE = `${config.siteUrl}/og-default.png`;

/* ── utilities ─────────────────────────────────────────────────────────── */

function clamp(text, max) {
  const s = (text == null ? '' : String(text)).replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  // Soft truncate at word boundary when possible
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(' ');
  return (last > max * 0.6 ? cut.slice(0, last) : cut).trimEnd() + '…';
}

function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Resolve an image input to an absolute URL. Accepts a full URL, a relative
 *  path (resolved against siteUrl), or a backend-relative storage path. */
function resolveImage(image) {
  if (!image) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/')) return `${config.siteUrl}${image}`;
  return `${config.backendUrl}/storage/${image}`;
}

function buildTitle(title) {
  const brand = config.siteName;
  if (!title) return brand;
  return clamp(title, 60);
}

/* ── main builder ──────────────────────────────────────────────────────── */

/**
 * @param {object}  opts
 * @param {string}  [opts.title]             — page-level title; brand suffix comes from layout template
 * @param {string}  [opts.description]      — auto-clamped to 160 chars
 * @param {string}  [opts.image]            — full URL, relative path, or storage path
 * @param {string}  [opts.path]             — site-relative path, defaults to '/'
 * @param {string}  [opts.type]             — og:type (website|article) — 'product' is not a valid OG type
 * @param {boolean} [opts.noindex]          — adds noindex,nofollow
 * @param {string[]}[opts.keywords]
 * @param {string}  [opts.locale]           — defaults to config.defaultLocale
 * @param {object}  [opts.price]            — { amount, currency } for products
 * @param {string}  [opts.availability]     — 'in stock' | 'out of stock'
 */
export function buildSEO(opts = {}) {
  const {
    title,
    description,
    image,
    path = '/',
    type = 'website',
    noindex = false,
    keywords,
    locale = config.defaultLocale,
    price,
    availability,
  } = opts;

  const finalTitle = buildTitle(title);
  const finalDesc  = clamp(description ? stripHtml(description) : DEFAULT_DESC, 160);
  const finalImg   = resolveImage(image);
  const canonical  = `${config.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

  /** @type {import('next').Metadata} */
  const metadata = {
    metadataBase: new URL(config.siteUrl),
    // `absolute` bypasses the root layout's title template — the template is
    // only for pages that return a plain string title (not via buildSEO).
    title: { absolute: finalTitle },
    description: finalDesc,
    alternates: { canonical },
    ...(keywords?.length ? { keywords } : {}),
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      url: canonical,
      siteName: config.siteName,
      type,
      locale,
      images: [{ url: finalImg, width: 1200, height: 630, alt: finalTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDesc,
      images: [finalImg],
      ...(config.twitterHandle ? { site: config.twitterHandle } : {}),
    },
  };

  // Product-specific Facebook Open Graph extensions (rich preview with price).
  if (type === 'product' && price?.amount) {
    metadata.other = {
      'product:price:amount': String(price.amount),
      'product:price:currency': price.currency || 'BDT',
      ...(availability ? { 'product:availability': availability } : {}),
    };
  }

  return metadata;
}

/* ── small helpers re-exported for consumers ───────────────────────────── */

export { clamp as clampText, stripHtml, resolveImage };
