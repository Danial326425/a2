// =============================================================================
// pixel.js — Facebook Pixel + Conversions API (CAPI) Hybrid Tracking
// =============================================================================
// Architecture:
//   - Browser Pixel  → fires via window.fbq ('trackSingle' per pixel)
//   - Server CAPI    → fires via backend /fb-track endpoint (hashed PII)
//   - Deduplication  → same event_id used for both browser + CAPI
//   - Reliability    → fetch with keepalive survives page navigation/unload
//
// PageView policy (CRITICAL):
//   - fbq('init') triggers Meta SDK's built-in PageView beacon (uncontrollable
//     event_id, cannot be deduped with CAPI properly).
//   - Meta SDK also auto-fires PageView on history.pushState (SPA navigation)
//     by default — this is the source of the "extra browser PageView on
//     navigate" bug.
//   - We disable BOTH by setting fbq.disablePushState = true BEFORE init,
//     AND by setting window._fbq.disablePushState = true. Then we manually
//     fire ALL PageViews from PixelPageView with our own event_id.
// =============================================================================

const DEBUG = process.env.NODE_ENV === 'development';

const log = (...args) => {
  if (DEBUG) console.log('[Pixel]', ...args);
};

// ─── Unique Event ID ──────────────────────────────────────────────────────────
export const generateEventId = (prefix = 'ev') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ─── Cookie & Storage Helpers ─────────────────────────────────────────────────
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : null;
};

