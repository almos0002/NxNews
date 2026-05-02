# KumariHub — Full SEO Audit

**Date:** 2 May 2026
**Scope:** Every public route, technical foundations, on-page optimization, structured data, indexation, internationalization
**Stack audited:** Next.js 16 App Router, `next-intl` (en / ne), Better Auth, Drizzle + Postgres
**Method:** Source review + live HTTP probes against the running dev server (`localhost:5000`) + database state inspection

---

## 0. TL;DR — Severity Summary

| Sev | Count | Headline issues |
|-----|-------|-----------------|
| 🔴 Critical | 4 | `<html lang>` missing on initial HTML, every category page 404s, `/og-default.png` & `/favicon.ico` 404, no `NewsArticle`/`Organization`/`Breadcrumb` structured data on the indexable pages that need it |
| 🟠 High | 7 | Auth pages indexable; sitemap promises hardcoded URLs (categories) the app can't render; sitemap includes a `noindex` page (`/search`) and omits `/latest` and `/events`; **all three sitemaps emit only `/en/` URLs** and **none carry `hreflang` blocks**; article canonical missing locale prefix; `next-intl` middleware doesn't set `Content-Language` |
| 🟡 Medium | 7 | Hard-coded English titles on auth pages, no breadcrumbs anywhere, no `ItemList` schema, missing `og:image`/`og:description` on home, `BreakingTicker` API mismatch leaves empty marquee, raw `<a>` pagination, weak alt text |
| 🟢 Low | 5 | Search correctly noindex (good); no `theme-color`; `MobileNav` uses `<img>` not `<Image>`; root `app/not-found.tsx` lacks `noindex`; missing `application-name` |

**Bottom line:** Technical scaffolding (sitemap routes, robots, metadata API) is in place, but five things break Google's ability to index and render the site correctly today: (1) the `<html lang>` is set client-side only, (2) every "category" listed in `sitemap.xml` is a hardcoded URL whose route returns 404 unless the DB is seeded, (3) the OG fallback image is a 404, (4) the news portal's bread-and-butter `NewsArticle`/`BreadcrumbList` JSON-LD is absent (only `/events/[slug]` carries any structured data — an `ImageGallery` block), and (5) `news-sitemap.xml`, `article-sitemap.xml`, and `sitemap.xml` all emit only English article URLs.

---

## 1. Technical Foundations

### 1.1 `robots.txt` — ✅ mostly correct

`app/robots.ts` returns:

```
User-agent: *
Allow: /
Disallow: /api/, /dashboard/, /account/
Sitemap: https://kumarihub.com/sitemap.xml
Sitemap: https://kumarihub.com/news-sitemap.xml
Sitemap: https://kumarihub.com/article-sitemap.xml
```

There is also a kill-switch: if the `seo_robots_noindex` setting is `"true"` in `site_settings`, the `Allow: /` rule is dropped — useful for staging. Good defensive design.

