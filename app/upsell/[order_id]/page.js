"use client";

import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { config } from "@/config";
import { ProductContext } from "@/app/context/ProductsContext";
import {
  trackBrowserEvent,
  sendCAPIEvent,
  formatPhoneForFacebook,
  updateAdvancedMatching,
} from "@/pixel";

import UpsellHeader    from "@/app/components/upsell/UpsellHeader";
import UrgencyBanner   from "@/app/components/upsell/UrgencyBanner";
import ScarcitySection from "@/app/components/upsell/ScarcitySection";
import ProductShowcase from "@/app/components/upsell/ProductShowcase";
import PricingSection  from "@/app/components/upsell/PricingSection";
import CountdownTimer  from "@/app/components/upsell/CountdownTimer";
import CTASection      from "@/app/components/upsell/CTASection";
import TrustBadges     from "@/app/components/upsell/TrustBadges";
import StickyMobileCTA from "@/app/components/upsell/StickyMobileCTA";

const extractDistrict = (address) => {
  if (!address) return "";
  const m = address.match(/district:\s*([^,]+)/i);
  return m ? m[1].trim() : "";
};

const extractDivision = (address) => {
  if (!address) return "";
  const m = address.match(/division:\s*([^,]+)/i);
  return m ? m[1].trim() : "";
};

const SECTION_RENDERERS = {
  header:   (props) => <UpsellHeader    key="header"   {...props} />,
  urgency:  (props) => <UrgencyBanner   key="urgency"  {...props} />,
  scarcity: (props) => <ScarcitySection key="scarcity" {...props} />,
  product:  (props) => <ProductShowcase key="product"  {...props} />,
  pricing:  (props) => <PricingSection  key="pricing"  {...props} />,
  timer:    (props) => <CountdownTimer  key="timer"    {...props} />,
  cta:      (props) => <CTASection      key="cta"      {...props} />,
  trust:    (props) => <TrustBadges     key="trust"    {...props} />,
};

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-red-500 animate-spin mb-3" />
      <p className="text-sm text-gray-500">লোড হচ্ছে…</p>
    </div>
  );
}

function AlreadyHandled({ status, orderId }) {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => { router.replace(`/thankyou/${orderId}`); }, 2000);
    return () => clearTimeout(t);
  }, [orderId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="text-5xl mb-3">{status === "accepted" ? "✅" : "👋"}</div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">
        {status === "accepted" ? "অফার গ্রহণ করা হয়েছে!" : "ইতিমধ্যে সম্পন্ন"}
      </h2>
      <p className="text-sm text-gray-500">আপনাকে ধন্যবাদ পেজে নিয়ে যাওয়া হচ্ছে…</p>
    </div>
  );
}

