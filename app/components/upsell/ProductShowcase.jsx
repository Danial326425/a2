"use client";

import Image from "next/image";

export default function ProductShowcase({ product, config, imageUrl }) {
  const p = config?.product ?? {};
  const bgColor = p.bg_color ?? '#ffffff';
  const imageStyle = p.image_style ?? 'rounded';

  const imgSrc = product?.image ? `/api/storage/${product.image}` : null;
  const features = Array.isArray(product?.features) ? product.features : [];
  const gallery  = Array.isArray(product?.gallery)  ? product.gallery  : [];

  const borderRadius = imageStyle === 'circle' ? '50%' : imageStyle === 'square' ? '0' : '12px';

  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: bgColor }}>
      {/* Product badge / tag row */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 flex-wrap">
        {p.show_badge && product?.badge_text && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            {product.badge_text}
          </span>
        )}
        {p.show_tag && product?.tag && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            {product.tag}
          </span>
        )}
        {product?.label && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
            {product.label}
          </span>
        )}
      </div>

      {/* Main image */}
      {p.show_image && imgSrc && (
        <div className="relative w-full flex justify-center px-4 pb-3">
          <div className="relative w-full max-w-xs h-48 md:h-64">
            <Image
              src={imgSrc}
              alt={product?.name ?? 'Upsell product'}
              fill
              style={{ objectFit: 'contain', borderRadius }}
              sizes="(max-width: 480px) 100vw, 480px"
              priority
            />
          </div>
        </div>
      )}

      {/* Gallery thumbnails */}
      {p.show_gallery && gallery.length > 0 && (
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {gallery.map((g, i) => (
            <div key={i} className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={`/api/storage/${g}`}
                alt={`gallery-${i}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="56px"
              />
            </div>
          ))}
        </div>
      )}

      {/* Product name + description */}
      <div className="px-4 pb-3">
        {product?.name && (
          <h2 className="text-lg font-bold text-gray-900 leading-snug">
            {product.name}
          </h2>
        )}
        {product?.description && (
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Features list */}
      {p.show_features && features.length > 0 && (
        <ul className="px-4 pb-4 space-y-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
