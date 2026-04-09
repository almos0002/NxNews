import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.pike.replit.dev",
    "*.janeway.replit.dev",
    "*.repl.co",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.replit.dev",
      },
      {
        protocol: "https",
        hostname: "*.janeway.replit.dev",
      },
      {
        protocol: "https",
        hostname: "*.pike.replit.dev",
      },
      {
        protocol: "https",
        hostname: "*.repl.co",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
