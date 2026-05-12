// =============================================================================
// pixel.js — Facebook Pixel + Conversions API (CAPI) Hybrid Tracking
// =============================================================================
// Architecture:
//   - Browser Pixel  → fires via window.fbq ('trackSingle' per pixel)
//   - Server CAPI    → fires via backend /fb-track endpoint (hashed PII)
//   - Deduplication  → same event_id used for both browser + CAPI
//   - Reliability    → fetch with keepalive survives page navigation/unload
// =============================================================================

// ─── Unique Event ID ──────────────────────────────────────────────────────────
// Generate one ID per event occurrence. Pass to BOTH browser fbq and CAPI.
export const generateEventId = (prefix = 'ev') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ─── Cookie & Storage Helpers ─────────────────────────────────────────────────
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : null;
};

export const getFBC = () => getCookie('_fbc') || localStorage.getItem('fbc') || null;
export const getFBP = () => getCookie('_fbp') || localStorage.getItem('fbp') || null;

// Generate + store fbc from ?fbclid= URL param (call once on page load).
export const generateFBC = () => {
  const existing = getCookie('_fbc');
  if (existing) return existing;
  if (typeof window === 'undefined') return null;
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (!fbclid) return null;
  const fbc = `fb.1.${Date.now()}.${fbclid}`;
  document.cookie = `_fbc=${fbc};path=/;max-age=7776000`;
  localStorage.setItem('fbc', fbc);
  return fbc;
};

// Format phone to E.164 (Facebook/CAPI standard for Bangladesh).
export const formatPhoneForFacebook = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && !digits.startsWith('880')) {
    return `880${digits.substring(1)}`;
  }
  return digits;
};

// ─── Pixel SDK Bootstrap ──────────────────────────────────────────────────────
let pixelsInitialized = [];
let sdkScriptInjected = false;

const ensurePixelSDK = () => {
  if (typeof window === 'undefined' || window.fbq) return;

  window.fbq = function () {
    window.fbq.callMethod
      ? window.fbq.callMethod.apply(window.fbq, arguments)
      : window.fbq.queue.push(arguments);
  };
  if (!window._fbq) window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = [];

  if (!sdkScriptInjected) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
    sdkScriptInjected = true;
  }
};

// ─── Initialize Pixels ────────────────────────────────────────────────────────
// Call once on App mount. Does NOT fire PageView — use trackBrowserEvent separately.
// advancedMatch: { ph, em, fn, ln } — unhashed values, Facebook hashes client-side.
export const initFacebookPixels = (pixelIds, advancedMatch = {}) => {
  if (typeof window === 'undefined' || !Array.isArray(pixelIds)) return;

  ensurePixelSDK();

  const newPixelIds = pixelIds.map(String).filter(id => !pixelsInitialized.includes(id));
  if (newPixelIds.length === 0) return;

  const matchData = {};
  if (advancedMatch.ph) matchData.ph = advancedMatch.ph;
  if (advancedMatch.em) matchData.em = advancedMatch.em;
  if (advancedMatch.fn) matchData.fn = advancedMatch.fn;
  if (advancedMatch.ln) matchData.ln = advancedMatch.ln;

  newPixelIds.forEach(pixelId => {
    window.fbq('init', pixelId, matchData);
    pixelsInitialized.push(pixelId);
  });
};

// Update advanced matching for already-initialized pixels (call when user data is known).
// e.g., on ThankYou page after we have customer phone/name.
export const updateAdvancedMatching = (pixelIds, matchData = {}) => {
  if (typeof window === 'undefined' || !window.fbq || !Array.isArray(pixelIds)) return;

  const clean = {};
  if (matchData.ph) clean.ph = matchData.ph;
  if (matchData.em) clean.em = matchData.em;
  if (matchData.fn) clean.fn = matchData.fn;
  if (matchData.ln) clean.ln = matchData.ln;
  if (!Object.keys(clean).length) return;

  pixelIds.forEach(pixelId => window.fbq('init', String(pixelId), clean));
};

// ─── Browser Pixel Event ──────────────────────────────────────────────────────
// Fires client-side pixel via fbq('trackSingle').
// PII fields are stripped automatically — never send PII to browser pixel.
export const trackBrowserEvent = (pixelIds, eventName, eventParams = {}, eventId) => {
  if (typeof window === 'undefined' || !window.fbq) return null;
  if (!Array.isArray(pixelIds) || !pixelIds.length) return null;

  const id = eventId || generateEventId(eventName.slice(0, 2).toLowerCase());

  // Strip PII — these are handled server-side via CAPI
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

  return id;
};

// ─── CAPI Event (Server Side) ─────────────────────────────────────────────────
// Sends to backend /fb-track which forwards to Facebook Conversions API.
// Uses fetch + keepalive so the request survives page navigation / unload.
// userData fields (phone, name, city, state) are hashed by the backend.
export const sendCAPIEvent = (
  apiUrl,
  eventName,
  customData = {},
  userData = {},
  eventId,
  testEventCodes = []
) => {
  const payload = {
    event: eventName,
    event_id: eventId,
    event_source_url: typeof window !== 'undefined' ? window.location.href : '',
    event_time: Math.floor(Date.now() / 1000),
    fbc: getFBC(),
    fbp: getFBP(),
    ...customData,
    ...userData,
  };

  if (testEventCodes?.[0]) {
    payload.test_event_code = testEventCodes[0];
  }

  // fetch with keepalive ensures the request completes even if the page navigates away.
  // This prevents CAPI events from being cancelled when user submits a form / navigates.
  if (typeof fetch !== 'undefined') {
    fetch(`${apiUrl}/fb-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
};

// ─── Hybrid Event (Browser + CAPI) ───────────────────────────────────────────
// Fires BOTH browser pixel and CAPI with the SAME event_id for proper deduplication.
// Facebook Events Manager will show one as "Processed" and the other as "Deduplicated".
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
// Retained for backward compatibility. New code should use trackBrowserEvent.
export const trackEventOnMultiplePixels = (pixelIds, eventName, eventParams = {}) => {
  if (typeof window === 'undefined' || !window.fbq || !Array.isArray(pixelIds)) return;
  const { event_id, ...rest } = eventParams;
  pixelIds.forEach(pixelId => {
    window.fbq('trackSingle', String(pixelId), eventName, {
      ...rest,
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
    }, { eventID: event_id });
  });
};
