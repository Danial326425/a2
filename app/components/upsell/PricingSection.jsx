"use client";

export default function PricingSection({ product, config }) {
  const pr = config?.pricing ?? {};

  const accentColor        = pr.accent_color          ?? '#EF4444';
  const currencySymbol     = pr.currency_symbol        ?? '৳';
  const showOfferLabel     = pr.show_offer_label       !== false;
  const offerLabel         = pr.offer_label            ?? '🎁 বিশেষ একবারের মূল্য';
  const offerLabelFontSize = pr.offer_label_font_size  || '12px';
  const offerLabelColor    = pr.offer_label_color      || accentColor;
  const savingsLabel       = pr.savings_label          ?? 'সাশ্রয়';

  // Style controls
  const bgColor      = pr.bg_color      ?? '#ffffff';
  const borderStyle  = pr.border_style  || 'solid';
  const borderWidth  = borderStyle === 'none' ? '0' : (pr.border_width || '2px');
  const borderColor  = pr.border_color  || (accentColor + '33');
  const showShadow   = pr.shadow        !== false;
  const widthMobile  = pr.width_mobile  || '100%';
  const widthDesktop = pr.width_desktop || '100%';

  const originalPrice = product?.original_price ?? 0;
  const offerPrice    = product?.offer_price    ?? 0;
  const savings       = originalPrice > offerPrice ? originalPrice - offerPrice : 0;

  return (
    <>
      <style>{`
        .upsell-pricing {
          width: ${widthMobile};
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 768px) {
          .upsell-pricing { width: ${widthDesktop}; }
        }
      `}</style>

      <div
        className="upsell-pricing mx-4 mt-3 rounded-2xl p-4"
        style={{
          backgroundColor: bgColor,
          border: `${borderWidth} ${borderStyle} ${borderColor}`,
          boxShadow: showShadow ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        {showOfferLabel && offerLabel && (
          <p className="font-semibold mb-2 text-center" style={{ color: offerLabelColor, fontSize: offerLabelFontSize }}>
            {offerLabel}
          </p>
        )}
        <div className="flex items-end justify-center gap-3">
          <span className="text-3xl font-extrabold" style={{ color: accentColor }}>
            {currencySymbol}{offerPrice.toLocaleString()}
          </span>
          {pr.show_original !== false && originalPrice > offerPrice && (
            <span className="text-base text-gray-400 line-through pb-1">
              {currencySymbol}{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        {pr.show_savings !== false && savings > 0 && (
          <div className="mt-2 text-center">
            <span
              className="inline-block text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: accentColor }}
            >
              {savingsLabel} {currencySymbol}{savings.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
