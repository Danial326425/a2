const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const createApiService = () => {
  let lastCallTime = 0;
  const minDelay = 1000;

  return {
    get: async (url) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      if (timeSinceLastCall < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastCall));
      }

      lastCallTime = Date.now();
      const response = await fetch(`${API_BASE}${url}`);
      return { data: await response.json() };
    },
    post: async (url, data) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      if (timeSinceLastCall < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastCall));
      }

      lastCallTime = Date.now();
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return { data: await response.json() };
    }
  };
};

export const fetchWithRetry = async (apiCall, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await apiCall();
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};