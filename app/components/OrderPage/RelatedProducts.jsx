"use client";

import { useMemo, useContext } from "react";
import { OrderContext } from "../../context/OrderContext";
import ProductCard from "../ProductCard";

export default function RelatedProducts({ filterAllProducts }) {
  const { products: currentProduct } = useContext(OrderContext);

  const related = useMemo(() => {
    if (!Array.isArray(filterAllProducts) || !filterAllProducts.length) return [];

    const currentId   = currentProduct?.id;
    const currentSlug = currentProduct?.slug;
    const currentCategoryIds = (currentProduct?.categories || []).map((c) => c.id);

    const sameCategory = currentCategoryIds.length
      ? filterAllProducts.filter((p) => {
          if (p.id === currentId || p.slug === currentSlug) return false;
          return (p.categories || []).some((c) => currentCategoryIds.includes(c.id));
        })
      : [];

    const pool = sameCategory.length
      ? sameCategory
      : filterAllProducts.filter((p) => p.id !== currentId && p.slug !== currentSlug);

    return pool.slice(0, 6);
  }, [filterAllProducts, currentProduct]);

  if (!related.length) return null;

  return (
    <section className="mt-10 px-4 pb-10">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        আরও পণ্য দেখুন
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
