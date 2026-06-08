'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaCheckCircle, FaGift } from 'react-icons/fa';
import { config } from '@/config/config';
import { trackHybridEvent, generateEventId } from '@/pixel';
import { ProductContext } from '../context/ProductsContext';

const apiUrl = config.apiUrl;

export default function CartPanel({ isOpen, toggleCart }) {
  const {
    isEmpty,
    items,
    updateItemQuantity,
    removeItem,
    cartTotal,
    coupon,
    setCoupon,
    clearCoupon,
  } = useCart();

  const imageProxyUrl = '/api/storage';
  const { pixel, testEventCode } = useContext(ProductContext);

  const hasTrackedCart = useRef(false);
  const previousItemsLength = useRef(0);
  const previousCartTotal = useRef(0);

  const trackAddToCartEvent = () => {
    if (isEmpty || !pixel?.length) return;

    const eventId = generateEventId('ATC');
    const contents = items.map(item => ({
      id: String(item.product_id || item.id),
      quantity: item.quantity,
      item_price: parseFloat(item.price),
    }));
    const contentIds = items.map(item => String(item.product_id || item.id));
    const numItems = items.reduce((total, item) => total + item.quantity, 0);

    const customData = {
      content_ids: contentIds,
      content_type: 'product_group',
      contents,
      currency: 'BDT',
      value: parseFloat(cartTotal.toFixed(2)),
      num_items: numItems,
      content_name: items.map(item => item.name).join(', ').substring(0, 100),
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
    };

    trackHybridEvent({
      pixelIds: pixel,
      apiUrl,
      eventName: 'AddToCart',
      customData,
      userData: {},
      testEventCodes: testEventCode,
      eventId,
    });
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
      coupon={coupon}
      setCoupon={setCoupon}
      clearCoupon={clearCoupon}
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
  imageProxyUrl,
  coupon,
  setCoupon,
  clearCoupon,
}) {
  return (
    <div className="relative">
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleCart}
        aria-hidden="true"
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
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
              items={items}
              coupon={coupon}
              setCoupon={setCoupon}
              clearCoupon={clearCoupon}
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

function CartFooter({ cartTotal, toggleCart, items, coupon, setCoupon, clearCoupon }) {
  const [reward, setReward] = useState(null);
  const couponDiscount = coupon?.discount ? Number(coupon.discount) : 0;
  const grandTotal = Math.max(0, cartTotal - (reward?.discount || 0) - couponDiscount);

  return (
    <div className="border-t border-gray-200 px-4 py-5 sm:px-6 space-y-4 max-h-[55vh] overflow-y-auto">
      <CartRewardProgress cartTotal={cartTotal} onApplied={setReward} />

      <CouponBox
        items={items}
        coupon={coupon}
        setCoupon={setCoupon}
        clearCoupon={clearCoupon}
      />

      <div className="space-y-1.5 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-700">
          <span>সাবটোটাল</span>
          <span>৳{cartTotal.toFixed(2)}</span>
        </div>
        {reward?.discount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>কার্ট রিওয়ার্ড</span>
            <span>− ৳{Number(reward.discount).toFixed(2)}</span>
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>কুপন ছাড় ({coupon.code})</span>
            <span>− ৳{couponDiscount.toFixed(2)}</span>
          </div>
        )}
        {coupon?.free_delivery && (
          <div className="flex justify-between text-sm text-blue-600">
            <span>ফ্রি ডেলিভারি</span>
            <span>প্রযোজ্য</span>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold text-gray-900 pt-1.5 border-t border-gray-100">
          <span>সর্বমোট</span>
          <span>৳{grandTotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500">শিপিং চার্জ চেকআউটে এড্রেস অনুযায়ী গণনা হবে</p>
      </div>

      <div className="pt-2">
        <Link
          href="/checkout"
          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          চেকআউট করুন
        </Link>
      </div>
      <div className="flex justify-center text-center text-sm text-gray-500">
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

function CartRewardProgress({ cartTotal, onApplied }) {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${apiUrl}/cart-rewards/active`)
      .then((res) => {
        if (mounted) setTiers(res.data.rewards || []);
      })
      .catch(() => mounted && setTiers([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const { current, next, currentDiscount } = useMemo(() => {
    if (!tiers.length) return { current: null, next: null, currentDiscount: 0 };
    const qualified = tiers.filter((t) => cartTotal >= Number(t.min_amount));
    const cur = qualified.length ? qualified[qualified.length - 1] : null;
    const nx = tiers.find((t) => cartTotal < Number(t.min_amount)) || null;
    let disc = 0;
    if (cur) {
      const dv = Number(cur.discount_value || 0);
      disc = cur.discount_type === 'percentage'
        ? Math.round((cartTotal * dv) / 100)
        : dv;
      if (cur.max_discount) disc = Math.min(disc, Number(cur.max_discount));
      disc = Math.min(disc, cartTotal);
    }
    return { current: cur, next: nx, currentDiscount: disc };
  }, [tiers, cartTotal]);

  useEffect(() => {
    onApplied?.(current ? { tier: current, discount: currentDiscount } : null);
  }, [current, currentDiscount, onApplied]);

  if (loading || !tiers.length) return null;

  const target = next ? Number(next.min_amount) : (current ? Number(current.min_amount) : 0);
  const progressPct = target > 0 ? Math.min(100, Math.round((cartTotal / target) * 100)) : 100;
  const remaining = next ? Math.max(0, Number(next.min_amount) - cartTotal) : 0;

  const nextLabel = next
    ? (next.discount_type === 'percentage'
        ? `${Number(next.discount_value)}% ছাড়`
        : `৳${Number(next.discount_value).toFixed(0)} ছাড়`)
    : null;

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <FaGift className="text-indigo-500 text-xs" />
        <span className="text-xs font-semibold text-gray-700">
          {current ? 'অভিনন্দন! আপনি ছাড় পাচ্ছেন' : 'বেশি কিনলে বেশি ছাড়'}
        </span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <p className="text-xs text-gray-600 mt-2 leading-snug">
        {current && (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium mr-1">
            <FaCheckCircle className="text-[10px]" />
            {current.label || `৳${Number(current.min_amount).toFixed(0)}-এ ছাড় চালু`}
            {currentDiscount > 0 && <> (− ৳{currentDiscount.toFixed(0)})</>}
          </span>
        )}
        {next && (
          <>
            {current && <br />}
            <span>আর <strong>৳{remaining.toFixed(0)}</strong> shopping করলে <strong>{nextLabel}</strong> পাবেন</span>
          </>
        )}
        {!next && current && <span> · সর্বোচ্চ tier পৌঁছেছেন</span>}
      </p>
    </div>
  );
}

function CouponBox({ items, coupon, setCoupon, clearCoupon }) {
  const [code, setCode] = useState(coupon?.code || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setCode(coupon?.code || '');
    if (coupon) setError(null);
  }, [coupon]);

  const buildCart = () => items.map((i) => ({
    product_id: i.product_id || i.id,
    quantity: i.quantity,
    price: Number(i.price) || 0,
    line_total: (Number(i.price) || 0) * i.quantity,
  }));

  const apply = async () => {
    const trimmed = (code || '').trim();
    if (!trimmed) { setError('কুপন কোড লিখুন'); return; }
    setBusy(true); setError(null); setMessage(null);
    try {
      const res = await axios.post(`${apiUrl}/coupons/validate`, {
        code: trimmed,
        cart: buildCart(),
      });
      if (res.data?.ok) {
        setCoupon({
          code: res.data.coupon?.code || trimmed,
          type: res.data.coupon?.type,
          discount: res.data.discount || 0,
          free_delivery: !!res.data.free_delivery,
        });
        setMessage(res.data.message || 'কুপন প্রয়োগ হয়েছে');
      } else {
        setError(res.data?.message || 'কুপন সঠিক নয়');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'কুপন যাচাই করা যায়নি');
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    clearCoupon();
    setCode('');
    setError(null);
    setMessage(null);
  };

  if (coupon) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FaCheckCircle className="text-emerald-500 text-sm shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-800 truncate">{coupon.code}</p>
            <p className="text-[11px] text-emerald-700">
              {coupon.free_delivery ? 'ফ্রি ডেলিভারি প্রযোজ্য' : `৳${Number(coupon.discount).toFixed(0)} ছাড় প্রযোজ্য`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={remove}
          className="text-xs text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
        >
          সরান
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="কুপন কোড লিখুন"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={apply}
          disabled={busy || !code.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {busy ? '...' : 'প্রয়োগ'}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {message && <p className="mt-1.5 text-xs text-emerald-600">{message}</p>}
    </div>
  );
}