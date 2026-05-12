'use client';

import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { config } from '@/config/config';

export const ProductContext = createContext();

export default function ProductProvider({ children }) {
  const apiUrl = config.apiUrl;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [pixel, setPixel] = useState([]);
  const [footerMenus, setFooterMenus] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [logo, setLogo] = useState({});
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [testEventCode, setTestEventCode] = useState([]);
  const [isPurchase, setIsPurchase] = useState(false);

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(false);

  const fetchAllData = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiUrl}/homepage-data`, {
        signal: abortControllerRef.current.signal
      });

      if (response.data.success) {
        const data = response.data.data;

        if (isMountedRef.current) {
          setProducts(data.products || []);
          setCategories(data.categories || []);
          setBanners(data.banners || []);
          setFooterMenus(data.footer_menus || []);
          setContactInfo(data.contact_info || {});
          setLogo(data.logo || {});
          setSocialLinks(data.social_links || []);

          const pixelList = data.pixels || [];
          setPixel(pixelList.map((p) => p.pixel_id));
          setTestEventCode(pixelList.map((p) => p.test_event_code));
          setIsPurchase(pixelList.length > 0 ? (pixelList[0].is_purchase ?? false) : false);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      if (isMountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchAllData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [apiUrl]);

  const filterProductsByCategory = (categoryId) => {
    const filtered = products.filter(
      (product) => product.category_id === categoryId
    );
    setFilteredProducts(filtered);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        categories,
        pixel,
        testEventCode,
        isPurchase,
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
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}