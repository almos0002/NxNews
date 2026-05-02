# KumariHub — Multilingual News Portal

## Overview
Next.js 16 (App Router, Turbopack) multilingual news portal with English + Nepali support via next-intl, Better Auth (RBAC: admin/moderator/author/user), Neon PostgreSQL, and a CMS dashboard. Includes view tracking with geolocation, dual-mode (Gregorian/Bikram Sambat) calendar, live YouTube streams, video gallery, and SEO sitemaps (main + article + Google News).

## Tech Stack
- **Framework**: Next.js 16.2.2 (App Router, Turbopack), Node.js 22, TypeScript
- **i18n**: next-intl with locale-prefixed URLs (`/en/*`, `/ne/*`)
- **Auth**: Better Auth (email/password, admin plugin, rate limiting, JWE cookie cache)
- **DB**: Neon PostgreSQL via `pg` Pool (`NEON_DATABASE_URL`, falls back to `DATABASE_URL`)
- **Validation**: Zod
- **Fonts**: Noticia Text (serif) + DM Sans (sans-serif)
- **Styling**: CSS Modules + global tokens

## Project Structure
```
app/
  layout.tsx              # Root html/body — reads `x-locale` header from proxy
  page.tsx                # Root → /en redirect
  globals.css, fonts.ts, icon.svg
  sitemap.xml/, article-sitemap.xml/, news-sitemap.xml/, robots.ts
  not-found.tsx, page.module.css
  [locale]/               # All routes (locale-prefixed)
    layout.tsx, page.tsx  # Locale-aware metadata + Org/WebSite JSON-LD
    article/[id]/         # Article detail (NewsArticle + Breadcrumb JSON-LD)
    [category]/, tags/[tag]/, search/, author/[slug]/
    calendar/, live/, videos/
    login/, signup/, account/
    dashboard/            # RBAC-protected CMS (own dark shell, noindex)
      dashboard.module.css   # Consolidated layout + page styles
      articles/, pages/, videos/, taxonomy/, users/, moderation/,
      featured/, profile/, menu/, ads/, settings/, seo/, live/
  _components/            # Grouped by domain
    layout/    Header, Footer, MobileNav, LanguageSwitcher,
               BreakingTicker, UserMenu, DateTimeClock
    seo/       JsonLd  (reusable <script type="application/ld+json">)
    home/      FeaturedPanel, LatestFeed, EditorsPick, CategoryLists,
               ThreeColSection, VideoSection, WeatherSection (+ fetchWeather, weather data),
               EntertainmentSection, EventPhotosSection, TrendingSidebar,
               SectionHeading, RecentViewsWidget
    article/   ArticleCard, CategoryBadge, BookmarkButton, ViewTracker,
               ArchiveLayout, PaginationBar, SearchInput, CalendarClient
    editor/    ArticleEditor, PageEditor, QuillEditor
    dashboard/ DashboardSidebar, AdsClient, ArticleListClient,
               EventsAdminClient, LiveAdminClient, MenuClient,
               ModerationClient, PagesClient, ProfileClient,
               SeoSettingsClient, SettingsClient, TaxonomyClient,
               UsersClient, VideosClient, cms.module.css
    auth/      LoginForm, SignupForm, SignOutButton
    ads/       AdSlot, AdUnit
    ui/        Combobox, ConfirmDialog, Toaster
  api/                    # Route handlers (see API Routes below)
lib/                      # Grouped by concern
  auth/      auth.ts, auth-client.ts, account.ts
  db/        db.ts                       # pg Pool
  content/   articles.ts, pages.ts, public.ts, taxonomy.ts, videos.ts
  cms/       settings.ts, menu.ts, ads.ts, events.ts, live-views.ts
  util/      toast.ts, validation.ts, nepali-calendar.ts
i18n/        routing.ts, request.ts, navigation.ts
messages/    en.json, ne.json
proxy.ts     # Next.js 16 middleware: auth cookie + next-intl
```
**Import paths**: `@/app/_components/<group>/<File>`, `@/lib/<group>/<file>` (e.g. `@/lib/auth/auth`, `@/lib/content/public`).

