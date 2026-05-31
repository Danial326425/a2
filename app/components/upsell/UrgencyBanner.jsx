"use client";

export default function UrgencyBanner({ config }) {
  const u = config?.urgency ?? {};
  if (u.enabled === false) return null;

  const bgColor   = u.bg_color   ?? '#EF4444';
  const textColor = u.text_color ?? '#ffffff';
  const text      = u.text       ?? '🔥 সীমিত সময়ের অফার';
  const fontSize  = u.font_size  ?? '14px';

  return (
    <div className="px-4 pt-4 pb-1">
      <div
        className="px-4 py-2.5 rounded-xl text-center font-bold"
        style={{ backgroundColor: bgColor, color: textColor, fontSize }}
      >
        <span className="inline-flex items-center gap-1 animate-pulse">
          {text}
        </span>
      </div>
    </div>
  );
}
