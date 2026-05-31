// Server Component — fetches product on the server for fast SEO + LCP.
// All interactivity lives in OrderPageClient (client component).

import { notFound } from 'next/navigation';
import { config } from '@/config';
import OrderPageClient from './OrderPageClient';

const PRODUCT_FETCH_REVALIDATE = 60; // seconds; tune per how fresh inventory must be

async function fetchProduct(slug) {
  if (!slug) return null;

  try {
    const res = await fetch(`${config.apiUrl}/products/${slug}`, {
      next: { revalidate: PRODUCT_FETCH_REVALIDATE },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data ?? data;
  } catch {
    return null;
  }
}

function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${config.backendUrl}/storage/${path}`;
}

function pickPrimaryImage(product) {
  return (
    product?.images?.[0]?.image ||
    product?.colors?.[0]?.image ||
    null
  );
}

export async function generateMetadata({ params }) {
  const { 'product-slug': slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return { title: 'পণ্য পাওয়া যায়নি', robots: { index: false, follow: false } };
  }

  const name     = product.name || '';
  const price    = product.discount_price || product.price;
  // SEO title: "Product Name – ৳Price | Brand" (brand appended by layout template)
  // Keep under 60 chars — layout template adds " | Brand" on top.
  const priceStr = price ? ` – ৳${Number(price).toLocaleString('bn-BD')}` : '';
  const seoTitle = name + priceStr;

  const desc =
    product?.homepage?.paragraph ||
    stripHtml(product?.homepage?.description).slice(0, 160) ||
    `${name}${price ? ` মাত্র ৳${price} টাকায়` : ''} অর্ডার করুন। ক্যাশ অন ডেলিভারি সুবিধায় সারা বাংলাদেশে ডেলিভারি।`;

  const primaryImage = buildImageUrl(pickPrimaryImage(product));
  const canonical    = `/${slug}`;

  return {
    title: seoTitle,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: seoTitle,
      description: desc,
      type: 'website',
      url: canonical,
      images: primaryImage ? [{ url: primaryImage, width: 1200, height: 630, alt: name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: desc,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

function ProductJsonLd({ product }) {
  if (!product) return null;

  const primaryImage = buildImageUrl(pickPrimaryImage(product));
  const price = Number(product?.discount_price || product?.price || 0);

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: stripHtml(product?.homepage?.description).slice(0, 500) || product.name,
    sku: String(product.id),
    image: primaryImage ? [primaryImage] : [],
    offers: {
      '@type': 'Offer',
      url: `/${product.slug}`,
      priceCurrency: 'BDT',
      price: price.toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function ProductPage({ params }) {
  const { 'product-slug': slug } = await params;
  const initialProduct = await fetchProduct(slug);

  if (!initialProduct) notFound();

  const primaryImagePath = pickPrimaryImage(initialProduct);
  const primaryImageUrl = buildImageUrl(primaryImagePath);

  return (
    <>
      <ProductJsonLd product={initialProduct} />
      {primaryImageUrl && (
        <link rel="preload" as="image" href={primaryImageUrl} fetchPriority="high" />
      )}
      <OrderPageClient slug={slug} initialProduct={initialProduct} />
    </>
  );
}
