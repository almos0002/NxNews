# KumariHub — Multilingual News Portal

## Overview
A modern multilingual news portal built with Next.js 16 App Router. Features a contemporary editorial design with clean card-based layouts, strong typographic hierarchy, full English + Nepali language support via next-intl, and a complete authentication system with role-based access control.

## Tech Stack
- **Framework**: Next.js 16.2.2 (App Router, Turbopack)
- **Runtime**: Node.js 22
- **Language**: TypeScript
- **i18n**: next-intl with locale-prefixed URLs (`/en/*`, `/ne/*`)
- **Auth**: Better Auth (email/password + admin plugin + rate limiting)
- **Database**: Neon PostgreSQL (via `pg` Pool — `NEON_DATABASE_URL`)
- **Validation**: Zod (client + server schemas)
- **Fonts**: Noticia Text (serif, headlines) + DM Sans (sans-serif, UI/body) via `next/font`
- **Styling**: CSS Modules + global CSS variables

## Project Structure
```
app/
  layout.tsx              # Root layout (pass-through; html/body in locale layout)
  page.tsx                # Root redirect → /en
  globals.css             # Global styles & design tokens
  fonts.ts                # Font definitions (Noticia Text, DM Sans)
  [locale]/               # All routes under locale prefix
    layout.tsx            # Locale layout: <html lang>, NextIntlClientProvider
    page.tsx              # Homepage
    article/[id]/         # Article detail page
    [category]/           # Category archive
    tags/[tag]/           # Tag archive
    search/               # Search results
    author/[slug]/        # Author archive
    login/                # Login page (Server Component + LoginForm client)
    signup/               # Sign-up page (Server Component + SignupForm client)
    dashboard/            # Protected dashboard (RBAC: admin/moderator/author/user)
  _components/            # Shared components
    Header.tsx            # Sticky nav — auth-aware Sign In / user avatar
    Footer.tsx
    MobileNav.tsx
    LanguageSwitcher.tsx
    BreakingTicker.tsx
    ArchiveLayout.tsx
    ArticleCard.tsx
    LoginForm.tsx         # Client component — Better Auth signIn.email
    SignupForm.tsx        # Client component — Better Auth signUp.email
    SignOutButton.tsx     # Client component — Better Auth signOut
    *.module.css
  _data/
    articles.ts           # Mock article data & types
    authors.ts
    tags.ts
  api/
    auth/[...all]/        # Better Auth API handler (GET + POST)
lib/
  auth.ts                 # Better Auth server config (admin plugin, rate limit, JWE)
  auth-client.ts          # Better Auth React client (adminClient plugin)
  db.ts                   # pg Pool → Neon PostgreSQL
  validation.ts           # Zod schemas (loginSchema, signupSchema)
i18n/
  routing.ts              # Locales config: ["en", "ne"], defaultLocale: "en"
  request.ts              # next-intl server config
  navigation.ts           # Locale-aware Link, useRouter, usePathname exports
messages/
  en.json                 # English translations
  ne.json                 # Nepali translations
proxy.ts                  # Next.js middleware: auth cookie check + next-intl routing
next.config.ts            # Next.js config (next-intl plugin, remote images)
```

## Authentication Architecture

### Better Auth Configuration (lib/auth.ts)
- Email + password authentication (autoSignIn on signup)
- Admin plugin: RBAC roles (`admin`, `moderator`, `author`, `user`)
- Rate limiting: 10 requests/60s per IP, stored in `rateLimit` table
- Session: 7-day expiry, daily refresh, 5-min JWE cookie cache
- Base URL: reads `BETTER_AUTH_URL` → falls back to `REPLIT_DEV_DOMAIN`

### Database Tables (Neon PostgreSQL — `NEON_DATABASE_URL`)
| Table          | Purpose                                  |
|---------------|------------------------------------------|
| `user`        | Users with `role`, `banned`, `bio` fields |
| `session`     | Active sessions (with impersonation)     |
| `account`     | OAuth + email providers per user         |
| `verification`| Email verification tokens                |
| `rateLimit`   | Per-IP rate limit tracking               |

### Role-Based Dashboard (`/dashboard`)
- **Admin**: Full user table, moderation queue, article management, site analytics
- **Moderator**: Moderation queue + article review
- **Author**: My articles, drafts, publish stats
- **User (Reader)**: Profile, saved articles, newsletter prefs
- Unauthenticated visitors → redirect to `/[locale]/login?from=/[locale]/dashboard`

### Route Protection
`proxy.ts` reads `better-auth.session_token` / `__Secure-better-auth.session_token` cookie.
Redirects to locale login with `?from=` param if missing.

## Environment Variables
| Key                  | Type   | Purpose                                |
|---------------------|--------|----------------------------------------|
| `NEON_DATABASE_URL` | Secret | Neon PostgreSQL connection string      |
| `BETTER_AUTH_SECRET`| Secret | Session signing key (32+ char random) |
| `BETTER_AUTH_URL`   | Env    | App base URL (optional, auto-detected) |

## i18n Architecture
- All URLs locale-prefixed: `/en/...` and `/ne/...`
- Server components: `getTranslations(namespace)` from `"next-intl/server"`
- Client components: `useTranslations(namespace)` from `"next-intl"`
- All `<Link>` elements use locale-aware `Link` from `@/i18n/navigation`

## Translation Namespaces
| Namespace    | Used in                                        |
|-------------|------------------------------------------------|
| `site`      | Layout metadata                                |
| `nav`       | Header, MobileNav, Footer                      |
| `footer`    | Footer                                         |
| `article`   | Article detail page                            |
| `archive`   | Category/tag/author/search pages               |
| `newsletter`| ArchiveLayout sidebar                          |
| `search`    | Search page, SearchInput                       |
| `login`     | Login page                                     |
| `signup`    | Sign-up page                                   |
| `language`  | LanguageSwitcher                               |

## Design System
- **Colors**: Warm off-white bg (#f5f5f0), white surface cards, near-black text (#141414), red accent (#e63946)
- **Typography**: Noticia Text for headlines, DM Sans for UI/body
- **Layout**: `--max-width: 1200px`, card-based grid

## Scripts
- `npm run dev` — Start development server on port 5000
- `npm run build` — Build for production
- `npm run start` — Start production server on port 5000
- `npm run lint` — Run ESLint
- `npx @better-auth/cli@latest migrate` — Run DB migrations (run once after setup)

## Notes
- `proxy.ts` is this project's Next.js middleware file (not `middleware.ts`)
- `NEON_DATABASE_URL` is distinct from Replit's built-in `DATABASE_URL`
- Auth cookie cache means session reads don't hit DB on every request (5-min TTL)
- The test admin account `admin@kumari.test` was created during development
