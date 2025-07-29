import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly disable static export
  output: undefined,
  // Configure for serverless deployment
  serverExternalPackages: ['@prisma/client'],
  // Ensure we're not doing static export
  trailingSlash: false,
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