## Authentication
- Better Auth: email+password, autoSignIn on signup, admin plugin, 10 req/60s rate limit, 7-day session, 5-min JWE cache.
- Base URL: `BETTER_AUTH_URL` → falls back to `REPLIT_DEV_DOMAIN`.
- Cookie: `better-auth.session_token` / `__Secure-better-auth.session_token`. `proxy.ts` redirects unauth dashboard hits to `/[locale]/login?from=...`.
- Roles: `admin`, `moderator`, `author`, `user` (reader). Authors only see their own articles in dashboard list/edit/API.

### Admin
`admin@kumarihub.com` / `Admin@1234`

## Database (Neon PostgreSQL)
| Table | Purpose |
|---|---|
| `user`, `session`, `account`, `verification`, `rateLimit` | Better Auth |
| `article` | Bilingual articles |
| `pages` | Bilingual static CMS pages |
| `categories`, `tags` | Taxonomy (tags bilingual) |
| `videos` | YouTube entries |
| `settings` | Bilingual key/value site settings |
| `menu_items` | Header/footer nav |
| `ads` | Ad slot configs |
| `page_views`, `reading_history` | View tracking + per-user history |

Migrations: `scripts/migrate.mjs` + `scripts/schema.sql` (single source of truth).

## Dashboard Sections
| Route | Access |
|---|---|
| `/dashboard` | All roles — overview |
| `/dashboard/articles[/new\|/[id]/edit]` | Author+ |
| `/dashboard/pages[/new\|/[id]/edit]` | Author+ |
| `/dashboard/videos` | Author+ |
| `/dashboard/profile` | Author+ |
| `/dashboard/taxonomy`, `/dashboard/moderation`, `/dashboard/featured`, `/dashboard/menu`, `/dashboard/live` | Moderator+ |
| `/dashboard/users`, `/dashboard/ads`, `/dashboard/settings`, `/dashboard/seo` | Admin |
| `/account[/edit]` | Reader (user role) — bookmarks, history, profile |

## API Routes (selected)
`/api/articles`, `/api/articles/[id]`, `/api/articles/featured`, `/api/pages[/...]`, `/api/categories[/...]`, `/api/tags[/...]`, `/api/videos[/...]`, `/api/users`, `/api/menu[/...]`, `/api/menu/reorder`, `/api/bookmarks`, `/api/views[/recent]`, `/api/live[/...]`, `/api/events[/...]`, `/api/profile`, `/api/upload` (8MB → `public/uploads/`), `/api/auth/[...all]`.

## Environment Variables
| Key | Purpose |
|---|---|
| `NEON_DATABASE_URL` | Neon Postgres (primary) |
| `DATABASE_URL` | Replit Helium fallback |
| `BETTER_AUTH_SECRET` | Session signing key (32+ chars) |
| `SESSION_SECRET` | Fallback if `BETTER_AUTH_SECRET` not set |
| `BETTER_AUTH_URL` | Base URL (auto-detected from `REPLIT_DEV_DOMAIN`) |

## i18n
- `getTranslations(ns)` (server) / `useTranslations(ns)` (client).
- All `<Link>` from `@/i18n/navigation` (locale-aware).
- Namespaces: `site`, `nav`, `footer`, `article`, `archive`, `newsletter`, `search`, `login`, `signup`, `language`, `home`, etc.

## Design System
- Colors: warm off-white bg `#f5f5f0`, white cards, near-black ink `#141414`, red accent `#e63946`.
- Typography: Noticia Text headlines, DM Sans body/UI.
- Layout: `--max-width: 1200px`, card-based grid.

## Scripts
- `npm run dev` — dev server, port 5000
- `npm run build` / `npm run start` — production
- `npm run lint`
- `npx @better-auth/cli@latest migrate` — initial DB migration

## Notes
- `proxy.ts` is the Next.js 16 middleware (renamed from `middleware.ts`).
- SSL is only enabled for Neon URLs; Replit Helium does not use SSL.
- Pagination: `PUBLIC_PAGE_SIZE = 20` (from `lib/content/public.ts`); all public archives + dashboard lists paginated.
- Article `category` stored as slug; queries use `LOWER(a.category) = slug` so legacy "Technology" still matches.
- `BreakingTicker` accepts `headline?: string` or `headlines?: Headline[]` (backwards-compatible).
- `getPublicArticleBySlug` returns `publishedAt` + `updatedAt` ISO strings for OG `article:published_time`.

