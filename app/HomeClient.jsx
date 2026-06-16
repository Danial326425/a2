"use client";

import { useContext } from "react";
import dynamic from "next/dynamic";

import { ProductContext } from "@/app/context/ProductsContext";
import BannerSlider from "@/app/components/BannerSlider";
import {
  BannerSkeleton, CategoryStripSkeleton, CategorySectionSkeleton,
} from "@/app/components/ui/Skeleton";

// BannerSlider is imported DIRECTLY (not dynamic) because it holds the LCP
// image — a dynamic boundary kept next/image's `priority` preload out of the
// initial HTML, so the banner was discovered late + without fetchpriority.
// (It no longer pulls react-slick, so it's lightweight now.)
// Below-the-fold children stay code-split for faster hydration.
const Category = dynamic(() => import("@/app/components/Category"), {
  loading: () => <CategoryStripSkeleton cols={4} />,
});
const CategoryProducts = dynamic(
  () => import("@/app/components/CategoryProducts"),
  { loading: () => <HomeListSkeleton /> }
);

export default function HomeClient() {
  const { loading, banners } = useContext(ProductContext);

  if (loading) {
    return (
      <div className="bg-gray-50">
        <BannerSkeleton />
        <CategoryStripSkeleton cols={4} />
        <HomeListSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {banners?.length > 0 && <BannerSlider banners={banners} />}
      <Category />
      <CategoryProducts />
    </div>
  );
}

function HomeListSkeleton() {
  return (
    <div className="bg-gray-50 pb-16">
      <div className="container mx-auto py-8 px-4">
        <CategorySectionSkeleton cards={5} />
        <CategorySectionSkeleton cards={5} />
      </div>
    </div>
  );
}
