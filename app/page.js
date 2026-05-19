"use client";

import { useContext } from "react";
import dynamic from "next/dynamic";

import { ProductContext } from "@/app/context/ProductsContext";

// Heavy children — split out of the initial JS bundle so the homepage shell
// hydrates faster. CategoryProducts pulls in react-slick, image-heavy lists,
// and the cart panel; BannerSlider pulls slick CSS + JS.
const BannerSlider = dynamic(() => import("@/app/components/BannerSlider"), {
  loading: () => (
    <div className="w-full aspect-[16/5] bg-gray-100 animate-pulse" />
  ),
});
const Category = dynamic(() => import("@/app/components/Category"), {
  loading: () => <CategorySkeleton />,
});
const CategoryProducts = dynamic(
  () => import("@/app/components/CategoryProducts"),
  { loading: () => <CategoryProductsSkeleton /> }
);

export default function Home() {
  const { loading, banners } = useContext(ProductContext);

  // Show a lightweight progressive skeleton instead of a full-screen spinner
  // so visitors see structure immediately (better LCP / CLS perception).
  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="bg-gray-50">
      {banners?.length > 0 && <BannerSlider banners={banners} />}
      <Category />
      <CategoryProducts />
    </div>
  );
}

/* ── Lightweight skeleton primitives ───────────────────────────────────── */

function HomeSkeleton() {
  return (
    <div className="bg-gray-50">
      <div className="w-full aspect-[16/5] bg-gray-200 animate-pulse" />
      <CategorySkeleton />
      <CategoryProductsSkeleton />
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 text-center space-y-2">
        <div className="h-7 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-72 mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryProductsSkeleton() {
  return (
    <div className="bg-gray-50 pb-16">
      <div className="container mx-auto py-8 px-4">
        {Array.from({ length: 2 }).map((_, sec) => (
          <section key={sec} className="mb-12">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <div className="h-7 bg-gray-200 rounded w-40 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
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
          </section>
        ))}
      </div>
    </div>
  );
}
