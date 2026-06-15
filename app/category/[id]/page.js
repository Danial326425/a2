// Server component — dynamic SEO metadata for /category/{id}.
// Renders CategoryClient (client component) for the actual UI.

import CategoryClient from './CategoryClient';
import { buildSEO } from '@/app/lib/seo';
import { config } from '@/config/config';

const CATEGORY_REVALIDATE = 300;

async function getCategory(id) {
  try {
    const res = await fetch(`${config.apiUrl}/category/${id}`, {
      next: { revalidate: CATEGORY_REVALIDATE },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.category || data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const cat = await getCategory(id);

  if (!cat) {
    return buildSEO({
      title: 'Category Not Found',
      noindex: true,
      path: `/category/${id}`,
    });
  }

  const title       = cat.meta_title       || `${cat.name} Collection`;
  const description = cat.meta_description || `Shop ${cat.name} at ${config.siteName} — fast cash-on-delivery across Bangladesh. Discover the latest ${cat.name} products curated for you.`;
  const keywords    = cat.meta_keywords    ? cat.meta_keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined;
  const image       = cat.og_image         || cat.image;

  return buildSEO({
    title,
    description,
    keywords,
    image,
    path:  `/category/${id}`,
    type:  'website',
  });
}

export default async function Page({ params }) {
  const { id } = await params;
  // Reuse the cached category fetch (deduped with generateMetadata) and pass it
  // down so CategoryClient renders the header immediately — no client round-trip
  // gating the product grid. Products come from the SSR-seeded ProductContext.
  const initialCategory = await getCategory(id);
  return <CategoryClient initialCategory={initialCategory} />;
}
