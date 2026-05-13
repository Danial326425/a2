"use client";

export default function PricingSection({ product, config }) {
  const pr = config?.pricing ?? {};
  const accentColor    = pr.accent_color    ?? '#EF4444';
  const currencySymbol = pr.currency_symbol ?? '৳';
  const offerLabel     = pr.offer_label     ?? '🎁 বিশেষ একবারের মূল্য';
  const savingsLabel   = pr.savings_label   ?? 'সাশ্রয়';

  const originalPrice = product?.original_price ?? 0;
  const offerPrice    = product?.offer_price    ?? 0;
  const savings       = originalPrice > offerPrice ? originalPrice - offerPrice : 0;

  return (
    <div className="mx-4 mt-3 rounded-2xl bg-white border-2 p-4 shadow-sm" style={{ borderColor: accentColor + '33' }}>
      {offerLabel && (
        <p className="text-xs font-semibold mb-2 text-center" style={{ color: accentColor }}>
          {offerLabel}
        </p>
      )}
      <div className="flex items-end justify-center gap-3">
        <span className="text-3xl font-extrabold" style={{ color: accentColor }}>
          {currencySymbol}{offerPrice.toLocaleString()}
        </span>
        {pr.show_original && originalPrice > offerPrice && (
          <span className="text-base text-gray-400 line-through pb-1">
            {currencySymbol}{originalPrice.toLocaleString()}
          </span>
        )}
      </div>
      {pr.show_savings && savings > 0 && (
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
  );
}
