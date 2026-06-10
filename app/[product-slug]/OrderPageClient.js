'use client';

import React, { Suspense, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaShoppingCart, FaMinus, FaPlus, FaTruck, FaInfoCircle } from 'react-icons/fa';
import { OrderContext, clearCheckoutDraft } from '../context/OrderContext';
import axios from 'axios';
import { HeaderContext } from '../context/HeaderContext';
import { ProductContext } from '../context/ProductsContext';
import { trackBrowserEvent, sendCAPIEvent, generateEventId } from '@/pixel';
import { ownTrack } from '@/app/lib/tracking';
import ReviewNotifications from '@/app/components/ReviewNotifications';
import bdLocations from '../data/locations';
import { useCart } from '../context/CartContext';
import DeliveryCharge from '../components/Landing/DeliveryCharge';
import CouponBox from '../components/CouponBox';

// Heavy / below-the-fold deps: lazy-loaded so they don't block initial JS.
// react-slick + framer-motion + CartPanel together ≈ 120KB; keeping them out
// of the main chunk speeds up TTI on mobile.
const Slider = dynamic(() => import('react-slick'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square bg-gray-100 rounded-lg animate-pulse" />
  ),
});

const MotionButton = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.button),
  { ssr: false }
);

const CartPanel = dynamic(() => import('../components/CartPanel'), {
  ssr: false,
});

// Placeholder components
const DistrictSelector = () => null;
const RelatedProducts = dynamic(() => import('../components/OrderPage/RelatedProducts'), { ssr: false });

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
};

// Custom hooks for API calls and debouncing
const useApiData = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(url);
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, ...dependencies]);

  return { data, loading, error };
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// API service with rate limiting
const createApiService = () => {
  let lastCallTime = 0;
  const minDelay = 1000; // 1 second between calls

  return {
    get: async (url) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      if (timeSinceLastCall < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastCall));
      }
      
      lastCallTime = Date.now();
      return axios.get(url);
    },
    post: async (url, data) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      if (timeSinceLastCall < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastCall));
      }
      
      lastCallTime = Date.now();
      return axios.post(url, data);
    }
  };
};

// Enhanced API call with retry
const fetchWithRetry = async (apiCall, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await apiCall();
      return response;
    } catch (error) {
      if (error.response?.status === 429) {
        // Wait longer for rate limiting
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1) * 2));
      } else if (i === retries - 1) {
        throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
};


// Tiny 1x1 grey SVG used as placeholder while next/image streams in the real bitmap.
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=';

const ImagePlaceholder = ({ className, style }) => (
  <div
    className={`bg-gray-100 flex items-center justify-center rounded-lg ${className || ''}`}
    style={style}
  >
    <div className="text-gray-400 text-center p-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-sm">ইমেজ পাওয়া যায়নি</p>
    </div>
  </div>
);

// Backed by next/image so we get WebP/AVIF, lazy loading, and srcset for free.
// Pass `priority` for above-the-fold images (the LCP candidate).
const ImageWrapper = ({ src, alt, className, style, width, height, priority = false, sizes }) => {
  const [isError, setIsError] = useState(false);

  if (!src || isError) {
    return <ImagePlaceholder className={className} style={style} />;
  }

  return (
    <NextImage
      src={src}
      alt={alt || ''}
      width={width || 400}
      height={height || 400}
      className={className}
      style={style}
      priority={priority}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={() => setIsError(true)}
    />
  );
};

// Main product image with hover-to-zoom. Uses next/image `fill` so we get
// responsive srcsets while CSS handles the zoom transform.
const SimpleImageZoom = ({ src, alt, className, style, priority = false, sizes }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isError, setIsError] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  if (!src || isError) {
    return <ImagePlaceholder className={className} style={style} />;
  }

  // next/image `fill` needs an explicit height on its container, otherwise the
  // layout collapses to 0px. Aspect-ratio keeps CLS at zero.
  const containerStyle = { aspectRatio: '1 / 1', ...style };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className || ''}`}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NextImage
        src={src}
        alt={alt || ''}
        fill
        sizes={sizes || '(max-width: 1024px) 100vw, 50vw'}
        className="object-contain"
        style={{
          transform: isHovered ? 'scale(1.8)' : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`,
          transition: 'transform 0.2s ease-out',
        }}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        onError={() => setIsError(true)}
      />
    </div>
  );
};



// ── Helpers ───────────────────────────────────────────────────────────────────
const PER_PAGE = 5;

function Stars({ rating, size = 18 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= rating ? '#FBBF24' : '#E5E7EB'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  );
}

// Mask phone: keep first 5 + last 2 digits, star the middle → 01712****89
function maskPhone(phone) {
  if (!phone) return '';
  const d = String(phone).replace(/\D/g, '');
  if (d.length <= 7) return d; // too short to mask meaningfully
  return d.slice(0, 5) + '*'.repeat(d.length - 7) + d.slice(-2);
}

// ── Star Picker ───────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'খুব খারাপ', 'খারাপ', 'মোটামুটি', 'ভালো', 'অসাধারণ'];
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(i => (
          <button key={i} type="button"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
            className="focus:outline-none transition-transform hover:scale-110 select-none"
          >
            <svg width="32" height="32" viewBox="0 0 20 20"
              fill={i <= (hovered || value) ? '#FBBF24' : '#E5E7EB'}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <span className="text-sm font-semibold text-yellow-600">
          {labels[hovered || value]}
        </span>
      )}
    </div>
  );
}

