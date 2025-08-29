import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.spoonacular.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'edamam.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.edamam.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
