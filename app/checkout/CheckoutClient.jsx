"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FaShoppingCart, FaTruck, FaCheckCircle, FaGift, FaTimesCircle,
} from "react-icons/fa";

import { useCart } from "@/app/context/CartContext";
import { OrderContext } from "@/app/context/OrderContext";
import { ProductContext } from "@/app/context/ProductsContext";
import { trackBrowserEvent, sendCAPIEvent, generateEventId, getFBP, getFBC } from "@/pixel";
import bdLocations from "@/app/data/locations";
import DeliveryCharge from "@/app/components/Landing/DeliveryCharge";

const imageProxyUrl = "/api/storage";

export default function CheckoutPage() {
  const router = useRouter();

  const {
    isEmpty, items, cartTotal, clearCart,
    coupon, clearCoupon,
  } = useCart();

  const {
    apiUrl,
    name, address, phone,
    deliveryCharge, setDeliveryCharge,
    estimatedDays, setEstimatedDays,
    selectedDistrict, setSelectedDistrict,
    deliveryNote, setDeliveryNote,
    setName, setAddress, setPhone,
    districts: districtData,
  } = useContext(OrderContext);

  const { pixel, testEventCode } = useContext(ProductContext);

  const [isSubmitting, setIsSubmitting]               = useState(false);
  const [divisions, setDivisions]                     = useState([]);
  const [districts, setDistricts]                     = useState([]);
  const [selectedDivision, setSelectedDivision]       = useState("");
  const [selectedDivisionName, setSelectedDivisionName] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [phoneError, setPhoneError]                   = useState("");
  const [submitError, setSubmitError]                 = useState(null);

  const trackingFired = useRef(false);
  const orderIdRef    = useRef(`A2C${Math.floor(1000 + Math.random() * 90000)}`);

  /* ── Phone (Bengali → English digits + validation) ────────────────────── */
  const handlePhoneChange = (e) => {
    const bnToEn = { "০":"0","১":"1","২":"2","৩":"3","৪":"4","৫":"5","৬":"6","৭":"7","৮":"8","৯":"9" };
    let v = e.target.value.replace(/[০-৯]/g, (m) => bnToEn[m]).replace(/\D/g, "");
    setPhone(v);
    if (v.length > 0 && v.length < 11) setPhoneError("মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে");
    else if (v.length === 11 && !v.startsWith("01")) setPhoneError("সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01...)");
    else setPhoneError("");
  };

  /* ── DeliveryCharge component handler (radio-card selector) ──────────── */
  // Receives (charge, area) — area carries district_name, estimated_days, delivery_note
  const handleDeliveryChange = (_charge, area) => {
    if (!area) return;
    setDeliveryCharge(area.delivery_charge);
    setEstimatedDays(area.estimated_days);
    setDeliveryNote(area.delivery_note || "");
    setSelectedDistrict(area.district_name);
    setSelectedDistrictName(area.district_name);
  };

  /* ── Pixel: InitiateCheckout (fires once) ─────────────────────────────── */
  useEffect(() => {
    if (!pixel?.length || !items.length || trackingFired.current) return;
    const eventId = generateEventId("IC");
    const contentIds = items.map((i) => String(i.product_id));
    const contents = items.map((i) => ({
      id: String(i.product_id),
      quantity: i.quantity,
      item_price: parseFloat(i.price) || 0,
    }));
    const customData = {
      value: parseFloat(cartTotal) || 0,
      currency: "BDT",
      content_name: "Checkout",
      content_ids: contentIds,
      contents,
      num_items: items.reduce((t, i) => t + i.quantity, 0),
      content_type: "product",
      event_source_url: typeof window !== "undefined" ? window.location.href : "",
    };
    trackBrowserEvent(pixel, "InitiateCheckout", customData, eventId);
    sendCAPIEvent(apiUrl, "InitiateCheckout", customData, {}, eventId, testEventCode);
    trackingFired.current = true;
  }, [pixel, items, cartTotal, apiUrl, testEventCode]);

  /* ── Divisions / Districts loaders ────────────────────────────────────── */
  useEffect(() => {
    setDivisions(
      bdLocations.map((d) => ({ id: d.division.en, name: d.division.en, bn_name: d.division.bn }))
    );
  }, []);

  useEffect(() => {
    if (!selectedDivision) { setDistricts([]); return; }
    const div = bdLocations.find((d) => d.division.en === selectedDivision);
    if (div) {
      setDistricts(div.districts.map((dist) => ({ id: dist.en, name: dist.en, bn_name: dist.bn })));
    }
  }, [selectedDivision]);

  /* ── Cart reward tier (fetched once) ──────────────────────────────────── */
  const [rewardTiers, setRewardTiers] = useState([]);
  useEffect(() => {
    let mounted = true;
    axios
      .get(`${apiUrl}/cart-rewards/active`)
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res.data?.rewards) ? res.data.rewards : (res.data?.data || []);
        setRewardTiers(list);
      })
      .catch(() => mounted && setRewardTiers([]));
    return () => { mounted = false; };
  }, [apiUrl]);

  const { rewardTier, rewardDiscount, nextRewardTier, rewardRemaining, rewardProgress } = useMemo(() => {
    if (!rewardTiers.length) return { rewardTier: null, rewardDiscount: 0, nextRewardTier: null, rewardRemaining: 0, rewardProgress: 0 };
    const qualified = rewardTiers.filter((t) => cartTotal >= Number(t.min_amount));
    const tier = qualified.length ? qualified[qualified.length - 1] : null;
    const nextT = rewardTiers.find((t) => cartTotal < Number(t.min_amount)) || null;
    let discount = 0;
    if (tier) {
      const v = Number(tier.discount_value || 0);
      discount = tier.discount_type === "percentage" ? Math.round((cartTotal * v) / 100) : v;
      if (tier.max_discount) discount = Math.min(discount, Number(tier.max_discount));
      discount = Math.min(discount, cartTotal);
    }
    const target = nextT ? Number(nextT.min_amount) : (tier ? Number(tier.min_amount) : 0);
    const progress = target > 0 ? Math.min(100, Math.round((cartTotal / target) * 100)) : 100;
    const remaining = nextT ? Math.max(0, Number(nextT.min_amount) - cartTotal) : 0;
    return { rewardTier: tier, rewardDiscount: discount, nextRewardTier: nextT, rewardRemaining: remaining, rewardProgress: progress };
  }, [rewardTiers, cartTotal]);

  /* ── Totals ───────────────────────────────────────────────────────────── */
  const couponDiscount = useMemo(() => Number(coupon?.discount || 0), [coupon]);
  const couponFreeDelivery = !!coupon?.free_delivery;
  const effectiveDelivery = couponFreeDelivery ? 0 : Number(deliveryCharge || 0);
  const grandTotal = Math.max(
    0,
    Math.round(Number(cartTotal || 0) + effectiveDelivery - rewardDiscount - couponDiscount)
  );

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedDistrictName) {
      setSubmitError("ডেলিভারি চার্জ দেখতে জেলা সিলেক্ট করুন");
      return;
    }
    if (phoneError || !/^01[3-9]\d{8}$/.test(phone)) {
      setSubmitError("সঠিক বাংলাদেশি মোবাইল নম্বর দিন");
      return;
    }

    setIsSubmitting(true);

    const orderItems = items.map((item) => ({
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      color: item.color || null,
      size: item.size || null,
    }));

    const orderData = {
      order_id: orderIdRef.current,
      customer_name: name,
      phone_number: phone,
      customer_address: `Village/Road: ${address}, District: ${selectedDistrictName}, Division: ${selectedDivisionName}`,
      delivery_charge: effectiveDelivery,
      total: grandTotal,
      items: orderItems,
      payment_method: "cod",
      delivery_note: deliveryNote,
      coupon_code: coupon?.code || null,
      // Browser identifiers for server-side Confirm Purchase CAPI matching (EMQ)
      fbp: getFBP(),
      fbc: getFBC(),
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      await axios.post(`${apiUrl}/cartstore`, orderData, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
      });

      clearCart();
      clearCoupon();
      // Soft navigation keeps the context tree alive so back-button works.
      router.push(`/thankyou/${orderIdRef.current}`);
    } catch (err) {
      let msg = "অর্ডার সাবমিশন ব্যর্থ হয়েছে";
      if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors).flat().join("\n");
      } else if (err.code === "ECONNABORTED") {
        msg = "সার্ভারে রেসপন্স দিতে দেরি হচ্ছে। দয়া করে পরে আবার চেষ্টা করুন";
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };

  /* ── Empty cart guard ─────────────────────────────────────────────────── */
  if (isEmpty) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-10">
          <FaShoppingCart className="text-5xl text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">কার্ট খালি</h1>
          <p className="text-gray-500 mb-6">চেকআউট করার জন্য কার্টে অন্তত একটি product যোগ করুন।</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            <FaShoppingCart /> Shop এ যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#116d3c] to-[#0a2635] py-10 text-center text-white">
        <h1 className="text-4xl font-bold">Checkout</h1>
        <p className="mt-2 text-lg">
          <Link href="/" className="hover:underline">Home</Link> / Checkout
        </p>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Customer info form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-6">

                <Field label="মোবাইল নম্বর:">
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                </Field>

                <Field label="আপনার নাম:">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="পূর্ণ নাম লিখুন"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </Field>

                <Field label="আপনার বিভাগ সিলেক্ট করুন:">
                  <Select
                    value={selectedDivisionName}
                    onChange={(e) => {
                      const opt = e.target.options[e.target.selectedIndex];
                      setSelectedDivision(opt.dataset.id);
                      setSelectedDivisionName(opt.value);
                      setSelectedDistrictName("");
                    }}
                  >
                    <option value="">বিভাগ সিলেক্ট করুন</option>
                    {divisions.map((d) => (
                      <option key={d.id} data-id={d.id} value={d.name}>{d.bn_name}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="আপনার জেলা সিলেক্ট করুন:">
                  <Select
                    value={selectedDistrictName}
                    onChange={(e) => setSelectedDistrictName(e.target.value)}
                    disabled={!selectedDivision}
                  >
                    <option value="">জেলা সিলেক্ট করুন</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>{d.bn_name}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="আপনার গ্রাম/রোড:">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="বিস্তারিত ঠিকানা (থানা, গ্রাম/রোড)"
                    rows={3}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y"
                  />
                </Field>
              </div>
            </form>

            {/* Order summary */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
              </div>

              <div className="px-4 py-5 sm:p-6">
                {/* Cart reward progress bar */}
                {rewardTiers.length > 0 && (
                  <CartRewardBar
                    tier={rewardTier}
                    discount={rewardDiscount}
                    nextTier={nextRewardTier}
                    progress={rewardProgress}
                    remaining={rewardRemaining}
                  />
                )}

                {/* Items */}
                <ul className="-my-4 divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="py-4 flex gap-4">
                      <div className="flex-shrink-0 w-20 h-20 border border-gray-200 rounded-md overflow-hidden relative bg-gray-50">
                        <Image
                          src={`${imageProxyUrl}/${item.images?.[0]?.image || item.image || ""}`}
                          alt={item.name}
                          fill
                          className="object-cover object-center"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="line-clamp-2">{item.name}</h3>
                          <p className="ml-4 whitespace-nowrap">৳{Math.round(item.price * item.quantity)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{[item.color, item.size].filter(Boolean).join(" • ")}</p>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <p className="text-gray-500">পরিমাণ: {item.quantity}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Delivery area selector — radio-card style, same UX as Landing */}
                <div className="mt-6">
                  <DeliveryCharge
                    handleDeliveryChange={handleDeliveryChange}
                    deliveryArea={districtData || []}
                    setSelectedDeliveryCharge={setDeliveryCharge}
                  />
                </div>

                {/* Totals */}
                <div className="mt-2 border-t border-gray-200 pt-6 space-y-2">
                  <Row label="সাবটোটাল" value={`৳${Math.round(cartTotal)}`} />

                  {rewardDiscount > 0 && (
                    <Row
                      label="কার্ট রিওয়ার্ড ছাড়"
                      value={`− ৳${rewardDiscount}`}
                      className="text-emerald-600"
                    />
                  )}

                  {coupon && (
                    <CouponRow coupon={coupon} discount={couponDiscount} onRemove={clearCoupon} />
                  )}

                  <Row
                    label={`ডেলিভারি চার্জ${selectedDistrict ? ` (${selectedDistrict})` : ""}`}
                    value={effectiveDelivery === 0 ? "ফ্রি" : `৳${Math.round(effectiveDelivery)}`}
                    className={effectiveDelivery === 0 ? "text-green-600 font-semibold" : ""}
                  />

                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 text-lg font-bold text-gray-900">
                    <p>সর্বমোট</p>
                    <p>৳{grandTotal}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center text-sm text-gray-500">
                  <FaTruck className="flex-shrink-0 mr-2 text-blue-500" />
                  <p>
                    {selectedDistrictName
                      ? `${selectedDistrictName}-এ আনুমানিক ডেলিভারি: ${estimatedDays} কার্যদিবস`
                      : "ডেলিভারি সময় জেলা নির্বাচন করার পরে দেখানো হবে"}
                  </p>
                </div>

                {submitError && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 whitespace-pre-line">
                    {submitError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedDistrictName}
                  className={`mt-6 w-full flex justify-center items-center px-6 py-3 rounded-md text-base font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm ${
                    isSubmitting || !selectedDistrictName ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      প্রসেসিং...
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="mr-2" />
                      অর্ডার নিশ্চিত করুন
                    </>
                  )}
                </button>

                {!selectedDistrictName && (
                  <p className="text-sm text-red-500 mt-2 text-center">
                    ডেলিভারি চার্জ দেখতে জেলা সিলেক্ট করুন
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Primitives ────────────────────────────────────────────────────────── */

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-base font-semibold mb-2 text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Select({ children, className = "", ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}

function Row({ label, value, className = "" }) {
  return (
    <div className={`flex justify-between text-sm ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function CouponRow({ coupon, discount, onRemove }) {
  return (
    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <FaCheckCircle className="text-emerald-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-emerald-800 truncate">কুপন: {coupon.code}</p>
          <p className="text-[11px] text-emerald-700">
            {coupon.free_delivery ? "ফ্রি ডেলিভারি প্রযোজ্য" : `৳${discount} ছাড় প্রযোজ্য`}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove coupon"
        className="text-red-600 hover:text-red-700 text-sm"
      >
        <FaTimesCircle />
      </button>
    </div>
  );
}

function CartRewardBar({ tier, discount, nextTier, progress, remaining }) {
  const nextLabel = nextTier
    ? (nextTier.discount_type === "percentage"
        ? `${Number(nextTier.discount_value)}% ছাড়`
        : `৳${Number(nextTier.discount_value).toFixed(0)} ছাড়`)
    : null;

  return (
    <div className="mb-5 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <FaGift className="text-indigo-500" />
        <span className="text-sm font-semibold text-gray-800">
          {tier ? "অভিনন্দন! আপনি ছাড় পাচ্ছেন" : "বেশি কিনলে বেশি ছাড়"}
        </span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-xs text-gray-600 mt-2 leading-snug space-y-1">
        {tier && (
          <p className="text-emerald-600 font-medium flex items-center gap-1">
            <FaCheckCircle className="text-[11px]" />
            {tier.label || `৳${Number(tier.min_amount).toFixed(0)}-এ ছাড় চালু`}
            {discount > 0 && <span> (− ৳{Math.round(discount)})</span>}
          </p>
        )}
        {nextTier && (
          <p>
            আর <strong>৳{Math.round(remaining)}</strong> shopping করলে <strong>{nextLabel}</strong> পাবেন
          </p>
        )}
        {!nextTier && tier && (
          <p className="text-gray-400">সর্বোচ্চ tier পৌঁছেছেন</p>
        )}
      </div>
    </div>
  );
}
