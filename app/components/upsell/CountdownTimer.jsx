"use client";

import { useState, useEffect, useRef } from "react";

// Timer end-time is persisted in sessionStorage so a page reload does not
// reset the countdown. Key is scoped to the configured duration so changing
// the setting in the dashboard starts a fresh timer.
function getOrCreateEndTime(totalSeconds) {
  const key = `upsell_timer_end_${totalSeconds}`;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const end = Number(stored);
      // If end is still in the future, reuse it
      if (end > Date.now()) return end;
    }
  } catch { /* private mode / SSR */ }

  // First visit or timer already expired — create a new end time
  const end = Date.now() + totalSeconds * 1000;
  try { sessionStorage.setItem(key, String(end)); } catch {}
  return end;
}

export default function CountdownTimer({ config, onExpire }) {
  const t = config?.timer ?? {};
  if (t.enabled === false) return null;

  const totalSeconds = (t.minutes ?? 10) * 60;
  const bgColor      = t.bg_color     ?? '#1a1a2e';
  const textColor    = t.text_color   ?? '#ffffff';
  const accentColor  = t.accent_color ?? '#EF4444';
  const showProgress = t.show_progress !== false;
  const headline     = t.headline     ?? '⏳ অফার শেষ হবে';
  const widthMobile  = t.width_mobile  || '100%';
  const widthDesktop = t.width_desktop || '100%';
  const showBg       = t.show_bg     !== false;
  const showShadow   = t.show_shadow  !== false;
  const showBorder   = t.show_border  === true;
  const borderColor  = t.border_color || accentColor;
  const borderWidth  = t.border_width || '1px';

  const endTimeRef   = useRef(null);
  const intervalRef  = useRef(null);
  const expiredRef   = useRef(false);
  const onExpireRef  = useRef(onExpire);
  onExpireRef.current = onExpire;

  const calcRemaining = () => {
    if (!endTimeRef.current) return totalSeconds;
    return Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    // Runs only on client after mount
    endTimeRef.current = getOrCreateEndTime(totalSeconds);
    expiredRef.current = false;
    setSecondsLeft(calcRemaining());

    intervalRef.current = setInterval(() => {
      const remaining = calcRemaining();
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(intervalRef.current);
        if (!expiredRef.current) {
          expiredRef.current = true;
          onExpireRef.current?.();
        }
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds]);

  const minutes  = Math.floor(secondsLeft / 60);
  const seconds  = secondsLeft % 60;
  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const pad      = (n) => String(n).padStart(2, '0');

  return (
    <>
      <style>{`
        .upsell-timer {
          width: ${widthMobile};
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 768px) {
          .upsell-timer { width: ${widthDesktop}; }
        }
      `}</style>

      <div
        className="upsell-timer mx-4 mt-3 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: showBg ? bgColor : 'transparent',
          boxShadow: showShadow ? '0 2px 12px rgba(0,0,0,0.15)' : 'none',
          border: showBorder ? `${borderWidth} solid ${borderColor}` : 'none',
        }}
      >
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
    </>
  );
}