export const generateFBC = () => {
  if (typeof window === 'undefined') return null;
  const existing = getCookie('_fbc');
  if (existing) return existing;
  // Extract fbclid EXACTLY as it appears in the URL. Do NOT use
  // URLSearchParams.get() — it decodes '+' to a space and '%XX' escapes,
  // which alters the fbclid. Meta flags any modified fbclid in fbc.
  const m = window.location.search.match(/[?&]fbclid=([^&#]+)/);
  const fbclid = m ? m[1] : null;
  if (!fbclid) return null;
  const fbc = `fb.1.${Date.now()}.${fbclid}`;
  try {
    document.cookie = `_fbc=${fbc};path=/;max-age=7776000`;
    localStorage.setItem('fbc', fbc);
  } catch { /* storage blocked */ }
  return fbc;
};

export const getFBC = () => {
  if (typeof window === 'undefined') return null;
  // Existing cookie/storage first, else mint one from a ?fbclid still in the
  // URL (covers ad traffic where the SDK hasn't written _fbc yet). Non-ad
  // visitors legitimately have no fbc — that's expected, not a defect.
  return getCookie('_fbc') || localStorage.getItem('fbc') || generateFBC();
};

export const getFBP = () => {
  if (typeof window === 'undefined') return null;
  const existing = getCookie('_fbp') || localStorage.getItem('fbp');
  if (existing) return existing;
  // No _fbp yet — the first CAPI event (e.g. PageView) often fires before the
  // Pixel SDK has written the cookie, leaving server events without fbp and
  // dragging EMQ down. Mint one in Meta's exact format and persist it; the SDK
  // adopts an existing _fbp instead of overwriting it, so browser + CAPI (and
  // the value we store on the order for the Confirm Purchase) all share the
  // same fbp. Guarantees fbp coverage on every event.
  const fbp = `fb.1.${Date.now()}.${Math.floor(Math.random() * 1e16)}`;
  try {
    document.cookie = `_fbp=${fbp};path=/;max-age=7776000`;
    localStorage.setItem('fbp', fbp);
  } catch { /* storage blocked — still return the value for this event */ }
  return fbp;
};

// Persistent anonymous visitor id used as external_id on events that have no
// logged-in customer yet (PageView, ViewContent, InitiateCheckout). Reuses the
// same `_own_vid` key as the own-analytics tracker so it's stable per browser
// and boosts Event Match Quality. Backend hashes external_id before sending.
export const getExternalId = () => {
  if (typeof window === 'undefined') return null;
  try {
    let vid = localStorage.getItem('_own_vid');
    if (!vid) {
      vid = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('_own_vid', vid);
    }
    return vid;
  } catch { return null; }
};

export const formatPhoneForFacebook = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && !digits.startsWith('880')) {
    return `880${digits.substring(1)}`;
  }
  return digits;
};

// ─── Pixel SDK Bootstrap ──────────────────────────────────────────────────────
// CRITICAL: We set disablePushState = true on the fbq stub BEFORE init runs.
// This prevents Meta SDK from auto-firing PageView on history.pushState/popstate
// events — which is exactly what happens during Next.js SPA navigation and
// was causing the "extra browser PageView on navigate" bug.
//
// We also override the auto-PageView that fbq('init') itself fires by setting
// the flag before init is queued.
const ensurePixelSDK = () => {
  if (typeof window === 'undefined') return;

  // SDK script already injected — disablePushState flag is already set, nothing to do.
  if (window.__fbqScriptInjected) return;

  // Another module / header_scripts already set up fbq — make sure pushState
  // tracking is still disabled on it (idempotent).
  if (window.fbq && window.__fbqScriptInjected === undefined) {
    window.fbq.disablePushState = true;
    if (window._fbq) window._fbq.disablePushState = true;
    window.__fbqScriptInjected = true;
    log('SDK already present (external source) — disablePushState forced');
    return;
  }

  // Set up the fbq stub that queues commands until the SDK loads.
  if (!window.fbq) {
    window.fbq = function () {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push    = window.fbq;
    window.fbq.loaded  = true;
    window.fbq.version = '2.0';
    window.fbq.queue   = [];

    // ⚠ CRITICAL: must be set BEFORE any fbq('init') is queued, so the SDK
    // reads this flag during its first run and skips auto-PageView fires
    // on pushState/popstate (SPA navigation).
    window.fbq.disablePushState  = true;
    window._fbq.disablePushState = true;

    log('fbq stub created (disablePushState = true)');
  }

  // Inject the FB Pixel SDK script once.
  const script = document.createElement('script');
  script.async = true;
  script.src   = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  window.__fbqScriptInjected = true;
  log('SDK script injected');
};

// ─── Initialize Pixels ────────────────────────────────────────────────────────
// Idempotent — safe to call from anywhere, will only `fbq('init', id)` each
// pixel ID exactly once per browser session (window guard).
//
// NOTE: fbq('init') normally fires a built-in PageView beacon, BUT we set
// fbq.disablePushState = true in ensurePixelSDK BEFORE init runs, which also
// suppresses that initial PageView. All PageViews come from PixelPageView's
// explicit trackBrowserEvent call.
export const initFacebookPixels = (pixelIds) => {
  if (typeof window === 'undefined' || !Array.isArray(pixelIds) || !pixelIds.length) return;

  ensurePixelSDK();

  // Use window-level set so module re-eval (HMR) doesn't reset the guard.
  if (!window.__fbqPixelsInitialized) window.__fbqPixelsInitialized = [];

  const newIds = pixelIds
    .map(String)
    .filter(id => !window.__fbqPixelsInitialized.includes(id));

  if (!newIds.length) {
    log('initFacebookPixels — all pixels already initialized, skipping');
    return;
  }

  newIds.forEach(pixelId => {
    // Disable the SDK's automatic event collection BEFORE init. With autoConfig
    // on, the Meta Pixel fires its OWN PageView on init and on every SPA
    // history change (pushState) — which is the source of the duplicate
    // PageView on route changes — plus automatic button-click events
    // (SubscribedButtonClick). We fire every event explicitly (browser +
    // CAPI, deduped by event_id), so the automatic ones are pure noise/dupes.
    // Must run before init for the SDK to honour it.
    window.fbq('set', 'autoConfig', false, pixelId);
    window.fbq('init', pixelId);
    window.__fbqPixelsInitialized.push(pixelId);
    log(`fbq('init', '${pixelId}') (autoConfig off)`);
  });
};

// updateAdvancedMatching is intentionally REMOVED from this export.
// Calling fbq('init') a second time triggers a duplicate PageView beacon.
// PII is passed to Facebook via CAPI userData (hashed server-side) instead.

// ─── Browser Pixel Event ──────────────────────────────────────────────────────
export const trackBrowserEvent = (pixelIds, eventName, eventParams = {}, eventId) => {
  if (typeof window === 'undefined' || !window.fbq) return null;
  if (!Array.isArray(pixelIds) || !pixelIds.length) return null;

  const id = eventId || generateEventId(eventName.slice(0, 2).toLowerCase());

  // Strip PII — these must only travel via CAPI (hashed server-side).
  const {
    phone, email, name, city, state,
    fbc, fbp, external_id,
    event_id, event_time,
    ...customData
  } = eventParams;

  pixelIds.forEach(pixelId => {
    window.fbq('trackSingle', String(pixelId), eventName, {
      ...customData,
      event_source_url: customData.event_source_url || window.location.href,
    }, { eventID: id });
  });

  log(`trackBrowserEvent '${eventName}' eventId=${id}`, customData);
  return id;
};

// ─── CAPI Event (Server Side) ─────────────────────────────────────────────────
export const sendCAPIEvent = (
  apiUrl,
  eventName,
  customData = {},
  userData = {},
  eventId,
  testEventCodes = []
) => {
  if (typeof window === 'undefined') return;

  const payload = {
    event:            eventName,
    event_id:         eventId,
    event_source_url: window.location.href,
    event_time:       Math.floor(Date.now() / 1000),
    fbc:              getFBC(),
    fbp:              getFBP(),
    ...customData,
    ...userData,
  };

  // Ensure every event carries an external_id (boosts Event Match Quality).
  // Order events already supply their own (customer id / phone) — keep those;
  // anonymous events (PageView/ViewContent/InitiateCheckout) fall back to the
  // persistent visitor id.
  if (!payload.external_id) {
    payload.external_id = getExternalId();
  }

  if (testEventCodes?.[0]) {
    payload.test_event_code = testEventCodes[0];
  }

  log(`sendCAPIEvent '${eventName}' eventId=${eventId}`);

  if (typeof fetch !== 'undefined') {
    fetch(`${apiUrl}/fb-track`, {
      method:    'POST',
      headers:   { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:      JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
};

// ─── Hybrid Event (Browser + CAPI) ───────────────────────────────────────────
export const trackHybridEvent = ({
  pixelIds,
  apiUrl,
  eventName,
  customData = {},
  userData = {},
  testEventCodes = [],
  eventId,
}) => {
  const id = eventId || generateEventId(eventName.slice(0, 2).toLowerCase());
  trackBrowserEvent(pixelIds, eventName, customData, id);
  sendCAPIEvent(apiUrl, eventName, customData, userData, id, testEventCodes);
  return id;
};

// ─── Legacy Compatibility ─────────────────────────────────────────────────────
export const trackEventOnMultiplePixels = (pixelIds, eventName, eventParams = {}) => {
  if (typeof window === 'undefined' || !window.fbq || !Array.isArray(pixelIds)) return;
  const { event_id, ...rest } = eventParams;
  pixelIds.forEach(pixelId => {
    window.fbq('trackSingle', String(pixelId), eventName, {
      ...rest,
      event_source_url: window.location.href,
    }, { eventID: event_id });
  });
};