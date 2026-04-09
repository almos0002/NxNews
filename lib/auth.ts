import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { pool } from "./db";

const baseURL = process.env.BETTER_AUTH_URL ||
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:5000");

export const auth = betterAuth({
  appName: "KumariHub",
  baseURL,
  database: pool,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,      // 7 days
    updateAge: 60 * 60 * 24,           // refresh daily
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                  // 5-min client-side cache
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
    window: 60,       // 60-second window
    max: 10,          // 10 auth attempts per window per IP
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
