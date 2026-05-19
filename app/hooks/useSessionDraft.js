'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Persist a small state value to `sessionStorage` so it survives:
 *   - Page refresh (F5) within the same tab
 *   - back-nav from /thankyou or /upsell to the previous page
 *
 * Does NOT persist across tabs (sessionStorage scope) and NOT to localStorage
 * (intentional — checkout drafts shouldn't outlive the tab they were created in).
 *
 * The value is written 400 ms after the last change, debounced, so typing in
 * controlled inputs doesn't thrash storage.
 *
 * Usage:
 *   const [draft, setDraft] = useSessionDraft('checkout-draft-v1', { name: '', phone: '' });
 *   setDraft(d => ({ ...d, phone: '01...' }));
 *   ...
 *   clearSessionDraft('checkout-draft-v1'); // on order success
 *
 * Returns [value, setValue, clear].
 */
export function useSessionDraft(key, initialValue) {
  // Lazy initial state: read once on first mount.
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined' || !key) return initialValue;
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? { ...initialValue, ...JSON.parse(raw) } : initialValue;
    } catch {
      return initialValue;
    }
  });

  const writeTimer = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !key) return;
    clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch { /* quota / private mode */ }
    }, 400);
    return () => clearTimeout(writeTimer.current);
  }, [key, value]);

  const clear = () => {
    try { sessionStorage.removeItem(key); } catch {}
    setValue(initialValue);
  };

  return [value, setValue, clear];
}

/** Side-effect helper for clearing a draft from anywhere (e.g. after success). */
export function clearSessionDraft(key) {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(key); } catch {}
}
