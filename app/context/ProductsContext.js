'use client';

import React, { createContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { config } from '@/config/config';

export const ProductContext = createContext();

const CACHE_KEY     = 'homepage-data-cache-v1';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes — homepage stays cached across refresh

/**
 * Read cached homepage-data from localStorage if fresh; otherwise null.
 * Lets the storefront paint instantly on refresh and survives back-navigation
 * after order completion without waiting for /homepage-data round-trip.
 */
function readCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.at || Date.now() - parsed.at > CACHE_MAX_AGE) return null;
    return parsed.payload;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), payload }));
  } catch { /* quota / private mode — safe to ignore */ }
}

export default function ProductProvider({ children, seed: serverSeed = null }) {
  const apiUrl = config.apiUrl;

  // Prefer server-rendered data (passed from the root layout) so the banner +
  // product grid are in the INITIAL HTML — fast LCP, no loading→content shift.
  // Falls back to the client localStorage cache (return visits), then null.
  // Using the SAME value on server + client keeps hydration consistent.
  const seed = serverSeed || (typeof window === 'undefined' ? null : readCache());

  const [products, setProducts]         = useState(seed?.products  || []);
  const [categories, setCategories]     = useState(seed?.categories || []);
  const [banners, setBanners]           = useState(seed?.banners    || []);
  const [pixel, setPixel]               = useState(seed?.pixel      || []);
  const [footerMenus, setFooterMenus]   = useState(seed?.footer_menus || []);
  const [contactInfo, setContactInfo]   = useState(seed?.contact_info || {});
  const [logo, setLogo]                 = useState(seed?.logo || {});
  const [socialLinks, setSocialLinks]   = useState(seed?.social_links || []);
  const [loading, setLoading]           = useState(!seed);
  const [error, setError]               = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [testEventCode, setTestEventCode] = useState(seed?.testEventCode || []);
  const [isPurchase, setIsPurchase]       = useState(seed?.isPurchase || false);
  const [trackingConfigReady, setTrackingConfigReady] = useState(false);

  const abortControllerRef = useRef(null);
  const isMountedRef       = useRef(false);
  // True once we have usable data (server seed or a successful fetch). Used so a
  // LATER transient failure (e.g. mobile waking from idle) never wipes the UI.
  const hasDataRef         = useRef(!!seed);

  const fetchAllData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setError(null);
      const response = await axios.get(`${apiUrl}/homepage-data`, {
        signal: abortControllerRef.current.signal,
      });
      if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch data');

      const data = response.data.data;
      const pixelList = data.pixels || [];
      const pixelIds = pixelList.map((p) => p.pixel_id);
      const testCodes = pixelList.map((p) => p.test_event_code);
      const purchase = pixelList.length > 0 ? (pixelList[0].is_purchase ?? false) : false;

      if (!isMountedRef.current) return;

      setProducts(data.products || []);
      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setFooterMenus(data.footer_menus || []);
      setContactInfo(data.contact_info || {});
      setLogo(data.logo || {});
      setSocialLinks(data.social_links || []);
      setPixel(pixelIds);
      setTestEventCode(testCodes);
      setIsPurchase(purchase);
      setTrackingConfigReady(true);
      hasDataRef.current = true;

      writeCache({
        products: data.products || [],
        categories: data.categories || [],
        banners: data.banners || [],
        footer_menus: data.footer_menus || [],
        contact_info: data.contact_info || {},
        logo: data.logo || {},
        social_links: data.social_links || [],
        pixel: pixelIds,
        testEventCode: testCodes,
        isPurchase: purchase,
      });
    } catch (err) {
      if (axios.isCancel(err)) return;
      // Only surface a blocking error on the FIRST load (no data yet). A
      // transient failure during background revalidation must NOT wipe the
      // header/nav — keep the cached/seeded data (stale-while-revalidate).
      if (isMountedRef.current && !hasDataRef.current) setError(err.message);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    isMountedRef.current = true;
    // If we already have cached data we still revalidate in the background
    // (stale-while-revalidate) without blocking the UI.
    fetchAllData();
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [fetchAllData]);

  // Recover when the connection returns or the tab is re-opened (common on
  // mobile after the page sat idle): clear any error and refresh in the
  // background. Without this, a one-off network blip left a stale error showing.
  useEffect(() => {
    const recover = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setError(null);
      fetchAllData();
    };
    const onVisible = () => { if (document.visibilityState === 'visible') recover(); };
    window.addEventListener('online', recover);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', recover);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchAllData]);

  const filterProductsByCategory = useCallback((categoryId) => {
    setFilteredProducts((_) => products.filter((p) => p.category_id === categoryId));
  }, [products]);

  // Memoized value — prevents every consumer from re-rendering on each
  // ProductProvider render when nothing they care about changed.
  const value = useMemo(() => ({
    products,
    filteredProducts,
    categories,
    pixel,
    testEventCode,
    isPurchase,
    trackingConfigReady,
    banners,
    loading,
    setLoading,
    error,
    footerMenus,
    contactInfo,
    logo,
    socialLinks,
    filterProductsByCategory,
    refetchData: fetchAllData,
    apiUrl,
  }), [
    products, filteredProducts, categories, pixel, testEventCode, isPurchase, trackingConfigReady,
    banners, loading, error, footerMenus, contactInfo, logo, socialLinks,
    filterProductsByCategory, fetchAllData, apiUrl,
  ]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
