"use client";

import { createContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { config } from "@/config/config";

export const HeaderContext = createContext();

export default function HeaderProvider({ children }) {

  const apiUrl = config.apiUrl;
  const imageUrl = config.imageUrl;
  const apiStorageUrl = config.apiStorageUrl;

  const [categories, setCategories] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [logo, setLogo] = useState("");
  const [headerMenus, setHeaderMenus] = useState([]);
  const [footerMenus, setFooterMenus] = useState([]);
  const [socialLinks, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchProducts, setSearchProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const allProductsRef = useRef([]);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(false);

  const fetchHeaderData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {

      const response = await axios.get(`${apiUrl}/homepage-data`, {
        signal: abortControllerRef.current.signal
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to load");
      }

      const data = response.data.data;

      if (isMountedRef.current) {
        setCategories(data.categories || []);
        setContactInfo(data.contact_info || {});
        setLogo(data.logo?.logo || data.logo || "");

        setSocials(
          (data.social_links || []).filter((s) => s.status === 1)
        );

        const allMenus = data.footer_menus || [];

        setHeaderMenus(
          allMenus
            .filter((m) => m.menu_type === "header")
            .sort((a, b) => a.order - b.order)
        );

        setFooterMenus(
          allMenus
            .filter((m) => m.menu_type === "footer")
            .sort((a, b) => a.order - b.order)
        );

        allProductsRef.current = data.products || [];
      }

    } catch (err) {
      if (axios.isCancel(err)) return;
      if (isMountedRef.current) {
        setError(err.message || "An error occurred");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }

  }, [apiUrl]);

  const handleSearch = useCallback((searchText) => {

    if (!searchText || !searchText.trim()) {
      setSearchProducts([]);
      setShowResults(false);
      return;
    }

    const lower = searchText.toLowerCase();

    const filtered = allProductsRef.current.filter((p) =>
      p.name.toLowerCase().includes(lower)
    );

    setSearchProducts(filtered);
    setShowResults(true);

  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchHeaderData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchHeaderData]);

  return (
    <HeaderContext.Provider
      value={{
        categories,
        contactInfo,
        logo,
        socialLinks,
        headerMenus,
        footerMenus,
        loading,
        error,
        imageUrl,
        apiStorageUrl,
        searchProducts,
        showResults,
        handleSearch,
        setShowResults,
        refetchData: fetchHeaderData,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}