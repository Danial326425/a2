'use client';

import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { initFacebookPixels, trackEventOnMultiplePixels } from '@/pixel';
import { FaChevronDown, FaChevronUp, FaShoppingCart } from 'react-icons/fa';
import { ProductContext } from '../../context/ProductsContext';
import { useCart } from '../../context/CartContext';
import CartPanel from '../../components/CartPanel';

const imageProxyUrl = '/api/storage';

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
};

export default function SingleCategory() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const params = useParams();
  const id = params.id;
  const categoryId = Number(id);

  const { pixel, apiUrl } = useContext(ProductContext);
  const { totalItems, addItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          axios.get(`${apiUrl}/products`),
          axios.get(`${apiUrl}/category/${id}`),
        ]);

        const filteredProducts = productResponse.data.filter((product) =>
          product.categories?.some((c) => Number(c.id) === Number(categoryId))
        );

        setCategory(categoryResponse.data.category);
        setProducts(filteredProducts);
      } catch (error) {
        // handle error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, id, categoryId]);

  useEffect(() => {
    if (pixel?.length > 0 && category?.name) {
      initFacebookPixels(pixel);
      trackEventOnMultiplePixels(pixel, 'ViewCategory', {
        content_name: category.name,
        content_category: category.name,
      });
    }
  }, [pixel, category?.name]);

  const toggleDropdown = (productId) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleColorSelect = (productId, colorId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        colorId,
        sizeId: null,
      },
    }));
  };

  const handleSizeSelect = (productId, sizeId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        sizeId,
      },
    }));
  };

  const handleAddToCart = (product) => {
    if (product.colors?.length > 0 && !selectedOptions[product.id]?.colorId) {
      alert('Please select a color');
      return;
    }

    if (
      product.clothing &&
      product.colors?.find((c) => c.id === selectedOptions[product.id]?.colorId)
        ?.sizes?.length > 0 &&
      !selectedOptions[product.id]?.sizeId
    ) {
      alert('Please select a size');
      return;
    }

    if (product.single_product_sizes?.length > 0 && !selectedOptions[product.id]?.sizeId) {
      alert('Please select a size');
      return;
    }

    let cartItem = {
      ...product,
      product_id: product.id,
      price: product.discount_price || product.price,
    };

    if (product.colors?.length > 0) {
      const selectedColor = product.colors.find(
        (c) => c.id === selectedOptions[product.id]?.colorId
      );
      const selectedSize = product.clothing
        ? selectedColor?.sizes?.find((s) => s.id === selectedOptions[product.id]?.sizeId)
        : null;

      cartItem = {
        ...cartItem,
        id: `${product.id}${selectedColor ? `-${selectedColor.id}` : ''}${
          selectedSize ? `-${selectedSize.id}` : ''
        }`,
        color: selectedColor?.color || null,
        colorId: selectedColor?.id || null,
        size: selectedSize?.size || null,
        sizeId: selectedSize?.id || null,
        image: selectedColor?.image || product.images[0]?.image,
      };
    }

    if (product.single_product_sizes?.length > 0) {
      const selectedSize = product.single_product_sizes.find(
        (s) => s.id === selectedOptions[product.id]?.sizeId
      );

      cartItem = {
        ...cartItem,
        id: `${product.id}${selectedSize ? `-${selectedSize.id}` : ''}`,
        size: selectedSize?.size || null,
        sizeId: selectedSize?.id || null,
      };
    }

    addItem(cartItem);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500" />
      </div>
    );
  }

  return (
    <>
      {/* Category Banner */}
      <div className="bg-gradient-to-r from-[#116d3c] to-[#0a2635] py-10 text-center text-white">
        <h1 className="text-4xl font-bold">{category?.name}</h1>
        <p className="mt-2 text-lg">
          <Link href="/" className="hover:underline">Home</Link> / {category?.name}
        </p>
      </div>

      <div className="bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
              {[...products].reverse().map((product) => (
                <CategoryProductCard
                  key={product.id}
                  product={product}
                  selectedOptions={selectedOptions}
                  openDropdowns={openDropdowns}
                  onToggleDropdown={toggleDropdown}
                  onColorSelect={handleColorSelect}
                  onSizeSelect={handleSizeSelect}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </div>

        <FloatingCartButton totalItems={totalItems} onClick={() => setIsCartOpen(true)} />

        <CartPanel isOpen={isCartOpen} toggleCart={() => setIsCartOpen(false)} />
      </div>
    </>
  );
}

function CategoryProductCard({
  product,
  selectedOptions,
  openDropdowns,
  onToggleDropdown,
  onColorSelect,
  onSizeSelect,
  onAddToCart,
}) {
  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const productOptions = selectedOptions[product.id] || {};
  const selectedColor = product.colors?.find((c) => c.id === productOptions.colorId);
  const isDropdownOpen = openDropdowns[product.id];
  const hasColors = (product.colors?.length ?? 0) > 0;
  const colorHasSizes = (selectedColor?.sizes?.length ?? 0) > 0;
  const anyColorHasSizes = Boolean(product.colors?.some((c) => (c.sizes?.length ?? 0) > 0));
  const hasSingleSizes = (product.single_product_sizes?.length ?? 0) > 0;
  const isSingleSizeProduct = hasSingleSizes && !hasColors;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full relative">
      {product.discount_price && (
        <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded z-10">
          {discountPercentage}% Off
        </span>
      )}

      <div className="relative aspect-square overflow-hidden">
        <Link href={`/${product.slug}`} className="block h-full w-full">
          <ProductImage product={product} hasColors={hasColors} />
        </Link>
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-center">
          {product.name}
        </h3>

        <PriceDisplay product={product} />

        {isSingleSizeProduct && (
          <SingleSizeSelector
            product={product}
            productOptions={productOptions}
            onSizeSelect={(sizeId) => onSizeSelect(product.id, sizeId)}
          />
        )}

        {(hasColors || anyColorHasSizes) && (
          <OptionsDropdown
            product={product}
            productOptions={productOptions}
            selectedColor={selectedColor}
            isOpen={isDropdownOpen}
            hasColors={hasColors}
            hasSizes={colorHasSizes}
            onToggle={() => onToggleDropdown(product.id)}
            onColorSelect={(colorId) => onColorSelect(product.id, colorId)}
            onSizeSelect={(sizeId) => onSizeSelect(product.id, sizeId)}
          />
        )}

        <button
          onClick={() => onAddToCart(product)}
          className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <FaShoppingCart className="text-sm" />
          Add to Cart
        </button>

        <Link
          href={`/${product.slug}`}
          className="mt-2 w-full text-white font-bold text-sm md:text-md lg:text-lg px-2 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-700 shadow-lg transform transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
        >
          <FaShoppingCart />
          <span>অর্ডার করুন</span>
        </Link>
      </div>
    </div>
  );
}

function ProductImage({ product, hasColors }) {
  if (hasColors) {
    if (product.colors.length === 1) {
      return (
        <Image
          src={`${imageProxyUrl}/${product.colors[0].image}`}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          unoptimized
        />
      );
    }

    return (
      <Slider {...sliderSettings}>
        {product.colors.map((color) => (
          <div key={color.id}>
            <Image
              src={`${imageProxyUrl}/${color.image}`}
              alt={`${color.color} ${product.name}`}
              width={500}
              height={500}
              className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              unoptimized
            />
          </div>
        ))}
      </Slider>
    );
  }

  return (
    <Image
      src={`${imageProxyUrl}/${product.images[0]?.image}`}
      alt={product.name}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
      unoptimized
    />
  );
}

function PriceDisplay({ product }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-2">
      {product.discount_price ? (
        <>
          <span className="text-sm text-gray-400 line-through">৳{product.price}</span>
          <span className="text-lg font-bold text-green-600">৳{product.discount_price}</span>
        </>
      ) : (
        <span className="text-lg font-bold text-green-600">৳{product.price}</span>
      )}
    </div>
  );
}

