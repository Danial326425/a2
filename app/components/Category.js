'use client';

import { useContext, useMemo } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Slider from "react-slick";
import { config } from "@/config/config";
import { ProductContext } from "../context/ProductsContext";

export default function Category({ toggleSidebar }) {
  const { categories } = useContext(ProductContext);

  const mainCategories = useMemo(() => {
    return categories.filter(category =>
      category.parent_id === null
    );
  }, [categories]);

  const imageProxyUrl = '/api/storage';
  const router = useRouter();

  const handleCategoryClick = (categoryId) => {
    router.push(`/category/${categoryId}`);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && toggleSidebar) {
      toggleSidebar();
    }
  };

  if (mainCategories.length === 0) {
    return null;
  }

  const totalSlides = Math.min(mainCategories.length, 8);
  const actualRows = totalSlides <= 4 ? 1 : 2;

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(mainCategories.length, 4),
    slidesToScroll: 1,
    rows: actualRows,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(mainCategories.length, 4),
          rows: actualRows
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(mainCategories.length, 4),
          rows: actualRows
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: Math.min(mainCategories.length, 4),
          rows: actualRows
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(mainCategories.length, 4),
          rows: actualRows
        }
      }
    ]
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Shop by Category</h2>
        <p className="text-gray-600 mt-2 text-sm lg:text-base">
          Discover products from our wide range of categories
        </p>
      </div>

      <Slider {...settings}>
        {mainCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            imageProxyUrl={imageProxyUrl}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}
      </Slider>
    </div>
  );
}

function CategoryCard({ category, imageProxyUrl, onClick }) {
  return (
    <div className="px-[2px] md:px-2">
      <div className="flex flex-col h-full">
        <button
          onClick={onClick}
          className="w-full text-left group relative flex flex-col h-full"
        >
          <div className="relative flex-shrink-0 overflow-hidden rounded-xl lg:rounded-2xl bg-white shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-105 p-1 aspect-square">
            <div className="relative z-10 rounded-lg lg:rounded-xl overflow-hidden bg-white w-full h-full">
              <Image
                src={`${imageProxyUrl}/${category.image}`}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 200px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = '/images/category-placeholder.png';
                }}
              />
            </div>
          </div>

          <div className="mt-2 flex-grow min-h-[40px] flex items-center justify-center">
            <p className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 text-center leading-tight px-1">
              {category.name}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}