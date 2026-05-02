import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { pool } from "../db/db";

const baseURL = process.env.BETTER_AUTH_URL ||
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:5000");

const trustedOrigins: string[] = [
  "http://localhost:5000",
  "http://localhost:3000",
];

if (process.env.REPLIT_DEV_DOMAIN) {
  trustedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}

if (process.env.REPLIT_DOMAINS) {
  process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
    trustedOrigins.push(`https://${d.trim()}`);
  });
}

export const auth = betterAuth({
  appName: "KumariHub",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET,
  database: pool,
  trustedOrigins,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    storage: "database",
  },

  plugins: [
    admin({
      defaultRole: "user",
      adminRole: ["admin"],
    }),
  ],

  user: {
    additionalFields: {
      bio: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
