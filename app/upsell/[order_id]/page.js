"use client";

import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { config } from "@/config";
import { ProductContext } from "@/app/context/ProductsContext";
import {
  trackBrowserEvent,
  sendCAPIEvent,
  formatPhoneForFacebook,
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

// ── Multi-product card grid ───────────────────────────────────────────────────
function MultiProductGrid({ products, selectedItems, onToggle, onSizeChange, cfg }) {
  const accentColor = cfg?.pricing?.accent_color ?? "#EF4444";

  return (
    <div className="px-4 pt-4 pb-3">
      <p className="text-xs font-semibold text-gray-500 text-center mb-3 uppercase tracking-wide">আপনি যা নিতে চান বেছে নিন</p>
      <div className="grid grid-cols-1 gap-3">
        {products.map((product) => {
          const item      = selectedItems.find(i => i.upsell_product_id === product.id);
          const isSelected = !!item;
          const hasSizes   = Array.isArray(product.sizes) && product.sizes.length > 0;
          const savings    = product.original_price > product.offer_price
            ? Math.round(((product.original_price - product.offer_price) / product.original_price) * 100)
            : 0;

          return (
            <div
              key={product.id}
              onClick={() => onToggle(product)}
              className="rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden"
              style={{
                borderColor: isSelected ? "#22c55e" : "#e5e7eb",
                backgroundColor: isSelected ? "#f0fdf4" : "#ffffff",
                boxShadow: isSelected ? "0 2px 12px rgba(34,197,94,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-center gap-3 p-3">
                {/* Checkbox circle */}
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: isSelected ? "#22c55e" : "transparent",
                    borderColor: isSelected ? "#22c55e" : "#d1d5db",
                  }}
                >
                  {isSelected && (
                    <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none">
                      <path d="M1 5l3 3L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                {/* Product image */}
                {product.image ? (
                  <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                    <img
                      src={`${config.imageUrl}/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl">
                    🎁
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-bold text-gray-800 text-sm leading-snug">{product.name}</div>
                    {product.badge_text && (
                      <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 leading-tight">
                        {product.badge_text}
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.description}</p>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {product.original_price > product.offer_price && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳{Number(product.original_price).toLocaleString()}
                      </span>
                    )}
                    <span className="text-lg font-black leading-none" style={{ color: accentColor }}>
                      ৳{Number(product.offer_price).toLocaleString()}
                    </span>
                    {savings > 0 && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                        {savings}% ছাড়
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  {Array.isArray(product.features) && product.features.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 mt-1">
                      {product.features.slice(0, 2).map((f, i) => (
                        <span key={i} className="text-[11px] text-green-700 flex items-center gap-0.5">
                          <span className="font-bold">✓</span> {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Size selector — only shown when selected and product has sizes */}
              {isSelected && hasSizes && (
                <div
                  className="px-3 pb-3 pt-1 border-t border-green-200"
                  onClick={e => e.stopPropagation()}
                >
                  <p className="text-xs text-gray-600 font-semibold mb-1.5">সাইজ বেছে নিন:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onSizeChange(product.id, sz)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition ${
                          item?.size === sz
                            ? "bg-green-500 text-white border-green-500"
                            : "border-gray-300 text-gray-700 hover:border-green-400"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                  {!item?.size && (
                    <p className="text-xs text-amber-600 mt-1">সাইজ সিলেক্ট করুন</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Single-product size selector (shown above CTA for single product) ─────────
function SingleSizeSelector({ product, selectedItem, onSizeChange }) {
  if (!Array.isArray(product?.sizes) || product.sizes.length === 0) return null;
  return (
    <div className="px-4 pb-4">
      <p className="text-sm font-bold text-gray-700 mb-2 text-center">সাইজ বেছে নিন:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {product.sizes.map(sz => (
          <button
            key={sz}
            type="button"
            onClick={() => onSizeChange(product.id, sz)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition ${
              selectedItem?.size === sz
                ? "bg-green-500 text-white border-green-500"
                : "border-gray-300 text-gray-700 hover:border-green-400"
            }`}
          >
            {sz}
          </button>
        ))}
      </div>
      {!selectedItem?.size && (
        <p className="text-xs text-amber-600 text-center mt-2">সাইজ বেছে নিলে অর্ডার করতে পারবেন</p>
      )}
    </div>
  );
}

// ── Dynamic total summary (shown above CTA for multi-product) ─────────────────
function SelectedTotal({ products, selectedItems, cfg, orderTotal }) {
  if (!selectedItems.length) return null;
  const upsellTotal = selectedItems.reduce((sum, item) => {
    const p = products.find(p => p.id === item.upsell_product_id);
    return sum + (p ? Number(p.offer_price) : 0);
  }, 0);
  const newTotal = (Number(orderTotal) || 0) + upsellTotal;
  const accentColor = cfg?.pricing?.accent_color ?? "#EF4444";

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-500">আগের অর্ডার মূল্য:</span>
        <span className="text-gray-600 font-medium">৳{Number(orderTotal).toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600">নির্বাচিত আপসেল ({selectedItems.length}টি):</span>
        <span className="font-bold" style={{ color: accentColor }}>+৳{upsellTotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center font-black text-base border-t border-green-200 pt-2">
        <span className="text-gray-800">সর্বমোট:</span>
        <span style={{ color: accentColor }}>৳{newTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function UpsellPage() {
  const { order_id } = useParams();
  const router = useRouter();
  const { pixel, testEventCode, apiUrl } = useContext(ProductContext);

  const [pageState, setPageState] = useState({
    loading: true,
    products: [],
    product: null,
    pageConfig: null,
    upsellStatus: null,
    customer: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  // selectedItems: [{upsell_product_id, size}]
  const [selectedItems, setSelectedItems] = useState([]);
  const abortRef = useRef(null);
  const pixelFired = useRef(false);

  useEffect(() => {
    if (!order_id) return;
    abortRef.current = new AbortController();

    fetch(`${config.apiUrl}/upsell/${order_id}`, { signal: abortRef.current.signal })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          router.replace(`/thankyou/${order_id}`);
          return;
        }

        if (data.upsell_status && data.upsell_status !== "pending") {
          setPageState({ loading: false, products: [], product: null, pageConfig: null, upsellStatus: data.upsell_status, customer: null });
          return;
        }

        const products = data.upsell_products || (data.upsell_product ? [data.upsell_product] : []);
        if (!products.length) {
          router.replace(`/thankyou/${order_id}`);
          return;
        }

        setPageState({
          loading: false,
          products,
          product: products[0],
          pageConfig: data.config ?? null,
          upsellStatus: data.upsell_status ?? "pending",
          customer: data.customer ?? null,
        });

        // Pre-select ONLY the first product
        setSelectedItems([{ upsell_product_id: products[0].id, size: null }]);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          router.replace(`/thankyou/${order_id}`);
        }
      });

    return () => abortRef.current?.abort();
  }, [order_id, router]);

  // ── ViewContent + AddPaymentInfo (fires once when upsell page is ready) ─────
  useEffect(() => {
    if (
      pixelFired.current ||
      !pixel?.length ||
      !pageState.products?.length ||
      !pageState.customer ||
      pageState.upsellStatus !== "pending"
    ) return;

    pixelFired.current = true;
    const { products, customer } = pageState;
    const formattedPhone = formatPhoneForFacebook(customer.phone_number);
    const ts = Date.now();

    const userData = {
      phone:       formattedPhone,
      name:        customer.customer_name || "",
      city:        extractDistrict(customer.address),
      state:       extractDivision(customer.address),
      external_id: String(customer.id || customer.order_id),
    };

    // ── 1. ViewContent — upsell product(s) context ──────────────────────────
    const vcContents  = products.map(p => ({
      id:         `upsell_${p.id}`,
      quantity:   1,
      item_price: Math.round(Number(p.offer_price) || 0),
    }));
    const vcValue = products.reduce((s, p) => s + (Number(p.offer_price) || 0), 0);

    const vcCustomData = {
      value:        vcValue,
      currency:     "BDT",
      content_name: products.map(p => p.name).join(", "),
      content_type: "product",
      content_ids:  products.map(p => `upsell_${p.id}`),
      contents:     vcContents,
      num_items:    products.length,
      order_id:     customer.order_id,
      external_id:  String(customer.id || customer.order_id),
    };
    const vcEventId = `VC_${customer.order_id}_${ts}`;

    trackBrowserEvent(pixel, "ViewContent", vcCustomData, vcEventId);
    sendCAPIEvent(apiUrl, "ViewContent", vcCustomData, userData, vcEventId, testEventCode);

    // ── 2. AddPaymentInfo — original order customer + product data ──────────
    // Build contents from the original order items
    let apiContents, apiContentIds, apiContentName, apiValue;

    if (Array.isArray(customer.items) && customer.items.length > 0) {
      apiContents    = customer.items.map(i => ({
        id:         String(i.product_id || i.product_name),
        quantity:   i.quantity,
        item_price: Math.round(i.price),
      }));
      apiContentIds  = customer.items.map(i => String(i.product_id || i.product_name));
      apiContentName = customer.items.map(i => i.product_name).join(", ");
      apiValue       = customer.order_total;
    } else {
      // Fallback: top-level product fields
      apiContents    = [{
        id:         String(customer.product_name),
        quantity:   customer.quantity || 1,
        item_price: Math.round(customer.product_price || 0),
      }];
      apiContentIds  = [String(customer.product_name)];
      apiContentName = customer.product_name || "";
      apiValue       = customer.order_total;
    }

    const apiCustomData = {
      value:        apiValue,
      currency:     "BDT",
      content_name: apiContentName,
      content_type: "product",
      content_ids:  apiContentIds,
      contents:     apiContents,
      num_items:    apiContents.length,
      order_id:     customer.order_id,
      external_id:  String(customer.id || customer.order_id),
    };
    const apiEventId = `API_${customer.order_id}_${ts}`;

    trackBrowserEvent(pixel, "AddPaymentInfo", apiCustomData, apiEventId);
    sendCAPIEvent(apiUrl, "AddPaymentInfo", apiCustomData, userData, apiEventId, testEventCode);
  }, [pageState, pixel, apiUrl, testEventCode]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleProduct = useCallback((product) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.upsell_product_id === product.id);
      if (exists) return prev.filter(i => i.upsell_product_id !== product.id);
      return [...prev, { upsell_product_id: product.id, size: null }];
    });
  }, []);

  const handleSizeChange = useCallback((productId, size) => {
    setSelectedItems(prev => prev.map(i =>
      i.upsell_product_id === productId ? { ...i, size } : i
    ));
  }, []);

  const handleAccept = useCallback(async () => {
    if (selectedItems.length === 0) return;
    setActionLoading(true);

    if (pixel?.length && pageState.products?.length && pageState.customer) {
      const { products, customer } = pageState;
      const formattedPhone = formatPhoneForFacebook(customer.phone_number);
      const eventId = `UA_${customer.order_id}_${Date.now()}`;

      // Only the accepted (selected) products
      const acceptedProducts = products.filter(p =>
        selectedItems.some(i => i.upsell_product_id === p.id)
      );
      const contents  = acceptedProducts.map(p => ({
        id:         `upsell_${p.id}`,
        quantity:   1,
        item_price: Math.round(Number(p.offer_price) || 0),
      }));
      const totalValue = acceptedProducts.reduce((s, p) => s + (Number(p.offer_price) || 0), 0);

      const customData = {
        value:        totalValue,
        currency:     "BDT",
        content_name: acceptedProducts.map(p => p.name).join(", "),
        content_type: "product",
        content_ids:  acceptedProducts.map(p => `upsell_${p.id}`),
        contents,
        num_items:    acceptedProducts.length,
        order_id:     customer.order_id,
        external_id:  String(customer.id || customer.order_id),
      };
      const userData = {
        phone:       formattedPhone,
        name:        customer.customer_name || "",
        city:        extractDistrict(customer.address),
        state:       extractDivision(customer.address),
        external_id: String(customer.id || customer.order_id),
      };

      trackBrowserEvent(pixel, "UpsellAccepted", customData, eventId);
      sendCAPIEvent(apiUrl, "UpsellAccepted", customData, userData, eventId, testEventCode);
    }

    try {
      await fetch(`${config.apiUrl}/upsell/${order_id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems }),
      });
    } catch { /* always redirect */ }
    router.push(`/thankyou/${order_id}`);
  }, [order_id, selectedItems, pageState, pixel, apiUrl, testEventCode, router]);

  const handleDecline = useCallback(async () => {
    try {
      await fetch(`${config.apiUrl}/upsell/${order_id}/decline`, { method: "POST" });
    } catch { /* always redirect */ }
    router.push(`/thankyou/${order_id}`);
  }, [order_id, router]);

  const { loading, product, products, pageConfig: cfg, upsellStatus, customer } = pageState;

  if (loading) return <LoadingSpinner />;
  if (upsellStatus === "accepted" || upsellStatus === "declined") {
    return <AlreadyHandled status={upsellStatus} orderId={order_id} />;
  }
  if (!product) return <LoadingSpinner />;

  const isMulti = products.length > 1;

  // Validation: every selected item that needs a size must have one
  const canAccept = selectedItems.length > 0 && selectedItems.every(item => {
    const p = products.find(p => p.id === item.upsell_product_id);
    if (!p) return false;
    return !(Array.isArray(p.sizes) && p.sizes.length > 0) || !!item.size;
  });

  // Design tokens
  const design       = cfg?.design ?? {};
  const maxWidth     = design.max_width     ?? "480px";
  const borderRadius = design.border_radius ?? "16px";
  const pageBg       = design.page_bg       ?? "#F3F4F6";
  const shadow       = design.shadow        !== false;
  const footerText   = cfg?.footer?.text       ?? "";
  const footerColor  = cfg?.footer?.text_color ?? "#9CA3AF";
  const sectionsOrder   = Array.isArray(cfg?.sections_order)
    ? cfg.sections_order
    : ["header", "urgency", "scarcity", "product", "pricing", "timer", "cta", "trust"];
  const sectionsEnabled = cfg?.sections_enabled ?? {};

  const sharedProps = {
    product,
    config: cfg,
    imageUrl: config.imageUrl,
    onAccept: handleAccept,
    onDecline: handleDecline,
    loading: actionLoading,
    disabled: !canAccept,
  };

  // ── Single-product sections (existing layout) ────────────────────────────
  const SECTION_RENDERERS_SINGLE = {
    header:   (p) => <UpsellHeader    key="header"   {...p} />,
    urgency:  (p) => <UrgencyBanner   key="urgency"  {...p} />,
    scarcity: (p) => <ScarcitySection key="scarcity" {...p} />,
    product:  (p) => <ProductShowcase key="product"  {...p} />,
    pricing:  (p) => <PricingSection  key="pricing"  {...p} />,
    timer:    (p) => <CountdownTimer  key="timer"    {...p} />,
    cta:      (p) => <CTASection      key="cta"      {...p} />,
    trust:    (p) => <TrustBadges     key="trust"    {...p} />,
  };

  // ── Multi-product: replace product+pricing sections with card grid ───────
  const SECTION_RENDERERS_MULTI = {
    header:   (p) => <UpsellHeader    key="header"   {...p} />,
    urgency:  (p) => <UrgencyBanner   key="urgency"  {...p} />,
    scarcity: (p) => <ScarcitySection key="scarcity" {...p} />,
    product:  () => (
      <MultiProductGrid
        key="product-grid"
        products={products}
        selectedItems={selectedItems}
        onToggle={handleToggleProduct}
        onSizeChange={handleSizeChange}
        cfg={cfg}
      />
    ),
    pricing:  () => null, // pricing is shown per-card in the grid
    timer:    (p) => <CountdownTimer  key="timer"    {...p} />,
    cta:      (p) => (
      <div key="cta-multi">
        <SelectedTotal
          products={products}
          selectedItems={selectedItems}
          cfg={cfg}
          orderTotal={customer?.order_total ?? 0}
        />
        <CTASection {...p} />
      </div>
    ),
    trust:    (p) => <TrustBadges     key="trust"    {...p} />,
  };

  const renderers = isMulti ? SECTION_RENDERERS_MULTI : SECTION_RENDERERS_SINGLE;

  const singleItem = !isMulti ? selectedItems.find(i => i.upsell_product_id === product.id) : null;
  const singleNeedsSize = !isMulti && Array.isArray(product.sizes) && product.sizes.length > 0;

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

          // Single product: inject size selector just before CTA
          if (!isMulti && key === "cta") {
            return (
              <div key="cta-single">
                {singleNeedsSize && (
                  <SingleSizeSelector
                    product={product}
                    selectedItem={singleItem}
                    onSizeChange={handleSizeChange}
                  />
                )}
                <CTASection {...sharedProps} />
              </div>
            );
          }

          const render = renderers[key];
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
        disabled={!canAccept}
      />
    </div>
  );
}
