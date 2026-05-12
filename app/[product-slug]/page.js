'use client';

import React, { Suspense, useContext, useEffect, useMemo, useState, useCallback, useRef, use } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaShoppingCart, FaMinus, FaPlus, FaTruck, FaInfoCircle } from 'react-icons/fa';
import { OrderContext } from '../context/OrderContext';
import axios from 'axios';
import { HeaderContext } from '../context/HeaderContext';
import { ProductContext } from '../context/ProductsContext';
import { trackBrowserEvent, sendCAPIEvent, generateEventId } from '../lib/pixel';
import { track } from '../lib/tracking';
import bdLocations from '../data/locations';
import { useCart } from 'react-use-cart';
import { motion } from "framer-motion";
import CartPanel from '../components/CartPanel';

// Lazy load components - commented out as components don't exist
// const DistrictSelector = lazy(() => import('../components/OrderPage/DistrictSelector'));
// const RelatedProducts = lazy(() => import('../components/OrderPage/RelatedProducts'));

// Placeholder components
const DistrictSelector = () => null;
const RelatedProducts = ({ filterAllProducts, imageUrl }) => null;

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


// Image wrapper - using regular img tag for simplicity
const ImageWrapper = ({ src, alt, className, style, width, height }) => {
  const [isError, setIsError] = useState(false);

  if (!src || isError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center rounded-lg ${className}`}
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
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      style={style}
      onError={() => setIsError(true)}
    />
  );
};

const SimpleImageZoom = ({ src, alt, className, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // If no src, show placeholder
  if (!src) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center rounded-lg ${className}`} 
        style={style}
      >
        <div className="text-gray-400 text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">ইমেজ পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ImageWrapper
        src={src}
        alt={alt}
        fill
        className="w-full h-auto object-contain"
        style={{
          transform: isHovered ? 'scale(1.8)' : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`
        }}
      />
    </div>
  );
};



const OrderPage = ({ params }) => {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
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
    estimatedDays,
    filterAllProducts,
    setName,
    setAddress,
    setPhone,
    setSelectedSize,
    handleColorSelect,
    handleQuantityChange,
    calculatePrices,
    selectedDistrict,
    deliveryNote,
    handleBulkDiscountSelect,
    selectedBulkDiscount,
    handleBumpSelect,
    fetchProductDetails
  } = useContext(OrderContext);

  const { loading: headerLoading } = useContext(HeaderContext);
  const { pixel, testEventCode } = useContext(ProductContext);

  // Debug: Log image state
  console.log('[OrderPage] currentImage:', currentImage);
  console.log('[OrderPage] products.colors:', products?.colors);
  console.log('[OrderPage] products.images:', products?.images);

  const [dataSaved, setDataSaved] = useState(false);

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
  const { basePrice, productPrice, totalPrice, appliedDiscount } = calculatePrices();


  const [isCartOpen, setIsCartOpen] = useState(false);
 const { items, totalItems, addItem, updateItemQuantity, removeItem, setItems } = useCart();

  const [codAdvance, setCodAdvance] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [showForm, setShowForm] = useState(false);

   const randomNumber = `HA${Math.floor(1000 + Math.random() * 90000)}`;
   const eventTime = Math.floor(Date.now() / 1000);

  // Create API service instance
  const apiService = useMemo(() => createApiService(), []);

  // Debounced phone number for validation
  const debouncedPhone = useDebounce(phone, 500);

  // Fetch data using custom hooks
  const { data: codAdvanceData } = useApiData(`${apiUrl}/codadvances`);
  
  // Memoized values
  const priceDetails = useMemo(() => calculatePrices(), [
    products,
    quantity,
    selectedBulkDiscount,
    deliveryCharge
  ]);


 const mobileInputRef = useRef(null);
 const sizeRef        = useRef(null);

 const [phoneError, setPhoneError] = useState("");
 const [sizeError, setSizeError]   = useState('');

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

// Own tracking — page_view fires once per session per slug
useEffect(() => {
  if (slug) track('page_view', slug);
}, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

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
  track('checkout_view', slug);
  
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

  // Fetch product details when slug changes
  useEffect(() => {
    if (slug) {
      fetchProductDetails(slug);
    }
  }, [slug, fetchProductDetails]);

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
          const randomNumber = `A2C${Math.floor(1000 + Math.random() * 900000)}`;
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
      product_name: products?.name,
      color: selectedColor || "",
      size: selectedSize || "",
      quantity,
      delivery_charge: deliveryCharge,
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
      items: orderItems
    };

  

    if (!navigator.onLine) {
      alert('আপনার ইন্টারনেট সংযোগ নেই। দয়া করে ইন্টারনেট সংযোগ চেক করুন এবং আবার চেষ্টা করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      await fetchWithRetry(() => apiService.post(`${apiUrl}/customers`, orderDetails, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }));

      setDataSaved(true);
      track('order', slug);
      window.location.href = `/thankyou/${randomNumber}`;
      
    } catch (error) {
      let errorMessage = 'অর্ডার সাবমিশন ব্যর্থ হয়েছে';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'সার্ভারে রেসপন্স দিতে দেরি হচ্ছে। দয়া করে পরে আবার চেষ্টা করুন';


      }

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



  if (loading || headerLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
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
                    className="prose max-w-none text-gray-700"
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
                        className="prose prose-sm max-w-none text-gray-700"
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
                    <label className="block text-lg font-semibold mb-3 text-gray-700">
                      সাইজ সিলেক্ট করুন:
                    </label>
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
                    <label className="block text-lg font-semibold mb-3 text-gray-700">
                      সাইজ সিলেক্ট করুন:
                    </label>
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
                      
                      return (
                        <div 
                          key={index} 
                          onClick={() => handleBulkDiscountSelect(discount)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected && isExactQuantity
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : isExactQuantity
                                ? 'border-green-100 bg-green-50 hover:border-green-300'
                                : 'border-gray-200 bg-gray-50 opacity-70'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className={`font-medium ${
                                isSelected ? 'text-blue-800' : 'text-gray-800'
                              }`}>
                                {discount.title}
                              </span>
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
                              {discount.discount_percentage}% ছাড়
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
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition transform hover:scale-105"
                    >
                      <FaPlus />
                    </button>
                  </div>
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
              
              {!showForm && <motion.button
                type="button" // এখানে type="button" যোগ করুন  
                onClick={handleOpenFormModal}
                className="mt-3 w-full bg-gradient-to-r from-[#fa582d] to-[#e14a20] 
                          text-white py-2 rounded-md font-semibold text-sm md:text-lg 
                          flex items-center justify-center gap-2 hover:opacity-90 
                          transition-colors shadow-md hover:shadow-lg"
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
              </motion.button>}
            </div>

                {/* Customer Info */}
                {showForm && <div className="space-y-6">
                  <div ref={mobileInputRef}>
                    <label className="block text-lg font-semibold mb-2 text-gray-700">
                      মোবাইল নম্বর:
                    </label>
                    <input
                      type="tel"
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
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="বিস্তারিত ঠিকানা (থানা, গ্রাম/রোড)"
                      rows="3"
                      required
                    />
                  </div>

                  {/* District Selector */}
                  <Suspense fallback={<div>Loading...</div>}>
                    <DistrictSelector />
                  </Suspense>
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
                      - ৳{
                        Math.floor(
                          ((products.discount_price ? products.discount_price : products.price) * quantity * appliedDiscount.discount_percentage) / 100
                        )
                      }
                    </span>
                  </div>
                )}

                  {/* Delivery Charge */}
                  {showForm && <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">ডেলিভারি চার্জ ({selectedDistrict}):</span>
                    <span className={`font-bold ${deliveryCharge === 0 ? 'text-green-600' : ''}`}>
                      {deliveryCharge === 0 ? 'ফ্রি' : `৳${deliveryCharge}`}
                    </span>
                  </div>}

                  {/* Total Price */}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-800">মোট মূল্য:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {showForm 
                        ? `৳${Math.floor(totalPrice)}` 
                        : `৳${Math.floor((totalPrice - deliveryCharge))}`
                      }
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

                {/* Order Button */}
              { showForm && <button
                  type="submit"
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

export default OrderPage;