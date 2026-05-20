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
  return buildSEO({
    title:       `${cat.name} Collection`,
    description: `Shop ${cat.name} at ${config.siteName} — fast cash-on-delivery across Bangladesh. Discover the latest ${cat.name} products curated for you.`,
    image:       cat.image,
    path:        `/category/${id}`,
    type:        'website',
  });
}

export default function Page() {
  return <CategoryClient />;
}
