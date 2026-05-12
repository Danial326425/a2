"use client";

import { useContext } from "react";

import CategoryProducts from "@/app/components/CategoryProducts";
import Category from "@/app/components/Category";

import BannerSlider from "@/app/components/BannerSlider";

import { ProductContext } from "@/app/context/ProductsContext";
import { HeaderContext } from "@/app/context/HeaderContext";

export default function Home() {

  const {
    loading: productLoading,
    banners,
  } = useContext(ProductContext);

  const {
    loading: headerLoading,
  } = useContext(HeaderContext);

  // Loading Screen
  if (productLoading || headerLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {banners?.length > 0 && (
        <BannerSlider banners={banners} />
      )}
      <Category />
      <CategoryProducts />
    </div>
  );
}