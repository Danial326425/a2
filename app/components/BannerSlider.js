'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { config } from '@/config/config';

const imageProxyUrl = '/api/storage';

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
  fade: true,
  cssEase: 'linear',
  adaptiveHeight: true,
};

export default function BannerSlider({ banners }) {
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="banner-slider-container w-full relative">
      <Slider {...settings}>
        {banners.map((banner) => (
          <BannerSlide key={banner.id} banner={banner} />
        ))}
      </Slider>
    </div>
  );
}

function BannerSlide({ banner }) {
  return (
    <div className="banner-slide relative">
      <div className="banner-image-container relative w-full aspect-[16/5]">
        <Image
          src={`${imageProxyUrl}/${banner.image}`}
          alt={banner.title || 'Banner'}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />

        {(banner.title || banner.description || banner.link) && (
          <BannerOverlay banner={banner} />
        )}
      </div>
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