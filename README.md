# Opus Mastery — Gamified Course Platform

A Next.js app for learning Opus through 12 practical lessons, challenge submissions, achievements, and certificate generation.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- SQLite (`better-sqlite3`)
- Railway deployment

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run db:init
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

See `.env.example`.

Critical values:

- `SESSION_SECRET`
- `DATABASE_PATH` (default production path: `/data/opus-course.db`)
- SMTP settings for OTP/certificate email flows

## Database

Initialize schema:

```bash
npm run db:init
```

Schema is defined in `lib/schema.sql` and includes:

- `users`
- `progress`
- `achievements`
- `certificates`
- `analytics`

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — linting
- `npm run test` — lightweight schema checks
- `npm run db:init` — initialize SQLite schema

## Deployment (Railway)

This repo includes:

- `railway.toml` with `/api/health` health check
- `nixpacks.toml` for Node build/runtime

Attach a persistent volume and set `DATABASE_PATH=/data/opus-course.db`.

## Custom Domain (Cloudflare DNS)

Use the helper script to upsert the `opus-course.learnopenclaw.ai` CNAME once your Railway public hostname is known.

```bash
export CF_API_TOKEN=...
# Prefer explicit zone id (fastest)
export CF_ZONE_ID=...
# Optional fallback if you only know the zone name (example: learnopenclaw.ai)
# export CF_ZONE_NAME=learnopenclaw.ai
export NEXT_PUBLIC_APP_URL=https://opus-course.learnopenclaw.ai
export CF_TARGET_CNAME=<railway-generated-domain>
# Optional: target a different DNS name than NEXT_PUBLIC_APP_URL hostname
# export CF_RECORD_NAME=www.opus-course.learnopenclaw.ai
# Optional: disable Cloudflare proxy (DNS-only)
# export CF_PROXIED=false
node scripts/configure-cloudflare-domain.mjs
```

Dry run before applying changes:

```bash
node scripts/configure-cloudflare-domain.mjs --dry-run
```

If `CF_TARGET_CNAME` is omitted, the script falls back to `RAILWAY_PUBLIC_DOMAIN`, then attempts `railway domain --json` (when run in a linked Railway project). If `CF_ZONE_ID` is omitted, set `CF_ZONE_NAME` and the script will resolve the zone automatically.
