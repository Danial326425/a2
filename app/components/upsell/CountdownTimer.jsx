"use client";

import { useState, useEffect, useRef } from "react";

export default function CountdownTimer({ config }) {
  const t = config?.timer ?? {};
  if (t.enabled === false) return null;

  const totalSeconds  = (t.minutes ?? 10) * 60;
  const bgColor       = t.bg_color    ?? '#1a1a2e';
  const textColor     = t.text_color  ?? '#ffffff';
  const accentColor   = t.accent_color ?? '#EF4444';
  const showProgress  = t.show_progress !== false;
  const headline      = t.headline ?? '⏳ অফার শেষ হবে';

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="mx-4 mt-3 rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: bgColor }}>
      <div className="px-4 pt-4 pb-2 text-center">
        {headline && (
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider opacity-70" style={{ color: textColor }}>
            {headline}
          </p>
        )}
        <div className="flex justify-center gap-3">
          {[
            { value: pad(minutes), label: 'মিনিট' },
            { value: pad(seconds), label: 'সেকেন্ড' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-extrabold shadow-inner"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: accentColor }}
              >
                {value}
              </div>
              <span className="text-xs mt-1 opacity-60" style={{ color: textColor }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {showProgress && (
        <div className="px-4 pb-4">
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
