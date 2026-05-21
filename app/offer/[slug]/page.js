import { notFound } from 'next/navigation';
import OfferViewer from './OfferViewer';
import { buildSEO } from '@/app/lib/seo';
import { config } from '@/config/config';

export const dynamic = 'force-dynamic';

async function fetchOffer(slug) {
  try {
    const res = await fetch(`${config.apiUrl}/landing-pages/offer/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result?.success ? result.data : null;
  } catch {
    return null;
  }
}

function pickOgImage(landing) {
  // Per-landing SEO override → product image → null (utility falls back to default)
  return landing?.seo?.og_image
      || landing?.product?.images?.[0]?.image
      || landing?.product?.colors?.[0]?.image
      || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const landing = await fetchOffer(slug);

  if (!landing) {
    return buildSEO({
      title: 'Offer Not Found',
      noindex: true,
      path: `/offer/${slug}`,
    });
  }

  const seo     = landing.seo || {};
  const product = landing.product || {};

  return buildSEO({
    title:       seo.meta_title       || landing.name || product.name || 'Special Offer',
    description: seo.meta_description || product.homepage?.paragraph  || `Order ${product.name || landing.name} now — Cash on Delivery available across Bangladesh.`,
    keywords:    seo.meta_keywords ? String(seo.meta_keywords).split(',').map(k => k.trim()) : undefined,
    image:       pickOgImage(landing),
    path:        `/offer/${slug}`,
    type:        'website',
    price:       product.price ? { amount: product.discount_price || product.price, currency: 'BDT' } : undefined,
    availability: 'in stock',
  });
}

export default async function OfferPage({ params }) {
  const { slug } = await params;
  const landing = await fetchOffer(slug);
  if (!landing) notFound();

  // Inject checkout-type attribute on body when missing (legacy editor pages)
  let html = landing.html;
  const bodyMatch = html.match(/<body([^>]*)>/i);
  if (bodyMatch && !bodyMatch[1].includes('data-checkout-type')) {
    const checkoutType = landing.checkout_display_mode || 'scroll';
    html = html.replace(/<body([^>]*)>/i, `<body$1 data-checkout-type="${checkoutType}">`);
  }

  return (
    <OfferViewer
      html={html}
      css={landing.css}
      name={landing.name}
      slug={landing.slug}
      checkoutType={landing.checkout_display_mode || 'scroll'}
    />
  );
}
