'use client';

import React, { useState, useContext, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart, FaChevronDown, FaChevronUp, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { ProductContext } from '../context/ProductsContext';
import CartPanel from './CartPanel';
import { config } from '@/config/config';

const imageProxyUrl = '/api/storage';

export default function CategoryProducts() {
  const { products, categories } = useContext(ProductContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems, addItem } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});

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
      id: product.id.toString(),
    };

    if (product.colors?.length > 0) {
      const selectedColor = product.colors.find(
        (c) => c.id === selectedOptions[product.id]?.colorId
      );
      const selectedSize = selectedColor?.sizes?.find(
        (s) => s.id === selectedOptions[product.id]?.sizeId
      ) ?? null;

      cartItem = {
        ...cartItem,
        id: `${product.id}-${selectedColor?.id || '0'}${
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
        id: `${product.id}-${selectedSize?.id || '0'}`,
        size: selectedSize?.size || null,
        sizeId: selectedSize?.id || null,
      };
    }

    addItem(cartItem);
  };

  const homepageCategories = useMemo(() =>
    categories
      .filter((category) => category.show_on_homepage)
      .sort((a, b) => a.sort_order - b.sort_order),
    [categories]
  );

  return (
    <div className="bg-gray-50 min-h-screen relative pb-16">
      <div className="container mx-auto py-8 px-4">
        {homepageCategories.map((category, categoryIndex) => {
          const allCategoryProducts = products
            .filter((product) => product.categories?.some((c) => c.id === category.id))
            .reverse();

          const displayedProducts = category.product_limit
            ? allCategoryProducts.slice(0, category.product_limit)
            : allCategoryProducts;
          const hasMoreProducts = category.product_limit
            ? allCategoryProducts.length > category.product_limit
            : false;

          if (displayedProducts.length === 0) return null;

          return (
            <CategorySection
              key={category.id}
              category={category}
              products={displayedProducts}
              hasMoreProducts={hasMoreProducts}
              firstSection={categoryIndex === 0}
              selectedOptions={selectedOptions}
              openDropdowns={openDropdowns}
              onToggleDropdown={toggleDropdown}
              onColorSelect={handleColorSelect}
              onSizeSelect={handleSizeSelect}
              onAddToCart={handleAddToCart}
            />
          );
        })}
      </div>

      <FloatingCartButton totalItems={totalItems} onClick={() => setIsCartOpen(true)} />

      <CartPanel isOpen={isCartOpen} toggleCart={() => setIsCartOpen(false)} />
    </div>
  );
}

function CategorySection({
  category,
  products,
  hasMoreProducts,
  firstSection = false,
  selectedOptions,
  openDropdowns,
  onToggleDropdown,
  onColorSelect,
  onSizeSelect,
  onAddToCart,
}) {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{category.name}</h2>

        {hasMoreProducts && (
          <Link
            href={`/category/${category.slug || category.id}`}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            View More
            <FaArrowRight className="ml-1 text-sm" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product, productIndex) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={firstSection && productIndex < 4}
            selectedOptions={selectedOptions}
            openDropdowns={openDropdowns}
            onToggleDropdown={onToggleDropdown}
            onColorSelect={onColorSelect}
            onSizeSelect={onSizeSelect}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {hasMoreProducts && <ViewAllButton category={category} />}
    </div>
  );
}

function ProductCard({
  product,
  priority = false,
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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full relative group touch-manipulation active:scale-[0.98]">
      {product.discount_price && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          {discountPercentage}% OFF
        </div>
      )}

      <div className="relative aspect-square overflow-hidden">
        <Link href={`/${product.slug}`} className="block h-full w-full">
          <ProductImage
            product={product}
            hasColors={hasColors}
            selectedColor={selectedColor}
            priority={priority}
          />
        </Link>
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-center">{product.name}</h3>

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
            isOpen={isDropdownOpen}
            hasColors={hasColors}
            hasSizes={colorHasSizes}
            selectedColor={selectedColor}
            onToggle={() => onToggleDropdown(product.id)}
            onColorSelect={(colorId) => onColorSelect(product.id, colorId)}
            onSizeSelect={(sizeId) => onSizeSelect(product.id, sizeId)}
          />
        )}

        <button
          onClick={() => onAddToCart(product)}
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
}

function ProductImage({ product, hasColors, priority = false }) {
  if (hasColors) {
    if (product.colors.length === 1) {
      return (
        <Image
          src={`${imageProxyUrl}/${product.colors[0].image}`}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          priority={priority}
        />
      );
    }

    return <ColorImageCycler colors={product.colors} name={product.name} priority={priority} />;
  }

  return (
    <Image
      src={`${imageProxyUrl}/${product.images[0]?.image}`}
      alt={product.name}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
      priority={priority}
    />
  );
}

// Lightweight color-image cycler (replaces react-slick). react-slick instantiated
// a full carousel per product card, and dozens of them on the homepage blocked
// the main thread for several seconds during hydration — so clicks/links were
// dead until it finished. This is a tiny CSS opacity fade with one interval.
function ColorImageCycler({ colors, name, priority = false }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (colors.length <= 1) return undefined;
    const t = setInterval(() => setActive((a) => (a + 1) % colors.length), 3000);
    return () => clearInterval(t);
  }, [colors.length]);

  return (
    <>
      {colors.map((color, i) => (
        <Image
          key={color.id}
          src={`${imageProxyUrl}/${color.image}`}
          alt={`${color.color} ${name}`}
          fill
          className={`object-cover transition-opacity duration-500 group-hover:scale-105 ${i === active ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          // First image of an above-the-fold card is an LCP candidate → eager + fetchpriority.
          priority={priority && i === 0}
        />
      ))}
    </>
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
            className={`py-1 text-xs rounded cursor-pointer ${
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
  isOpen,
  hasColors,
  hasSizes,
  selectedColor,
  onToggle,
  onColorSelect,
  onSizeSelect,
}) {
  return (
    <div className="mt-3">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
      >
        <span>Select Options</span>
        {isOpen ? <FaChevronUp className="text-gray-500 text-xs" /> : <FaChevronDown className="text-gray-500 text-xs" />}
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
                      className={`w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
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
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasSizes && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Size:</label>
              <div className="grid grid-cols-4 gap-2">
                {selectedColor?.sizes?.map((size) => (
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

function ViewAllButton({ category }) {
  return (
    <div className="mt-6 flex justify-center md:hidden">
      <Link
        href={`/category/${category.slug || category.id}`}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
      >
        View All {category.name} Products
        <FaArrowRight className="ml-2 text-sm" />
      </Link>
    </div>
  );
}

function FloatingCartButton({ totalItems, onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-6 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10 flex items-center justify-center"
      aria-label="View cart"
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