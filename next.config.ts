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
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'antd',
      'recharts',
      'motion/react',
      'dayjs',
    ],
  },
  async headers() {
    return [
      {
        source: '/app/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'Vary',
            value: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Vary',
            value: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
