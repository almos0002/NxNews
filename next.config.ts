import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "9fc197d0-17bb-4755-8c40-0cec88ae0c76-00-1k2ewmg8u1fa1.pike.replit.dev",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
