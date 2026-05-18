"use client";

import { createContext, useState, useCallback, useContext, useMemo, useRef } from "react";
import { ProductContext } from "./ProductsContext";
import { config } from "@/config/config";

export const HeaderContext = createContext();

export default function HeaderProvider({ children }) {
  const {
    products,
    categories,
    contactInfo,
    logo: logoObj,
    socialLinks,
    footerMenus: allMenus,
    loading,
    error,
  } = useContext(ProductContext);

  const imageUrl = config.imageUrl;
  const apiStorageUrl = config.apiStorageUrl;

  const [searchProducts, setSearchProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const allProductsRef = useRef([]);
  allProductsRef.current = products;

  const logo = useMemo(() => {
    if (!logoObj) return "";
    if (typeof logoObj === "string") return logoObj;
    return logoObj.logo || "";
  }, [logoObj]);

  const headerMenus = useMemo(
    () =>
      (allMenus || [])
        .filter((m) => m.menu_type === "header")
        .sort((a, b) => a.order - b.order),
    [allMenus]
  );

  const footerMenus = useMemo(
    () =>
      (allMenus || [])
        .filter((m) => m.menu_type === "footer")
        .sort((a, b) => a.order - b.order),
    [allMenus]
  );

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

  return (
    <HeaderContext.Provider
      value={{
        categories,
        contactInfo,
        logo,
        socialLinks: (socialLinks || []).filter((s) => s.status === 1),
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
        refetchData: () => {},
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
