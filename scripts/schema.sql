-- ============================================================================
-- KumariHub — Complete Database Schema (PostgreSQL)
-- ============================================================================
-- This file contains the FULL schema for the KumariHub multilingual news
-- portal: Better Auth tables, CMS content tables, view tracking, user
-- engagement features, and all production indexes.
--
-- Sources consolidated:
--   - scripts/migrate.mjs           (pages, categories, tags, videos)
--   - lib/auth.ts (Better Auth)     (user, session, account, verification, rateLimit)
--   - lib/ads.ts                    (ads — note: code uses VARCHAR PK on slot;
--                                    live DB uses uuid id + unique slot)
--   - lib/events.ts                 (event_photos + indexes)
--   - lib/live-views.ts             (global_view_counters)
--   - app/api/views/route.ts        (global_view_counters — same table)
--   - app/api/live/route.ts         (live_streams — see note below)
--   - replit.md "Production Readiness" (all performance indexes)
--
-- NOTE: There are TWO different live_streams definitions in the codebase:
--   - app/api/live/route.ts   uses columns: stream_url, platform, display_order
--   - the live DB has columns: youtube_url,  sort_order
-- This file uses the live DB version (the migrated/canonical one).
-- ============================================================================

-- Required extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- 1. BETTER AUTH — Users, Sessions, Accounts, Verification, Rate Limit
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user" (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL UNIQUE,
  "emailVerified" BOOLEAN     NOT NULL DEFAULT false,
  image           TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role            TEXT        NOT NULL DEFAULT 'user',         -- admin | moderator | author | user
  banned          BOOLEAN     DEFAULT false,
  "banReason"     TEXT,
  "banExpires"    TIMESTAMPTZ,
  bio             TEXT        DEFAULT ''
);

CREATE TABLE IF NOT EXISTS session (
  id               TEXT        PRIMARY KEY,
  "expiresAt"      TIMESTAMPTZ NOT NULL,
  token            TEXT        NOT NULL UNIQUE,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress"      TEXT,
  "userAgent"      TEXT,
  "userId"         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "impersonatedBy" TEXT
);

