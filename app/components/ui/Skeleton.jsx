/**
 * Storefront skeleton primitives + page-level compositions.
 *
 * Why these exist:
 *   - We had inline `<div className="... animate-pulse" />` blocks copy-pasted
 *     across homepage, /shop, /category, /checkout. Centralizing the same
 *     dimensions reserves real layout space so loading → loaded transition
 *     has minimal CLS.
 *   - Server-component safe (no `'use client'`) — usable inside Server pages.
 *
 * Usage:
 *   <Skeleton className="h-4 w-3/4" />              // raw box
 *   <SkeletonText lines={3} />                       // multi-line text
 *   <ProductCardSkeleton />                          // matches ProductCard
 *   <CategorySectionSkeleton />                      // matches CategoryProducts
 */

export function Skeleton({ className = '', ...rest }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      {...rest}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  return <Skeleton className={`${sizes[size] || sizes.md} rounded-full`} />;
}

/**
 * Matches the visual envelope of <ProductCard /> — same aspect-square image,
 * title, price, two CTAs. Use everywhere ProductCard is loaded asynchronously.
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2.5">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-1/3 mx-auto" />
        <Skeleton className="h-8 w-full mt-3" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

/** A category row — heading + grid of N skeleton cards. */
export function CategorySectionSkeleton({ cards = 5 }) {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: cards }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

/** Banner placeholder — reserves 16:5 aspect ratio so CLS = 0 on banner load. */
export function BannerSkeleton() {
  return <div className="w-full aspect-[16/5] bg-gray-200 animate-pulse" />;
}

/** Category strip skeleton (homepage row). */
export function CategoryStripSkeleton({ cols = 4 }) {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 text-center space-y-2">
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
      <div className={`grid grid-cols-${cols} gap-3`}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-3 w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
