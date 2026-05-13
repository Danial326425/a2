"use client";

import { useState, useEffect } from "react";

export default function ScarcitySection({ config }) {
  const s = config?.scarcity ?? {};
  if (s.enabled === false) return null;

  const [count] = useState(() => {
    const min = s.count_min ?? 12;
    const max = s.count_max ?? 28;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });

  const bgColor   = s.bg_color   ?? '#FEF3C7';
  const textColor = s.text_color ?? '#92400E';

  const rawText = s.text ?? 'মাত্র <strong>{{count}}</strong> জন এই অফারটি দেখছেন';
  const html = rawText.replace('{{count}}', count);

  return (
    <div
      className="mx-4 mt-3 rounded-lg px-4 py-2 text-center text-sm"
      style={{ backgroundColor: bgColor, color: textColor }}
      dangerouslySetInnerHTML={{ __html: '👀 ' + html }}
    />
  );
}
