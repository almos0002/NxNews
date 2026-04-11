# KumariHub — Multilingual News Portal

## Overview
A modern multilingual news portal built with Next.js 16 App Router. Features a contemporary editorial design with clean card-based layouts, strong typographic hierarchy, full English + Nepali language support via next-intl, and a complete authentication system with role-based access control. Includes unique view tracking (IP + date deduplication) with geolocation and a live Recent Viewers dashboard widget.

### Key Public Pages
- `/calendar` — Interactive dual-mode calendar: English (Gregorian/AD) and Nepali (Bikram Sambat/BS) with date cross-reference and full Nepali numeral/weekday localization
- `/live` — Live streams page showing active YouTube embeds and channel links configured via the admin dashboard
- `/videos` — Video gallery; `/article/*` — article detail; `/[category]` — category archives

### Key Dashboard Pages (admin/moderator/author)
- `/dashboard/live` — Manage live stream links (CRUD, toggle active, display order)
- `/dashboard/seo` — Full SEO settings: meta, canonical, OG, GA4, Google/Bing/Yandex/Baidu/Pinterest verification, sitemap viewer, robots.txt preview

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
      layout.tsx          # Isolated dashboard shell (dark sidebar, no public Header/Footer)
      layout.module.css
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
| `article`     | Published articles (bilingual)           |
| `pages`       | Static CMS pages (bilingual)             |
| `categories`  | Article categories (no color)            |
| `tags`        | Article tags (bilingual)                 |
| `videos`      | YouTube video entries (bilingual)        |
| `settings`    | Key/value site settings (bilingual)      |
| `menu_items`  | Header/footer nav menu items             |
| `ads`         | Ad slot configs (enabled, code, dims)    |

Migration script: `scripts/migrate.mjs`

### Role-Based Dashboard (`/dashboard`)
- **Admin**: User management, moderation queue, articles, pages, categories/tags, videos
- **Moderator**: Moderation queue, articles, pages, categories/tags, videos
- **Author**: Articles, pages, videos
- **User (Reader)**: Profile only
- Unauthenticated visitors → redirect to `/[locale]/login?from=/[locale]/dashboard`

### Dashboard Sections
| Route | Access | Purpose |
|-------|--------|---------|
| `/dashboard` | All roles | Overview |
| `/dashboard/articles` | Author+ | Article list + CRUD |
| `/dashboard/articles/new` | Author+ | New article (Quill editor, bilingual) |
| `/dashboard/articles/[id]/edit` | Author+ | Edit article |
| `/dashboard/pages` | Author+ | Static pages list |
| `/dashboard/pages/new` | Author+ | New page (Quill editor, bilingual) |
| `/dashboard/pages/[id]/edit` | Author+ | Edit page |
| `/dashboard/videos` | Author+ | YouTube video management |
| `/dashboard/taxonomy` | Moderator+ | Categories & tags (tabbed inline CRUD) |
| `/dashboard/users` | Admin | User role + ban management |
| `/dashboard/moderation` | Moderator+ | Article review queue (approve/reject) |
| `/dashboard/featured` | Moderator+ | Featured posts management (search + toggle star) |
| `/dashboard/profile` | Author+ | Edit own name, bio, change password (within dashboard) |
| `/account` | Reader (user role) | Personal account page: bookmarks + reading history |
| `/account/edit` | Reader (user role) | Edit profile name, bio, change password (public layout) |
| `/dashboard/menu` | Moderator+ | Navbar & footer menu manager with page/URL links and sort order |
| `/dashboard/ads` | Admin | Ad slot enable/disable + ad code/script editor |
| `/dashboard/settings` | Admin | Site-wide settings (title, description, social links, etc.) |
| `/dashboard/seo` | Admin | SEO settings (meta titles, OG images, GA4, GSC, structured data, robots) |

