import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const allowedDevOrigins = [
  "*.replit.dev",
  "*.picard.replit.dev",
  "*.pike.replit.dev",
  "*.janeway.replit.dev",
  "*.repl.co",
];

if (process.env.REPLIT_DEV_DOMAIN) {
  allowedDevOrigins.push(process.env.REPLIT_DEV_DOMAIN);
}

const nextConfig: NextConfig = {
  allowedDevOrigins,
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
        hostname: "*.picard.replit.dev",
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
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