// ── Reviews section ───────────────────────────────────────────────────────────
function ReviewsSection({ productId, apiUrl }) {
  const [reviews, setReviews]         = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form, setForm]               = useState({ reviewer_name: '', reviewer_phone: '', rating: 0, review: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [page, setPage]               = useState(1);
  const [filterStar, setFilterStar]   = useState(0); // 0 = all

  useEffect(() => {
    axios.get(`${apiUrl}/products/${productId}/reviews`)
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reviewer_name.trim())  return setError('নাম লিখুন');
    if (!form.reviewer_phone.trim()) return setError('মোবাইল নম্বর লিখুন');
    if (!form.rating)                return setError('রেটিং দিন');
    setError(null);
    setSubmitting(true);
    try {
      await axios.post(`${apiUrl}/reviews`, { product_id: productId, ...form });
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  // Derived
  const avg         = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const starCount   = s => reviews.filter(r => r.rating === s).length;
  const filtered    = filterStar ? reviews.filter(r => r.rating === filterStar) : reviews;
  const totalPages  = Math.ceil(filtered.length / PER_PAGE);
  const paginated   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter = (s) => { setFilterStar(s); setPage(1); };

  const inp = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400";

  return (
    <div id="reviews" className="mt-10 max-w-2xl mx-auto px-4 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Ratings &amp; Reviews</h2>
        {!submitted && (
          <button onClick={() => setShowForm(v => !v)}
            className="text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
            {showForm ? '✕ বন্ধ' : '✏️ রিভিউ লিখুন'}
          </button>
        )}
      </div>

      {/* ── Rating summary ── */}
      {!loadingList && reviews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 flex gap-6 items-start">
          {/* Big number */}
          <div className="flex-shrink-0 text-center">
            <div className="text-5xl font-black text-gray-900 leading-none">{avg.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-0.5">/5</div>
            <Stars rating={Math.round(avg)} size={18} />
            <div className="text-xs text-gray-500 mt-1">{reviews.length} Ratings</div>
          </div>
          {/* Bars */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {[5,4,3,2,1].map(s => {
              const n   = starCount(s);
              const pct = reviews.length ? (n / reviews.length) * 100 : 0;
              return (
                <button key={s} type="button"
                  onClick={() => handleFilter(filterStar === s ? 0 : s)}
                  className="flex items-center gap-2 w-full group">
                  <Stars rating={s} size={13} />
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-xs w-6 text-right flex-shrink-0 font-medium ${filterStar === s ? 'text-yellow-600' : 'text-gray-500'}`}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Submit form ── */}
      {showForm && !submitted && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5 shadow-sm">
          <div className="bg-yellow-400 px-5 py-3">
            <h3 className="font-bold text-gray-900 text-sm">আপনার অভিজ্ঞতা শেয়ার করুন</h3>
            <p className="text-yellow-800 text-xs mt-0.5">অনুমোদনের পর প্রকাশিত হবে</p>
          </div>
          <div className="p-5">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-center gap-2">
                <span>⚠️</span>{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">নাম *</label>
                  <input value={form.reviewer_name}
                    onChange={e => setForm(p => ({ ...p, reviewer_name: e.target.value }))}
                    placeholder="আপনার নাম" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">মোবাইল *</label>
                  <input value={form.reviewer_phone} type="tel"
                    onChange={e => setForm(p => ({ ...p, reviewer_phone: e.target.value }))}
                    placeholder="017XXXXXXXX" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">রেটিং *</label>
                <StarPicker value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">মন্তব্য</label>
                <textarea value={form.review} rows={3}
                  onChange={e => setForm(p => ({ ...p, review: e.target.value }))}
                  placeholder="আপনার অভিজ্ঞতা লিখুন…"
                  className={inp + " resize-none"} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition disabled:opacity-60 text-sm">
                {submitting ? 'পাঠানো হচ্ছে…' : 'সাবমিট করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-5">
          <p className="font-bold text-green-800">🎉 ধন্যবাদ! আপনার রিভিউ জমা হয়েছে।</p>
          <p className="text-xs text-green-600 mt-0.5">অনুমোদনের পর প্রকাশিত হবে।</p>
        </div>
      )}

      {/* ── Review list header ── */}
      {!loadingList && (
        <div className="flex items-center justify-between py-3 border-b border-gray-200 mb-3">
          <span className="font-semibold text-gray-800 text-sm">Product Reviews</span>
          {filterStar > 0 && (
            <button onClick={() => handleFilter(0)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Stars rating={filterStar} size={12} /> ফিল্টার বাদ দিন ✕
            </button>
          )}
        </div>
      )}

      {/* ── List ── */}
      {loadingList ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="flex gap-3 mb-2">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-100 rounded w-16 ml-auto" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">{filterStar ? `${filterStar}★ রিভিউ নেই` : 'এখনো কোনো রিভিউ নেই। প্রথম রিভিউ দিন!'}</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {paginated.map(r => (
              <div key={r.id} className="py-4">
                {/* Stars + date row */}
                <div className="flex items-center justify-between mb-1">
                  <Stars rating={r.rating} size={16} />
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                  </span>
                </div>
                {/* Name + verified (row), phone below the name */}
                <div className="mb-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {r.reviewer_name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Verified Purchase
                    </span>
                  </div>
                  {r.reviewer_phone && (
                    <div className="text-xs text-gray-400 font-medium tracking-wide mt-0.5">
                      {r.reviewer_phone}
                    </div>
                  )}
                </div>
                {/* Review text */}
                {r.review && (
                  <p className="text-sm text-gray-700 leading-relaxed">{r.review}</p>
                )}
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← আগে
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 text-sm rounded-lg font-semibold transition ${
                    page === p ? 'bg-yellow-400 text-gray-900' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                পরে →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const OrderPageClient = ({ slug, initialProduct }) => {
  const router = useRouter();

  const {
    apiUrl,
    imageUrl,
    loading,
    products,
    selectedColor,
    selectedColorId,
    selectedSize,
    quantity,
    currentImage,
    name,
    address,
    phone,
    homepage,
    deliveryCharge,
    setDeliveryCharge,
    estimatedDays,
    setEstimatedDays,
    filterAllProducts,
    setName,
    setAddress,
    setPhone,
    setSelectedSize,
    handleColorSelect,
    handleQuantityChange,
    calculatePrices,
    selectedDistrict,
    setSelectedDistrict,
    deliveryNote,
    setDeliveryNote,
    districts: districtData,
    handleBulkDiscountSelect,
    selectedBulkDiscount,
    handleBumpSelect,
    fetchProductDetails,
    hydrateProduct,
    fetchAllProducts,
  } = useContext(OrderContext);

  const { loading: headerLoading } = useContext(HeaderContext);
  const { pixel, testEventCode } = useContext(ProductContext);

  // Debug: Log image state
  console.log('[OrderPage] currentImage:', currentImage);
  console.log('[OrderPage] products.colors:', products?.colors);
  console.log('[OrderPage] products.images:', products?.images);

  const [dataSaved, setDataSaved] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const [token, setToken] = useState(null);

  // Initialize token from localStorage on mount (client-side only)
  useEffect(() => {
    setToken(localStorage.getItem('authToken') || null);
  }, []);

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDivisionName, setSelectedDivisionName] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userStatus, setUserStatus] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethod[0]?.id || null);
  const [selectedPayment, setSelectedPayment] = useState('cod');

  const [paymentNumber, setPaymentNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Use useMemo to safely calculate prices without causing render issues
  const calculatedPrices = useMemo(() => {
    try {
      return calculatePrices();
    } catch (error) {
      console.error('[OrderPage] calculatePrices error:', error);
      return { basePrice: 0, productPrice: 0, totalPrice: 0, appliedDiscount: null };
    }
  }, [products, quantity, selectedDistrict, districts, selectedBulkDiscount]);

  const {
    basePrice,
    productPrice,
    totalPrice,
    appliedDiscount,
    bumpsTotal = 0,
    bulkDiscount = 0,
  } = calculatedPrices;


  const [isCartOpen, setIsCartOpen] = useState(false);
 const { items, totalItems, addItem, updateItemQuantity, removeItem, setItems } = useCart();

  const [codAdvance, setCodAdvance] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [showForm, setShowForm] = useState(false);

   const eventTime = Math.floor(Date.now() / 1000);

  // Create API service instance
  const apiService = useMemo(() => createApiService(), []);

  // Debounced phone number for validation
  const debouncedPhone = useDebounce(phone, 500);

  // Fetch data using custom hooks
  const { data: codAdvanceData } = useApiData(`${apiUrl}/codadvances`);


 const mobileInputRef = useRef(null);
 const sizeRef        = useRef(null);

 const [phoneError, setPhoneError] = useState("");
 const [sizeError, setSizeError]   = useState('');
 // Applied coupon — { code, type, discount, free_delivery } or null
 const [appliedCoupon, setAppliedCoupon] = useState(null);
 // Global order settings (quantity_limit_enabled, global_max_per_order, etc.)
 const [orderSettings, setOrderSettings] = useState(null);
 // Storefront order-id prefix is admin-configurable (Order Settings). Falls
 // back to 'HA' until the setting loads / when left unset in the dashboard.
 const randomNumber = `${orderSettings?.order_id_prefix || 'HA'}${Math.floor(1000 + Math.random() * 90000)}`;
 // Inline submit error (e.g. IP limit 429) — replaces alert() so the message
 // is visible right above the submit button instead of dismissable.
 const [submitError, setSubmitError] = useState(null);

 // Fetch order settings once so we can apply the per-order quantity limit live.
 useEffect(() => {
   if (!apiUrl) return;
   const controller = new AbortController();
   axios
     .get(`${apiUrl}/order-settings`, { signal: controller.signal })
     .then((res) => setOrderSettings(res.data || {}))
     .catch(() => {});
   return () => controller.abort();
 }, [apiUrl]);

 // Resolve the effective max quantity for this product:
 //   - If quantity_limit_enabled is OFF → no cap
 //   - Else product.max_per_order takes precedence; falls back to the global
 //     setting; null means uncapped.
 const effectiveMaxQty = useMemo(() => {
   if (!orderSettings?.quantity_limit_enabled) return null;
   const productCap = Number(products?.max_per_order);
   if (Number.isFinite(productCap) && productCap > 0) return productCap;
   const globalCap = Number(orderSettings?.global_max_per_order);
   return Number.isFinite(globalCap) && globalCap > 0 ? globalCap : null;
 }, [orderSettings, products?.max_per_order]);

 const qtyAtMax = effectiveMaxQty !== null && Number(quantity) >= effectiveMaxQty;

  // Mirror of backend DeliveryService rules:
  //   1) product.free_delivery_enabled && qty >= product.free_delivery_min_qty
  //   2) any of product.categories has free_delivery = true
  //   3) coupon is free_delivery type
  // Frontend recalculates so price summary reflects free delivery without a
  // round-trip to /coupons/validate or order-submit.
  const productFreeShip = useMemo(() => {
    const minQty = Number(products?.free_delivery_min_qty || 0);
    return !!products?.free_delivery_enabled && minQty > 0 && Number(quantity || 0) >= minQty;
  }, [products?.free_delivery_enabled, products?.free_delivery_min_qty, quantity]);

  const categoryFreeShip = useMemo(
    () => (products?.categories || []).some((c) => !!c.free_delivery),
    [products?.categories]
  );

  const freeShipReason = appliedCoupon?.free_delivery
    ? 'কুপন'
    : (productFreeShip ? 'Bulk Purchase' : (categoryFreeShip ? 'Category Free' : null));
  const isFreeDelivery = !!freeShipReason;

  // DeliveryCharge component callback — receives (charge, area) where area
  // is the full delivery zone (district_name, delivery_charge, estimated_days,
  // delivery_note). Updates all related OrderContext state in one shot so the
  // price summary + submit payload stay in sync.
  const handleDeliveryChange = useCallback((_charge, area) => {
    if (!area) return;
    setDeliveryCharge(area.delivery_charge);
    setEstimatedDays(area.estimated_days);
    setDeliveryNote(area.delivery_note || '');
    setSelectedDistrict(area.district_name);
  }, [setDeliveryCharge, setEstimatedDays, setDeliveryNote, setSelectedDistrict]);

   // ফোন নাম্বার বাংলা থেকে ইংরেজি করার ফাংশন
    const handlePhoneChange = (e) => {
      const input = e.target.value;
      const bengaliToEnglish = {'০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'};
      
      // বাংলা ডিজিট রিপ্লেস
      let convertedNumber = input.replace(/[০-৯]/g, match => bengaliToEnglish[match]);
      // ইংরেজি সংখ্যা ছাড়া সব মুছে ফেলা
      convertedNumber = convertedNumber.replace(/\D/g, '');
      
      setPhone(convertedNumber);

      if (convertedNumber.length > 0 && convertedNumber.length < 11) {
      setPhoneError("মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে");
      } else if (convertedNumber.length === 11 && !convertedNumber.startsWith("01")) {
      setPhoneError("সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01...)");
      } else {
      setPhoneError(""); 
      }
  };


const viewContentTracked = useRef(false);

useEffect(() => {
  if (!products?.id || !pixel?.length || viewContentTracked.current) return;

  const eventId = generateEventId('VC');
  const itemPrice = Math.round(products.discount_price || products.price);

  const customData = {
    content_ids: [String(products.id)],
    contents: [{ id: String(products.id), quantity: 1, item_price: itemPrice }],
    content_name: products.name,
    content_type: 'product',
    value: itemPrice,
    currency: 'BDT',
    event_source_url: window.location.href,
    external_id: randomNumber,
  };

  trackBrowserEvent(pixel, 'ViewContent', customData, eventId);
  sendCAPIEvent(apiUrl, 'ViewContent', customData, {}, eventId, testEventCode);

  viewContentTracked.current = true;
}, [products?.id, pixel]);


const [checkoutTracked, setCheckoutTracked] = useState(false);
const fireInitiateCheckout = () => {
  if (checkoutTracked || !products) return;
  setCheckoutTracked(true);

  const eventId = generateEventId('IC');
  const itemPrice = Math.round(products.discount_price || products.price);

  const customData = {
    value: Math.round(totalPrice),
    currency: 'BDT',
    content_name: products.name,
    content_ids: [String(products.id)],
    contents: [{ id: String(products.id), quantity: quantity, item_price: itemPrice }],
    event_source_url: window.location.href,
    external_id: randomNumber,
  };

  trackBrowserEvent(pixel, 'InitiateCheckout', customData, eventId);
  sendCAPIEvent(apiUrl, 'InitiateCheckout', customData, {}, eventId, testEventCode);
};

const handleOpenFormModal = () => {
  setShowForm(true);

  // InitiateCheckout ট্র্যাকিং ফাংশন কল
  fireInitiateCheckout();
  
  // স্ক্রল এবং ফোকাস লজিক
  setTimeout(() => {
    if (mobileInputRef.current) {
      mobileInputRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      mobileInputRef.current.focus();
    }
  }, 100);
};


const handleAddToCart = (product) => {

  // ভ্যালিডেশন চেক
  if (product.colors?.length > 0 && !selectedColorId) {
    alert('Please select a color');
    return;
  }

  if (product.clothing && product.colors?.find(c => c.id === selectedColorId)?.sizes?.length > 0 && !selectedSize) {
    alert('Please select a size');
    return;
  }

  if (product.single_product_sizes?.length > 0 && !selectedSize) {
    alert('Please select a size');
    return;
  }

  // কার্ট আইটেমের ID তৈরি করুন
  const itemId = `${product.id}${selectedColorId ? `-${selectedColorId}` : ''}${selectedSize ? `-${selectedSize}` : ''}`;
  
  // কার্ট আইটেম তৈরি করুন
  let cartItem = { 
    ...product, 
    id: itemId,
    product_id: product.id, 
    price: product.discount_price || product.price,
    quantity: quantity 
  };

  // ভ্যারিয়েন্ট ডিটেইলস যোগ করুন
  if (product.colors?.length > 0) {
    const selectedColorImage = product.colors.find(c => c.id === selectedColorId)?.image;
    cartItem = {
      ...cartItem,
      color: selectedColor || null,
      colorId: selectedColorId || null,
      size: selectedSize || null,
      image: selectedColorImage || product.images[0]?.image,
    };
  }

  // সিঙ্গেল প্রোডাক্ট সাইজ যোগ করুন
  if (product.single_product_sizes?.length > 0) {
    cartItem = {
      ...cartItem,
      size: selectedSize || null,
    };
  }

  // যদি আইটেম ইতিমধ্যে কার্টে থাকে
  const existingItemIndex = items.findIndex(item => item.id === itemId);
  
  if (existingItemIndex !== -1) {
    // বিদ্যমান আইটেম আপডেট করুন
    const updatedItems = [...items];
    updatedItems[existingItemIndex] = {
      ...updatedItems[existingItemIndex],
      quantity: updatedItems[existingItemIndex].quantity + quantity
    };
    setItems(updatedItems);
  } else {
    // নতুন আইটেম যোগ করুন
    addItem(cartItem, quantity);
  }
  // কার্ট প্যানেল খুলুন
  setIsCartOpen(true);

};

  // Hydrate from SSR if the server delivered the product; otherwise fall back
  // to a client-side fetch (covers next/link navigations that bypass SSR).
  useEffect(() => {
    if (initialProduct?.id) {
      hydrateProduct(initialProduct);
      // Related-products rail is below the fold — defer until the browser is idle.
      const ric = typeof window !== 'undefined' && window.requestIdleCallback;
      if (ric) ric(() => fetchAllProducts(), { timeout: 2000 });
      else setTimeout(fetchAllProducts, 0);
    } else if (slug) {
      fetchProductDetails(slug);
    }
  }, [slug, initialProduct, hydrateProduct, fetchAllProducts, fetchProductDetails]);

  // BFCache restoration: when user navigates Back from /thankyou or /upsell,
  // some browsers serve the page from the back-forward cache without firing
  // React lifecycle. The `pageshow` event with `persisted=true` is our signal
  // to re-hydrate so the form fields + product details are fresh.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onShow = (e) => {
      if (e.persisted && initialProduct?.id) hydrateProduct(initialProduct);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [initialProduct, hydrateProduct]);

  // বিভাগ লোড
  useEffect(() => {
    const loadedDivisions = bdLocations.map(div => ({
      id: div.division.en,
      name: div.division.en,
      bn_name: div.division.bn
    }));
    setDivisions(loadedDivisions);
  }, []);

  // বিভাগ পরিবর্তন হলে সংশ্লিষ্ট জেলা লোড করুন
  useEffect(() => {
    if (selectedDivision) {
      const selectedDivData = bdLocations.find(
        div => div.division.en === selectedDivision
      );
      
      if (selectedDivData) {
        const loadedDistricts = selectedDivData.districts.map(dist => ({
          id: dist.en,
          name: dist.en,
          bn_name: dist.bn
        }));
        
        setDistricts(loadedDistricts);
      }
    } else {
      setDistricts([]);
    }
  }, [selectedDivision]);



  // Set COD advance data when loaded
  useEffect(() => {
    if (codAdvanceData && codAdvanceData.length > 0) {
      setCodAdvance(codAdvanceData[0]);
      setSelectedPayment('cod_advance');
    }
  }, [codAdvanceData]);

  // Set payment method when loaded
  useEffect(() => {
    if (paymentMethod.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethod[0].id);
    }
  }, [paymentMethod]);

  //BlackList
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const cleanedPhone = debouncedPhone.replace(/\D/g, '');
        if (cleanedPhone.length !== 11) return;

        const response = await fetchWithRetry(() => apiService.get(`${apiUrl}/customers/phone/${cleanedPhone}`));
        setUserStatus(response.data.customer.delivery_status);
      } catch (err) {
      }
    };

    if (debouncedPhone.length === 11) {
      fetchUserStatus();
    }
  }, [debouncedPhone, apiUrl, apiService]);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const response = await fetchWithRetry(() => apiService.get(`${apiUrl}/paymentmethod`));
        setPaymentMethod(response.data);

        if (response.data.length > 0) {
          if (userStatus === 'blocked') {
            setSelectedPaymentMethod(response.data[0].id);
            setSelectedPayment(response.data[0].payment_method);
          }
        }
      } catch (err) {
      }
    };
    
    fetchPaymentMethod();
  }, [userStatus, apiUrl, apiService]);

  // Save data when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (!dataSaved && name && phone && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
        
        try {
          const randomNumber = `${orderSettings?.order_id_prefix || 'A2C'}${Math.floor(1000 + Math.random() * 900000)}`;
          const leadData = {
            order_id: randomNumber,
            product_id: products?.homepage?.product_id || products?.id,
            customer_name: name,
            phone_number: phone,
            product_price: totalPrice,
            customer_address: `Village/Road: ${address}, district: ${selectedDistrictName}, division: ${selectedDivisionName}`,
            status: 'lead',
            quantity: quantity,
            color: selectedColor || '',
            size: selectedSize || '',
            product_name: products?.name || '',
            page_url: window.location.href
          };

          await fetchWithRetry(() => apiService.post(`${apiUrl}/leads`, leadData));
          setDataSaved(true);
          
          window.removeEventListener('beforeunload', handleBeforeUnload);
          window.close();
        } catch (error) {
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [name, phone, products, dataSaved, apiUrl, isSubmitting, address, selectedDistrictName, selectedDivisionName, quantity, totalPrice, apiService]);

  // ── Own analytics: checkout_view ─────────────────────────────────────────
  // The product page IS the checkout page, so "viewing checkout" = the customer
  // actually starting to fill the order form. Fires once, keyed to the product
  // `slug` so view → checkout → order → CVR all aggregate on the same row.
  const checkoutViewFired = useRef(false);
  useEffect(() => {
    if (checkoutViewFired.current) return;
    const started = (phone && phone.length >= 3) || (name && name.trim().length >= 2);
    if (started) {
      checkoutViewFired.current = true;
      ownTrack('checkout_view', slug);
    }
  }, [phone, name, slug]);


      const selectedBulkDiscounts = products.bulk_discounts?.filter(d => 
      selectedBulkDiscount?.id === d.id && quantity === d.offer_quantity
    ).map(discount => ({
      id: discount.id
    })) || [];

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPayment === 'cod_advance') {
      if (!selectedPaymentMethod || !paymentNumber || !transactionId) {
        alert('অগ্রিম পেমেন্টের জন্য পেমেন্ট মেথড, পেমেন্ট নম্বর এবং ট্রানজেকশন আইডি প্রদান করুন');
        return;
      }
    }

    const phoneRegex = /^01[3-9]\d{8}$/;
    const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('phone') : null;
    const cleanedPhone = (storedPhone || phone).replace(/\D/g, '');
    
    if (!phoneRegex.test(cleanedPhone)) {
      alert('সঠিক মোবাইল নম্বর দিন (১১ ডিজিট, 01 দিয়ে শুরু)');
      return;
    }
    
    if (!name || !address || !cleanedPhone ) {
      alert('দয়া করে সমস্ত তথ্য পূরণ করুন।');
      return;
    }
    
    if (products.clothing && !selectedColor) {
      alert('দয়া করে কালার সিলেক্ট করুন।');
      return;
    }

    const colorSizeRequired  = products.clothing && products.colors?.some(c => c.id === selectedColorId && c.sizes?.length > 0);
    const singleSizeRequired = products.single_product_sizes?.length > 0;
    if ((colorSizeRequired || singleSizeRequired) && !selectedSize) {
      setSizeError('অনুগ্রহ করে সাইজ সিলেক্ট করুন');
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // ফেসবুক পিক্সেল ইভেন্ট ট্র্যাকিং
    try {

      let formattedPhone = cleanedPhone;

      if (formattedPhone.length === 11 && formattedPhone.startsWith('01')) {
        formattedPhone = '880' + formattedPhone.slice(1);
      }
      
      
    } catch (error) {
    }

   
    const payableAmount = codAdvance ? totalPrice - codAdvance.pay_amount : totalPrice;






    const selectedBumps = products.bumps?.filter(b => b.selected).map(bump => ({
      id: bump.id,
      bump_price: bump.bump_price
    })) || [];

    const selectedBulkDiscounts = products.bulk_discounts?.filter(d => 
      selectedBulkDiscount?.id === d.id && quantity === d.offer_quantity
    ).map(discount => ({
      id: discount.id
    })) || [];


    const finalPaymentMethod = selectedPayment === 'cod' ? 'cash' : selectedPayment;





    const orderItems = [{
        product_id: products.id,
        product_name: products.name,
        quantity: quantity,
        price: products.discount_price || products.price,
        color: selectedColor || null,
        size: selectedSize || null,
    }];

    const orderDetails = {
      order_id: randomNumber,
      product_id: products?.id,
      product_name: products?.name,
      color: selectedColor || "",
      size: selectedSize || "",
      quantity,
      // Backend re-validates free-delivery rules, but we mirror them here so
      // the displayed total matches the saved order if the user reviews.
      delivery_charge: isFreeDelivery ? 0 : deliveryCharge,
      cod_advance: codAdvance ? codAdvance.pay_amount : 0,
      product_price: products.discount_price ? products.discount_price * quantity : products.price * quantity,
      total: payableAmount,
      transaction_id: transactionId,
      customer_name: name,
      customer_address: `Village/Road: ${address}, district: ${selectedDistrictName}, division: ${selectedDivisionName}`,
      phone_number: phone,

      payment_method: paymentMethod.find(p => p.id === selectedPaymentMethod)?.payment_method || finalPaymentMethod,
      payment_number: paymentNumber,

      delivery_note: deliveryNote,
      bulk_discounts: selectedBulkDiscounts,
      bumps: selectedBumps,
      items: orderItems,
      coupon_code: appliedCoupon?.code || null,
    };

  

    if (!navigator.onLine) {
      alert('আপনার ইন্টারনেট সংযোগ নেই। দয়া করে ইন্টারনেট সংযোগ চেক করুন এবং আবার চেষ্টা করুন।');
      return;
    }

    // Pre-flight: check IP daily quota so we never enter Processing… for a
    // request the backend will reject with 429. Alert immediately if reached.
    try {
      const q = await axios.get(`${apiUrl}/order-settings/quota`);
      if (q.data?.reached) {
        const msg = `আপনার অর্ডার লিমিট শেষ। আপনি গত ২৪ ঘণ্টায় সর্বোচ্চ ${q.data.limit}টি অর্ডার করেছেন। আজ আর অর্ডার করা যাবে না।`;
        setSubmitError(msg);
        alert(msg);
        return;
      }
    } catch { /* quota check is best-effort — submit anyway, backend will still reject */ }

    setIsSubmitting(true);

    try {
      const res = await fetchWithRetry(() => apiService.post(`${apiUrl}/customers`, orderDetails, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }));

      setDataSaved(true);
      // Order succeeded — wipe the draft so a back-nav doesn't repopulate the
      // form with already-submitted data. Soft-nav keeps context tree alive.
      clearCheckoutDraft();
      // Only route through /upsell when the backend confirms an ACTIVE upsell;
      // otherwise go straight to /thankyou and skip the throwaway /upsell hop
      // (which would fire an extra PageView when the upsell is inactive).
      // Remember which product slug this order came from so the ThankYou page
      // attributes the `order` analytics event to the right product row
      // (instead of guessing from the referrer / order_id).
      try { sessionStorage.setItem('own_order_slug', slug); } catch {}
      const body = res?.data;
      const hasUpsell = !!body?.has_upsell
        || (Array.isArray(body?.upsell_product_ids) && body.upsell_product_ids.length > 0);
      router.push(hasUpsell ? `/upsell/${randomNumber}` : `/thankyou/${randomNumber}`);
      
    } catch (error) {
      let errorMessage = 'অর্ডার সাবমিশন ব্যর্থ হয়েছে';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'সার্ভারে রেসপন্স দিতে দেরি হচ্ছে। দয়া করে পরে আবার চেষ্টা করুন';
      } else {
        const status = error.response?.status;
        const data   = error.response?.data;
        if (status === 429) {
          // IP-based daily limit — backend sends a precise Bengali message
          const fromErrors = data?.errors?.ip_address?.[0];
          errorMessage = fromErrors || data?.message || 'আপনার অর্ডার লিমিট শেষ। আজ আর অর্ডার করা যাবে না।';
        } else if (status === 422) {
          const firstFieldErr = data?.errors ? Object.values(data.errors).flat()[0] : null;
          errorMessage = firstFieldErr || data?.message || errorMessage;
        } else if (data?.message) {
          errorMessage = data.message;
        }
      }

      setSubmitError(errorMessage);
      alert(errorMessage);
    }

    setIsSubmitting(false);
  };

  // Memoized payment methods renderer
  const renderPaymentMethods = useCallback(() => {
    if (userStatus === 'blocked' && !codAdvance) {
      return (
        <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">পেমেন্ট মেথড</h3>
            <p className="text-sm text-red-500 mt-1">
              আপনার অ্যাকাউন্ট ব্লক করা আছে। সম্পূর্ণ অগ্রিম পেমেন্ট করে অর্ডার সম্পন্ন করুন।
            </p>
          </div>
          
          <div className='px-4 py-4 space-y-4'>
            {paymentMethod.filter(pay => pay.payment_method !== 'cod').map(pay => (
              <div key={pay.id} className="flex items-start">
                <input 
                  type="radio" 
                  name="payment_method" 
                  checked={selectedPaymentMethod === pay.id}
                  onChange={() => {
                    setSelectedPaymentMethod(pay.id);
                    setSelectedPayment(pay.payment_method);
                  }}
                  className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded mt-1"
                />
                <label className="ml-3 block w-full">
                  <span className="text-lg font-semibold text-gray-800">{pay.payment_method}</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {pay.payment_method} নাম্বারে "Send Money" করুন
                  </p> 
                  
                  {selectedPaymentMethod === pay.id && (
                    <div className="mt-2 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                      <p className="text-sm font-medium text-yellow-800">
                        {pay.payment_method} নম্বর: {pay.payment_number}
                      </p>
                      
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            আপনার {pay.payment_method} নম্বর
                          </label>
                          <input
                            type="text"
                            value={paymentNumber}
                            onChange={(e) => setPaymentNumber(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="01XXXXXXXXX"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            ট্রানজেকশন আইডি
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="TX123456789"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">পেমেন্ট মেথড</h3>
          </div>
          
          <div className="px-4 py-4 space-y-4">
            {codAdvance ? (
              <div className="flex items-start">
                <input 
                  type="radio" 
                  name="payment_method" 
                  checked={selectedPayment === 'cod_advance'}
                  onChange={() => {
                    setSelectedPayment('cod_advance');
                    setSelectedPaymentMethod(null);
                  }}
                  className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded mt-1"
                />
                <label className="ml-3 block w-full">
                  <span className="text-lg font-semibold text-gray-800">
                    {codAdvance.title || 'ক্যাশ অন ডেলিভারি (অগ্রিম পেমেন্ট)'}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {codAdvance.sub_title || 'অগ্রিম পেমেন্ট করুন এবং ডেলিভারি এজেন্টের কাছে নগদ অর্থ প্রদান করুন'}
                  </p>
                  
                  {selectedPayment === 'cod_advance' && (
                    <div className="mt-3 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                      <h4 className="font-medium text-yellow-800 mb-2">{codAdvance.headline}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentMethod.filter(pay => pay.payment_method !== 'cod').map(pay => (
                         <div 
                            key={pay.id} 
                            className={`border rounded-md p-3 ${selectedPaymentMethod === pay.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                          >
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="radio" 
                                checked={selectedPaymentMethod === pay.id}
                                onChange={() => {
                                  setSelectedPaymentMethod(pay.id);
                                  setSelectedPayment('cod_advance');
                                }}
                                className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
                              />
                                <div className="ml-2">
                                  <span className="font-medium">{pay.payment_method}</span>
                                  <p className="text-sm mt-1 text-gray-500 font-semibold">
                                    পেমেন্ট নাম্বার: {pay.payment_number}
                                  </p>
                                </div>
                            </label>
                          </div>
                          
                        ))}
                      </div>

                      {selectedPaymentMethod && (
                        <div className="mt-3 space-y-3">
                          <div>
                            <label htmlFor="advancePaymentNumber" className="block text-sm font-medium text-gray-700">
                              আপনার {paymentMethod.find(p => p.id === selectedPaymentMethod)?.payment_method} নম্বর
                            </label>
                            <input
                              type="text"
                              id="advancePaymentNumber"
                              value={paymentNumber}
                              onChange={(e) => setPaymentNumber(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="01XXXXXXXXX"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="advanceTransactionId" className="block text-sm font-medium text-gray-700">
                              ট্রানজেকশন আইডি
                            </label>
                            <input
                              type="text"
                              id="advanceTransactionId"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="TX123456789"
                              required
                            />
                          </div>
                          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                            <p className="text-sm text-blue-800">
                              <strong>দ্রষ্টব্য:</strong> অগ্রিম {codAdvance.pay_amount} টাকা পেমেন্ট করুন এবং অবশিষ্ট {totalPrice - codAdvance.pay_amount} টাকা ডেলিভারি এজেন্টকে দিন।
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div className="flex items-start">
                <input 
                  type="radio" 
                  name="payment_method" 
                  checked={selectedPayment === 'cod'}
                  onChange={() => {
                    setSelectedPayment('cod');
                    setSelectedPaymentMethod(null);
                  }}
                  className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded mt-1"
                />
                <label className="ml-3 block w-full">
                  <span className="text-lg font-semibold text-gray-800">ক্যাশ অন ডেলিভারি</span>
                </label>
              </div>
            )}
          </div>
          
          {/* Delivery Info Section */}
          <div className="p-4 bg-white">
            <div className="flex items-start">
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  পণ্য হাতে পেয়ে নগদ অর্থ প্রদান করুন। ডেলিভারি এজেন্টের কাছে সরাসরি টাকা পরিশোধ করুন। 
                  <span className="block mt-1 font-medium text-green-600">
                    কোন অতিরিক্ত চার্জ প্রযোজ্য নয়
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                    </svg>
                    নিরাপদ
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-800 border border-purple-100">
                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                    </svg>
                    দ্রুত
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-100">
                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                    বিশ্বস্ত
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }, [userStatus, codAdvance, paymentMethod, selectedPaymentMethod, selectedPayment, paymentNumber, transactionId, totalPrice]);



  // Check if we need to show loading
  // Only show spinner if we're still loading AND no products loaded yet
  // This prevents infinite loading when product data is available but loading state is slow
  const shouldShowLoading = loading && !products?.id;

  console.log('[OrderPage] Render - loading:', loading, 'headerLoading:', headerLoading, 'products.id:', products?.id, 'slug:', slug, 'shouldShowLoading:', shouldShowLoading);

  if (shouldShowLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* ── Size Guide Modal ──────────────────────────────────────────────── */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSizeGuide(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">📐 Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-xl transition">
                ×
              </button>
            </div>
            <div className="p-5">
              {products?.size_guide_text && (
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100 font-sans leading-relaxed mb-4">
                  {products.size_guide_text}
                </pre>
              )}
              {products?.size_guide_image && (
                <img
                  src={`${imageUrl}/${products.size_guide_image}`}
                  alt="Size Guide"
                  className="w-full rounded-xl border border-gray-100"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Product Header */}
        {homepage?.headline && (
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {homepage.headline}
            </h1>
            {homepage.paragraph && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {homepage.paragraph}
              </p>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 mb-16">
            {/* Product Images */}
            <div className="flex flex-col items-center">
              <div className="w-full overflow-hidden p-2">
                {products?.colors && products.colors.length > 0 ? (
                  <SimpleImageZoom
                    src={currentImage ? `${imageUrl}/${currentImage}` : null}
                    alt={products.name || 'Product'}
                    className="w-full rounded-lg cursor-zoom-in"
                    style={{ maxHeight: '600px' }}
                    priority
                  />
                ) : products?.images && products.images.length > 0 ? (
                  <div className="w-full mx-auto">
                    {products.images.length === 1 ? (
                      <div className="bg-white">
                        <SimpleImageZoom
                          src={products.images[0]?.image ? `${imageUrl}/${products.images[0].image}` : null}
                          alt={products.name || 'Product'}
                          className="w-full rounded-lg cursor-zoom-in"
                          style={{ maxHeight: '600px' }}
                          priority
                        />
                      </div>
                    ) : (
                      <Slider {...sliderSettings} className="rounded-xl overflow-hidden">
                        {products.images.map((image, index) => (
                          <div key={index} className="flex justify-center bg-white">
                            <SimpleImageZoom
                              src={image?.image ? `${imageUrl}/${image.image}` : null}
                              alt={`${products.name || 'Product'} - Image ${index + 1}`}
                              className="w-full rounded-sm cursor-zoom-in"
                              style={{ maxHeight: '600px' }}
                              priority={index === 0}
                            />
                          </div>
                        ))}
                      </Slider>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-100 w-full h-64 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">কোন ইমেজ পাওয়া যায়নি</p>
                    </div>
                  </div>
                )}
              </div>
            
            {/* Color Selection */}
            {products?.colors?.length > 0 && (
              <div className="w-full max-w-xl mt-6 bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  কালার সিলেক্ট করুন:
                </h3>
                <div className="flex flex-wrap gap-3">
                  {products.colors.map((colorOption) => (
                    <div
                      key={colorOption.id}
                      onClick={() => handleColorSelect(colorOption.color, colorOption.image, colorOption.id)}
                      className={`cursor-pointer p-1 rounded-lg border-2 transition-all transform hover:scale-105 ${
                        selectedColor === colorOption.color
                          ? 'border-blue-600 ring-2 ring-blue-300'
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <ImageWrapper
                        src={colorOption?.image ? `${imageUrl}/${colorOption.image}` : null}
                        alt={colorOption.color || 'Color option'}
                        width={80}
                        height={80}
                        sizes="80px"
                        className="object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {/* Product Description for Desktop */}
            {homepage?.description && (
              <div className="w-full hidden lg:block mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaInfoCircle className="mr-2 text-blue-500" />
                    {products.name} সম্পর্কে
                  </h2>
                  <div 
                    className="prose max-w-none text-gray-700 break-words overflow-hidden"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    dangerouslySetInnerHTML={{ __html: homepage.description }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Form */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-100">
                {products.name || 'অর্ডার ফর্ম'}
              </h2>

              {/* প্রাইস সেকশন যোগ করুন */}
              <div className="flex justify-start items-center gap-4 mb-4">
                {products.discount_price ? (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ৳{products.price}
                    </span>
                    <span className="text-2xl font-bold text-[#fa582c]">
                      ৳{products.discount_price}
                    </span>
                    
                    <span className="text-sm bg-[#dd3737] text-white px-2 py-1 rounded-full">
                      {Math.round(((products.price - products.discount_price) / products.price) * 100)}% ছাড়
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-green-600">
                    ৳{products.price}
                  </span>
                )}
              </div>

              {/* ── Rating ─────────────────────────────────────────── */}
              {products?.rating_enabled && products?.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => {
                      const filled = i <= Math.floor(products.rating);
                      const half   = !filled && i - 0.5 <= products.rating;
                      return (
                        <span key={i} className="text-xl leading-none" style={{ color: filled || half ? '#FBBF24' : '#D1D5DB' }}>
                          {filled ? '★' : half ? '⯨' : '☆'}
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-sm font-bold text-yellow-600">{Number(products.rating).toFixed(1)}</span>
                  {products.rating_count > 0 && (
                    <span className="text-sm text-gray-400">({products.rating_count.toLocaleString()} রিভিউ)</span>
                  )}
                </div>
              )}

              {/* ── Guarantee Badge ─────────────────────────────────── */}
              {products?.guarantee_badge?.enabled && products.guarantee_badge.text && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold mb-4 border"
                  style={{
                    backgroundColor: products.guarantee_badge.bg_color || '#f0fdf4',
                    color:           products.guarantee_badge.text_color || '#166534',
                    borderColor:     products.guarantee_badge.bg_color || '#bbf7d0',
                  }}>
                  <span className="text-base">{products.guarantee_badge.icon || '🛡️'}</span>
                  {products.guarantee_badge.text}
                </div>
              )}

              {/* Mobile Description - Expandable */}
              {homepage?.description && (
                <div className="lg:hidden mb-6 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                    onClick={() => setShowDescription(!showDescription)}
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">পণ্যের বিবরণ</h3>
                        <p className="text-sm text-gray-500 mt-1">ক্লিক করে সম্পূর্ণ বিবরণ দেখুন</p>
                      </div>
                    </div>
                    <div className={`transform transition-transform duration-300 ${showDescription ? 'rotate-180' : ''}`}>
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {showDescription && (
                    <div className="px-4 py-4 bg-white border-t border-gray-100 animate-fadeIn">
                      <div 
                        className="prose prose-sm max-w-none text-gray-700 break-words overflow-hidden"
                        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                        dangerouslySetInnerHTML={{ __html: homepage.description }} 
                      />
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                        <button 
                          onClick={() => setShowDescription(false)}
                          className="flex items-center text-blue-600 text-sm font-medium"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"></path>
                          </svg>
                          বিবরণ বন্ধ করুন
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
                        
              <form onSubmit={handleSubmit}>
                {/* Size Selection */}
                {products?.colors?.length > 0 && products.colors.some(color => color.sizes && color.sizes.length > 0) && (
                  <div ref={sizeRef} className={`mb-6 p-3 rounded-xl transition-all duration-300 ${sizeError ? 'border-2 border-red-400 bg-red-50' : 'border border-transparent'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-lg font-semibold text-gray-700">
                        সাইজ সিলেক্ট করুন:
                      </label>
                      {products.size_guide_enabled && (products.size_guide_text || products.size_guide_image) && (
                        <button type="button" onClick={() => setShowSizeGuide(true)}
                          className="text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition flex items-center gap-1">
                          📐 Size Guide
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {products.colors
                        .filter((colorOption) => colorOption.id === selectedColorId)
                        .flatMap(colorOption =>
                          colorOption.sizes?.map((sizeOption) => (
                            <button
                              key={sizeOption.id}
                              type="button"
                              onClick={() => { setSelectedSize(sizeOption.size); setSizeError(''); }}
                              className={`px-4 py-2 border-2 rounded-lg transition-all transform hover:scale-105 ${
                                selectedSize === sizeOption.size
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white border-blue-600 shadow-md'
                                  : sizeError
                                    ? 'bg-white text-gray-700 border-red-400 hover:bg-red-50 hover:border-red-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                              }`}
                            >
                              {sizeOption.size}
                            </button>
                          ))
                        )}
                    </div>
                    {sizeError && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-red-500">
                        <span>⚠</span> অনুগ্রহ করে সাইজ সিলেক্ট করুন
                      </p>
                    )}
                  </div>
                )}

                {/* Size Selection for Single Product Sizes */}
                {products?.single_product_sizes?.length > 0 && (
                  <div ref={sizeRef} className={`mb-6 p-3 rounded-xl transition-all duration-300 ${sizeError ? 'border-2 border-red-400 bg-red-50' : 'border border-transparent'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-lg font-semibold text-gray-700">
                        সাইজ সিলেক্ট করুন:
                      </label>
                      {products.size_guide_enabled && (products.size_guide_text || products.size_guide_image) && (
                        <button type="button" onClick={() => setShowSizeGuide(true)}
                          className="text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition flex items-center gap-1">
                          📐 Size Guide
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {products.single_product_sizes.map((sizeOption) => (
                        <button
                          key={sizeOption.id}
                          type="button"
                          onClick={() => { setSelectedSize(sizeOption.size); setSizeError(''); }}
                          className={`px-4 py-2 border-2 rounded-lg transition-all transform hover:scale-105 ${
                            selectedSize === sizeOption.size
                              ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white border-blue-600 shadow-md'
                              : sizeError
                                ? 'bg-white text-gray-700 border-red-400 hover:bg-red-50 hover:border-red-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                          }`}
                        >
                          {sizeOption.size}
                        </button>
                      ))}
                    </div>
                    {sizeError && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-red-500">
                        <span>⚠</span> অনুগ্রহ করে সাইজ সিলেক্ট করুন
                      </p>
                    )}
                  </div>
                )}

                {/* Bulk Discounts Section */}
                {products?.bulk_discounts?.length > 0 && (
                <div className="w-full max-w-xl mt-6 bg-white p-4 rounded-xl shadow-md border border-gray-100">
               
                  <div className="space-y-3">
                    {products.bulk_discounts.map((discount, index) => {
                      const isSelected = selectedBulkDiscount?.id === discount.id;
                      const isExactQuantity = quantity === discount.offer_quantity;

                      // Price math for this tier — show what the customer pays for
                      // the whole bundle (original struck out) plus per-unit price.
                      const unitPrice  = products.discount_price ? products.discount_price : products.price;
                      const origPrice  = Math.round(unitPrice * discount.offer_quantity);
                      const finalPrice = discount.discount_type === 'fixed'
                        ? Math.round(Number(discount.fixed_price || 0))
                        : Math.round(origPrice - (origPrice * Number(discount.discount_percentage || 0)) / 100);
                      const perUnit    = Math.round(finalPrice / discount.offer_quantity);

                      return (
                        <div
                          key={index}
                          onClick={() => handleBulkDiscountSelect(discount)}
                          className={`relative overflow-hidden p-3 rounded-lg border cursor-pointer transition-all ${
                            discount.is_highlighted
                              ? 'border-amber-400 ring-2 ring-amber-300 bg-amber-50 shadow-md'
                              : isSelected && isExactQuantity
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : isExactQuantity
                                  ? 'border-green-100 bg-green-50 hover:border-green-300'
                                  : 'border-gray-200 bg-gray-50 opacity-70'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              {discount.is_highlighted && (
                                <span className="inline-block mb-1 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                                  ⭐ সেরা অফার
                                </span>
                              )}
                              <span className={`font-medium block ${
                                isSelected ? 'text-blue-800' : 'text-gray-800'
                              }`}>
                                {discount.title}
                              </span>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-lg font-bold text-green-700">৳{finalPrice}</span>
                                <span className="text-xs text-gray-400 line-through">৳{origPrice}</span>
                                <span className="text-xs text-gray-500">(প্রতিটি ৳{perUnit})</span>
                              </div>
                              {!isExactQuantity && (
                                <p className="text-xs text-red-500 mt-1">
                                  {quantity} টি সিলেক্ট করা আছে, প্রয়োজন ঠিক {discount.offer_quantity} টি
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-sm font-bold ${
                              isSelected 
                                ? 'bg-blue-100 text-blue-800'
                                : isExactQuantity
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-500'
                            }`}>
                              {discount.discount_type === 'fixed'
                                ? `৳${Math.max(0, Math.round((products.discount_price ? products.discount_price : products.price) * discount.offer_quantity - Number(discount.fixed_price || 0)))}`
                                : `${discount.discount_percentage}%`} ছাড়
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            শুধুমাত্র {discount.offer_quantity} টি অর্ডারে
                          </p>
                          {isSelected && isExactQuantity && (
                            <p className="text-xs text-blue-600 mt-1">
                              ✔️ এই অফারটি সক্রিয় আছে
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    * ডিসকাউন্ট পেতে অবশ্যই নির্দিষ্ট পরিমাণে অর্ডার করুন
                  </p>
                </div>
              )}           
                {/* Quantity Selector */}
                <div className="mb-6 mt-6">
                  <label className="block text-lg font-semibold mb-3 text-gray-700">
                    পরিমাণ:
                  </label>
                  <div className="flex items-center space-x-4 max-w-xs">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('decrement')}
                      disabled={quantity <= 1}
                      className={`px-4 py-2 rounded-lg ${
                        quantity <= 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition transform hover:scale-105`}
                    >
                      <FaMinus />
                    </button>
                    <span className="text-xl font-bold w-12 text-center bg-gray-50 py-2 rounded-lg">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('increment')}
                      disabled={qtyAtMax}
                      title={qtyAtMax ? `সর্বোচ্চ ${effectiveMaxQty}টি অর্ডার করা যাবে` : undefined}
                      className={`px-4 py-2 rounded-lg transition transform ${
                        qtyAtMax
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {qtyAtMax && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      সর্বোচ্চ <strong>{effectiveMaxQty}টি</strong> অর্ডার করা যাবে
                    </p>
                  )}
                  {selectedBulkDiscount && (
                    <p className="text-sm text-gray-500 mt-1">
                      ডিসকাউন্ট পেতে ঠিক {selectedBulkDiscount.offer_quantity} টি অর্ডার করুন
                    </p>
                  )}
                </div>
             <div className="md:flex md:justify-between mb-4 gap-4">
              <button
                type="button" // এখানে type="button" যোগ করুন
                onClick={() => handleAddToCart(products)}
                className="mt-3 w-full bg-white border-4 border-black text-black py-2 rounded-md font-medium font-semibold text-sm md:text-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <FaShoppingCart className="text-sm" />
                কার্টে যোগ করুন
              </button>
              
              {!showForm && <MotionButton
                type="button"
                onClick={handleOpenFormModal}
                className="mt-3 w-full bg-gradient-to-r from-[#fa582d] to-[#e14a20]
                          text-white py-2 rounded-md font-semibold text-sm md:text-lg
                          flex items-center justify-center gap-2 hover:opacity-90
                          transition-colors shadow-md hover:shadow-lg cursor-pointer"
                animate={{
                  x: [0, -5, 5, -5, 5, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <FaShoppingCart className="text-sm" />
                অর্ডার করুন
              </MotionButton>}
            </div>

                {/* Customer Info */}
                {showForm && <div className="space-y-6">
                  <div ref={mobileInputRef}>
                    <label className="block text-lg font-semibold mb-2 text-gray-700">
                      মোবাইল নম্বর:
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      required
                    />
                     {phoneError && (
                          <p className="text-red-500 text-sm mt-1">
                              {phoneError}
                          </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-700">
                      আপনার নাম:
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="পূর্ণ নাম লিখুন"
                      required
                    />
                  </div>

                 {/* বিভাগ সিলেক্ট */}
                  <div className="mb-4">
                    <label className="block text-lg font-semibold mb-2 text-gray-700">
                      আপনার বিভাগ সিলেক্ট করুন:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDivisionName}
                          onChange={(e) => {
                            const selectedOption = e.target.options[e.target.selectedIndex];
                            setSelectedDivision(selectedOption.id);
                            setSelectedDivisionName(selectedOption.value);
                            setSelectedDistrictName('');
                          }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                      >
                        <option value="">বিভাগ সিলেক্ট করুন</option>
                        {divisions.map((division) => (
                          <option key={division.id} id={division.id} value={division.name}>
                            {division.bn_name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* জেলা সিলেক্ট */}
                  <div className="mb-4">
                    <label className="block text-lg font-semibold mb-2 text-gray-700">
                      আপনার জেলা সিলেক্ট করুন:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDistrictName}
                        onChange={(e) => setSelectedDistrictName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                        disabled={!selectedDivision}
                      >
                        <option value="">জেলা সিলেক্ট করুন</option>
                        {districts.map((district) => (
                          <option key={district.id} value={district.name}>
                            {district.bn_name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-700">
                      আপনার গ্রাম/রোড:
                    </label>
                    <textarea
                      autoComplete="street-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="বিস্তারিত ঠিকানা (থানা, গ্রাম/রোড)"
                      rows="3"
                      required
                    />
                  </div>

                  {/* Coupon code — applies discount + optional free delivery */}
                  <CouponBox
                    apiUrl={apiUrl}
                    items={[{
                      product_id: products?.id,
                      quantity: quantity,
                      price: products?.discount_price || products?.price || 0,
                    }]}
                    phone={phone}
                    coupon={appliedCoupon}
                    onApply={setAppliedCoupon}
                    onRemove={() => setAppliedCoupon(null)}
                    className="mb-5"
                  />

                  {/* Delivery zone selector — hidden when free delivery applies
                       (bulk-qty / category / coupon). When free, district pick
                       is meaningless because the charge is forced to 0. */}
                  {!isFreeDelivery && (
                    <DeliveryCharge
                      handleDeliveryChange={handleDeliveryChange}
                      deliveryArea={districtData || []}
                      setSelectedDeliveryCharge={setDeliveryCharge}
                    />
                  )}
                  {isFreeDelivery && (
                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span>
                        এই অর্ডারে <strong>ফ্রি ডেলিভারি</strong> ({freeShipReason}) — কোনো ডেলিভারি চার্জ যোগ হবে না।
                      </span>
                    </div>
                  )}
                </div>
                }

                {/* Price Summary */}
                <div className="mt-8 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">মূল্য বিবরণী</h3>
                  
                  {products.discount_price && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">প্রকৃত মূল্য:</span>
                      <span className="text-gray-600 line-through">৳{products.price * quantity} </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">ডিস্কাউন্ট মূল্য:</span>
                    <span className="font-medium text-blue-600">
                      ৳{products.discount_price ? products.discount_price * quantity : products.price * quantity} 
                    </span>
                  </div>

                  {/* Bump Products */}
                  {products?.bumps?.filter(b => b.selected).map((bump, index) => (
                    <div key={index} className="flex justify-between items-center mb-2 text-blue-600">
                      <span>{bump.title}:</span>
                      <span>+৳{bump.bump_price}</span>
                    </div>
                  ))}

                {/* Bulk Discount */}
                {appliedDiscount && (
                  <div className="flex justify-between items-center mb-2 text-red-600">
                    <span>({appliedDiscount.title}):</span>
                    <span>
                      - ৳{Math.floor(Number(bulkDiscount || 0))}
                    </span>
                  </div>
                )}

                  {/* Coupon Discount */}
                  {appliedCoupon && !appliedCoupon.free_delivery && Number(appliedCoupon.discount) > 0 && (
                    <div className="flex justify-between items-center mb-2 text-emerald-600">
                      <span>কুপন ছাড় ({appliedCoupon.code}):</span>
                      <span>- ৳{Math.round(Number(appliedCoupon.discount))}</span>
                    </div>
                  )}

                  {/* Delivery Charge */}
                  {showForm && <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">ডেলিভারি চার্জ ({selectedDistrict}):</span>
                    <span className={`font-bold ${(isFreeDelivery || deliveryCharge === 0) ? 'text-green-600' : ''}`}>
                      {isFreeDelivery
                        ? `ফ্রি (${freeShipReason})`
                        : (deliveryCharge === 0 ? 'ফ্রি' : `৳${deliveryCharge}`)}
                    </span>
                  </div>}

                  {/* Total Price (after coupon + free-delivery adjustments) */}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-800">মোট মূল্য:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {(() => {
                        // Compute from primitives so we don't depend on whether
                        // `totalPrice` already includes delivery in the current render.
                        const subtotalNoDelivery = Math.max(
                          0,
                          Number(basePrice || 0) + Number(bumpsTotal || 0) - Number(bulkDiscount || 0)
                        );
                        const couponDisc = appliedCoupon && !appliedCoupon.free_delivery
                          ? Math.round(Number(appliedCoupon.discount || 0))
                          : 0;
                        const ship    = isFreeDelivery ? 0 : Number(deliveryCharge || 0);
                        const finalT  = Math.max(0, Math.floor(subtotalNoDelivery + (showForm ? ship : 0) - couponDisc));
                        return `৳${finalT}`;
                      })()}
                    </span>

                  </div>
                </div>
                

              {products?.bumps?.length > 0 && (
                <div className="w-full mt-4 md:mt-6 bg-white p-3 md:p-4 rounded-lg md:rounded-xl shadow-sm md:shadow-md border border-gray-100">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full p-1.5 md:p-2 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </span>
                    বিশেষ অফার
                  </h3>
                  
                  <div className="space-y-3 md:space-y-4">
                    {products.bumps.map((bump) => (
                      <div 
                        key={bump.id}
                        onClick={() => handleBumpSelect(bump.id)}
                        className={`p-3 md:p-4 rounded-md md:rounded-lg border transition-all cursor-pointer hover:shadow-sm md:hover:shadow-md ${
                          bump.selected 
                            ? 'border-blue-500 bg-blue-50 ring-1 md:ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 h-4 w-4 md:h-5 md:w-5 rounded-full border flex items-center justify-center mr-2 md:mr-3 mt-0.5 md:mt-1 ${
                            bump.selected 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'border-gray-300'
                          }`}>
                            {bump.selected && (
                              <svg className="h-2.5 w-2.5 md:h-3 md:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className={`text-sm md:text-base font-medium ${
                                bump.selected ? 'text-blue-800' : 'text-gray-800'
                              }`}>
                                {bump.title}
                              </h4>
                              <span className="bg-green-100 text-green-800 text-xs md:text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                                +৳{bump.bump_price}
                              </span>
                            </div>
                            
                            <div className="mt-1.5 md:mt-2 flex flex-col md:flex-row items-start relative">
                              {bump?.image && (
                                <ImageWrapper
                                  src={`${imageUrl}/${bump.image}`}
                                  alt={bump.title || 'Bump'}
                                  width={128}
                                  height={128}
                                  sizes="(max-width: 768px) 100vw, 128px"
                                  className="w-full md:w-32 h-auto md:h-32 object-cover rounded-md mr-0 md:mr-3 mb-2 md:mb-0"
                                />
                              )}
                              <p className="text-xs md:text-sm text-gray-600">{bump.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs md:text-sm text-gray-500 mt-2 md:mt-3">
                    * বিশেষ অফারের পণ্যগুলো আপনার অর্ডারে যোগ করতে চাইলে ক্লিক করুন
                  </p>
                </div>
              )}

                {renderPaymentMethods()}

                {/* Inline submit error (e.g. IP limit reached) */}
                {submitError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
                  >
                    <FaInfoCircle className="shrink-0 mt-0.5 text-red-500" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Order Button */}
              { showForm && <button
                  type="submit"
                  id="confirm-order-btn"
                  disabled={isSubmitting}
                  className={`w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 transition-all transform hover:scale-[1.01] flex items-center justify-center space-x-2 text-lg font-bold shadow-lg hover:shadow-xl ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      প্রসেসিং...
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="text-xl" />
                      <span>অর্ডার নিশ্চিত করুন</span>
                    </>
                  )}
                </button>}

                {/* Delivery Info */}
                <div className="mt-4 flex items-center justify-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <FaTruck className="mr-2 text-blue-500" />
                  <span className="font-medium">
                    {selectedDistrict 
                      ? `${selectedDistrict}-এ আনুমানিক ডেলিভারি সময়: ${estimatedDays} কার্যদিবস`
                      : 'দ্রুত ডেলিভারি - ২৪ থেকে ৭২ ঘন্টার মধ্যে'
                    }
                  </span>
                </div>
              </form>
            </div>
          </div>
         
        </div>

        {/* Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed right-6 bottom-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10 flex items-center justify-center"
        >
          <FaShoppingCart className="text-xl" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>

        {/* Cart Panel */}
        <CartPanel
          isOpen={isCartOpen}
          toggleCart={() => setIsCartOpen(false)}
          cartItems={items}
          removeFromCart={removeItem}
          updateQuantity={updateItemQuantity}
        />

        {/* ── Reviews Section ──────────────────────────────────────────────── */}
        {products?.id && products?.reviews_enabled && (
          <>
            <ReviewsSection productId={products.id} apiUrl={apiUrl} />
            <ReviewNotifications productId={products.id} apiUrl={apiUrl} />
          </>
        )}

        <Suspense fallback={<div>Loading related products...</div>}>
          <RelatedProducts
            filterAllProducts={filterAllProducts}
            imageUrl={imageUrl}
          />
        </Suspense>
      </main>
    </div>
  );
};

export default OrderPageClient;