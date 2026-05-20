/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
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
    ],
    localPatterns: [
      {
        pathname: '/api/storage/**',
      },
    ],
  },
};

export default nextConfig;
