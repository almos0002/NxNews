# Next.js 16 App

## Overview
A Next.js 16 application using the App Router with TypeScript.

## Tech Stack
- **Framework**: Next.js 16.2.2
- **Runtime**: Node.js 22
- **Language**: TypeScript
- **Router**: App Router

## Project Structure
```
app/
  layout.tsx      # Root layout with metadata
  page.tsx        # Home page
  globals.css     # Global styles
next.config.ts    # Next.js configuration (includes allowedDevOrigins for Replit)
tsconfig.json     # TypeScript configuration
package.json      # Dependencies and scripts
```

## Scripts
- `npm run dev` — Start development server on port 5000
- `npm run build` — Build for production
- `npm run start` — Start production server on port 5000
- `npm run lint` — Run ESLint

## Development
The dev server runs on port 5000 via the "Start application" workflow.

## Notes
- `allowedDevOrigins` in `next.config.ts` is set to allow the Replit preview domain for HMR to work correctly.
- Uses Turbopack for fast development builds (default in Next.js 16).
