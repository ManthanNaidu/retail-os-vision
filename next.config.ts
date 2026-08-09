import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  turbopack: {
    root: __dirname,
  },
  typescript: {
    // In production we handle TS checks separately; allow builds to complete
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
