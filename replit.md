# The Daily Report — News Portal

## Overview
A modern multilingual news portal built with Next.js 16 App Router. Features a contemporary editorial design with clean card-based layouts, strong typographic hierarchy, and full English + Nepali language support via next-intl.

## Tech Stack
- **Framework**: Next.js 16.2.2 (App Router, Turbopack)
- **Runtime**: Node.js 22
- **Language**: TypeScript
- **i18n**: next-intl with locale-prefixed URLs (`/en/*`, `/ne/*`)
- **Fonts**: Noticia Text (serif, headlines) + DM Sans (sans-serif, UI/body) via `next/font`
- **Styling**: CSS Modules + global CSS variables
- **Images**: `next/image` with Unsplash remote patterns

## Project Structure
```
app/
  layout.tsx              # Root layout (pass-through; html/body in locale layout)
  page.tsx                # Root redirect → /en
  page.module.css         # Homepage styles
  globals.css             # Global styles & design tokens
  fonts.ts                # Font definitions (Noticia Text, DM Sans)
  icon.svg                # Favicon
  [locale]/               # All routes under locale prefix
    layout.tsx            # Locale layout: <html lang>, NextIntlClientProvider
    page.tsx              # Homepage
    article/[id]/         # Article detail page
    [category]/           # Category archive
    tags/[tag]/           # Tag archive
    search/               # Search results
    author/[slug]/        # Author archive
    login/                # Login page
    signup/               # Sign-up page
  _components/            # Shared components
    Header.tsx            # Sticky nav — uses getTranslations("nav")
    Footer.tsx            # Site footer — uses getTranslations("footer", "nav")
    MobileNav.tsx         # Mobile drawer nav — uses useTranslations("nav")
    LanguageSwitcher.tsx  # EN|NE toggle — uses useLocale / router.replace
    BreakingTicker.tsx    # Live news banner
    ArchiveLayout.tsx     # Shared archive page layout (with translated sidebar)
    ArticleCard.tsx       # Article card
    CategoryBadge.tsx     # Category badge
    SearchInput.tsx       # Search form — uses useTranslations("search")
    *.module.css          # Component-scoped styles
  _data/
    articles.ts           # Mock article data & types
    authors.ts            # Author profiles
    tags.ts               # Tag definitions
    getAllArticles.ts      # Data utilities
i18n/
  routing.ts              # Locales config: ["en", "ne"], defaultLocale: "en"
  request.ts              # next-intl server config (getRequestConfig)
  navigation.ts           # Locale-aware Link, useRouter, usePathname exports
messages/
  en.json                 # English translations (all namespaces)
  ne.json                 # Nepali translations (all namespaces)
proxy.ts                  # next-intl routing middleware (replaces middleware.ts)
next.config.ts            # Next.js config (next-intl plugin, remote images)
```

## i18n Architecture
- All URLs are locale-prefixed: `/en/...` and `/ne/...`
- Middleware (proxy.ts) redirects non-prefixed URLs to `/en/...`
- Root `app/page.tsx` redirects to `/en`
- Server components use `getTranslations(namespace)` from `"next-intl/server"`
- Client components use `useTranslations(namespace)` from `"next-intl"`
- All `<Link>` elements use the locale-aware `Link` from `@/i18n/navigation`
- `LanguageSwitcher` uses `useLocale` + `router.replace(pathname, { locale })`

## Translation Namespaces
| Namespace    | Used in                                        |
|-------------|------------------------------------------------|
| `site`      | Layout metadata                                |
| `nav`       | Header, MobileNav, Footer (section links)      |
| `footer`    | Footer                                         |
| `article`   | Article page (by, read, share, related news)  |
| `archive`   | ArchiveLayout, category/tag/author/search pages|
| `newsletter`| ArchiveLayout sidebar                          |
| `search`    | Search page, SearchInput                       |
| `login`     | Login page                                     |
| `signup`    | Sign-up page                                  |
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

## Notes
- `allowedDevOrigins` in `next.config.ts` configured for Replit preview domain
- `proxy.ts` is the Next.js 16 replacement for `middleware.ts`
- `app/[category]` root-level folder was removed to avoid dynamic-route name conflict with `app/[locale]`
