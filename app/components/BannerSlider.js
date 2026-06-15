'use client';

// Lightweight banner slider (no react-slick) so the FIRST banner is a proper
// LCP candidate: rendered in the SSR HTML, eager, with fetchpriority=high +
// preload (via next/image `priority`). react-slick cloned slides and shipped
// slick.css + slick.woff into the critical path, which delayed LCP.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const imageProxyUrl = '/api/storage';
const AUTOPLAY_MS = 4000;

export default function BannerSlider({ banners }) {
  const count = banners?.length || 0;
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  const goTo = useCallback((i) => setActive(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count <= 1) return undefined;
    timer.current = setInterval(() => setActive((a) => (a + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer.current);
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="banner-slider-container w-full relative overflow-hidden">
      {/* aspect ratio reserves space → no CLS while the image decodes */}
      <div className="relative w-full aspect-[16/5] bg-gray-100">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-linear ${
              i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={i !== active}
          >
            <Image
              src={`${imageProxyUrl}/${banner.image}`}
              alt={banner.title || 'Banner'}
              fill
              className="object-cover"
              sizes="100vw"
              // First banner is the LCP image: eager + fetchpriority=high + preload.
              priority={i === 0}
            />

            {(banner.title || banner.description || banner.link) && (
              <BannerOverlay banner={banner} />
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === active ? 'w-6 bg-white' : 'w-2.5 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BannerOverlay({ banner }) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="text-center px-4 max-w-4xl">
        {banner.title && (
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
            {banner.title}
          </h2>
        )}

        {banner.description && (
          <p className="text-sm md:text-lg lg:text-xl text-white mb-4 md:mb-6">
            {banner.description}
          </p>
        )}

        {banner.link && (
          <Link
            href={banner.link}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 md:py-3 md:px-8 rounded-full transition-colors duration-300"
          >
            Shop Now
          </Link>
        )}
      </div>
    </div>
  );
}
