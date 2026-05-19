'use client';

import React, { useEffect, useContext, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';
import { initFacebookPixels, trackEventOnMultiplePixels } from '@/pixel';
import { ProductContext } from '../../context/ProductsContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/ProductCard';

// CartPanel is bottom-of-tree and only mounts when opened — split it out of
// the initial bundle so the category page paints faster.
const CartPanel = dynamic(() => import('../../components/CartPanel'), {
  ssr: false,
});

export default function SingleCategory() {
  const params = useParams();
  const categoryId = Number(params.id);

  const { pixel, apiUrl, products, loading: contextLoading } = useContext(ProductContext);
  const { totalItems } = useCart();

  const [category, setCategory]   = useState(null);
  const [catLoading, setCatLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Single light request just for category meta — products come from context
  // (already loaded once in /homepage-data, deduped across pages).
  useEffect(() => {
    if (!apiUrl || !params.id) return;
    const controller = new AbortController();
    axios
      .get(`${apiUrl}/category/${params.id}`, { signal: controller.signal })
      .then((res) => setCategory(res.data.category))
      .catch((err) => { if (!axios.isCancel(err)) setCategory(null); })
      .finally(() => setCatLoading(false));
    return () => controller.abort();
  }, [apiUrl, params.id]);

  // Filter from in-memory products once per dependency change. Newest first.
  const categoryProducts = useMemo(() => {
    if (!products?.length) return [];
    return products
      .filter((p) => p.categories?.some((c) => Number(c.id) === categoryId))
      .slice()
      .reverse();
  }, [products, categoryId]);

  // Pixel: fires once when both pixel + category name are available.
  useEffect(() => {
    if (pixel?.length > 0 && category?.name) {
      initFacebookPixels(pixel);
      trackEventOnMultiplePixels(pixel, 'ViewCategory', {
        content_name: category.name,
        content_category: category.name,
      });
    }
  }, [pixel, category?.name]);

  const loading = catLoading || (contextLoading && categoryProducts.length === 0);

  return (
    <>
      <div className="bg-gradient-to-r from-[#116d3c] to-[#0a2635] py-10 text-center text-white">
        <h1 className="text-4xl font-bold">{category?.name || ' '}</h1>
        <p className="mt-2 text-lg">
          <Link href="/" className="hover:underline">Home</Link>
          {category?.name ? ` / ${category.name}` : ''}
        </p>
      </div>

      <div className="bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          {loading ? (
            <CategoryGridSkeleton />
          ) : categoryProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <FloatingCartButton totalItems={totalItems} onClick={() => setIsCartOpen(true)} />
        <CartPanel isOpen={isCartOpen} toggleCart={() => setIsCartOpen(false)} />
      </div>
    </>
  );
}

const FloatingCartButton = React.memo(function FloatingCartButton({ totalItems, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="View cart"
      className="fixed right-6 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10 flex items-center justify-center"
    >
      <FaShoppingCart className="text-xl" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
});

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-3 space-y-2.5">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto" />
            <div className="h-8 bg-gray-200 rounded mt-3" />
            <div className="h-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <p className="text-gray-500">এই category তে কোনো product নেই।</p>
      <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline font-medium">
        Home-এ ফিরে যান
      </Link>
    </div>
  );
}
