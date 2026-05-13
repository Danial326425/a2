"use client";

import { useState, useEffect } from "react";

export default function StickyMobileCTA({ product, config, onAccept, loading }) {
  const [visible, setVisible] = useState(false);
  const c = config?.cta ?? {};

  const buttonText      = product?.cta_text || c.button_text      || '✅ অফারটি নিন';
  const buttonBg        = c.button_bg        ?? '#16A34A';
  const buttonTextColor = c.button_text_color ?? '#ffffff';

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-4 pt-2 bg-white/95 backdrop-blur border-t border-gray-100 shadow-2xl">
      <button
        onClick={onAccept}
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-sm font-extrabold transition-all active:scale-95 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
        style={{
          backgroundColor: buttonBg,
          color: buttonTextColor,
          boxShadow: `0 4px 16px ${buttonBg}55`,
        }}
      >
        {loading ? 'প্রক্রিয়া করা হচ্ছে…' : buttonText}
      </button>
    </div>
  );
}
