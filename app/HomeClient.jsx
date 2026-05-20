"use client";

import { useContext } from "react";
import dynamic from "next/dynamic";

import { ProductContext } from "@/app/context/ProductsContext";
import {
  BannerSkeleton, CategoryStripSkeleton, CategorySectionSkeleton,
} from "@/app/components/ui/Skeleton";

// Heavy children — split out of the initial JS bundle so the homepage shell
// hydrates faster. CategoryProducts pulls in react-slick, image-heavy lists,
// and the cart panel; BannerSlider pulls slick CSS + JS.
const BannerSlider = dynamic(() => import("@/app/components/BannerSlider"), {
  loading: () => <BannerSkeleton />,
});
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