export default function UpsellPage() {
  const { order_id } = useParams();
  const router = useRouter();
  const { pixel, testEventCode, apiUrl } = useContext(ProductContext);

  const [pageState, setPageState] = useState({
    loading: true,
    product: null,
    pageConfig: null,
    upsellStatus: null,
    customer: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const abortRef = useRef(null);
  const addPaymentInfoFired = useRef(false);

  useEffect(() => {
    if (!order_id) return;
    abortRef.current = new AbortController();

    fetch(`${config.apiUrl}/upsell/${order_id}`, { signal: abortRef.current.signal })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          // No upsell or not found → skip to thankyou (soft nav keeps context alive)
          router.replace(`/thankyou/${order_id}`);
          return;
        }

        if (data.upsell_status && data.upsell_status !== "pending") {
          setPageState({ loading: false, product: null, pageConfig: null, upsellStatus: data.upsell_status, customer: null });
          return;
        }

        if (!data.upsell_product) {
          router.replace(`/thankyou/${order_id}`);
          return;
        }

        setPageState({
          loading: false,
          product: data.upsell_product,
          pageConfig: data.config ?? null,
          upsellStatus: data.upsell_status ?? "pending",
          customer: data.customer ?? null,
        });
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          router.replace(`/thankyou/${order_id}`);
        }
      });

    return () => abortRef.current?.abort();
  }, [order_id, router]);

  // ── AddPaymentInfo (hybrid: browser pixel + CAPI) ──────────────────────────
  // Fires once when upsell page is rendered with a pending offer.
  useEffect(() => {
    if (
      addPaymentInfoFired.current ||
      !pixel?.length ||
      !pageState.product ||
      !pageState.customer ||
      pageState.upsellStatus !== "pending"
    ) return;

    addPaymentInfoFired.current = true;

    const { product, customer } = pageState;
    const formattedPhone = formatPhoneForFacebook(customer.phone_number);
    const eventId = `API_${customer.order_id}_${Date.now()}`;
    const offerPrice = Number(product.offer_price) || 0;

    if (formattedPhone) updateAdvancedMatching(pixel, { ph: formattedPhone });

    const customData = {
      value:        offerPrice,
      currency:     "BDT",
      content_name: product.name,
      content_type: "product",
      content_ids:  [`upsell_${product.id}`],
      contents:     [{ id: `upsell_${product.id}`, quantity: 1, item_price: Math.round(offerPrice) }],
      num_items:    1,
      order_id:     customer.order_id,
      external_id:  String(customer.id || customer.order_id),
    };

    const userData = {
      phone: formattedPhone,
      name:  customer.customer_name || "",
      city:  extractDistrict(customer.address),
      state: extractDivision(customer.address),
      external_id: String(customer.id || customer.order_id),
    };

    trackBrowserEvent(pixel, "AddPaymentInfo", customData, eventId);
    sendCAPIEvent(apiUrl, "AddPaymentInfo", customData, userData, eventId, testEventCode);
  }, [pageState, pixel, apiUrl, testEventCode]);

  // ── UpsellAccepted (custom event) + accept API call ────────────────────────
  const handleAccept = useCallback(async () => {
    setActionLoading(true);

    // Fire pixel BEFORE the API call so the event survives the redirect.
    if (pixel?.length && pageState.product && pageState.customer) {
      const { product, customer } = pageState;
      const formattedPhone = formatPhoneForFacebook(customer.phone_number);
      const eventId = `UA_${customer.order_id}_${Date.now()}`;
      const offerPrice = Number(product.offer_price) || 0;

      const customData = {
        value:        offerPrice,
        currency:     "BDT",
        content_name: product.name,
        content_type: "product",
        content_ids:  [`upsell_${product.id}`],
        contents:     [{ id: `upsell_${product.id}`, quantity: 1, item_price: Math.round(offerPrice) }],
        num_items:    1,
        order_id:     customer.order_id,
        external_id:  String(customer.id || customer.order_id),
      };

      const userData = {
        phone: formattedPhone,
        name:  customer.customer_name || "",
        city:  extractDistrict(customer.address),
        state: extractDivision(customer.address),
        external_id: String(customer.id || customer.order_id),
      };

      trackBrowserEvent(pixel, "UpsellAccepted", customData, eventId);
      sendCAPIEvent(apiUrl, "UpsellAccepted", customData, userData, eventId, testEventCode);
    }

    try {
      await fetch(`${config.apiUrl}/upsell/${order_id}/accept`, { method: "POST" });
    } catch { /* always redirect */ }
    router.push(`/thankyou/${order_id}`);
  }, [order_id, pageState, pixel, apiUrl, testEventCode, router]);

  const handleDecline = useCallback(async () => {
    try {
      await fetch(`${config.apiUrl}/upsell/${order_id}/decline`, { method: "POST" });
    } catch { /* always redirect */ }
    router.push(`/thankyou/${order_id}`);
  }, [order_id, router]);

  const { loading, product, pageConfig: cfg, upsellStatus } = pageState;

  if (loading) return <LoadingSpinner />;

  if (upsellStatus === "accepted" || upsellStatus === "declined") {
    return <AlreadyHandled status={upsellStatus} orderId={order_id} />;
  }

  if (!product) return <LoadingSpinner />;

  // Design tokens
  const design       = cfg?.design ?? {};
  const maxWidth     = design.max_width     ?? "480px";
  const borderRadius = design.border_radius ?? "16px";
  const pageBg       = design.page_bg       ?? "#F3F4F6";
  const shadow       = design.shadow        !== false;
  const footerText   = cfg?.footer?.text       ?? "";
  const footerColor  = cfg?.footer?.text_color ?? "#9CA3AF";

  const sectionsOrder   = Array.isArray(cfg?.sections_order) ? cfg.sections_order : ["header","urgency","scarcity","product","pricing","timer","cta","trust"];
  const sectionsEnabled = cfg?.sections_enabled ?? {};

  const sharedProps = {
    product,
    config: cfg,
    imageUrl: config.imageUrl,
    onAccept: handleAccept,
    onDecline: handleDecline,
    loading: actionLoading,
  };

  return (
    <div className="min-h-screen py-6 pb-28 md:pb-6" style={{ backgroundColor: pageBg }}>
      <div
        className="mx-auto overflow-hidden"
        style={{
          maxWidth,
          borderRadius,
          backgroundColor: "#ffffff",
          boxShadow: shadow ? "0 8px 40px rgba(0,0,0,0.12)" : "none",
        }}
      >
        {sectionsOrder.map((key) => {
          if (sectionsEnabled[key] === false) return null;
          const render = SECTION_RENDERERS[key];
          return render ? render(sharedProps) : null;
        })}

        {footerText && (
          <p className="text-center text-xs px-4 py-5" style={{ color: footerColor }}>
            {footerText}
          </p>
        )}
      </div>

      <StickyMobileCTA
        product={product}
        config={cfg}
        onAccept={handleAccept}
        loading={actionLoading}
      />
    </div>
  );
}