CREATE TABLE IF NOT EXISTS account (
  id                      TEXT        PRIMARY KEY,
  "accountId"             TEXT        NOT NULL,
  "providerId"            TEXT        NOT NULL,
  "userId"                TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken"           TEXT,
  "refreshToken"          TEXT,
  "idToken"               TEXT,
  "accessTokenExpiresAt"  TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope                   TEXT,
  password                TEXT,
  "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification (
  id          TEXT        PRIMARY KEY,
  identifier  TEXT        NOT NULL,
  value       TEXT        NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "rateLimit" (
  id            TEXT PRIMARY KEY,
  key           TEXT,
  count         INTEGER,
  "lastRequest" BIGINT
);


-- ============================================================================
-- 2. CMS — Articles, Pages, Categories, Tags, Videos
-- ============================================================================

CREATE TABLE IF NOT EXISTS article (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en       TEXT        NOT NULL,
  title_ne       TEXT        NOT NULL DEFAULT '',
  slug           TEXT        NOT NULL UNIQUE,
  content_en     TEXT        NOT NULL DEFAULT '',
  content_ne     TEXT        NOT NULL DEFAULT '',
  excerpt_en     TEXT        NOT NULL DEFAULT '',
  excerpt_ne     TEXT        NOT NULL DEFAULT '',
  featured_image TEXT        NOT NULL DEFAULT '',
  category       TEXT        NOT NULL DEFAULT '',
  tags           TEXT[]      NOT NULL DEFAULT '{}',
  status         TEXT        NOT NULL DEFAULT 'draft',         -- draft | pending | published
  author_id      TEXT        NOT NULL,
  author_name    TEXT        NOT NULL DEFAULT '',
  is_featured    BOOLEAN     NOT NULL DEFAULT false,
  view_count     INTEGER     NOT NULL DEFAULT 0,
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en   TEXT        NOT NULL,
  title_ne   TEXT        NOT NULL DEFAULT '',
  slug       TEXT        NOT NULL UNIQUE,
  content_en TEXT        NOT NULL DEFAULT '',
  content_ne TEXT        NOT NULL DEFAULT '',
  status     TEXT        NOT NULL DEFAULT 'draft',
  author_id  TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en    TEXT        NOT NULL,
  name_ne    TEXT        NOT NULL DEFAULT '',
  slug       TEXT        NOT NULL UNIQUE,
  color      TEXT        NOT NULL DEFAULT '#e63946',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en    TEXT        NOT NULL,
  name_ne    TEXT        NOT NULL DEFAULT '',
  slug       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS videos (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en       TEXT        NOT NULL,
  title_ne       TEXT        NOT NULL DEFAULT '',
  youtube_url    TEXT        NOT NULL,
  description_en TEXT        NOT NULL DEFAULT '',
  description_ne TEXT        NOT NULL DEFAULT '',
  thumbnail      TEXT        NOT NULL DEFAULT '',
  status         TEXT        NOT NULL DEFAULT 'published',
  author_id      TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional video columns added by scripts/seed.ts
ALTER TABLE videos ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Video';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration VARCHAR(20)  DEFAULT '';


-- ============================================================================
-- 3. SITE CONFIG — Settings, Menu, Ads, Live Streams
-- ============================================================================

CREATE TABLE IF NOT EXISTS settings (
  key      TEXT PRIMARY KEY,
  value_en TEXT NOT NULL DEFAULT '',
  value_ne TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS menu_items (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label_en         TEXT        NOT NULL,
  label_ne         TEXT        NOT NULL DEFAULT '',
  url              TEXT        NOT NULL,
  menu_type        TEXT        NOT NULL DEFAULT 'navbar',     -- navbar | footer | bottom
  sort_order       INTEGER     NOT NULL DEFAULT 0,
  link_type        TEXT        NOT NULL DEFAULT 'external',   -- page | external | category
  page_id          UUID        REFERENCES pages(id) ON DELETE SET NULL,
  open_new_tab     BOOLEAN     NOT NULL DEFAULT false,
  section_label_en TEXT        NOT NULL DEFAULT '',
  section_label_ne TEXT        NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS link_type        TEXT    NOT NULL DEFAULT 'external';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS page_id          UUID    REFERENCES pages(id) ON DELETE SET NULL;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS open_new_tab     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS section_label_en TEXT    NOT NULL DEFAULT '';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS section_label_ne TEXT    NOT NULL DEFAULT '';

-- Canonical ads table (matches live DB).
CREATE TABLE IF NOT EXISTS ads (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot       TEXT        NOT NULL UNIQUE,
  enabled    BOOLEAN     NOT NULL DEFAULT false,
  code       TEXT        NOT NULL DEFAULT '',
  width      INTEGER     NOT NULL DEFAULT 0,
  height     INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_streams (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en    TEXT        NOT NULL,
  title_ne    TEXT        NOT NULL DEFAULT '',
  youtube_url TEXT        NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 4. EVENT PHOTOS (photo gallery)
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_photos (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en       TEXT        NOT NULL,
  title_ne       TEXT,
  description_en TEXT,
  description_ne TEXT,
  location_en    TEXT,
  location_ne    TEXT,
  event_date     DATE,
  cover_image    TEXT,
  images         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  slug           TEXT        UNIQUE NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'published'
                             CHECK (status IN ('published','draft')),
  view_count     INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE event_photos ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;


-- ============================================================================
-- 5. VIEW TRACKING — page_views (unique IP+date) + global counters
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_views (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT        NOT NULL,                        -- article | video | page | live | event
  content_id   TEXT        NOT NULL,
  ip_address   TEXT,
  ip           TEXT,                                        -- used by app/api/views/route.ts
  viewed_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
  country      TEXT,
  city         TEXT,
  user_agent   TEXT,
  view_hash    TEXT        UNIQUE,                          -- sha256(ip|type|id|YYYY-MM-DD)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_type, content_id, ip_address, viewed_date)
);
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS ip         TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city       TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS view_hash  TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS global_view_counters (
  id         TEXT PRIMARY KEY,                              -- e.g. 'live-page'
  view_count INTEGER NOT NULL DEFAULT 0
);

INSERT INTO global_view_counters (id, view_count)
VALUES ('live-page', 0)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 6. USER ENGAGEMENT — Bookmarks, Reading History
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT        NOT NULL REFERENCES "user"(id)  ON DELETE CASCADE,
  article_id UUID        NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS reading_history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT        NOT NULL REFERENCES "user"(id)  ON DELETE CASCADE,
  article_id UUID        NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),           -- used by app/api/views/route.ts
  UNIQUE (user_id, article_id)
);
ALTER TABLE reading_history ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ NOT NULL DEFAULT NOW();


-- ============================================================================
-- 7. PRODUCTION INDEXES
--    Verbatim from replit.md "Production Readiness (Audit Complete)" plus
--    the indexes created in lib/events.ts. These power archive / listing /
--    related-article / trending queries.
-- ============================================================================

-- article — listing / archive / featured / related / tags / trending
CREATE INDEX IF NOT EXISTS idx_article_status_published
  ON article (status, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_article_slug
  ON article (slug);

CREATE INDEX IF NOT EXISTS idx_article_status_featured
  ON article (status, is_featured);

CREATE INDEX IF NOT EXISTS idx_article_category_status
  ON article (LOWER(category), status);

CREATE INDEX IF NOT EXISTS idx_article_tags_gin
  ON article USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_article_view_count
  ON article (view_count DESC);

-- user — author lookup (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_user_lower_name
  ON "user" (LOWER(name));

-- page_views — view-count joins
CREATE INDEX IF NOT EXISTS idx_page_views_content
  ON page_views (content_type, content_id);

-- videos — listing
CREATE INDEX IF NOT EXISTS idx_videos_status_created
  ON videos (status, created_at DESC);

-- event_photos
CREATE INDEX IF NOT EXISTS event_photos_status_idx
  ON event_photos (status);
CREATE INDEX IF NOT EXISTS event_photos_slug_idx
  ON event_photos (slug);
CREATE INDEX IF NOT EXISTS event_photos_date_idx
  ON event_photos (event_date DESC NULLS LAST);


-- ============================================================================
-- DONE
-- ============================================================================
