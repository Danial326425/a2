/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
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
