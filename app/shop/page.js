"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import axios from "axios";
import { config } from "@/config/config";
import { FaArrowRight, FaStore, FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";

const ProductCard = dynamic(() => import("@/app/components/ProductCard"), {
  ssr: false,
  loading: () => <ProductCardSkeleton />,
});

// CartPanel only mounts when opened — split out of initial bundle
const CartPanel = dynamic(() => import("@/app/components/CartPanel"), {
  ssr: false,
});

const apiUrl = config.apiUrl;
const PER_PAGE = 2;            // categories per fetch
const PRODUCTS_PER_CATEGORY = 8;

export default function ShopPage() {
  const [groups, setGroups]       = useState([]);   // [{ id, name, products: [...] }]
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]         = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { totalItems } = useCart();

  const loadedPagesRef  = useRef(new Set());        // dedupe page fetches
  const loadedCatIdsRef = useRef(new Set());        // dedupe categories
  const sentinelRef     = useRef(null);

  const fetchPage = useCallback(async (p) => {
    if (loadedPagesRef.current.has(p)) return;
    loadedPagesRef.current.add(p);
    const isInitial = p === 1;
    if (isInitial) setLoading(true); else setLoadingMore(true);
    try {
      const res = await axios.get(`${apiUrl}/shop/categories`, {
        params: {
          page: p,
          per_page: PER_PAGE,
          products_per_category: PRODUCTS_PER_CATEGORY,
        },
      });
      const data = res.data?.data || [];
      const more = !!res.data?.has_more;

      setGroups((prev) => {
        const fresh = data.filter((g) => !loadedCatIdsRef.current.has(g.id));
        fresh.forEach((g) => loadedCatIdsRef.current.add(g.id));
        return [...prev, ...fresh];
      });
      setHasMore(more);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
      loadedPagesRef.current.delete(p); // allow retry
    } finally {
      if (isInitial) setLoading(false); else setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // IntersectionObserver-based infinite scroll
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const next = page + 1;
          setPage(next);
          fetchPage(next);
        }
      },
      { rootMargin: "300px 0px" } // start loading before sentinel enters viewport
    );
    io.observe(el);
    return () => io.disconnect();
  }, [page, hasMore, loading, loadingMore, fetchPage]);

  return (
    <main className="bg-gray-50 min-h-screen">
      <ShopHero />

      <div className="container mx-auto py-8 px-4">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <CategorySkeletonList count={2} />
        ) : groups.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {groups.map((cat) => (
              <CategorySection key={cat.id} category={cat} />
            ))}

            {/* Sentinel + load-more state */}
            {hasMore && (
              <div ref={sentinelRef} className="py-8">
                {loadingMore && <CategorySkeletonList count={1} />}
              </div>
            )}
            {!hasMore && groups.length > 0 && (
              <p className="text-center text-sm text-gray-400 py-10">
                — সব products দেখানো হয়েছে —
              </p>
            )}
          </>
        )}
      </div>

      <FloatingCartButton totalItems={totalItems} onClick={() => setIsCartOpen(true)} />
      <CartPanel isOpen={isCartOpen} toggleCart={() => setIsCartOpen(false)} />
    </main>
  );
}

const FloatingCartButton = React.memo(function FloatingCartButton({ totalItems, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="View cart"
      className="fixed right-6 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40 flex items-center justify-center"
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

/* ─── Subcomponents ──────────────────────────────────────────────────────── */

const CategorySection = React.memo(function CategorySection({ category }) {
  const products = category.products || [];
  if (products.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{category.name}</h2>
        <Link
          href={`/category/${category.slug || category.id}`}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm md:text-base"
        >
          View All <FaArrowRight className="ml-1 text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
});

function ShopHero() {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <FaStore />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-100">Shop</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          All Products
        </h1>
        <p className="text-blue-100 mt-2 max-w-xl text-sm md:text-base">
          Browse our full catalog organized by category. Scroll down to explore more.
        </p>
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2.5">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="h-8 bg-gray-200 rounded mt-3" />
        <div className="h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function CategorySkeletonList({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <section key={i} className="mb-12">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
            <div className="h-7 bg-gray-200 rounded w-40 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, j) => (
              <ProductCardSkeleton key={j} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <FaStore className="text-gray-300 text-2xl" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700">No products found</h3>
      <p className="text-sm text-gray-500 mt-1">Check back soon for new arrivals.</p>
    </div>
  );
}
