'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { trackBrowserEvent, sendCAPIEvent, generateEventId, formatPhoneForFacebook } from '@/pixel';
import { ownTrack } from '@/app/lib/tracking';
import { FaCheckCircle, FaShoppingBag, FaUserAlt, FaTruck, FaPlusCircle, FaMinusCircle, FaGift } from 'react-icons/fa';
import { HeaderContext } from '@/app/context/HeaderContext';
import { ProductContext } from '@/app/context/ProductsContext';
import * as FaIcons from 'react-icons/fa';

const FaIconComponent = ({ iconName, className }) => {
  const Icon = FaIcons[iconName] || FaIcons.FaFacebook;
  return <Icon className={className} />;
};

const LoginModal = ({ isOpen, onClose, onLogin, error }) => {
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.match(/^01[3-9]\d{8}$/)) {
      setLocalError('সঠিক মোবাইল নম্বর দিন (১১ ডিজিট, 01 দিয়ে শুরু)');
      return;
    }
    setLocalError('');
    onLogin(phone);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">লগইন করুন</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                মোবাইল নম্বর
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">+88</span>
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>
            {(error || localError) && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 font-medium">{error || localError}</span>
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              লগইন
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={onClose} className="text-blue-600 hover:text-blue-800 font-medium transition">
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessHeader = ({ orderId }) => (
  <div className="text-center mb-12">
    <div className="relative inline-block">
      <FaCheckCircle className="text-green-500 text-6xl md:text-7xl mx-auto mb-4 animate-bounce" />
    </div>
    <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
      ধন্যবাদ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে
    </h1>
    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
      আপনার অর্ডার নম্বর: <span className="font-bold text-blue-600">{orderId}</span>
    </p>
  </div>
);

const CustomerInfo = ({ order }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
      <FaUserAlt className="text-blue-500 mr-2" />
      গ্রাহক তথ্য
    </h3>
    <div className="pl-8">
      <p className="text-gray-700 mb-1">
        <span className="font-medium">নাম:</span> {order.customer_name}
      </p>
      <p className="text-gray-700 mb-3">
        <span className="font-medium">ফোন:</span> {order.phone_number}
      </p>
      <p className="text-gray-700">
        <span className="font-medium">ঠিকানা:</span> {order.customer_address}
      </p>
    </div>
  </div>
);

const ProductDetails = ({ order }) => {
  const allItems = order.items && order.items.length > 0 ? order.items : null;
  const regularItems = allItems
    ? allItems.filter(item => !item.product_name?.startsWith('[Upsell]'))
    : null;
  const products = regularItems && regularItems.length > 0
    ? regularItems
    : [{ product_name: order.product_name, quantity: order.quantity, color: order.color, size: order.size }];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
        <FaShoppingBag className="text-blue-500 mr-2" />
        পণ্য বিবরণ
      </h3>
      <div className="space-y-4">
        {products.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-md p-4 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p className="text-gray-700">
                <span className="font-medium text-gray-600">পণ্য:</span> {item.product_name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium text-gray-600">পরিমাণ:</span> {item.quantity}
              </p>
              {item.color && (
                <p className="text-gray-700">
                  <span className="font-medium text-gray-600">রং:</span>
                  <span className="ml-1 px-2 py-1 bg-gray-100 rounded-full text-sm">{item.color}</span>
                </p>
              )}
              {item.size && (
                <p className="text-gray-700">
                  <span className="font-medium text-gray-600">সাইজ:</span>
                  <span className="ml-1 px-2 py-1 bg-gray-100 rounded-full text-sm">{item.size}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PriceSummary = ({ order }) => {
  const allItems     = order.items && order.items.length > 0 ? order.items : null;
  const regularItems = allItems ? allItems.filter(i => !i.product_name?.startsWith('[Upsell]')) : [];
  const upsellItems  = allItems ? allItems.filter(i => i.product_name?.startsWith('[Upsell]')) : [];

  const upsellAccepted = order.upsell_status === 'accepted';

  // If order.items has [Upsell] rows use them; else fall back to upsell_items JSON
  const upsellLines = upsellItems.length > 0
    ? upsellItems.map(i => ({ name: i.product_name.replace('[Upsell] ', ''), price: i.price, size: i.size }))
    : (upsellAccepted && Array.isArray(order.upsell_items) && order.upsell_items.length > 0)
      ? order.upsell_items.map(i => ({ name: i.name, price: i.price, size: i.size }))
      : (upsellAccepted && (order.upsell_price || order.upsell_product?.offer_price))
        ? [{ name: order.upsell_product?.name ?? 'আপসেল পণ্য', price: order.upsell_price ?? order.upsell_product?.offer_price, size: null }]
        : [];

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">মূল্য বিবরণী</h3>
      <div className="space-y-3">
        {regularItems.length > 0 ? (
          regularItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-600">{item.product_name}</span>
              <span className="font-medium">৳{item.price} (x{item.quantity}) = ৳{item.price * item.quantity}</span>
            </div>
          ))
        ) : (
          <div className="flex justify-between">
            <span className="text-gray-600">পণ্য মূল্য:</span>
            <span className="font-medium">৳{order.product_price}</span>
          </div>
        )}

        {upsellLines.length > 0 && (
          <div className="space-y-1.5">
            {upsellLines.map((line, idx) => (
              <div key={idx} className="flex justify-between items-center bg-red-50 border border-red-100 rounded-md px-3 py-2">
                <div className="flex items-center gap-1.5 text-red-700 flex-1 min-w-0">
                  <FaGift className="text-xs flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{line.name}</span>
                  {line.size && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">{line.size}</span>
                  )}
                </div>
                <span className="font-bold text-red-600 text-sm flex-shrink-0 ml-2">+৳{line.price}</span>
              </div>
            ))}
          </div>
        )}

        {order.order_bumps && order.order_bumps.length > 0 && (
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium">স্পেশাল অফার:</span>
            </div>
            {order.order_bumps.map((bump, index) => (
              <div key={index} className="flex justify-between items-center pl-4 mb-1">
                <div className="flex items-center">
                  <FaPlusCircle className="text-blue-500 text-xs mr-2" />
                  <span className="text-gray-600 text-sm">{bump.bump?.title || `অতিরিক্ত পণ্য #${index + 1}`}</span>
                </div>
                <span className="font-medium text-sm">৳{bump.price}</span>
              </div>
            ))}
          </div>
        )}

        {order.bulk_discounts && order.bulk_discounts.length > 0 && (
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium">কম্বো ডিসকাউন্ট:</span>
            </div>
            {order.bulk_discounts.map((discount, index) => (
              <div key={index} className="flex justify-between items-center pl-4 mb-1">
                <div className="flex items-center">
                  <FaMinusCircle className="text-red-500 text-xs mr-2" />
                  <span className="text-gray-600 text-sm">{discount.title}</span>
                </div>
                <span className="font-medium text-sm text-red-600">
                  - ৳{Math.floor(order.product_price * discount.discount_percentage / 100)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">ডেলিভারি চার্জ:</span>
          <span className="font-medium text-green-600">৳{order.delivery_charge}</span>
        </div>
        {order.cod_advance > 0 && (
          <div className="flex justify-between text-yellow-600">
            <span>অগ্রীম পেমেন্ট:</span>
            <span>- ৳{order.cod_advance}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>{upsellAccepted ? 'সর্বমোট পরিশোধ:' : 'মোট পরিশোধ:'}</span>
            <span className="text-blue-600">৳{order.total}</span>
          </div>
          {upsellAccepted && upsellLines.length > 0 && (
            <p className="text-xs text-red-500 text-right mt-1 font-medium">
              ({upsellLines.length}টি আপসেল পণ্য অন্তর্ভুক্ত)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const UpsellOrderBadge = ({ order }) => {
  if (order.upsell_status !== 'accepted') return null;

  // Prefer upsell_items JSON (multi); fall back to single upsell_product
  const items = Array.isArray(order.upsell_items) && order.upsell_items.length > 0
    ? order.upsell_items
    : (order.upsell_product ? [{ name: order.upsell_product.name, price: order.upsell_price ?? order.upsell_product.offer_price, size: null }] : []);

  if (!items.length) return null;

  return (
    <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <FaGift className="text-red-500 text-lg" />
        <h3 className="font-bold text-red-700 text-sm">
          {items.length > 1 ? `${items.length}টি আপসেল পণ্য যোগ হয়েছে!` : 'বিশেষ আপসেল পণ্য যোগ হয়েছে!'}
        </h3>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 bg-white rounded-xl border border-red-100 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {item.size && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{item.size}</span>
                )}
                <span className="text-red-600 font-black text-sm">৳{Number(item.price).toLocaleString()}</span>
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">যোগ হয়েছে ✓</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DeliveryInfo = () => (
  <div className="mt-8 bg-green-50 p-4 rounded-lg border border-green-200">
    <div className="flex items-center">
      <FaTruck className="text-green-500 text-2xl mr-3" />
      <div>
        <p className="font-medium text-green-800">আপনার অর্ডারটি প্রস্তুত হচ্ছে!</p>
        <p className="text-sm text-green-600 mt-1">
          ২৪-৭২ ঘন্টার মধ্যে ডেলিভারি দেওয়া হবে। ডেলিভারি স্ট্যাটাস জানতে আমাদের হেল্পলাইনে কল করুন।
        </p>
      </div>
    </div>
  </div>
);

const CommunitySection = ({ communities }) => {
  if (!communities || communities.length === 0) return null;

  return (
    <>
      {communities.map((community) => (
        <div key={community.id} className="mt-8 bg-blue-50 rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto">
          <div className="bg-blue-700 px-6 py-4"></div>
          <div className="p-6 text-center">
            <div className="mb-5">
              <FaIconComponent iconName={community.icon} className="w-16 h-16 mx-auto text-blue-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{community.name}</h3>
            <p className="text-gray-600 mb-6">{community.description}</p>
            <a
              href={community.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300"
            >
              <FaIconComponent iconName={community.icon} className="mr-2" />
              {community.button_text}
            </a>
          </div>
        </div>
      ))}
    </>
  );
};

const OrderNotFound = () => (
  <div className="bg-gradient-to-br from-blue-50 to-gray-50 min-h-screen flex items-center justify-center">
    <div className="container mx-auto text-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl lg:text-4xl font-bold text-blue-900 mb-4">
          ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে।
        </h1>
        <p className="text-lg text-gray-600 mb-6">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700 font-medium">
            অর্ডার ডিটেইলস পাওয়া যায়নি। অনুগ্রহ করে আমাদের কাস্টমার কেয়ারে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  // Skeleton matches the real thank-you layout so the user perceives instant
  // structure instead of a blank spinner → better LCP / CLS feel.
  <div className="bg-gradient-to-br from-blue-50 to-gray-50 min-h-screen py-12">
    <div className="container mx-auto px-4 max-w-2xl animate-pulse">
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto mb-5" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-3" />
        <div className="h-5 bg-gray-100 rounded w-1/2 mx-auto" />
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-14 bg-blue-100" />
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="space-y-2 pl-8">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
              <div className="h-24 bg-gray-50 rounded-md border border-gray-100" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                    <div className="h-3.5 bg-gray-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
              <div className="h-px bg-gray-200 my-3" />
              <div className="flex justify-between">
                <div className="h-5 bg-gray-300 rounded w-1/4" />
                <div className="h-5 bg-gray-300 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ThankYou() {
  const [orderDetails, setOrderDetails] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();
  const pixelInitialized = useRef(false);
  const isMounted = useRef(false);

  const sanitizedId = params.slug?.replace(/[{}]/g, '') || '';

  const { loading: headerLoading } = useContext(HeaderContext);
  const { pixel, testEventCode, isPurchase, trackingConfigReady, apiUrl, loading: productLoading } = useContext(ProductContext);

  const extractDistrict = (address) => {
    if (!address) return '';
    const match = address.match(/district:\s*([^,]+)/i);
    return match ? match[1].trim() : '';
  };

  const extractDivision = (address) => {
    if (!address) return '';
    const match = address.match(/division:\s*([^,]+)/i);
    return match ? match[1].trim() : '';
  };

  const buildContentsForPixel = (order) => {
    let contents = [];
    if (order?.items?.length > 0) {
      contents = order.items
        .filter(item => !item.product_name?.startsWith('[Upsell]'))
        .map(item => ({
          id: item.product_id,
          quantity: item.quantity,
          item_price: Number(item.price)
        }));
    } else {
      contents.push({
        id: order?.product_id,
        quantity: Number(order?.quantity || 1),
        item_price: Number(order?.product_price)
      });
    }
    if (order?.order_bumps?.length > 0) {
      order.order_bumps.forEach(bump => {
        contents.push({ id: `bump_${bump.bump_id}`, quantity: 1, item_price: Number(bump.price) });
      });
    }
    if (order?.upsell_status === 'accepted' && order?.upsell_product_id) {
      const upsellPrice = Number(order?.upsell_price || order?.upsell_product?.offer_price || 0);
      contents.push({
        id: `upsell_${order.upsell_product_id}`,
        quantity: 1,
        item_price: Math.round(upsellPrice),
      });
    }
    return contents;
  };

  const buildContentIds = (order) => {
    let ids = [];
    if (order?.items?.length > 0) {
      ids = order.items
        .filter(item => !item.product_name?.startsWith('[Upsell]'))
        .map(item => item.product_id);
    } else if (order?.product_id) {
      ids.push(order.product_id);
    }
    if (order?.order_bumps?.length > 0) {
      order.order_bumps.forEach(bump => ids.push(`bump_${bump.bump_id}`));
    }
    if (order?.upsell_status === 'accepted' && order?.upsell_product_id) {
      ids.push(`upsell_${order.upsell_product_id}`);
    }
    return ids;
  };

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!sanitizedId || !apiUrl) return;

    const controller = new AbortController();

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`${apiUrl}/customers/${sanitizedId}`, {
          signal: controller.signal
        });
        if (isMounted.current) {
          setOrderDetails(response.data.customer);
          setIsLoading(false);
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchOrderDetails();

    return () => controller.abort();
  }, [apiUrl, sanitizedId]);

  useEffect(() => {
    if (!apiUrl) return;

    const controller = new AbortController();

    const fetchCommunity = async () => {
      try {
        const response = await axios.get(`${apiUrl}/communities`, {
          signal: controller.signal
        });
        if (isMounted.current) {
          setCommunities(response.data);
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
      }
    };

    fetchCommunity();

    return () => controller.abort();
  }, [apiUrl]);

  useEffect(() => {
    if (!trackingConfigReady || !pixel?.length || !orderDetails || pixelInitialized.current) return;

    const controller = new AbortController();

    const contents = buildContentsForPixel(orderDetails);
    const contentIds = buildContentIds(orderDetails);
    const orderValue = parseFloat(String(orderDetails?.total || '0').replace(/,/g, ''));
    const formattedPhone = formatPhoneForFacebook(orderDetails?.phone_number || '');
    const eventName = isPurchase ? 'Purchase' : 'Lead';
    const eventId = orderDetails?.order_id || generateEventId(eventName.slice(0, 2));


    const customData = {
      value: orderValue,
      currency: 'BDT',
      content_name: orderDetails?.product_name || '',
      content_ids: contentIds,
      contents,
      num_items: contents.length,
      content_type: 'product',
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
      external_id: orderDetails?.id ? String(orderDetails.id) : formattedPhone,
    };

    const userData = {
      phone: formattedPhone,
      name: orderDetails?.customer_name || '',
      city: extractDistrict(orderDetails?.customer_address),
      state: extractDivision(orderDetails?.customer_address),
    };

    trackBrowserEvent(pixel, eventName, customData, eventId);
    sendCAPIEvent(apiUrl, eventName, customData, userData, eventId, testEventCode);

    axios.patch(`${apiUrl}/customers/${orderDetails.order_id}/pixel-fired`, { pixel_fired: eventName }, {
      signal: controller.signal
    }).catch(() => {});

    // Own analytics order event — attribute to the originating product slug
    // saved at checkout (reliable), so view → checkout → order → CVR all land
    // on the same product row. Falls back to the referrer/product name only if
    // the saved slug is missing (e.g. older sessions).
    let ownSlug = '';
    try {
      ownSlug = sessionStorage.getItem('own_order_slug') || '';
      if (ownSlug) sessionStorage.removeItem('own_order_slug');
    } catch {}
    if (!ownSlug) {
      const refPath = typeof document !== 'undefined' ? new URL(document.referrer || location.href).pathname : '';
      ownSlug = refPath.split('/').filter(s => s && s !== 'thankyou')[0] || orderDetails?.product_name || 'unknown';
    }
    ownTrack('order', ownSlug);

    pixelInitialized.current = true;

    return () => controller.abort();
  }, [trackingConfigReady, pixel, isPurchase, orderDetails, apiUrl, testEventCode]);

  const handleLogin = async (phone) => {
    if (!apiUrl) return;
    setLoginError('');

    const controller = new AbortController();

    try {
      const response = await axios.post(`${apiUrl}/userlogin`, { phone }, {
        signal: controller.signal
      });
      if (response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('phone', phone);
        setLoginOpen(false);
        window.location.reload();
      } else {
        setLoginError('লগইন সফল হয়নি');
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      if (err.response?.status === 404) {
        setLoginError('এই নম্বর দিয়ে কোন ইউজার নেই');
      } else {
        setLoginError('লগইনে সমস্যা হয়েছে, পরে চেষ্টা করুন');
      }
    }
  };

  if (headerLoading || productLoading || isLoading) return <LoadingSpinner />;
  if (!orderDetails) return <OrderNotFound />;

  return (
    <>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} error={loginError} />

      <div className="bg-gradient-to-br from-blue-50 to-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <SuccessHeader orderId={orderDetails.order_id} />

          <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FaShoppingBag className="mr-2" />
                অর্ডার বিবরণ
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <CustomerInfo order={orderDetails} />
                  <ProductDetails order={orderDetails} />
                </div>
                <PriceSummary order={orderDetails} />
              </div>
              <UpsellOrderBadge order={orderDetails} />
              <DeliveryInfo />
            </div>
          </div>

          <CommunitySection communities={communities} />
        </div>
      </div>
    </>
  );
}
