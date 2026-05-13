"use client";

export default function TrustBadges({ config }) {
  const t = config?.trust ?? {};
  const bgColor   = t.bg_color   ?? '#F0FDF4';
  const textColor = t.text_color ?? '#166534';
  const iconColor = t.icon_color ?? '#16A34A';
  const headline  = t.headline;
  const badges    = Array.isArray(t.badges) ? t.badges : [];

  if (badges.length === 0) return null;

  return (
    <div className="mx-4 mt-3 rounded-2xl px-4 py-4" style={{ backgroundColor: bgColor }}>
      {headline && (
        <p className="text-xs font-bold mb-3 text-center" style={{ color: textColor }}>
          {headline}
        </p>
      )}
      <ul className="space-y-2">
        {badges.map((badge, i) => (
          <li key={i} className="flex items-center gap-2 text-sm" style={{ color: textColor }}>
            <span className="font-extrabold text-base flex-shrink-0" style={{ color: iconColor }}>✓</span>
            <span>{badge}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
