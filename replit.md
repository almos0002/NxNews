# The Daily Report — News Portal

## Overview
A modern news portal homepage built with Next.js 16 using the App Router. Contemporary editorial design with clean card-based layouts and strong typographic hierarchy.

## Tech Stack
- **Framework**: Next.js 16.2.2
- **Runtime**: Node.js 22
- **Language**: TypeScript
- **Router**: App Router (server components by default)
- **Fonts**: Noticia Text (serif, headlines) + DM Sans (sans-serif, UI/body) via `next/font`
- **Styling**: CSS Modules + global CSS variables
- **Images**: `next/image` with Unsplash remote patterns configured

## Project Structure
```
app/
  layout.tsx              # Root layout with fonts & metadata
  page.tsx                # Homepage (server component)
  page.module.css         # Homepage styles
  globals.css             # Global styles & design tokens
  fonts.ts                # Font definitions (Noticia Text, DM Sans)
  icon.svg                # Favicon
  _components/            # Private components (not routed)
    Header.tsx            # Sticky nav with logo & categories
    BreakingTicker.tsx    # Live news banner
    ArticleCard.tsx       # Article card (hero/sidebar/grid/compact variants)
    CategoryBadge.tsx     # Category label badge
    SectionHeading.tsx    # Section divider heading
    TrendingSidebar.tsx   # Trending articles sidebar
    Footer.tsx            # Site footer
    *.module.css          # Component-scoped styles
  _data/
    articles.ts           # Mock article data & types
next.config.ts            # Next.js config (remote images, dev origins)
tsconfig.json             # TypeScript config
package.json              # Dependencies & scripts
```

## Design System
- **Colors**: Warm off-white bg (#f5f5f0), white surface cards, near-black text (#141414), red accent (#e63946)
- **Typography**: Noticia Text for headlines, DM Sans for UI/body. No shadows, no gradients.
- **Layout**: Modern card-based grid layout with rounded corners

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
- All components are server components (no `'use client'` needed).
- Remote images from Unsplash are allowed via `next.config.ts` remotePatterns.
