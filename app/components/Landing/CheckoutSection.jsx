import React, {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderContext } from "../../context/OrderContext";
import { ProductContext } from "../../context/ProductsContext";
import bdLocations from "../../data/locations";
import { useParams } from "next/navigation";
import { trackBrowserEvent, sendCAPIEvent, generateEventId } from "@/pixel";
import { track } from "../../lib/tracking";
import DeliveryCharge from "./DeliveryCharge";
import {
  ShoppingCart, Phone, User, MapPin, Map, Building2, CheckCircle2,
  Truck, Shield, RotateCcw, Star, Zap, Package,
  BadgeCheck, ChevronDown, Plus, Minus, Tag, Gift,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cls = (...parts) => parts.filter(Boolean).join(" ");

// Animated shake for the submit button
const shakeAnimation = `
  @keyframes softShake {
    0%,100% { transform: translateX(0); }
    15%     { transform: translateX(-4px); }
    30%     { transform: translateX(4px); }
    45%     { transform: translateX(-3px); }
    60%     { transform: translateX(3px); }
    75%     { transform: translateX(-2px); }
    90%     { transform: translateX(2px); }
  }
  .cta-shake { animation: softShake 2.2s ease-in-out infinite; }
  .cta-pulse-ring::after {
    content:''; position:absolute; inset:-4px; border-radius:inherit;
    border: 2px solid rgba(16,185,129,0.5);
    animation: pulseRing 1.8s ease-out infinite;
  }
  @keyframes pulseRing {
    0%   { opacity:1; transform:scale(1); }
    100% { opacity:0; transform:scale(1.08); }
  }
  @keyframes sizeErrPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,.45); }
    50%     { box-shadow: 0 0 0 7px rgba(239,68,68,.08); }
  }
  .size-err-ring { animation: sizeErrPulse .85s ease-in-out 3; }
`;

// ─── Live Viewer Count (cosmetic urgency) ─────────────────────────────────────
const useLiveViewers = () => {
  const [count, setCount] = useState(() => 12 + Math.floor(Math.random() * 18));
  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.min(45, Math.max(8, prev + delta));
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);
  return count;
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, required, error, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error  && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><span>⚠</span>{error}</p>}
    {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

// ─── Input/Select base styles ─────────────────────────────────────────────────
const inputCls = (hasErr) => cls(
  "w-full px-4 py-3 rounded-xl border-2 text-gray-800 placeholder-gray-400",
  "text-base focus:outline-none transition-all duration-200",
  "bg-gray-50 focus:bg-white",
  hasErr
    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
);

// ─── Qty stepper ──────────────────────────────────────────────────────────────
const QtyBtn = ({ onClick, children, disabled }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200
               text-gray-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50
               active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CheckoutSection
// ══════════════════════════════════════════════════════════════════════════════
const CheckoutSection = ({ isModal = false, noVariants = false, onClose }) => {
  // ── Contexts ────────────────────────────────────────────────────────────────
  const {
    apiUrl, imageUrl,
    name, address, phone,
    deliveryCharge, setDeliveryCharge,
    estimatedDays, setEstimatedDays,
    selectedDistrict, setSelectedDistrict,
    deliveryNote,
    setName, setAddress, setPhone,
    districts: districtData,
  } = useContext(OrderContext);

  const { pixel, testEventCode } = useContext(ProductContext);

  // ── Local state ─────────────────────────────────────────────────────────────
  const [price, setPrice]                           = useState(0);
  const [selectedDeliveryCharge, setSelectedDeliveryCharge] = useState(0);
  const [deliveryArea, setDeliveryArea]             = useState([]);
  const [qty, setQty]                               = useState(1);
  const [bumps, setBumps]                           = useState([]);
  const [selectedBumps, setSelectedBumps]           = useState([]);
  const [selectedBulkDiscount, setSelectedBulkDiscount] = useState(null);
  const [selectedColor, setSelectedColor]           = useState(null);
  const [selectedSize, setSelectedSize]             = useState(null);
  const [selectedSingleSize, setSelectedSingleSize] = useState(null);
  const [loading, setLoading]                       = useState(false);
  const [error, setError]                           = useState(null);
  const [data, setData]                             = useState(null);
  const { slug }                                    = useParams();
  const [orderId]                                   = useState(`HA${Math.floor(1000 + Math.random() * 90000)}`);
  const [isSubmitting, setIsSubmitting]             = useState(false);
  const [divisions, setDivisions]                   = useState([]);
  const [districts, setDistricts]                   = useState([]);
  const [selectedDivision, setSelectedDivision]     = useState('');
  const [selectedDivisionName, setSelectedDivisionName] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [checkoutTracked, setCheckoutTracked]       = useState(false);
  const [phoneError, setPhoneError]                 = useState('');
  const [showMobileSticky, setShowMobileSticky]     = useState(false);

  const viewers        = useLiveViewers();
  const formRef        = useRef(null);
  const submitLockRef  = useRef(false); // hard ref lock prevents race-condition double submit
  const sizeRef        = useRef(null);
  const sectionRef     = useRef(null);
  const checkoutViewFired = useRef(false);
  const [sizeError, setSizeError]               = useState('');

  // ── Derived totals ───────────────────────────────────────────────────────────
  const bumpPriceTotal = selectedBumps.reduce((s, b) => s + Number(b.bump_price), 0);

  const bulkDiscountAmount = useMemo(() => {
    if (selectedBulkDiscount && qty === selectedBulkDiscount.offer_quantity) {
      return Math.round((price * qty * selectedBulkDiscount.discount_percentage) / 100);
    }
    return 0;
  }, [price, qty, selectedBulkDiscount]);

  const subtotal  = Math.round(price * qty - bulkDiscountAmount);
  const total     = Math.round(subtotal + Number(selectedDeliveryCharge || 0) + bumpPriceTotal);

  // ── Fetch landing page data + delivery charges in parallel ──────────────────
  useEffect(() => {
    let cancelled = false;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    console.log('API_BASE:', API_BASE);

    (async () => {
      try {
        setLoading(true);

        // Fetch landing page
        const pageResponse = await fetch(`${API_BASE}/landing-pages/offer/${slug}`);
        const pageRes = await pageResponse.json();
        console.log('Page response:', pageRes);

        // Fetch delivery charges
        const chargesResponse = await fetch(`${API_BASE}/deliverycharges`);
        const chargesRes = await chargesResponse.json();
        console.log('Charges response:', chargesRes);

        if (cancelled) return;

        const d = pageRes?.data;
        setData(d);
        setPrice(d?.product?.discount_price || d?.product?.price || 0);

        // Handle both array and object response formats
        let areas = [];
        if (Array.isArray(chargesRes)) {
          areas = chargesRes;
        } else if (chargesRes?.data && Array.isArray(chargesRes.data)) {
          areas = chargesRes.data;
        }
        console.log('Setting delivery areas:', areas);
        setDeliveryArea(areas);
      } catch (err) {
        console.error('Fetch error:', err);
        if (!cancelled) setError('ডেটা লোড করতে সমস্যা হয়েছে।');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Populate bumps from product ──────────────────────────────────────────────
  useEffect(() => {
    if (data?.product?.bumps) {
      setBumps(data.product.bumps.map(b => ({ ...b, selected: false })));
    }
  }, [data]);

  // ── Load BD divisions ────────────────────────────────────────────────────────
  useEffect(() => {
    setDivisions(bdLocations.map(div => ({
      id: div.division.en, name: div.division.en, bn_name: div.division.bn,
    })));
  }, []);

  useEffect(() => {
    if (!selectedDivision) { setDistricts([]); return; }
    const found = bdLocations.find(d => d.division.en === selectedDivision);
    if (found) setDistricts(found.districts.map(d => ({ id: d.en, name: d.en, bn_name: d.bn })));
  }, [selectedDivision]);

  // ── Show mobile sticky CTA after scroll (skip inside modal) ─────────────────
  useEffect(() => {
    if (isModal) return;
    const onScroll = () => setShowMobileSticky(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isModal]);

  // ── ViewContent tracking ─────────────────────────────────────────────────────
  const viewContentFired = useRef(false);
  useEffect(() => {
    if (!data?.product || !pixel?.length || viewContentFired.current) return;
    viewContentFired.current = true;

    const eventId     = generateEventId('VC');
    const productPrice = Math.round(data.product.discount_price || data.product.price);
    const customData  = {
      content_ids:  [String(data.product.id)],
      contents:     [{ id: String(data.product.id), quantity: 1, item_price: productPrice }],
      content_name: data.product.name,
      content_type: 'product',
      value:        productPrice,
      currency:     'BDT',
      event_source_url: window.location.href,
      external_id:  orderId,
    };
    trackBrowserEvent(pixel, 'ViewContent', customData, eventId);
    sendCAPIEvent(apiUrl, 'ViewContent', customData, {}, eventId, testEventCode);
  }, [data?.product, pixel]);

  // ── Own checkout_view tracking (fires once when #order section becomes visible)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !slug) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !checkoutViewFired.current) {
          checkoutViewFired.current = true;
          track('checkout_view', slug);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── InitiateCheckout ─────────────────────────────────────────────────────────
  const fireInitiateCheckout = useCallback(() => {
    if (checkoutTracked) return;
    setCheckoutTracked(true);

    const eventId     = generateEventId('IC');
    const finalValue  = Math.round(subtotal + bumpPriceTotal);
    const customData  = {
      value:        finalValue,
      currency:     'BDT',
      content_name: data?.product?.name,
      content_type: 'product',
      content_ids:  [String(data?.product?.id), ...selectedBumps.map(b => `bump_${b.id}`)],
      contents:     [
        { id: String(data?.product?.id), quantity: qty, item_price: Math.round(price) },
        ...selectedBumps.map(b => ({ id: `bump_${b.id}`, quantity: 1, item_price: Math.round(b.bump_price) })),
      ],
      event_source_url: window.location.href,
      external_id:  orderId,
    };
    const userData = { phone: phone?.startsWith('0') ? `88${phone}` : phone };

    trackBrowserEvent(pixel, 'InitiateCheckout', customData, eventId);
    sendCAPIEvent(apiUrl, 'InitiateCheckout', customData, userData, eventId, testEventCode);
  }, [checkoutTracked, subtotal, bumpPriceTotal, data, selectedBumps, qty, price, orderId, phone, pixel, apiUrl, testEventCode]);

  const handleFormInteraction = () => {
    if (checkoutTracked || !phone || phone.length < 11) return;
    fireInitiateCheckout();
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleQtyChange = (n) => {
    const newQty = Math.max(1, n);
    setQty(newQty);
  };

  const handleBulkDiscountSelect = (d) => {
    setSelectedBulkDiscount(d);
    setQty(d.offer_quantity);
  };

  const handleDeliveryChange = (charge) => setSelectedDeliveryCharge(charge);

  const handleDistrictChange = (name) => {
    const info = districtData.find(d => d.district_name === name);
    if (info) { setDeliveryCharge(info.delivery_charge); setEstimatedDays(info.estimated_days); }
    setSelectedDistrictName(name);
    setSelectedDistrict(name);
  };

  const handleColorSelect = (c) => { setSelectedColor(c); setSelectedSize(null); };

  const handleBumpSelect = (id) => {
    setBumps(prev => prev.map(b => b.id === id ? { ...b, selected: !b.selected } : b));
    setSelectedBumps(prev => {
      const exists = prev.find(b => b.id === id);
      if (exists) return prev.filter(b => b.id !== id);
      const toAdd  = bumps.find(b => b.id === id);
      return toAdd ? [...prev, toAdd] : prev;
    });
  };

  const handlePhoneChange = (e) => {
    const bn2en = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
    let v = e.target.value.replace(/[০-৯]/g, m => bn2en[m]).replace(/\D/g, '');
    setPhone(v);
    if (v.length > 0 && v.length < 11) setPhoneError('মোবাইল নম্বর ১১ ডিজিটের হতে হবে');
    else if (v.length === 11 && !v.startsWith('01')) setPhoneError('সঠিক বাংলাদেশি নম্বর দিন (01...)');
    else setPhoneError('');
  };

  const orderData = useMemo(() => ({
    order_id:         orderId,
    product_name:     data?.product?.name,
    customer_name:    name,
    phone_number:     phone,
    customer_address: `Village/Road: ${address}, District: ${selectedDistrictName}, Division: ${selectedDivisionName}`,
    delivery_charge:  String(Math.round(selectedDeliveryCharge || 0)),
    total:            String(total),
    payment_method:   'cod',
    delivery_note:    deliveryNote,
    items: [{
      product_id:   data?.product?.id,
      product_name: data?.product?.name,
      quantity:     qty,
      price:        Math.round(data?.product?.discount_price || data?.product?.price || 0),
      color:        selectedColor || null,
      size:         selectedSize  || null,
    }],
    bumps:          selectedBumps,
    bulk_discounts: selectedBulkDiscount ? [{ id: selectedBulkDiscount.id }] : [],
    product_price:  String(Math.round((data?.product?.discount_price ?? data?.product?.price ?? 0) * qty)),
    quantity:       qty || 1,
  }), [orderId, data?.product, name, phone, address, selectedDistrictName, selectedDivisionName,
       selectedDeliveryCharge, total, deliveryNote, qty, selectedColor, selectedSize,
       selectedBumps, selectedBulkDiscount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOrderConfirm = async (e) => {
    e?.preventDefault?.();

    // Size must be selected before anything else
    const needsColorSize  = selectedColor?.sizes?.length > 0 && !selectedSize;
    const needsSingleSize = hasSingleSizes && !selectedSingleSize;
    if (needsColorSize || needsSingleSize) {
      setSizeError('অনুগ্রহ করে সাইজ সিলেক্ট করুন');
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!name?.trim())                         { alert('আপনার নাম লিখুন'); return; }
    if (!phone?.trim() || phone.length !== 11) { alert('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন'); return; }
    if (!selectedDistrictName)                 { alert('জেলা সিলেক্ট করুন'); return; }
    if (!address?.trim())                      { alert('বিস্তারিত ঠিকানা দিন'); return; }

    // Hard ref-lock prevents double-submit even if button is clicked twice rapidly
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    fireInitiateCheckout();
    setIsSubmitting(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        track('order', slug);
        window.location.href = `/thankyou/${orderId}`;
        return;
      }
    } catch (err) {
      const msg = err?.message || 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      alert(msg);
    }

    // Only reach here on error — unlock so user can retry
    submitLockRef.current = false;
    setIsSubmitting(false);
  };

  // ── Auto-save lead on unload ──────────────────────────────────────────────────
  useEffect(() => {
    const save = () => {
      if (isSubmitting || !name?.trim() || !phone?.trim() || !data?.product?.id) return;
      navigator.sendBeacon(`${apiUrl}/leads`, new Blob([JSON.stringify({
        order_id:         orderId,
        product_id:       data.product.id,
        customer_name:    name,
        phone_number:     phone,
        product_name:     data.product.name,
        product_price:    Math.round((data.product.discount_price ?? data.product.price) * qty),
        quantity:         qty || 1,
        color:            selectedColor?.color || null,
        size:             selectedSize?.size || selectedSingleSize?.size || null,
        page_url:         window.location.href,
        customer_address: `Village/Road: ${address || ''}, District: ${selectedDistrictName || ''}, Division: ${selectedDivisionName || ''}`,
      })], { type: 'application/json' }));
    };
    window.addEventListener('beforeunload', save);
    return () => window.removeEventListener('beforeunload', save);
  }, [isSubmitting, name, phone, address, selectedDistrictName, selectedDivisionName, qty, selectedColor, selectedSize, selectedSingleSize, data?.product, apiUrl, orderId]);

  // ── Derived flags ─────────────────────────────────────────────────────────────
  const hasColors       = data?.product?.colors?.length > 0;
  const hasSingleSizes  = data?.product?.single_product_sizes?.length > 0;
  const hasOptions      = hasColors || hasSingleSizes;
  const hasBulkDiscount = data?.product?.bulk_discounts?.length > 0;
  const hasBumps        = bumps?.length > 0;

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fireInitiateCheckout();
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div id="order" ref={sectionRef} className="scroll-mt-4">
      <style>{shakeAnimation}</style>

      {/* ── Urgency Strip (hidden in modal) ─────────────────────────────── */}
      {!isModal && (
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white py-2.5 px-4">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs sm:text-sm font-semibold text-center">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              {viewers} জন এখন দেখছেন
            </span>
            <span>⚡ সীমিত স্টক বাকি!</span>
            <span>🚚 আজই অর্ডার করুন, দ্রুত পাবেন</span>
          </div>
        </div>
      )}

      <div className={cls("bg-gradient-to-b from-gray-50 to-white", !isModal && "min-h-screen")}>
        <div className={cls("mx-auto", isModal ? "px-4 py-4" : "px-4 py-8 sm:py-12 max-w-5xl")}>

          {/* ── Section Header (hidden in modal) ─────────────────────────── */}
          {!isModal && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                <ShoppingCart size={15} />
                অর্ডার ফর্ম
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                অর্ডার করতে নিচের তথ্য দিন
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                পণ্য হাতে পেয়ে পেমেন্ট করুন — কোনো অগ্রিম পেমেন্ট নেই
              </p>
            </div>
          )}

          {/* ── Main Two-Column Grid ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* ═══ LEFT COLUMN ════════════════════════════════════════════════ */}
            <div className="space-y-5">

              {/* Color & Size Selection */}
              {hasOptions && (
                <div
                  ref={sizeRef}
                  className={cls(
                    "bg-white rounded-2xl shadow-sm p-5 transition-all duration-300",
                    sizeError ? "border-2 border-red-400 size-err-ring" : "border border-gray-100"
                  )}
                >
                  <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                    <Package size={17} className="text-emerald-600" />
                    পণ্যের বিবরণ
                  </h3>

                  {hasColors && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600 mb-3">
                        রঙ সিলেক্ট করুন
                        {selectedColor && <span className="ml-2 text-emerald-600">— {selectedColor.color}</span>}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {data.product.colors.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleColorSelect(c)}
                            className={cls(
                              "p-2.5 rounded-xl border-2 transition-all duration-200 text-center",
                              selectedColor?.id === c.id
                                ? "border-emerald-500 bg-emerald-50 scale-[1.03] shadow-md"
                                : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                            )}
                          >
                            {c.image && (
                              <img
                                src={`${imageUrl}/${c.image}`}
                                alt={c.color}
                                className="w-12 h-12 rounded-lg object-cover mx-auto mb-1.5 border border-gray-200"
                              />
                            )}
                            <p className={cls("text-xs font-semibold truncate", selectedColor?.id === c.id ? "text-emerald-700" : "text-gray-700")}>
                              {c.color}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedColor?.sizes?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">সাইজ সিলেক্ট করুন</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedColor.sizes.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => { setSelectedSize(s); setSizeError(''); }}
                            className={cls(
                              "px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200",
                              selectedSize?.id === s.id
                                ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                                : sizeError
                                  ? "border-red-400 text-gray-700 hover:border-red-500 hover:bg-red-50"
                                  : "border-gray-200 text-gray-700 hover:border-emerald-300"
                            )}
                          >
                            {s.size}
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

                  {hasSingleSizes && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">সাইজ সিলেক্ট করুন</p>
                      <div className="flex flex-wrap gap-2">
                        {data.product.single_product_sizes.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => { setSelectedSingleSize(s); setSizeError(''); }}
                            className={cls(
                              "px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200",
                              selectedSingleSize?.id === s.id
                                ? "border-purple-500 bg-purple-500 text-white shadow-sm"
                                : sizeError
                                  ? "border-red-400 text-gray-700 hover:border-red-500 hover:bg-red-50"
                                  : "border-gray-200 text-gray-700 hover:border-purple-300"
                            )}
                          >
                            {s.size}
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

                  {/* Qty + mini summary */}
                  {hasOptions && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            selectedColor?.image
                              ? `${imageUrl}/${selectedColor.image}`
                              : data.product.images?.[0]?.image
                                ? `${imageUrl}/${data.product.images[0].image}`
                                : null
                          }
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{data?.product?.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ৳{price} × {qty}{" "}
                            {bulkDiscountAmount > 0
                              ? <><span className="line-through text-red-400 mr-1">= ৳{price*qty}</span><span className="font-bold text-emerald-600">= ৳{subtotal}</span></>
                              : <span className="font-bold text-gray-700">= ৳{subtotal}</span>
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(qty - 1)}
                          disabled={qty <= 1}
                          className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center font-bold text-gray-900 text-sm">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(qty + 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 active:scale-90 transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bulk Discounts */}
              {hasBulkDiscount && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                    <Tag size={17} className="text-blue-600" />
                    একাধিক পণ্যে বিশেষ ছাড়
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.product.bulk_discounts.map(d => {
                      const sel = selectedBulkDiscount?.id === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleBulkDiscountSelect(d)}
                          className={cls(
                            "p-3.5 rounded-xl border-2 text-left transition-all duration-200",
                            sel
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className={cls("text-sm font-bold leading-snug", sel ? "text-blue-800" : "text-gray-800")}>
                              {d.title}
                            </p>
                            <span className={cls("flex-shrink-0 text-xs font-black px-2 py-0.5 rounded-full", sel ? "bg-blue-600 text-white" : "bg-green-100 text-green-700")}>
                              {d.discount_percentage}% ছাড়
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                            <Package size={11} /> পরিমাণ: {d.offer_quantity} টি
                            {sel && qty !== d.offer_quantity && (
                              <span className="text-red-500 ml-2">({d.offer_quantity} টি লাগবে)</span>
                            )}
                            {sel && qty === d.offer_quantity && (
                              <span className="text-blue-600 ml-2 font-bold">✓ সক্রিয়</span>
                            )}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery + Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <Truck size={17} className="text-emerald-600" />
                  ডেলিভারি এলাকা
                </h3>
                <DeliveryCharge
                  handleDeliveryChange={handleDeliveryChange}
                  deliveryArea={deliveryArea}
                  setSelectedDeliveryCharge={setSelectedDeliveryCharge}
                />

                {/* Price Breakdown */}
                <div className="border-t border-gray-100 pt-4 mt-2 space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>পণ্যের মূল্য{!noVariants && ` (${qty}টি)`}</span>
                    <span className="font-semibold text-gray-800">৳{Math.round(price * qty)}</span>
                  </div>

                  {bulkDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1"><Tag size={12} />{selectedBulkDiscount.title}</span>
                      <span className="font-semibold">− ৳{bulkDiscountAmount}</span>
                    </div>
                  )}

                  {bumps.filter(b => b.selected).map((b, i) => (
                    <div key={i} className="flex justify-between text-sm text-blue-600">
                      <span className="flex items-center gap-1"><Gift size={12} />{b.title}</span>
                      <span className="font-semibold">+ ৳{Math.round(Number(b.bump_price))}</span>
                    </div>
                  ))}

                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Truck size={12} />ডেলিভারি চার্জ</span>
                    <span className={cls("font-semibold", selectedDeliveryCharge === 0 ? "text-green-600" : "text-gray-800")}>
                      {selectedDeliveryCharge === 0 ? 'ফ্রি' : `৳${Math.round(selectedDeliveryCharge)}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900 text-base">সর্বমোট</span>
                    <div className="text-right">
                      <span className="font-extrabold text-2xl text-emerald-600">৳{total}</span>
                    </div>
                  </div>
                </div>

                {/* COD notice */}
                <div className="mt-4 bg-emerald-50 rounded-xl px-4 py-3 flex items-center gap-2.5 border border-emerald-100">
                  <BadgeCheck size={20} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-xs text-emerald-800 font-semibold leading-snug">
                    পণ্য হাতে পেয়ে <strong>৳{total}</strong> পরিশোধ করুন।
                    কোনো অগ্রিম পেমেন্ট প্রয়োজন নেই।
                  </p>
                </div>
              </div>

              {/* Bump Offers */}
              {hasBumps && (
                <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                    <Zap size={17} className="text-amber-500" />
                    <span>বিশেষ অ্যাড-অন অফার</span>
                    <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      অতিরিক্ত ডিসকাউন্ট
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {bumps.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleBumpSelect(b.id)}
                        className={cls(
                          "w-full p-3.5 rounded-xl border-2 text-left transition-all duration-200",
                          b.selected
                            ? "border-amber-400 bg-amber-50 shadow-sm"
                            : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/40"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cls(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                            b.selected ? "bg-amber-500 border-amber-500" : "border-gray-300"
                          )}>
                            {b.selected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cls("text-sm font-bold leading-snug", b.selected ? "text-amber-800" : "text-gray-800")}>
                                {b.title}
                              </p>
                              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                +৳{Math.round(b.bump_price)}
                              </span>
                            </div>
                            {b.image && (
                              <img
                                src={`${imageUrl}/${b.image}`}
                                alt={b.title}
                                className="w-full h-28 object-cover rounded-lg mt-2 border border-gray-200"
                              />
                            )}
                            {b.description && (
                              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{b.description}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                    <Gift size={11} /> ক্লিক করলে অর্ডারের সাথে যোগ হবে
                  </p>
                </div>
              )}
            </div>

            {/* ═══ RIGHT COLUMN — Customer Form ══════════════════════════════ */}
            <div ref={formRef}>
              <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6"
                onFocus={handleFormInteraction}
                onClick={handleFormInteraction}
              >
                {/* Form header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <User size={19} className="text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight">আপনার তথ্য দিন</h3>
                    <p className="text-xs text-gray-400 mt-0.5">সব তথ্য গোপনীয় ও নিরাপদ</p>
                  </div>
                  <Shield size={18} className="text-gray-300 ml-auto" />
                </div>

                <div className="space-y-5">
                  {/* Name */}
                  <Field label="পুরো নাম" required hint="ডেলিভারির জন্য আপনার সম্পূর্ণ নাম">
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                        className={inputCls(false) + " pl-11"}
                        autoComplete="name"
                      />
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </Field>

                  {/* Phone */}
                  <Field label="মোবাইল নম্বর" required error={phoneError} hint="আমরা ডেলিভারির জন্য কল করব">
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        maxLength={11}
                        placeholder="01XXXXXXXXX"
                        className={inputCls(!!phoneError) + " pl-11"}
                        autoComplete="tel"
                        inputMode="numeric"
                      />
                      <Phone size={16} className={cls("absolute left-3.5 top-1/2 -translate-y-1/2", phoneError ? "text-red-400" : "text-gray-400")} />
                      {phone?.length === 11 && !phoneError && (
                        <CheckCircle2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                      )}
                    </div>
                  </Field>

                  {/* Division */}
                  <Field label="বিভাগ" required>
                    <div className="relative">
                      <select
                        value={selectedDivisionName}
                        onChange={e => {
                          const opt = e.target.options[e.target.selectedIndex];
                          setSelectedDivision(opt.id);
                          setSelectedDivisionName(opt.value);
                          setSelectedDistrictName('');
                        }}
                        className={inputCls(false) + " pl-11 appearance-none pr-9"}
                      >
                        <option value="">বিভাগ সিলেক্ট করুন</option>
                        {divisions.map(d => (
                          <option key={d.id} id={d.id} value={d.name}>{d.bn_name}</option>
                        ))}
                      </select>
                      <Map size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </Field>

                  {/* District */}
                  <Field label="জেলা" required hint={!selectedDivision ? 'আগে বিভাগ সিলেক্ট করুন' : undefined}>
                    <div className="relative">
                      <select
                        value={selectedDistrictName}
                        onChange={e => handleDistrictChange(e.target.value)}
                        disabled={!selectedDivision}
                        className={cls(inputCls(false), "pl-11 appearance-none pr-9", !selectedDivision && "opacity-50 cursor-not-allowed")}
                      >
                        <option value="">জেলা সিলেক্ট করুন</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.name}>{d.bn_name}</option>
                        ))}
                      </select>
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </Field>

                  {/* Address */}
                  <Field label="বিস্তারিত ঠিকানা" required hint="গ্রাম/মহল্লা, রোড নং, বাড়ি নং, থানা">
                    <div className="relative">
                      <textarea
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="গ্রাম/মহল্লা, রোড নং, বাড়ি নং, থানা..."
                        rows={3}
                        className={inputCls(false) + " pl-11 resize-none"}
                      />
                      <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    </div>
                  </Field>

                  {/* Estimated delivery */}
                  {selectedDistrictName && (
                    <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-2.5 border border-blue-100">
                      <Truck size={16} className="text-blue-600 flex-shrink-0" />
                      <p className="text-xs text-blue-800 font-semibold">
                        {selectedDistrictName} — আনুমানিক ডেলিভারি{' '}
                        <span className="text-blue-700 font-extrabold">{estimatedDays} কার্যদিবসে</span>
                      </p>
                    </div>
                  )}

                  {/* Order Summary mini repeat */}
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>পণ্য মূল্য</span><span className="font-semibold text-gray-700">৳{Math.round(price * qty)}</span>
                    </div>
                    {bulkDiscountAmount > 0 && (
                      <div className="flex justify-between text-xs text-green-600">
                        <span>ডিসকাউন্ট</span><span className="font-semibold">−৳{bulkDiscountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>ডেলিভারি</span>
                      <span className="font-semibold text-gray-700">
                        {selectedDeliveryCharge === 0 ? 'ফ্রি' : `৳${Math.round(selectedDeliveryCharge)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-gray-200 pt-1.5">
                      <span>মোট</span><span className="text-emerald-600">৳{total}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="relative">
                    <button
                      onClick={handleOrderConfirm}
                      disabled={isSubmitting}
                      className={cls(
                        "relative w-full py-4 rounded-2xl font-extrabold text-white text-lg",
                        "shadow-xl transition-all duration-200",
                        "flex items-center justify-center gap-2.5",
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 cta-shake cta-pulse-ring active:scale-95"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          প্রসেসিং হচ্ছে...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          অর্ডার কনফার্ম করুন — ৳{total}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust signals below button */}
                  <div className="flex items-center justify-center gap-4 flex-wrap pt-1">
                    {[
                      { icon: Shield,      text: "নিরাপদ" },
                      { icon: BadgeCheck,  text: "ক্যাশ অন ডেলিভারি" },
                      { icon: RotateCcw,   text: "রিটার্ন পলিসি" },
                    ].map(({ icon: I, text }) => (
                      <span key={text} className="flex items-center gap-1 text-xs text-gray-400">
                        <I size={12} className="text-emerald-500" />{text}
                      </span>
                    ))}
                  </div>

                  {/* Star reviews */}
                  <div className="text-center">
                    <div className="flex justify-center gap-0.5 mb-1">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                    </div>
                    <p className="text-xs text-gray-400">১০,০০০+ সন্তুষ্ট গ্রাহক</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile Sticky CTA (hidden inside modal) ────────────────────────── */}
      <AnimatePresence>
        {!isModal && showMobileSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          >
            <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 pt-3 pb-4 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-medium">সর্বমোট</p>
                <p className="text-base font-extrabold text-emerald-600">৳{total}</p>
              </div>
              <button
                onClick={scrollToForm}
                className="w-full py-3.5 rounded-xl font-bold text-white text-base
                           bg-gradient-to-r from-emerald-500 to-green-600
                           shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                এখনই অর্ডার করুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutSection;
