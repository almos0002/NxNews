# The Daily Report — News Portal

## Overview
A news portal homepage built with Next.js 16 using the App Router. Editorial-style design with strong typographic hierarchy inspired by classic newspaper aesthetics.

## Tech Stack
- **Framework**: Next.js 16.2.2
- **Runtime**: Node.js 22
- **Language**: TypeScript
- **Router**: App Router (server components by default)
- **Fonts**: Noticia Text (serif, headlines/body) + DM Sans (sans-serif, UI/navigation) via `next/font`
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
    Header.tsx            # Masthead & navigation
    BreakingTicker.tsx    # Breaking news scroll ticker
    ArticleCard.tsx       # Article card (hero/sidebar/grid/compact variants)
    CategoryBadge.tsx     # Category label badge
    SectionHeading.tsx    # Section divider heading
    TrendingSidebar.tsx   # Most-read trending list
    Footer.tsx            # Site footer
    *.module.css          # Component-scoped styles
  _data/
    articles.ts           # Mock article data & types
next.config.ts            # Next.js config (remote images, dev origins)
tsconfig.json             # TypeScript config
package.json              # Dependencies & scripts
```

## Design System
- **Colors**: Off-white background (#faf9f6), near-black text (#1a1a1a), crimson accent (#c41e3a)
- **Typography**: Serif-forward editorial hierarchy. No shadows, no gradients.
- **Layout**: CSS Grid editorial layout with newspaper-style rules/dividers

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
- All components are server components except where client interactivity is needed.
- Remote images from Unsplash are allowed via `next.config.ts` remotePatterns.
