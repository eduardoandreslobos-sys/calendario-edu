import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles bundling; no static export.
  images: { unoptimized: true },
  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },
};

export default nextConfig;
