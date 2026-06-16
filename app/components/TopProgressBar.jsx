'use client';

// Global navigation progress bar — gives instant feedback the moment a customer
// taps an internal link, so they never wonder "did my tap register?" while the
// next (server-rendered) page loads. Dependency-free.
//
// How it works:
//   - A capture-phase click listener starts the bar the instant an internal
//     <a>/Link is tapped (before navigation even begins).
//   - usePathname change = the new route finished → the bar completes + fades.

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const lastPathRef = useRef(null);

  const start = () => {
    clearInterval(timerRef.current);
    setVisible(true);
    setProgress(10);
    // Creep toward 90% while we wait for the new page.
    timerRef.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(0.6, (90 - p) * 0.07) : p));
    }, 180);
  };

  const finish = () => {
    clearInterval(timerRef.current);
    setProgress(100);
    window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 280);
  };

  // Start on tap of an internal link.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = e.target.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return; // internal only
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const dest = new URL(anchor.href, window.location.href);
      if (dest.pathname === window.location.pathname && dest.search === window.location.search) {
        return; // same page (or pure hash) — no navigation
      }
      start();
    };

    document.addEventListener('click', onClick, true); // capture so it runs before Link
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Finish when the route actually changes.
  useEffect(() => {
    if (lastPathRef.current !== null && lastPathRef.current !== pathname) {
      finish();
    }
    lastPathRef.current = pathname;
    return () => clearInterval(timerRef.current);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="h-full bg-green-500 transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(34,197,94,0.7)' }}
      />
    </div>
  );
}