🟡 Caveats:
- `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` are NOT disallowed. Combined with §2.2 below (those pages don't set `noindex` in metadata), they remain fully indexable.
- `/admin/` and `/_next/` are not listed — `/_next/` doesn't strictly need to be, but `/admin/` should be added if it ever exists.
- Trailing-slash semantics: `Disallow: /api/` does not block `/api` (no slash). Add both forms for safety, or rely on the trailing-slash version because Next routes always use one in practice.

### 1.2 Sitemaps — 🔴 several issues

`app/sitemap.xml/route.ts` emits:
- Per locale: `/{en,ne}` (homepage), then a **hardcoded** category list `["world","politics","business","technology","science","culture","opinion","sports","entertainment"]`, then a hardcoded static-page list `["videos","calendar","live","search"]` — all 2× (en + ne).
- Plus `/en/article/{slug}` for every published article from the DB.
- ❌ **No `<xhtml:link rel="alternate" hreflang>` blocks** on any URL in `sitemap.xml`. (Earlier draft of this report wrongly stated otherwise — the route emits flat `<url>` entries with `<loc>` only.)
- 🔴 **Hardcoded categories — sitemap promises 18 URLs that 404 today** (and any time the categories table is empty). The category route at `app/[locale]/[category]/page.tsx` checks the DB; the sitemap doesn't. This is structurally fragile and the root of finding §2.1.
- 🟠 **`/search` is in the sitemap but the page sets `noindex`.** That's a self-conflicting signal — Search Console will report "Indexed, though blocked" or "Submitted URL marked 'noindex'" warnings. Remove `/search` from the static list.
- 🟠 **`/latest` and `/events` are pages that exist but are NOT in the sitemap.** Add them.
- 🟠 **Article URLs are `/en/...` only.** Nepali article URLs are absent from `sitemap.xml` too (not just the news/article sitemaps).

`app/article-sitemap.xml/route.ts` and `app/news-sitemap.xml/route.ts`:
- 🔴 **Both emit only `/en/article/{slug}` URLs.** No `/ne/article/{slug}` entries at all, even though every article renders in both locales.
- 🟠 **No `<xhtml:link rel="alternate" hreflang>` blocks** in either route. Google News indexing in Nepal will under-cover the Nepali edition.
- 🟢 News sitemap correctly limits to articles from the last ~48 h (`COALESCE(published_at, created_at) >= now() - 2 days`) — good.
- 🟢 The news sitemap's `<news:title>` value is properly XML-escaped (`escape()` helper handles `& < > "`) — good defensive coding.

### 1.3 Sitemap discoverability — ✅ fine
All three sitemap routes are explicitly listed in `robots.ts`. Google will pick them up.

### 1.4 `<html lang>` attribute — 🔴 CRITICAL

Live response from `GET /en` shows:
```html
<html class="noticia_text_…__variable dm_sans_…__variable">
```
**No `lang` attribute.** It is set later by `app/_components/layout/HtmlLang.tsx` (a `"use client"` component running `useEffect`). This means:

- Googlebot's first render sees no `lang`, so it falls back to `<meta http-equiv>`/`Content-Language`/auto-detect.
- Screen readers also see no language until hydration.
- `suppressHydrationWarning` on the root `<html>` masks the developer-visible symptom.

**Fix:** in `app/[locale]/layout.tsx`, render `<html lang={locale}>` directly on the server. The root `app/layout.tsx` should not render `<html>` at all in this app shape, or should render `<html lang="en">` and let the locale layout override only when it wraps the tree (not possible with App Router — so the locale layout must be the one that owns `<html>`). Today the root layout owns `<html>` with no `lang`, which is the bug.

### 1.5 Locale routing — ⚠️ middleware behavior

`proxy.ts` (the next-intl middleware) does the geo redirect (`NP → /ne`) and the auth gate. It does **not** set `Content-Language` response headers, so neither HTTP headers nor HTML carry the language until client hydration. Combined with §1.4, this is the single biggest non-content SEO defect.

### 1.6 HTTPS / canonical host — ✅ logical

`baseUrl` resolves from `NEXT_PUBLIC_SITE_URL` then falls back to `https://kumarihub.com`. Canonical and OG URLs are absolute and HTTPS. Good.

### 1.7 Performance signals (visible from HTML)

- ✅ Logo is preloaded (`<link rel="preload" as="image" href="/logo.png">`).
- ✅ `next/font` is used via `app/fonts.ts` with CSS variables — no external Google Fonts roundtrip.
- 🟡 The home document is 41 kB over the wire — fine, but ~30 chunked `<script>` tags in `<head>` is dev-mode noise. Re-audit on a production build.
- 🟢 No `theme-color` meta. Add one for mobile address bar tint.

---

## 2. Indexation & Crawlability

### 2.1 🔴 CRITICAL — every category page is a 404

`GET /en/world` → **HTTP 404**.

Root cause: the category route at `app/[locale]/[category]/page.tsx` calls `notFound()` when the slug isn't found in the DB (via `listCategories()`), and the dev DB has zero category rows. **But `app/sitemap.xml/route.ts` does not consult the DB at all** — it ships a hardcoded array of nine category slugs (`world`, `politics`, `business`, `technology`, `science`, `culture`, `opinion`, `sports`, `entertainment`) and writes them into the sitemap unconditionally for both locales. So the sitemap promises Google 18 URLs that the application can't render. Today every internal navbar/footer link to `/en/world`, `/en/politics`, etc. also 404s.

Two related observations:
- **`app/[locale]/not-found.tsx` correctly sets `robots: { index: false, follow: false }`** — so the 404 response that bots actually receive for these category routes is properly noindex. Good.
- **The root `app/not-found.tsx` (which catches non-locale paths like `/foo`) does NOT set any robots metadata** — it inherits whatever the root layout exposes. Lower priority because most 404s land on the locale not-found, but worth fixing.

**The structural fix isn't seeding alone** — even after seeding, the sitemap will silently drift any time a category is removed from the DB. The sitemap should derive its category list from the same source of truth as the route (`listCategories()`), not from a hardcoded constant.

### 2.2 🟠 HIGH — auth pages are indexable

`GET /en/login` returns title `Sign In — KumariHub` and **no `noindex`**. Same for `/en/signup` and `/en/dashboard` (which redirects to login but renders the login HTML in the meantime). These pages should be excluded:

```ts
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: …
};
```

Pages that need this: `/login`, `/signup`, `/dashboard/*`, `/account/*`, `/forgot-password`, `/reset-password`, `/verify-email`.

`robots.txt` does `Disallow` these paths — that prevents crawling but does **not** prevent indexing of URLs that are linked from elsewhere. Always pair `Disallow` with a real `noindex` on the page itself.

### 2.3 🟡 MEDIUM — `BreakingTicker` API mismatch

`app/[locale]/page.tsx` calls `getBreakingHeadline()` (returns a single string) but the home wires it to `<BreakingTicker headlines={…}>`. The component supports both `headlines[]` and a single `headline` prop, so today it falls back gracefully — but the inconsistency means the marquee silently shows nothing on pages that pass the wrong shape, hurting internal linking. Standardize on one signature.

### 2.4 🟢 LOW — `/en/search` correctly noindex

✅ Confirmed. Good.

---

## 3. On-Page Optimization

### 3.1 Metadata coverage by route

| Route | Title | Description | Canonical | OG image | hreflang |
|-------|-------|-------------|-----------|----------|----------|
| `/[locale]` (home) | ✅ | ❌ none | ✅ | ⚠️ falls back to `/og-default.png` (404) | ✅ |
| `/[locale]/article/[id]` | ✅ | ✅ | 🟠 missing locale prefix | ✅ when `cover_url` exists, else 404 | ✅ |
| `/[locale]/[slug]` (category) | ✅ | ✅ | ✅ | ⚠️ default fallback | ✅ |
| `/[locale]/latest` | ✅ | ⚠️ generic | ✅ | ⚠️ default fallback | ✅ |
| `/[locale]/videos` | ✅ | ⚠️ generic | ✅ | ⚠️ default | ✅ |
| `/[locale]/events` | ✅ | ⚠️ generic | ✅ | ⚠️ default | ✅ |
| `/[locale]/events/[slug]` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/[locale]/live` | ✅ | ⚠️ generic | ✅ | ⚠️ default | ✅ |
| `/[locale]/calendar` | ✅ | ✅ | ✅ | ⚠️ default | ✅ |
| `/[locale]/search` | ✅ | n/a | ✅ noindex | n/a | ✅ |
| `/[locale]/login` | 🟡 hard-coded English | ⚠️ | ⚠️ | ⚠️ | should be noindex |
| `/[locale]/signup` | 🟡 hard-coded English | ⚠️ | ⚠️ | ⚠️ | should be noindex |
| `/[locale]/dashboard/*` | leaks "Sign In" title | n/a | wrong | n/a | should be noindex |

### 3.2 🔴 `/og-default.png` returns 404

`app/[locale]/layout.tsx` falls back to `${baseUrl}/og-default.png` when `settings.logo_url` is empty. The file does not exist in `public/`. Result: every page without a custom OG image (i.e., almost every page) sends a broken image URL to Facebook, X, LinkedIn, Slack, iMessage previews. Add a real 1200×630 PNG at `public/og-default.png` (and `public/favicon.ico` — also 404 today).

### 3.3 🟠 Article canonical is missing the locale prefix

`app/[locale]/article/[id]/page.tsx` sets `alternates.canonical = '/article/' + id`. Should be `'/' + locale + '/article/' + id`. Today this canonicalizes the article to a non-existent unprefixed URL. This is the kind of bug that makes Search Console show "Alternate page with proper canonical tag" warnings on every article and silently de-indexes them.

### 3.4 🟡 Home page has no `og:image` and no `og:description`

Confirmed in the rendered `<head>`:
```
og:title, og:url, og:site_name, og:locale, og:type
twitter:card, twitter:title
```
**No `og:image`. No `og:description`. No `twitter:description`. No `twitter:image`.**

Cause: `app/[locale]/layout.tsx` only sets `openGraph.title/url/siteName/locale/type` and `twitter.card/title`; it does **not** include an image array unless `settings.logo_url` exists in `site_settings`. With an empty DB, all are dropped.

### 3.5 🟡 Hard-coded English titles on auth pages

`app/[locale]/login/page.tsx` and `signup/page.tsx` set `metadata` statically as English strings. Should be `generateMetadata({params})` and read from `next-intl`'s message catalogs (you already have `messages/en.json` and `messages/ne.json`).

### 3.6 🟢 Calendar title — not actually a bug

The source title `"Calendar (AD & BS) — KumariHub"` renders as `<title>Calendar (AD &amp; BS) — KumariHub</title>` in HTML. That's correct HTML escaping by Next.js — the `&` is required to be encoded in the markup, and browsers/SERPs decode it back to `&` when displaying. **No action needed.** (An earlier draft of this report flagged this as a bug; verification of the source confirmed it's not.)

### 3.7 🟢 Image alt text & next/image usage

- `Header.tsx` logo: `alt="KumariHub"` — fine, but consider `"KumariHub home"` for clarity.
- `MobileNav.tsx` line 58 uses raw `<img src="/logo.png">` instead of `next/image` — loses lazy-loading & responsive srcset. Switch to `<Image />`.
- Article cover images (in card components): need an audit pass to ensure descriptive alt text rather than the article title duplicated.

### 3.8 🟢 Headings

Home page sole H2 today is `"No articles published yet"` (because DB is empty). With content, the home should expose **one H1** ("KumariHub" or the localized tagline) and use H2 for section titles. Currently the home page has no H1 at all — the rendered `<h2>` tags start the document outline. Add an H1, even visually-hidden, for the page title.

---

## 4. Structured Data — 🔴 nearly absent

### 4.1 What's there
Only `app/[locale]/events/[slug]/page.tsx` injects an `ImageGallery` JSON-LD block. That's it.

### 4.2 What's missing (and what to add)

| Schema | Where | Why it matters |
|--------|-------|----------------|
| `Organization` + `WebSite` `@graph` | root `app/layout.tsx` | Sitelinks search box, knowledge panel eligibility |
| `NewsArticle` (with `headline`, `image`, `datePublished`, `dateModified`, `author`, `publisher`) | `app/[locale]/article/[id]/page.tsx` | Eligibility for Top Stories, News tab, AMP-style rich results |
| `BreadcrumbList` | every nested page (article, category, event, calendar, etc.) | Breadcrumb display in SERP |
| `ItemList` | `/latest`, `/videos`, `/[slug]` (category), `/events`, `/live` | Carousel/list rich results |
| `VideoObject` | `/videos` items and the `/[locale]/videos` page | YouTube SERP visibility |
| `LiveBlogPosting` or `BroadcastEvent` | `/live` items | Live result eligibility |
| `Event` | `/events/[slug]` | Already has gallery; add full Event schema with `startDate`, `location`, `offers` if applicable |
| `FAQPage` | help/about pages if any | Long-tail rich result |

This is a news portal — the absence of `NewsArticle` + breadcrumbs is the single biggest organic-traffic ceiling on the project.

---

## 5. Internationalization & hreflang

### 5.1 ✅ What works
- Routing is `defineRouting({ locales: ['en', 'ne'], defaultLocale: 'en' })`.
- `<link rel="alternate" hreflang>` is emitted on the home and most pages.
- `og:locale` is set per route.
- Two complete translation catalogs exist.

### 5.2 ❌ What doesn't
- **No `x-default` `hreflang`**. Required by Google for multilingual sites. Add `<link rel="alternate" hreflang="x-default" href="https://kumarihub.com/en">` on every page.
- **`<html lang>` is client-set** (see §1.4).
- **Article/news sitemaps omit Nepali URLs entirely** (see §1.2).
- **`Content-Language` response header is not set** by the middleware.
- **Geo redirect (NP → /ne) does not set `Vary: cookie`/`Vary: Accept-Language`** — risk of CDN caching the wrong locale for everyone behind the first NP visitor.

---

## 6. Page-by-Page Findings

### `/[locale]` (home)
- ✅ Title, canonical, hreflang
- ❌ no description, no og:image, no og:description, no JSON-LD
- ⚠️ no H1 element

### `/[locale]/article/[id]`
- ✅ Title, description, og:image (when cover exists), hreflang
- 🟠 canonical missing locale prefix
- ❌ no `NewsArticle` JSON-LD
- ❌ no `BreadcrumbList`
- ⚠️ Author byline present in HTML but `author` not in metadata

### `/[locale]/[slug]` (category)
- 🔴 returns 404 today (empty DB) — see §2.1
- When it works: ✅ title/description, ❌ no `ItemList` JSON-LD, ❌ no breadcrumbs
- ⚠️ pagination uses raw `<a style="…">` not `<Link>` — kills client-nav prefetch

### `/[locale]/latest`
- ✅ basic metadata
- ❌ no `ItemList` JSON-LD
- ⚠️ description is generic; doesn't change between locales beyond translation

### `/[locale]/videos`
- ✅ title
- ❌ no `VideoObject` schema
- ⚠️ embeds YouTube directly — consider `loading="lazy"` iframes + a JSON-LD `VideoObject` with `embedUrl`/`thumbnailUrl`

### `/[locale]/events` and `/events/[slug]`
- ✅ Single page with `ImageGallery` schema (the only schema in the entire app)
- ❌ list page has no `ItemList`
- ❌ event detail still missing full `Event` schema fields
- ⚠️ pagination is raw `<a>`

### `/[locale]/live`
- ✅ basic metadata
- ❌ no `BroadcastEvent`/`LiveBlogPosting`
- ⚠️ `liveCount` query runs in the header on every request — consider `unstable_cache` with `revalidate: 30`

### `/[locale]/calendar`
- ✅ Title, description, canonical, hreflang all correct (see §3.6 — earlier `&amp;` finding withdrawn)
- ❌ no `Event` schema for the holiday entries

### `/[locale]/search`
- ✅ noindex correctly set
- ✅ no canonical (correct for query-driven page)

### `/[locale]/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`
- 🟠 Indexable, leaking auth UI into SERPs

### `/[locale]/dashboard/*`, `/account/*`
- 🟠 Auth gate redirects to login but the login HTML is what bots receive — needs `noindex` on the login response

---

## 7. Crawl Budget & Performance

- ✅ App Router uses RSC streaming — good Time-to-First-Byte once warm.
- ✅ Static assets served from `_next/static/*` with the standard immutable cache.
- 🟡 Almost every page calls `getSiteSettingsForLocale(locale)` and `getBreakingHeadline()` per request without caching. Wrap these with `unstable_cache` (5 min) — they change rarely.
- 🟡 Header runs `auth.api.getSession({headers})` on every request server-side. Necessary for personalization, but it forces every page out of full route caching. Consider rendering personalized bits in a client island.
- 🟢 Logo is preloaded — keep that.
- 🟢 No service worker / PWA manifest. Optional.

---

## 8. Recommended Fix Order (when you ask for fixes)

**Day-1 (must-fix before publishing):**
1. Add `lang={locale}` to `<html>` server-side (move `<html>` ownership to `app/[locale]/layout.tsx`, or pass `lang` through).
2. Create real `public/favicon.ico` and `public/og-default.png` (1200×630).
3. Fix article canonical in `app/[locale]/article/[id]/page.tsx` to include the `/{locale}/` prefix.
4. Add `robots: { index: false }` to `/login`, `/signup`, `/dashboard/*`, `/account/*`, `/forgot-password`, `/reset-password`, `/verify-email`, and the root `app/not-found.tsx` (locale not-found is already correct).
5. Make `app/sitemap.xml/route.ts` derive its category list from `listCategories()` instead of the hardcoded constant; until categories are seeded, the sitemap will simply skip them and you stop promising 404s to Google. Also seed at least one category and/or hide navbar/footer category links until categories exist.
6. Remove `/search` from the static-page list in `sitemap.xml` (it's `noindex`); add `/latest` and `/events` (which exist but are missing).

**Day-2 (rich results & i18n):**
7. Add `Organization` + `WebSite` JSON-LD to root layout (with `potentialAction.SearchAction` so the sitelinks search box becomes eligible).
8. Add `NewsArticle` + `BreadcrumbList` JSON-LD to article pages.
9. Add `ItemList` JSON-LD to `/latest`, `/videos`, `/events`, `/live`, and category pages.
10. Add `x-default` hreflang on every page.
11. Emit Nepali article URLs (and per-language hreflang `<xhtml:link>`) in `sitemap.xml`, `news-sitemap.xml`, and `article-sitemap.xml`.

**Day-3 (polish):**
12. Localize `/login` and `/signup` titles via `next-intl`.
13. Add real meta descriptions to `/`, `/latest`, `/videos`, `/events`, `/live` per locale.
14. Switch `MobileNav` `<img>` to `next/image`.
15. Convert raw `<a>` pagination on category/events pages to `<Link>`.
16. Set `Content-Language` header in `proxy.ts`; add `Vary: cookie, accept-language` on the geo redirect.
17. Add `theme-color` meta and `application-name`.
18. Wrap `getSiteSettingsForLocale` and `getBreakingHeadline` with `unstable_cache`.

---

## 9. What's Genuinely Solid

Worth saying — these were done right:
- Three-sitemap split (general / article / news) with a real 48 h news cutoff.
- `next-intl` routing config is clean.
- Metadata API used everywhere instead of manual `<head>` tags.
- Robots.txt is Google-friendly and references all three sitemaps.
- `next/font` self-hosted; no Google Fonts call.
- HTTPS canonical URLs derived from a single `baseUrl`.
- Logo image is preloaded with `priority`.
- Search page correctly uses `noindex`.

The bones are good. The five critical issues in §0 are small code changes that will unlock most of the missing organic potential.

---

*End of audit. No code was modified. Ready to apply any subset of fixes on request.*
