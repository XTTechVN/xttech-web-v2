import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  env: {
    MINIO_PUBLIC_URL: process.env.MINIO_PUBLIC_URL || 'https://minio-production-2298.up.railway.app',
  },
};

export default nextConfig;
