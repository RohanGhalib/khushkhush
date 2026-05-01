import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'r2.khushkhush.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
