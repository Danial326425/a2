export const generateEventId = (prefix = 'PIXEL') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const trackBrowserEvent = (pixels, eventName, customData, eventId) => {
  if (typeof window === 'undefined' || !pixels?.length) return;

  pixels.forEach(pixel => {
    if (window.fbq) {
      window.fbq('track', eventName, customData, { eventID: eventId });
    }
  });
};

export const sendCAPIEvent = async (apiUrl, eventName, customData, userData, eventId, testEventCode) => {
  try {
    const response = await fetch(`${apiUrl}/fb-track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        event_id: eventId,
        event_time: Math.floor(Date.now() / 1000),
        custom_data: customData,
        user_data: userData,
        test_event_code: testEventCode,
      }),
    });

    return response.json();
  } catch (error) {
    console.error('Error sending CAPI event:', error);
  }
};