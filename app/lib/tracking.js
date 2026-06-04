import { config } from '@/config/config';

function getVisitorId() {
  try {
    let vid = localStorage.getItem('_own_vid');
    if (!vid) {
      vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('_own_vid', vid);
    }
    return vid;
  } catch { return ''; }
}

function getSessionId() {
  try {
    let sid = sessionStorage.getItem('_own_sid');
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('_own_sid', sid);
    }
    return sid;
  } catch { return ''; }
}

// Own analytics — sends to /api/evt (backend caches & dedupes)
export function ownTrack(eventType, slug) {
  if (typeof window === 'undefined') return;
  try {
    fetch(`${config.apiUrl}/evt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        slug: slug || 'home',
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        referrer: document.referrer || '',
      }),
    }).catch(() => {});
  } catch { /* non-blocking */ }
}

export const track = (eventName, slug) => {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, {
      page_path: window.location.pathname,
      product_slug: slug,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', eventName, {
      content_name: slug,
      event_source_url: window.location.href,
    });
  }
};