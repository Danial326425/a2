import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    // WebP only. AVIF gives slightly smaller files but its on-the-fly encode
    // is 5-10x SLOWER than WebP on a typical VPS, and the encoder serializes —
    // so on a cold load every above-the-fold image queues behind AVIF jobs and
    // the LCP image stalls for many seconds. WebP is the right trade for LCP.
    formats: ['image/webp'],
    // We only ever request these two quality levels (65 for banners, 75 the
    // default). Declaring them keeps Next from falling back / warning.
    qualities: [65, 75],
    // Fewer breakpoints → fewer distinct optimizer jobs / cache entries to warm
    // (the defaults include sizes we never use on a content-width layout).
    deviceSizes: [360, 480, 640, 768, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    // Cache optimized images server-side for 31 days so the LCP image and
    // repeat views aren't re-optimized every request.
    minimumCacheTTL: 2678400,
    // Next.js 16 blocks local-IP image optimization by default. We host the
    // Laravel API on localhost:8000 in dev, so allow it here. In production
    // the backend lives on a real hostname so this flag has no effect.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '/storage/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/storage/**',
      },
    ],
  },
};

export default nextConfig;
