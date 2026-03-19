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
- `npm run domain:setup` — apply Cloudflare CNAME + verify propagation
- `npm run domain:setup:dry` — dry-run custom-domain changes

## Deployment (Railway)

This repo includes:

- `railway.toml` with `/api/health` health check
- `nixpacks.toml` for Node build/runtime

Attach a persistent volume and set `DATABASE_PATH=/data/opus-course.db`.

## Custom Domain (Cloudflare DNS)

Use the helper script to upsert the `opus-course.learnopenclaw.ai` CNAME once your Railway public hostname is known.

```bash
export CF_API_TOKEN=... # alias: CLOUDFLARE_API_TOKEN
# Prefer explicit zone id (fastest)
export CF_ZONE_ID=...    # alias: CLOUDFLARE_ZONE_ID
# Optional fallback if you only know the zone name (example: learnopenclaw.ai)
# export CF_ZONE_NAME=learnopenclaw.ai # alias: CLOUDFLARE_ZONE_NAME
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
# or one-command dry run (configure + skip verification)
npm run domain:setup:dry
```

One-command apply + verify workflow:

```bash
npm run domain:setup
# equivalent:
# node scripts/custom-domain-setup.mjs --wait-seconds=300
```

You can also run it without exporting env vars by passing explicit flags:

```bash
node scripts/configure-cloudflare-domain.mjs \
  --token="$CF_API_TOKEN" \
  --app-url="https://opus-course.learnopenclaw.ai" \
  --zone-name="learnopenclaw.ai" \
  --target="<railway-generated-domain>" \
  --record-name="opus-course.learnopenclaw.ai" \
  --proxied=true \
  --dry-run
```

If `CF_TARGET_CNAME` is omitted, the script falls back to `RAILWAY_PUBLIC_DOMAIN`, then attempts `railway domain --json` (when run in a linked Railway project). If `CF_ZONE_ID` is omitted, the script uses `CF_ZONE_NAME` when provided, otherwise it infers a zone from `NEXT_PUBLIC_APP_URL` (e.g. `opus-course.learnopenclaw.ai` → `learnopenclaw.ai`) before resolving the zone via Cloudflare API.

After applying DNS, verify propagation points to Railway:

```bash
node scripts/verify-custom-domain.mjs \
  --domain="opus-course.learnopenclaw.ai" \
  --target="<railway-generated-domain>" \
  --wait-seconds=300
```

The command exits `0` once the CNAME matches. If DNS is still propagating it will poll until `--wait-seconds` is exhausted.

If Cloudflare proxy is enabled (`CF_PROXIED=true`) and public DNS no longer exposes the CNAME, you can pass Cloudflare auth (`--token` plus `--zone-id`/`--zone-name`, or env vars) and the verifier will confirm the CNAME directly via Cloudflare API as a fallback.
