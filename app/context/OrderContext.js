'use client';

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { config } from '@/config/config';

export const OrderContext = createContext();

export default function OrderProvider({ children }) {
  const apiUrl = config.apiUrl;
  const imageUrl = config.imageUrl;

  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [homepage, setHomepage] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [pixel, setPixel] = useState(null);
  const [filterAllProducts, setAllFilterProducts] = useState([]);
  const [products, setProducts] = useState({
    images: [],
    colors: [],
    name: '',
    price: 0,
    discount_price: null,
    clothing: 0,
    bumps: [],
  });

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('ঢাকা');
  const [estimatedDays, setEstimatedDays] = useState('3-5');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [selectedBulkDiscount, setSelectedBulkDiscount] = useState(null);
  const [autoAppliedDiscount, setAutoAppliedDiscount] = useState(null);

  const fetchInitialData = useCallback(async () => {
    try {
      const districtsRes = await axios.get(`${apiUrl}/deliverycharges`);
      const districtsData = Array.isArray(districtsRes.data) ? districtsRes.data : [];
      setDistricts(districtsData);

      const defaultDistrict =
        districtsData.find((d) => d.district_name?.includes('ঢাকা')) ||
        districtsData[0];
      if (defaultDistrict) {
        setSelectedDistrict(defaultDistrict.district_name);
        setDeliveryCharge(defaultDistrict.delivery_charge);
        setEstimatedDays(defaultDistrict.estimated_days);
        setDeliveryNote(defaultDistrict.delivery_note || '');
      }
    } catch (error) {
      // Non-fatal — page still renders, user picks district manually
      console.error('[OrderContext] fetchInitialData error:', error);
    }
  }, [apiUrl]);

  // Apply product data to local state. Used by both SSR hydration (Phase 2)
  // and the client-side fetchProductDetails fallback.
  const applyProductData = useCallback((productData) => {
    if (!productData) return;

    const initializedBumps = (productData?.bumps || []).map((bump) => ({
      ...bump,
      selected: false,
    }));

    setProducts({ ...productData, bumps: initializedBumps });
    setHomepage(productData?.homepage);

    if (productData?.colors?.length > 0 && productData.colors[0]?.image) {
      const firstColor = productData.colors[0];
      setSelectedColor(firstColor.color);
      setCurrentImage(firstColor.image);
      setSelectedColorId(firstColor.id);
    } else if (productData?.images?.length > 0 && productData.images[0]?.image) {
      setCurrentImage(productData.images[0].image);
    }
  }, []);

  // Background fetch for the "Related Products" rail. Below-the-fold, so deferred.
  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/products`);
      const list = res.data?.data || res.data;
      setAllFilterProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      // Non-fatal — related products simply won't render
      console.error('[OrderContext] fetchAllProducts error:', err);
    }
  }, [apiUrl]);

  // SSR-hydration entry point. Called by OrderPageClient when the server has
  // already delivered the product, eliminating the duplicate /products/{slug} fetch.
  const hydrateProduct = useCallback((productData) => {
    applyProductData(productData);
    setLoading(false);
  }, [applyProductData]);

  // Client-side fallback for navigations without SSR (e.g., next/link to a product
  // before the route is prefetched). Kept for back-compat.
  const fetchProductDetails = useCallback(async (slug) => {
    try {
      setLoading(true);

      const [productResponse, allProductsResponse] = await Promise.all([
        axios.get(`${apiUrl}/products/${slug}`),
        axios.get(`${apiUrl}/products`),
      ]);

      const productData = productResponse.data?.data || productResponse.data;
      const allProducts = allProductsResponse.data?.data || allProductsResponse.data;

      applyProductData(productData);
      setAllFilterProducts(Array.isArray(allProducts) ? allProducts : []);
    } catch (err) {
      console.error('[OrderContext] Error fetching product:', err);
      if (err.response?.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await fetchProductDetails(slug);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [apiUrl, applyProductData]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleColorSelect = (color, image, colorId) => {
    setSelectedColor(color);
    setCurrentImage(image);
    setSelectedColorId(colorId);
    setSelectedSize('');
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity((prev) => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const calculatePrices = () => {
    const districtList = Array.isArray(districts) ? districts : [];
    const selectedDistrictData = districtList.find((d) => d.district_name === selectedDistrict);

    const currentDeliveryCharge = selectedDistrictData
      ? parseFloat(selectedDistrictData.delivery_charge)
      : 0;

    const basePrice = (products.discount_price ? products.discount_price : products.price) * quantity;

    const bumpsTotal = products?.bumps
      ?.filter((b) => b.selected)
      .reduce((sum, bump) => sum + Number(bump.bump_price), 0);

    let appliedDiscount = null;
    const bulkDiscount =
      products?.bulk_discounts?.length > 0
        ? (() => {
            const found = products.bulk_discounts.find((d) => quantity === d.offer_quantity);
            appliedDiscount = found;
            return found ? Math.floor((basePrice * found.discount_percentage) / 100) : 0;
          })()
        : 0;

    const totalPrice = Math.floor(basePrice + bumpsTotal - bulkDiscount + currentDeliveryCharge);

    return {
      basePrice,
      bumpsTotal,
      bulkDiscount,
      totalPrice,
      appliedDiscount,
      deliveryCharge: currentDeliveryCharge,
      estimatedDays: selectedDistrictData?.estimated_days || '3-5',
      deliveryNote: selectedDistrictData?.delivery_note || '',
    };
  };

  const handleBulkDiscountSelect = (discount) => {
    setSelectedBulkDiscount(discount);
    setQuantity(discount.offer_quantity);
  };

  const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    const districtData = districts.find((d) => d.district_name === districtName);
    if (districtData) {
      setDeliveryCharge(districtData.delivery_charge);
      setEstimatedDays(districtData.estimated_days);
      setDeliveryNote(districtData.delivery_note || '');
    }
  };

  const handleBumpSelect = useCallback((bumpId) => {
    setProducts((prev) => {
      const updatedBumps = prev.bumps.map((bump) =>
        bump.id === bumpId ? { ...bump, selected: !bump.selected } : bump
      );
      return { ...prev, bumps: updatedBumps };
    });
  }, []);

  return (
    <OrderContext.Provider
      value={{
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
        pixel,
        filterAllProducts,
        setName,
        setAddress,
        setPhone,
        setSelectedSize,
        handleColorSelect,
        handleQuantityChange,
        calculatePrices,
        handleDistrictChange,
        districts,
        selectedDistrict,
        estimatedDays,
        deliveryNote,
        setDeliveryNote,
        selectedBulkDiscount,
        handleBulkDiscountSelect,
        autoAppliedDiscount,
        setAutoAppliedDiscount,
        handleBumpSelect,
        fetchProductDetails,
        hydrateProduct,
        fetchAllProducts,
        setSelectedDistrict,
        setEstimatedDays,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);