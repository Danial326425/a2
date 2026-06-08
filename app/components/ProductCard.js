'use client';

import React, { useState, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import {
  FaShoppingCart, FaChevronDown, FaChevronUp,
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';

/**
 * Self-contained product card with internal state for color/size selection.
 * Visual / interaction parity with the homepage CategoryProducts card.
 *
 * - Used by /shop page and any future grid pages.
 * - Memoized: re-renders only when product reference changes.
 * - Image variations use a single-axis slick slider (autoplay) when more
 *   than one color image exists.
 */
const imageProxyUrl = '/api/storage';

const sliderSettings = {
  dots: false, infinite: true, speed: 500,
  slidesToShow: 1, slidesToScroll: 1,
  autoplay: true, autoplaySpeed: 3000, arrows: false,
};

const ProductCard = memo(function ProductCard({ product }) {
  const { addItem } = useCart();
  const [colorId, setColorId] = useState(null);
  const [sizeId, setSizeId] = useState(null);
  const [open, setOpen] = useState(false);

  const colors = product.colors || [];
  const hasColors = colors.length > 0;
  const singleSizes = product.single_product_sizes || product.singleProductSizes || [];
  const hasSingleSizes = singleSizes.length > 0;
  const isSingleSizeProduct = hasSingleSizes && !hasColors;
  const selectedColor = colors.find((c) => c.id === colorId);
  const colorHasSizes = (selectedColor?.sizes?.length ?? 0) > 0;
  const anyColorHasSizes = colors.some((c) => (c.sizes?.length ?? 0) > 0);

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const handleSelectColor = (id) => { setColorId(id); setSizeId(null); };
  const handleSelectSize  = (id) => setSizeId(id);

  const handleAddToCart = () => {
    if (hasColors && !colorId) { alert('Please select a color'); return; }
    if (colorHasSizes && !sizeId) { alert('Please select a size'); return; }
    if (isSingleSizeProduct && !sizeId) { alert('Please select a size'); return; }

    let item = {
      ...product,
      product_id: product.id,
      price: product.discount_price || product.price,
      id: String(product.id),
    };

    if (hasColors) {
      const sColor = colors.find((c) => c.id === colorId);
      const sSize  = sColor?.sizes?.find((s) => s.id === sizeId) ?? null;
      item = {
        ...item,
        id: `${product.id}-${sColor?.id || '0'}${sSize ? `-${sSize.id}` : ''}`,
        color: sColor?.color || null,
        colorId: sColor?.id || null,
        size: sSize?.size || null,
        sizeId: sSize?.id || null,
        image: sColor?.image || product.images?.[0]?.image,
      };
    } else if (isSingleSizeProduct) {
      const sSize = singleSizes.find((s) => s.id === sizeId);
      item = {
        ...item,
        id: `${product.id}-${sSize?.id || '0'}`,
        size: sSize?.size || null,
        sizeId: sSize?.id || null,
      };
    }
    addItem(item);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full relative group">
      {product.discount_price && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          {discountPercent}% OFF
        </div>
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

        {isSingleSizeProduct && (
          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1">Size:</label>
            <div className="grid grid-cols-4 gap-2">
              {singleSizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => handleSelectSize(size.id)}
                  className={`py-1 text-xs rounded cursor-pointer transition-colors ${
                    sizeId === size.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {size.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {(hasColors || anyColorHasSizes) && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <span>Select Options</span>
              {open ? <FaChevronUp className="text-gray-500 text-xs" /> : <FaChevronDown className="text-gray-500 text-xs" />}
            </button>
            {open && (
              <div className="mt-2 space-y-3">
                {hasColors && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Color:</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const isSelected = colorId === color.id;
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => handleSelectColor(color.id)}
                            className={`w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-300 scale-110'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={!color.image ? { backgroundColor: color.color?.toLowerCase() } : undefined}
                            title={color.color}
                            aria-label={`Color: ${color.color}`}
                          >
                            {color.image && (
                              <Image
                                src={`${imageProxyUrl}/${color.image}`}
                                alt={color.color || 'color'}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {colorHasSizes && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Size:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedColor?.sizes?.map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => handleSelectSize(size.id)}
                          className={`py-1 text-xs rounded transition-colors ${
                            sizeId === size.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
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
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md hover:shadow-lg cursor-pointer"
        >
          <FaShoppingCart className="text-sm" />
          Add to Cart
        </button>

        <Link
          href={`/${product.slug}`}
          className="mt-2 w-full text-white font-bold text-sm px-2 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-700 shadow-lg transform transition-all hover:scale-[1.02] hover:shadow-xl flex items-center justify-center space-x-2"
        >
          <FaShoppingCart />
          <span>অর্ডার করুন</span>
        </Link>
      </div>
    </div>
  );
});

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
            />
          </div>
        ))}
      </Slider>
    );
  }
  return (
    <Image
      src={`${imageProxyUrl}/${product.images?.[0]?.image}`}
      alt={product.name}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
    />
  );
}

export default ProductCard;
