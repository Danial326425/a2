'use client';

import React, { useContext, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from 'react-use-cart';
import { FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { config } from '@/config/config';
import { trackEventOnMultiplePixels } from '@/pixel';
import { ProductContext } from '../context/ProductsContext';

export default function CartPanel({ isOpen, toggleCart }) {
  const {
    isEmpty,
    items,
    updateItemQuantity,
    removeItem,
    cartTotal,
  } = useCart();

  const imageProxyUrl = '/api/storage';
  const { pixel } = useContext(ProductContext);

  const hasTrackedCart = useRef(false);
  const previousItemsLength = useRef(0);
  const previousCartTotal = useRef(0);

  const trackAddToCartEvent = () => {
    if (isEmpty || !pixel || pixel.length === 0) return;

    const contents = items.map(item => ({
      id: item.product_id || item.id,
      item_id: item.product_id || item.id,
      product_id: item.product_id || item.id,
      quantity: item.quantity,
      item_price: parseFloat(item.price),
    }));

    const contentIds = items.map(item => item.product_id || item.id);
    const numItems = items.reduce((total, item) => total + item.quantity, 0);

    if (typeof window !== 'undefined') {
      trackEventOnMultiplePixels(pixel, 'AddToCart', {
        content_ids: contentIds,
        content_type: 'product_group',
        contents: contents,
        currency: 'BDT',
        value: parseFloat(cartTotal.toFixed(2)),
        num_items: numItems,
        content_name: items.map(item => item.name).join(', ').substring(0, 100),
        event_source_url: window.location.href,
      });
    }
  };

  useEffect(() => {
    if (isEmpty) {
      hasTrackedCart.current = false;
      previousItemsLength.current = 0;
      previousCartTotal.current = 0;
      return;
    }

    if (!pixel || pixel.length === 0) return;

    if (isOpen && !hasTrackedCart.current) {
      trackAddToCartEvent();
      hasTrackedCart.current = true;
      previousItemsLength.current = items.length;
      previousCartTotal.current = cartTotal;
    }

    if (isOpen && hasTrackedCart.current) {
      if (items.length > previousItemsLength.current) {
        trackAddToCartEvent();
        previousItemsLength.current = items.length;
        previousCartTotal.current = cartTotal;
      } else if (Math.abs(cartTotal - previousCartTotal.current) > 1) {
        previousCartTotal.current = cartTotal;
      }
    }

    if (!isOpen) {
      hasTrackedCart.current = false;
      previousItemsLength.current = 0;
      previousCartTotal.current = 0;
    }
  }, [isOpen, items.length, cartTotal, pixel, isEmpty]);

  return (
    <CartPanelContent
      isOpen={isOpen}
      toggleCart={toggleCart}
      isEmpty={isEmpty}
      items={items}
      updateItemQuantity={updateItemQuantity}
      removeItem={removeItem}
      cartTotal={cartTotal}
      imageProxyUrl={imageProxyUrl}
    />
  );
}

function CartPanelContent({
  isOpen,
  toggleCart,
  isEmpty,
  items,
  updateItemQuantity,
  removeItem,
  cartTotal,
  imageUrl,
}) {
  return (
    <div className="relative">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={toggleCart}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">আপনার শপিং কার্ট</h2>
            <button onClick={toggleCart} className="text-gray-400 hover:text-gray-500">
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {isEmpty ? (
              <EmptyCartMessage />
            ) : (
              <CartItemsList
                items={items}
                imageProxyUrl={imageProxyUrl}
                updateItemQuantity={updateItemQuantity}
                removeItem={removeItem}
              />
            )}
          </div>

          {!isEmpty && (
            <CartFooter
              cartTotal={cartTotal}
              toggleCart={toggleCart}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyCartMessage() {
  return (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">আপনার কার্ট খালি</h3>
      <p className="mt-1 text-gray-500">কিছু পণ্য কার্টে যোগ করুন</p>
    </div>
  );
}

function CartItemsList({ items, imageProxyUrl, updateItemQuantity, removeItem }) {
  return (
    <ul className="divide-y divide-gray-200">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          imageProxyUrl={imageProxyUrl}
          updateItemQuantity={updateItemQuantity}
          removeItem={removeItem}
        />
      ))}
    </ul>
  );
}

function CartItem({ item, imageProxyUrl, updateItemQuantity, removeItem }) {
  const imageSrc = item.images && item.images.length > 0
    ? `${imageProxyUrl}/${item.images[0]?.image}`
    : `${imageProxyUrl}/${item?.image}`;

  return (
    <li className="flex py-6">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <Image
          src={imageSrc}
          alt={item.name}
          width={96}
          height={96}
          className="h-full w-full object-cover object-center"
          unoptimized
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.name}</h3>
            <p className="ml-4">৳{(item.price * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">৳{item.price} প্রতি পিস</p>
        </div>
        <div className="flex justify-start text-base font-medium text-gray-900">
          <p className="text-sm text-gray-500">{item.color}</p>
          <p className="text-sm text-gray-500 ml-4">{item.size}</p>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <QuantityControls
            item={item}
            updateItemQuantity={updateItemQuantity}
          />
          <button
            className="font-medium text-red-600 hover:text-red-500 flex items-center"
            onClick={() => removeItem(item.id)}
          >
            <FaTrash className="mr-1" />
            মুছে ফেলুন
          </button>
        </div>
      </div>
    </li>
  );
}

function QuantityControls({ item, updateItemQuantity }) {
  return (
    <div className="flex items-center border border-gray-300 rounded">
      <button
        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
      >
        <FaMinus className="h-3 w-3" />
      </button>
      <span className="px-2">{item.quantity}</span>
      <button
        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
      >
        <FaPlus className="h-3 w-3" />
      </button>
    </div>
  );
}

function CartFooter({ cartTotal, toggleCart }) {
  return (
    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
      <div className="flex justify-between text-base font-medium text-gray-900">
        <p>সর্বমোট</p>
        <p>৳{cartTotal.toFixed(2)}</p>
      </div>
      <p className="mt-0.5 text-sm text-gray-500">শিপিং এবং ট্যাক্স চেকআউটে গণনা করা হবে</p>
      <div className="mt-6">
        <Link
          href="/checkout"
          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          চেকআউট করুন
        </Link>
      </div>
      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
        <p>
          অথবা{' '}
          <button
            type="button"
            className="font-medium text-indigo-600 hover:text-indigo-500"
            onClick={toggleCart}
          >
            শপিং চালিয়ে যান <span aria-hidden="true"> &rarr;</span>
          </button>
        </p>
      </div>
    </div>
  );
}