"use client";

export default function UpsellHeader({ config }) {
  const h = config?.header ?? {};

  const bgColor   = h.bg_color   ?? '#1a1a2e';
  const textColor = h.text_color ?? '#ffffff';

  return (
    <div
      className="px-5 pt-6 pb-8 text-center"
      style={{ backgroundColor: bgColor, color: textColor, borderRadius: '0 0 24px 24px' }}
    >
      {h.badge_text && (
        <span
          className="inline-block font-bold px-3 py-1 rounded-full mb-3"
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            color:    h.badge_color     || textColor,
            fontSize: h.badge_font_size || '12px',
          }}
        >
          {h.badge_text}
        </span>
      )}
      {h.headline && (
        <h1
          className="font-extrabold leading-tight mb-2"
          style={{
            color:    h.headline_color     || textColor,
            fontSize: h.headline_font_size || '20px',
          }}
        >
          {h.headline}
        </h1>
      )}
      {h.subheadline && (
        <p
          className="opacity-80 leading-relaxed"
          style={{
            color:    h.subheadline_color     || textColor,
            fontSize: h.subheadline_font_size || '14px',
          }}
        >
          {h.subheadline}
        </p>
      )}
    </div>
  );
}