## Next.js 16 Cache API Conventions
Next 16 made the second argument of `revalidateTag(tag, profile)` **required**. The codebase follows these rules:

1. **Reads** stay on `unstable_cache(fn, [key], { tags: [TAG], revalidate: 300 })` — see `lib/cms/settings.ts`, `lib/cms/menu.ts`, `lib/content/taxonomy.ts`.
2. **Route-handler writers** (everything under `app/api/**`) call `revalidateTag(TAG, <PROFILE_CONST>)`, where `<PROFILE_CONST>` is a per-module named constant (e.g. `MENU_REVALIDATE_PROFILE`, `SETTINGS_REVALIDATE_PROFILE`, `TAXONOMY_REVALIDATE_PROFILE`). All currently resolve to the built-in `"default"` cacheLife profile (5m stale / 15m revalidate), which matches our 5-minute `unstable_cache` TTLs. Never inline the magic string `"default"` — go through the constant so the choice is intentional and easy to retune.
3. **Server-action writers**: there are none today (no `"use server"` files exist). If a writer is ever moved into a server action and needs read-your-own-writes within the same request, switch that call to `updateTag(TAG)` instead. `updateTag` takes only the tag — no profile.
4. **`view_count` is owned by `app/api/views/route.ts`.** Today only `article`, `event_photos`, and `global_view_counters` (live) actually carry a `view_count INTEGER NOT NULL DEFAULT 0` column in `scripts/schema.sql`; `pages` and `videos` are listed in `tableForType()` in the views route but do **not** have the column — that increment will throw at runtime and is a known pre-existing bug to fix separately (either add the columns + indexes or drop those branches). Content writers (e.g. `createEventPhoto` / `updateEventPhoto`) intentionally exclude `view_count` from their input types so only the views route may mutate it; apply the same pattern to any future view-tracked table.

## Neon Cost Optimization
1. **Tiny client pool** for the `-pooler` endpoint: `max: 3`, `idleTimeoutMillis: 10_000`, `allowExitOnIdle: true` — short idle so Neon compute can auto-suspend.
2. **No runtime DDL**: removed `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE` from `lib/cms/events.ts`, `lib/cms/ads.ts`, `lib/cms/live-views.ts`, `app/api/views/route.ts`. All schema in `scripts/schema.sql`.
3. **Hot reads cached** via `unstable_cache` (5-min TTL, invalidated by `revalidateTag`):
   - `lib/cms/settings.ts::getAllSettings` → tag `settings`
   - `lib/cms/menu.ts::listMenuItems` → tag `menu`
   - `lib/content/taxonomy.ts::listCategories` → tag `categories`
   - `lib/content/taxonomy.ts::listTags` → tag `tags`
4. **`lib/cms/settings.ts`** reads bilingual `value_en`/`value_ne` columns and exposes flat `${key}`, `${key}_en`, `${key}_ne` keys.
5. **Recommended Neon settings**: auto-suspend ≤ 5 min, 0.25 CU compute, use `-pooler` URL for app and direct URL for one-off scripts.

## Production Audit
- Clean Turbopack build, zero TS errors, 157 routes.
- DB indexes on `article(status, published_at)`, `article(slug)`, `article(status, is_featured)`, `article(LOWER(category), status)`, `article(tags) GIN`, `article(view_count)`, `"user"(LOWER(name))`, `page_views(content_type, content_id)`, `videos(status, created_at)`.
- Full SEO metadata: `metadataBase` from `seo_canonical_base_url`, OG (with `publishedTime`/`modifiedTime`/`section`/`tags` on articles), Twitter cards, `alternates.canonical`. `/search` is `noindex,nofollow`.
- SEO settings dashboard: meta title templates, OG image, GA4/GSC, robots noindex toggle, JSON-LD toggle.
- Dynamic categories: `[category]/page.tsx` resolves from DB; RESERVED slugs (login, signup, dashboard, …) → 404.
- ArticleEditor + MenuClient pull categories from DB, no hardcoded lists.
