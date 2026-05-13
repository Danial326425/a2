"use client";

export default function UrgencyBanner({ config }) {
  const u = config?.urgency ?? {};
  if (u.enabled === false) return null;

  const bgColor   = u.bg_color   ?? '#EF4444';
  const textColor = u.text_color ?? '#ffffff';
  const text      = u.text       ?? '🔥 সীমিত সময়ের অফার';

  return (
    <div
      className="px-4 py-2 text-center text-sm font-bold"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <span className="inline-flex items-center gap-1 animate-pulse">
        {text}
      </span>
    </div>
  );
}
