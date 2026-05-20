export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8000/storage',
  apiStorageUrl: process.env.NEXT_PUBLIC_API_STORAGE_URL || '/api/storage',
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  // Canonical base URL used by all SEO metadata builders. Set
  // NEXT_PUBLIC_SITE_URL in production to your real https origin (no trailing
  // slash). Falls back to localhost in dev so absolute OG / canonical URLs
  // still resolve when running `next dev`.
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Safwan',
  defaultLocale: 'bn_BD',
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
};
