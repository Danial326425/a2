"use client";

export default function UpsellHeader({ config }) {
  const h = config?.header ?? {};
  const bgColor   = h.bg_color   ?? '#1a1a2e';
  const textColor = h.text_color ?? '#ffffff';

  return (
    <div
      className="px-5 py-6 text-center"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {h.badge_text && (
        <span
          className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: textColor }}
        >
          {h.badge_text}
        </span>
      )}
      {h.headline && (
        <h1 className="text-xl md:text-2xl font-extrabold leading-tight mb-2">
          {h.headline}
        </h1>
      )}
      {h.subheadline && (
        <p className="text-sm opacity-80 leading-relaxed">
          {h.subheadline}
        </p>
      )}
    </div>
  );
}