function SingleSizeSelector({ product, productOptions, onSizeSelect }) {
  return (
    <div className="mt-3">
      <label className="block text-xs text-gray-500 mb-1">Size:</label>
      <div className="grid grid-cols-4 gap-2">
        {product.single_product_sizes.map((size) => (
          <button
            key={size.id}
            onClick={() => onSizeSelect(size.id)}
            className={`py-1 text-xs rounded ${
              productOptions.sizeId === size.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition-colors`}
          >
            {size.size}
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionsDropdown({
  product,
  productOptions,
  selectedColor,
  isOpen,
  hasColors,
  hasSizes,
  onToggle,
  onColorSelect,
  onSizeSelect,
}) {
  return (
    <div className="mt-3">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
      >
        <span>Select Options</span>
        {isOpen ? (
          <FaChevronUp className="text-gray-500 text-xs" />
        ) : (
          <FaChevronDown className="text-gray-500 text-xs" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-3 animate-fadeIn">
          {hasColors && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Color:</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const isSelected = productOptions.colorId === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => onColorSelect(color.id)}
                      className={`w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-300 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={!color.image ? { backgroundColor: color.color?.toLowerCase() } : undefined}
                      title={color.color}
                    >
                      {color.image && (
                        <Image
                          src={`${imageProxyUrl}/${color.image}`}
                          alt={color.color || 'color'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasSizes && selectedColor?.sizes && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Size:</label>
              <div className="grid grid-cols-4 gap-2">
                {selectedColor.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => onSizeSelect(size.id)}
                    className={`py-1 text-xs rounded ${
                      productOptions.sizeId === size.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FloatingCartButton({ totalItems, onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-6 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10 flex items-center justify-center"
    >
      <FaShoppingCart className="text-xl" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
}