### Key Client Components (app/_components/)
| Component | Purpose |
|-----------|---------|
| `ArticleEditor.tsx` | Full bilingual article editor with Quill, categories, tags, featured image |
| `PageEditor.tsx` | Bilingual page editor (reuses ArticleEditor.module.css) |
| `QuillEditor.tsx` | Dynamically imported Quill v2 rich text editor (SSR disabled) |
| `TaxonomyClient.tsx` | Tabbed categories/tags CRUD client (no color field) |
| `AdUnit.tsx` | Async server component wrapping `AdSlot` — DB-driven per-slot enable/code |
| `AdsClient.tsx` | CMS ad slot toggle + code editor client |
| `VideosClient.tsx` | Videos list + inline add/edit form with YouTube embed preview |
| `UsersClient.tsx` | User table with role dropdown + ban toggle |
| `ProfileClient.tsx` | Edit profile (name, bio) + change password via Better Auth |
| `ModerationClient.tsx` | Review queue list with approve/reject article actions |
| `SeoSettingsClient.tsx` | SEO settings form (meta titles, OG images, GA4, GSC, structured data, robots) |
| `MenuClient.tsx` | Dual-menu manager (navbar/footer) with page selector, URL, and up/down sort |
| `DashboardSidebar.tsx` | Role-aware navigation sidebar |
| `cms.module.css` | Shared CSS module for all CMS/dashboard table pages |
| `Toaster.tsx` | Global toast notification system (dispatched via `lib/toast.ts` CustomEvent) |
| `ConfirmDialog.tsx` | Modal confirm dialog for destructive actions (delete, ban, etc.) |
| `FeaturedClient.tsx` | Featured posts manager — search + feature/unfeature published articles |

### API Routes
| Route | Methods | Auth |
|-------|---------|------|
| `/api/articles` | GET, POST | Session |
| `/api/articles/[id]` | GET, PUT, DELETE | Session |
| `/api/pages` | GET, POST | Session |
| `/api/pages/[id]` | GET, PUT, DELETE | Session |
| `/api/categories` | GET, POST | Moderator+ |
| `/api/categories/[id]` | PUT, DELETE | Moderator+ |
| `/api/tags` | GET, POST | Moderator+ |
| `/api/tags/[id]` | PUT, DELETE | Moderator+ |
| `/api/videos` | GET, POST | Session |
| `/api/videos/[id]` | GET, PUT, DELETE | Session |
| `/api/users` | GET, PATCH | Admin |
| `/api/menu` | GET, POST | Moderator+ |
| `/api/menu/[id]` | PUT, DELETE | Moderator+ |
| `/api/menu/reorder` | POST | Moderator+ — bulk sort_order update |
| `/api/articles/featured` | GET, POST | Moderator+ — list/toggle featured posts |
| `/api/bookmarks` | GET, POST | Session — list/toggle article bookmarks |
| `/api/views` | GET, POST | View tracking + auto-logs reading history for logged-in users |
| `/api/profile` | GET, PATCH | Session — update own name/bio |
| `/api/upload` | POST | Session — saves to `public/uploads/`, 8MB max |
| `/api/auth/[...all]` | GET, POST | Better Auth handler |

### Route Protection
`proxy.ts` reads `better-auth.session_token` / `__Secure-better-auth.session_token` cookie.
Redirects to locale login with `?from=` param if missing.

