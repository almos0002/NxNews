# The Daily Report — News Portal

## Overview
A modern news portal built with Next.js 16 using the App Router. Contemporary editorial design with clean card-based layouts and strong typographic hierarchy. Full 6-language translation system.

## Tech Stack
- **Framework**: Next.js 16.2.2
- **Runtime**: Node.js 22
- **Language**: TypeScript
- **Router**: App Router (mix of server and client components)
- **Fonts**: Noticia Text (serif, headlines) + DM Sans (sans-serif, UI/body) via `next/font`; Noto Serif Devanagari (Nepali), Noto Naskh Arabic (Arabic), Noto Serif SC (Chinese)
- **Styling**: CSS Modules + global CSS variables
- **Images**: `next/image` with Unsplash remote patterns configured
- **i18n**: Client-side 6-language system (EN, NE, ES, FR, AR, ZH) via React context

## Project Structure
```
app/
  layout.tsx              # Root layout with fonts, metadata, LanguageProvider
  page.tsx                # Homepage ("use client" for translations)
  page.module.css         # Homepage styles
  globals.css             # Global styles, design tokens, language font overrides
  fonts.ts                # Font definitions (Noticia Text, DM Sans, Noto variants)
  icon.svg                # Favicon
  _i18n/
    translations.ts       # All translation strings for 6 languages
    LanguageContext.tsx    # LanguageProvider, useT() hook, T component
  _components/            # Private components (not routed)
    Header.tsx            # Sticky nav with logo, categories, language switcher
    LanguageSwitcher.tsx  # Globe icon dropdown for language selection
    MobileNav.tsx         # Mobile drawer nav
    BreakingTicker.tsx    # Live news banner
    FeaturedPanel.tsx     # Hero featured article panel
    LatestFeed.tsx        # Latest news live feed
    EditorsPick.tsx       # Editor's Pick dark strip
    ArticleCard.tsx       # Article card (hero/sidebar/grid/compact variants)
    CategoryBadge.tsx     # Category label badge (translates category names)
    SectionHeading.tsx    # Section divider heading
    TrendingSidebar.tsx   # Trending articles sidebar
    ThreeColSection.tsx   # Science & Technology 3-column layout
    CategoryLists.tsx     # 3-column category lists
    ArchiveLayout.tsx     # Shared layout for archive/category/tag pages
    Footer.tsx            # Site footer (translated)
    *.module.css          # Component-scoped styles
  _data/
    articles.ts           # Mock article data & types
    getAllArticles.ts      # Article query functions (by category, tag, author, search)
    authors.ts            # Author profiles with slugs
    tags.ts               # Tag definitions with article mappings
  article/[id]/           # Single article page
  [category]/             # Category archive page
  tags/[tag]/             # Tag archive page
  author/[slug]/          # Author archive page
  search/                 # Search page
  login/                  # Login page
  signup/                 # Signup page
next.config.ts            # Next.js config (remote images, dev origins)
tsconfig.json             # TypeScript config
package.json              # Dependencies & scripts
```

## Translation System
- **Languages**: English, Nepali (नेपाली), Spanish (Español), French (Français), Arabic (العربية), Chinese (中文)
- **Storage**: localStorage key `tdr-lang`
- **Font switching**: CSS `--font-serif`/`--font-sans` variables overridden via `html[data-lang]` selector
- **RTL**: Arabic automatically switches to `dir="rtl"` via LanguageContext
- **Components using translations**: Header, BreakingTicker, LatestFeed, EditorsPick, Footer, ThreeColSection, TrendingSidebar, CategoryBadge, FeaturedPanel, page.tsx (homepage)
- **LanguageContext** uses `useLayoutEffect` to read saved language from localStorage immediately after mount

## Design System
- **Colors**: Warm off-white bg (#f5f5f0), white surface cards, near-black text (#141414), red accent (#e63946)
- **Typography**: Noticia Text for headlines, DM Sans for UI/body. No shadows, no gradients.
- **Layout**: Modern card-based grid layout with rounded corners
- **Breakpoints**: 1100px (drop sidebar), 900px (2-col grid), 680px (mobile grid), 600px (mobile header), 560px (feature panel stack)

## Scripts
- `npm run dev` — Start development server on port 5000
- `npm run build` — Build for production
- `npm run start` — Start production server on port 5000
- `npm run lint` — Run ESLint

## Development
The dev server runs on port 5000 via the "Start application" workflow.

## Notes
- `allowedDevOrigins` in `next.config.ts` is set for the Replit preview domain.
- Uses Turbopack for fast development builds (default in Next.js 16).
- Homepage (`page.tsx`) is a client component to support translations via `useT()`.
- Remote images from Unsplash are allowed via `next.config.ts` remotePatterns.
- `suppressHydrationWarning` on `<html>` and `<body>` in layout.tsx is intentional — the client-side language system modifies attributes after hydration.
