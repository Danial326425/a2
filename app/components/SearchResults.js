'use client';

import dynamic from 'next/dynamic';

// Reuse the SAME product card as the category / shop pages so search results
// match the rest of the site — and so images + product links actually work.
// (The old custom card used `product.image` — which doesn't exist; products
// carry `colors[]` / `images[]` — and linked to `/product/{id}` instead of the
// real `/{slug}` route.)
//
// Loaded dynamically so the card (and its deps) aren't pulled into the header
// bundle on every page — only when the customer actually searches.
const ProductCard = dynamic(() => import('./ProductCard'), {
  loading: () => <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />,
});

export default function SearchResults({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-4">
        <p className="text-gray-500 text-center">No products found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
