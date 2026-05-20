'use client';

/**
 * PixelPageView — fires exactly one Browser PageView + one CAPI PageView per
 * unique pathname, deduplicated with the same event_id so Meta shows:
 *   Browser PageView = Processed
 *   Server PageView  = Deduplicated
 *
 * Why duplicates happened (and how this fixes them):
 *
 * Root cause #1 — Meta SDK auto-PageView on pushState:
 *   Facebook Pixel SDK by default listens to history.pushState/popstate and
 *   fires its own PageView on every URL change. Next.js SPA navigation uses
 *   pushState, so every route change triggered an extra browser PageView
 *   with an event_id we don't control (so CAPI couldn't dedupe it).
 *   Fix: set fbq.disablePushState = true in pixel.js ensurePixelSDK() BEFORE
 *   init runs. Now SDK only fires events we explicitly tell it to.
 *
 * Root cause #2 — Context re-render making Effect A re-fire:
 *   When ProductContext re-renders on route change, ctx.pixel gets a new
 *   array reference (even with same data). Effect A had `[pixel]` as a dep
 *   and would re-fire firePageView with the new pathname, producing a
 *   second event.
 *   Fix: pixelArrivedRef gates Effect A to "first arrival only".
 *
 * Dedup layers (defense in depth):
 *   - pixelArrivedRef — Effect A runs ONLY once per mount.
 *   - firedRef (Set) — per-path guard within a single mount lifecycle.
 *   - window.__fbqLastPageViewPath — cross-HMR / cross-remount guard.
 *
 * DO NOT call fbq('init') or fbq('track','PageView') anywhere else in the app.
 */

import { useContext, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ProductContext } from '../context/ProductsContext';
import {
  initFacebookPixels,
  trackBrowserEvent,
  sendCAPIEvent,
  generateEventId,
} from '@/pixel';

const SKIP_PREFIXES = ['/dashboard', '/editor', '/login', '/register', '/offer'];

const isDev = process.env.NODE_ENV === 'development';
const log   = (...args) => { if (isDev) console.log('[PixelPageView]', ...args); };

export default function PixelPageView() {
  const pathname = usePathname();
  const ctx      = useContext(ProductContext);

  // Always-current ref — avoids making pixel/apiUrl/testEventCode effect deps,
  // which is what previously caused Effect A to re-fire on every context update.
  const ctxRef = useRef(ctx);
  useEffect(() => { ctxRef.current = ctx; });

  // Per-mount fired-set: resets only on full-page reload (unmount), which is
  // exactly when window state also resets and a fresh PageView is appropriate.
  const firedRef = useRef(new Set());

  // Tracks whether pixel data has arrived (and we've handled it) at least once
  // for this mount. Prevents Effect A from re-firing when ctx.pixel reference
  // changes due to a parent context re-render — which happens on route change
  // and was one of the root causes of duplicate PageViews on SPA navigation.
  const pixelArrivedRef = useRef(false);

  const firePageView = useCallback((path) => {
    const { pixel, testEventCode, apiUrl } = ctxRef.current;

    // ── Guards ──────────────────────────────────────────────────────────────
    if (!path || SKIP_PREFIXES.some((p) => path.startsWith(p))) return;
    if (!pixel?.length) return;

    if (firedRef.current.has(path)) {
      log(`skip (firedRef) — already fired for "${path}"`);
      return;
    }
    if (typeof window !== 'undefined' && window.__fbqLastPageViewPath === path) {
      log(`skip (window) — already fired for "${path}"`);
      return;
    }

    // Mark FIRST — prevents any concurrent invocation from also firing.
    firedRef.current.add(path);
    if (typeof window !== 'undefined') {
      window.__fbqLastPageViewPath = path;
    }

    // ── Init + fire ─────────────────────────────────────────────────────────
    // initFacebookPixels is idempotent (checks window.__fbqPixelsInitialized),
    // AND it sets fbq.disablePushState = true so the SDK won't auto-fire
    // PageView on pushState/popstate — that was the source of the extra
    // browser PageView seen on SPA navigation.
    initFacebookPixels(pixel);

    const eventId   = generateEventId('PV');
    const sourceUrl = window.location.href;

    log(`PageView — path="${path}" pixel=${JSON.stringify(pixel)} eventId="${eventId}"`);

    trackBrowserEvent(pixel, 'PageView', { event_source_url: sourceUrl }, eventId);
    sendCAPIEvent(apiUrl, 'PageView', { event_source_url: sourceUrl }, {}, eventId, testEventCode);

    log(`fired ✓ — browser + CAPI — eventId="${eventId}"`);
  }, []); // no deps — reads fresh values via ctxRef

  // ── Effect A: pixel-arrival ────────────────────────────────────────────────
  // Fires ONLY the first time pixel IDs become available.
  // - Cold start (no cache): pixel arrives async after mount → fire here.
  // - Warm start (cached): pixel is set on first render → fire here on mount.
  // Either way, this only runs ONCE for the lifetime of this component mount.
  // Subsequent ctx.pixel reference changes are ignored via pixelArrivedRef.
  const { pixel } = ctx;
  useEffect(() => {
    if (!pixel?.length) return;
    if (pixelArrivedRef.current) {
      log('skip (Effect A) — pixel already arrived once, ignoring re-render');
      return;
    }
    pixelArrivedRef.current = true;
    firePageView(pathname);
  }, [pixel]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect B: route change ─────────────────────────────────────────────────
  // Fires on every pathname change (SPA navigation). On the initial mount, if
  // Effect A already fired for this path, firedRef catches it as a no-op.
  // On subsequent navigations, Effect A is dormant (pixelArrivedRef = true),
  // so this is the ONLY path that fires PageView.
  useEffect(() => {
    firePageView(pathname);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}