## Environment Variables
| Key                  | Type   | Purpose                                |
|---------------------|--------|----------------------------------------|
| `NEON_DATABASE_URL` | Secret | Neon PostgreSQL connection (primary — auto-provided via Neon integration) |
| `DATABASE_URL`      | Secret | Replit Helium PostgreSQL fallback (used if NEON_DATABASE_URL not set) |
| `BETTER_AUTH_SECRET`| Secret | Session signing key (32+ char random string) |
| `SESSION_SECRET`    | Secret | Fallback session key if BETTER_AUTH_SECRET not set |
| `BETTER_AUTH_URL`   | Env    | App base URL (optional, auto-detected via REPLIT_DEV_DOMAIN) |

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
- `proxy.ts` is this project's Next.js 16 middleware file (Next.js 16 renamed middleware to proxy)
- `lib/db.ts` uses `NEON_DATABASE_URL` with fallback to `DATABASE_URL` (Replit's built-in Postgres)
- SSL is only enabled for Neon databases; Replit's Helium Postgres does not use SSL
- `lib/auth.ts` uses `BETTER_AUTH_SECRET` with fallback to `SESSION_SECRET`
- Auth cookie cache means session reads don't hit DB on every request (5-min TTL)
- Admin account: `admin@kumarihub.com` / `Admin@1234` (role: admin, not banned)
- **Critical**: The app uses `NEON_DATABASE_URL` (Neon cloud PostgreSQL), NOT the Replit helium `DATABASE_URL`. Using the wrong connection shows an empty user table — always use `NEON_DATABASE_URL` for database operations.
- Category values stored in articles use the slug (e.g. "technology"); the public query filters via `LOWER(a.category) = slug` so older articles stored as "Technology" still match

## Production Readiness (Audit Complete)
- **Build**: Clean production build, zero TypeScript errors — 157 routes compiled (Turbopack).
- **DB Indexes** (`scripts/` or applied via node-pg):
  - `idx_article_status_published` on `article(status, published_at DESC NULLS LAST)` — all archive/listing queries
  - `idx_article_slug` on `article(slug)` — single-article lookup
  - `idx_article_status_featured` on `article(status, is_featured)` — featured hero panel
  - `idx_article_category_status` on `article(LOWER(category), status)` — related articles, category archive
  - `idx_article_tags_gin` GIN on `article(tags)` — tag array `ANY()` queries
  - `idx_user_lower_name` on `"user"(LOWER(name))` — author lookup (ILIKE/LOWER queries)
  - `idx_page_views_content` on `page_views(content_type, content_id)` — view count joins
  - `idx_videos_status_created` on `videos(status, created_at DESC)` — videos listing
  - `idx_article_view_count` on `article(view_count DESC)` — trending sort
- **SEO**: All public pages now have full metadata:
  - `metadataBase` set from `seo_canonical_base_url` setting (falls back to `https://kumarihub.com`)
  - `openGraph` (type, title, description, images, locale, publishedTime/modifiedTime on articles, section, tags)
  - `twitter` card (summary_large_image on article/home, summary on archives)
  - `alternates.canonical` on every public page
  - `robots: { index: false, follow: false }` on `/search` (prevents search result pages being indexed)
  - `robots: { index: true, follow: true }` explicitly on all other public pages
  - `getPublicArticleBySlug` returns `publishedAt` + `updatedAt` ISO strings for OG `article:published_time`
- **BreakingTicker**: Now accepts both `headline?: string` (single-string legacy) and `headlines?: Headline[]` (array) — fully backwards-compatible
- **lib/public.ts** `getPublicArticleBySlug` return type extended with `publishedAt: string | null`, `updatedAt: string | null`

## Completed Features
- **SEO Settings** (`/dashboard/seo`) — meta title templates, OG image, GA4/GSC integration, robots noindex toggle, JSON-LD toggle
- **Dashboard overview** — real DB stats for admin/author, recent articles table, moderation queue preview
- **Dynamic category pages** — `[category]/page.tsx` resolves from DB instead of a hardcoded allow-list; RESERVED slugs (login, signup, dashboard, etc.) short-circuit to 404
- **Menu page** — `dashboard/menu/page.tsx` loads categories from DB via `listCategories()` instead of static data
- **MenuClient Nepali autofill** — selecting a category in the link form auto-fills both `label_en` and `label_ne` from DB category names
- **ArticleEditor dynamic categories** — hardcoded category array removed; editor receives categories prop from server pages (`new/page.tsx`, `[id]/edit/page.tsx`) which fetch from `listCategories()`
