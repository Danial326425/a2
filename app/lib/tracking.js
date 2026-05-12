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

  // Custom analytics
  const analyticsData = {
    event: eventName,
    slug: slug,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };

  // Store in sessionStorage for debugging
  try {
    const existingEvents = JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
    existingEvents.push(analyticsData);
    sessionStorage.setItem('analytics_events', JSON.stringify(existingEvents.slice(-50)));
  } catch (e) {
    console.error('Error storing analytics:', e);
  }
};