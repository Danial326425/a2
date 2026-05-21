"use client";

export default function CTASection({ product, config, onAccept, onDecline, loading }) {
  const c = config?.cta ?? {};

  const buttonText        = product?.cta_text || c.button_text       || '✅ হ্যাঁ! আমি এই অফারটি নিতে চাই';
  const buttonBg          = c.button_bg        ?? '#16A34A';
  const buttonTextColor   = c.button_text_color ?? '#ffffff';
  const declineText       = c.decline_text      ?? 'না ধন্যবাদ, আমি এই বিশেষ ছাড় চাই না';
  const declineColor      = c.decline_color     ?? '#6B7280';
  const declineFontSize   = c.decline_font_size ?? '12px';
  const showGuarantee     = c.show_guarantee    !== false;
  const guaranteeText     = c.guarantee_text    ?? '১০০% নিরাপদ | ক্যাশ অন ডেলিভারি';
  const buttonWidthMobile    = c.button_width_mobile      || '100%';
  const buttonWidthDesktop   = c.button_width_desktop     || '100%';
  const buttonFontMobile     = c.button_font_size_mobile  || '16px';
  const buttonFontDesktop    = c.button_font_size_desktop || '18px';

  return (
    <>
      <style>{`
        .upsell-cta-btn {
          width: ${buttonWidthMobile};
          font-size: ${buttonFontMobile};
          margin-left: auto;
          margin-right: auto;
          display: block;
        }
        @media (min-width: 768px) {
          .upsell-cta-btn { width: ${buttonWidthDesktop}; font-size: ${buttonFontDesktop}; }
        }
      `}</style>

      <div className="mx-4 mt-4 space-y-3">
        <button
          onClick={onAccept}
          disabled={loading}
          className="upsell-cta-btn py-4 px-6 rounded-2xl font-extrabold shadow-lg transition-all active:scale-95 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
          style={{
            backgroundColor: buttonBg,
            color: buttonTextColor,
            boxShadow: `0 4px 20px ${buttonBg}66`,
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              প্রক্রিয়া করা হচ্ছে…
            </span>
          ) : buttonText}
        </button>

        {showGuarantee && guaranteeText && (
          <p className="text-center text-xs text-gray-500">{guaranteeText}</p>
        )}

        <button
          onClick={onDecline}
          disabled={loading}
          className="w-full py-2 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          style={{ color: declineColor, fontSize: declineFontSize }}
        >
          {declineText}
        </button>
      </div>
    </>
  );
}
