# PRD: Opus Mastery — Gamified Course Platform 🎓

## Overview

A gamified learning platform where users master Opus (AI workflow automation) by completing 12 progressive lessons. Each lesson has written content, video tutorials, and a hands-on challenge verified within Opus. Built as a Next.js app on Railway — same architecture as the Hatch Quest app (hatch.learnopenclaw.ai).

**Live URL target:** opus-course.learnopenclaw.ai (or similar)
**Reference app:** https://hatch.learnopenclaw.ai

---

## The Experience

### User Flow

1. User lands on homepage → sees course overview with 12-lesson roadmap
2. Clicks any lesson → immediately starts learning (NO signup required)
3. All 12 lessons are freely accessible — written guides + video embeds + challenges
4. Progress tracked in localStorage (no account needed)
5. User self-marks challenges as complete (honor system)
6. Progress bar fills as lessons complete
7. At 12/12: Prompt to sign in (email OTP) to generate certificate
8. Certificate generated → Shareable badge → Public profile page

**Key principle:** Zero friction to learn. Only gate = certificate generation (requires email for identity).

### UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  LEFT SIDEBAR (30%)            │  MAIN CONTENT (70%)         │
│                                │                              │
│   🎓 Opus Mastery              │  Lesson 3: The Opus Agent    │
│                                │                              │
│   ████████████░░░ 3/12         │  📺 [Tutorial Video]         │
│   "Workflow Architect"         │  "Master the Opus Agent"     │
│                                │                              │
│   ✅ 1. First Workflow         │  📝 Lesson Content:          │
│   ✅ 2. The Builder            │  What is the Opus Agent?     │
│   → 3. Opus Agent             │  The Opus Agent is your AI   │
│   ○ 4. Decision Agents        │  workhorse for reasoning,    │
│   ○ 5. Custom Agents          │  extraction, and generation  │
│   ○ 6. Human-in-the-Loop      │  ...                         │
│   ○ 7. Data Tasks             │                              │
│   ○ 8. Integrations           │  🛠️ Challenge:               │
│   ○ 9. Sub-Workflows          │  Build a customer feedback   │
│   ○ 10. Opus Code             │  analyzer workflow with 3    │
│   ○ 11. Production            │  agents that classifies,     │
│   ○ 12. Capstone              │  extracts, and responds.     │
│                                │                              │
│   ┌──────────────────────┐    │  ┌──────────────────────┐    │
│   │ 🏆 Achievements      │    │  │ Submit: Paste your   │    │
│   │ • First Workflow ✅   │    │  │ workflow URL or       │    │
│   │ • Speed Builder ✅    │    │  │ screenshot            │    │
│   │ • Agent Master ○     │    │  │ [__________] [✓]     │    │
│   └──────────────────────┘    │  └──────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Mobile:** Sidebar collapses to top nav, content stacks vertically.

---

## The 12 Lessons

| # | Lesson | Challenge | Verification |
|---|--------|-----------|-------------|
| 1 | Your First Workflow | Build a text summarizer workflow | Workflow URL or screenshot of successful preview |
| 2 | Mastering the Builder | Multi-step document processor (3 chained agents) | Screenshot of builder with 3+ connected tasks |
| 3 | The Opus Agent | Customer feedback analyzer | Screenshot of workflow output showing sentiment + response |
| 4 | Decision Agents | Support ticket router with 3 branches | Screenshot of decision branches in builder |
| 5 | Custom Agents | Multi-language content generator | Screenshot showing multi-model output |
| 6 | Human-in-the-Loop | Content approval pipeline with review | Screenshot of human review step |
| 7 | Data Tasks | Invoice processor (PDF → structured data) | Screenshot of extracted invoice data |
| 8 | Integrations | Lead enrichment with external service | Screenshot of integration config + output |
| 9 | Sub-Workflows | Content repurposer using Execute Workflow | Screenshot of main + sub-workflow |
| 10 | Opus Code | Financial report with Python code task | Screenshot of Opus Code task + output |
| 11 | Going to Production | Activate a workflow + run 3 jobs | Screenshot of Jobs page with 3+ completed jobs |
| 12 | Capstone Project | Full end-to-end automation | Workflow URL + architecture description |

---

## Progression System

### Titles (Earned by Lesson Count)

| Lessons | Title |
|---|---|
| 0 | Newcomer |
| 1-2 | Workflow Rookie |
| 3-4 | Workflow Builder |
| 5-6 | Automation Specialist |
| 7-8 | Integration Expert |
| 9-10 | Workflow Architect |
| 11 | Production Engineer |
| 12 | Opus Master 🏆 |

### Achievements (Bonus Badges)

| Badge | Condition |
|---|---|
| ⚡ Speed Builder | Complete a lesson within 1 hour of starting |
| 🔥 Streak Master | Complete 3 lessons in 3 consecutive days |
| 🧠 Agent Whisperer | Complete all 3 agent lessons (3, 4, 5) |
| 🤝 Human Touch | Complete the Human-in-the-Loop lesson |
| 🔌 Integrator | Complete the Integrations lesson |
| 🐍 Code Warrior | Complete the Opus Code lesson |
| 🎓 Opus Master | Complete all 12 lessons |

---

## Completion Reward

### Certificate
- PDF certificate with:
  - User's name
  - "Opus Mastery — Complete Course"
  - Completion date
  - Unique certificate ID
  - Course stats (lessons completed, achievements earned)

### Shareable Badge
- OG image for social sharing (1200x630)
- Shows: title, achievements count, completion date
- Public profile URL: `opus-course.learnopenclaw.ai/u/[username]`

### Public Profile Page
- Username, title, achievements
- Lessons completed timeline
- Certificate download link
- "Start your Opus journey →" CTA for referrals

---

## Technical Architecture

### Stack (Matching Hatch Quest Pattern)

| Component | Technology |
|---|---|
| **Framework** | Next.js 14+ (App Router) |
| **Styling** | Tailwind CSS |
| **Auth** | Email OTP only — triggered ONLY when requesting certificate (no signup wall) |
| **Progress** | localStorage (anonymous progress) + SQLite (after OTP sign-in for certificate) |
| **Database** | SQLite via `better-sqlite3` (Railway persistent volume at `/data/opus-course.db`) |
| **Hosting** | Railway |
| **Certificate** | PDF generation (same pattern as Hatch) |
| **Analytics** | Simple event tracking (lesson starts, completions, time spent) |
| **Domain** | Custom domain via Cloudflare DNS |

### Auth Philosophy
- **No signup wall.** All content is free and immediately accessible.
- Progress is stored in localStorage — works without any account.
- When user completes all 12 lessons and wants a certificate, THEN prompt for email OTP.
- OTP creates a user record, migrates localStorage progress to DB, generates certificate.
- Optional: user can sign in earlier to sync progress across devices, but never required.

### Database Schema

```sql
-- Users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    github_id TEXT UNIQUE,
    password_hash TEXT,
    otp_code TEXT,
    otp_expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Lesson progress
CREATE TABLE progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id INTEGER NOT NULL, -- 1-12
    status TEXT DEFAULT 'locked', -- locked, available, in_progress, completed
    started_at TEXT,
    completed_at TEXT,
    proof_url TEXT, -- screenshot or workflow URL
    proof_verified INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- Achievements
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    badge_id TEXT NOT NULL, -- speed-builder, streak-master, etc.
    earned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, badge_id)
);

-- Certificates
CREATE TABLE certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    certificate_id TEXT UNIQUE NOT NULL, -- UUID
    generated_at TEXT DEFAULT (datetime('now')),
    pdf_path TEXT
);

-- Analytics events
CREATE TABLE analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event TEXT NOT NULL, -- lesson_start, lesson_complete, achievement_earned, etc.
    data TEXT, -- JSON metadata
    created_at TEXT DEFAULT (datetime('now'))
);
```

### File Structure

```
opus-course-app/
├── app/
│   ├── page.tsx                    # Homepage / landing
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind + custom styles
│   ├── dashboard/page.tsx          # Main dashboard (sidebar + lesson list)
│   ├── lessons/
│   │   └── [lessonId]/page.tsx     # Individual lesson view
│   ├── certificate/page.tsx        # Certificate view + download
│   ├── u/
│   │   └── [username]/
│   │       ├── page.tsx            # Public profile
│   │       └── badge/
│   │           ├── page.tsx        # Badge page
│   │           └── image/route.tsx # OG image generation
│   └── api/
│       ├── auth/
│       │   ├── otp-send/route.ts
│       │   ├── otp-verify/route.ts
│       │   └── logout/route.ts
│       ├── lessons/
│       │   ├── progress/route.ts   # GET progress, POST update
│       │   └── verify/route.ts     # POST proof submission
│       ├── achievements/route.ts   # GET user achievements
│       ├── certificate/
│       │   ├── generate/route.ts   # POST generate certificate
│       │   └── email/route.ts      # POST email certificate
│       ├── analytics/
│       │   ├── track/route.ts      # POST event
│       │   └── summary/route.ts    # GET analytics
│       ├── og/route.tsx            # OG image generation
│       └── health/route.ts         # Health check
├── components/
│   ├── otp-modal.tsx               # OTP sign-in modal (for certificate request)
│   ├── lesson-sidebar.tsx          # Left sidebar with progress
│   ├── lesson-content.tsx          # Main lesson content renderer
│   ├── progress-bar.tsx            # Visual progress indicator
│   ├── proof-submit-form.tsx       # Challenge submission form
│   ├── achievement-badge.tsx       # Achievement display
│   ├── video-embed.tsx             # YouTube/video embed
│   ├── code-block.tsx              # Syntax highlighted code
│   ├── completion-celebration.tsx  # Final completion animation
│   └── analytics-tracker.tsx       # Client-side analytics
├── lib/
│   ├── db.ts                       # SQLite connection + queries
│   ├── auth.ts                     # Auth helpers (session, OTP)
│   ├── lessons.ts                  # Lesson content + metadata
│   ├── achievements.ts             # Achievement checking logic
│   ├── certificate.ts              # PDF generation
│   └── analytics.ts                # Analytics helpers
├── content/
│   ├── lesson-01.md                # Lesson 1 content (markdown)
│   ├── lesson-02.md
│   ├── lesson-03.md
│   ├── lesson-04.md
│   ├── lesson-05.md
│   ├── lesson-06.md
│   ├── lesson-07.md
│   ├── lesson-08.md
│   ├── lesson-09.md
│   ├── lesson-10.md
│   ├── lesson-11.md
│   └── lesson-12.md
├── public/
│   ├── images/                     # Lesson images, screenshots
│   └── fonts/                      # Custom fonts
├── .env.example
├── railway.toml
├── nixpacks.toml
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── prd.md
└── README.md
```

### Environment Variables

```
# Auth (only needed for certificate OTP flow)
SESSION_SECRET=             # Random 64-char string

# Email (OTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=        # https://opus-course.learnopenclaw.ai
DATABASE_PATH=/data/opus-course.db

# Optional
ANALYTICS_ENABLED=true
```

---

## Tasks

### Phase 1: Project Bootstrap
- [ ] Initialize Next.js project with Tailwind CSS, TypeScript, App Router
- [ ] Set up project structure (app, components, lib, content directories)
- [ ] Configure Railway deployment (railway.toml, nixpacks.toml, persistent volume for SQLite)
- [ ] Set up .env.example with all required variables
- [ ] Create SQLite database initialization script (users, progress, achievements, certificates, analytics tables)
- [ ] Create lib/db.ts with database connection and query helpers
- [ ] Create README.md with project overview and setup instructions

### Phase 2: Progress System & Lightweight Auth
- [ ] Create lib/progress.ts — localStorage-based progress tracking (read/write lesson completion status, timestamps, challenge self-marks)
- [ ] Create a React context (ProgressProvider) that wraps the app, loads progress from localStorage on mount, provides methods: markComplete(lessonId), getProgress(), isComplete(lessonId), getTotalCompleted()
- [ ] Create lib/auth.ts — lightweight session management (cookie-based), only used when user requests certificate
- [ ] Create /api/auth/otp-send route — send OTP code via email (triggered only from certificate request flow)
- [ ] Create /api/auth/otp-verify route — verify OTP, create user record if new, set session cookie, migrate localStorage progress to DB
- [ ] Create /api/auth/logout route — clear session cookie
- [ ] Create a sign-in modal component (not a page) — email input + OTP verification, appears when user clicks "Get Certificate" after completing all lessons
- [ ] No login page, no register page, no GitHub OAuth — keep it minimal. Just OTP when needed.

### Phase 3: Lesson Content System
- [ ] Create lib/lessons.ts — lesson metadata (id, title, description, video URL, challenge description, verification type)
- [ ] Write content/lesson-01.md through content/lesson-12.md — full written content for all 12 lessons (use the curriculum from opus-course-curriculum.md)
- [ ] Create lesson-content.tsx component — markdown renderer with syntax highlighting, code blocks, info/warning callouts, and image support
- [ ] Create video-embed.tsx component — responsive YouTube/video embed
- [ ] Create code-block.tsx component — syntax highlighted code with copy button

### Phase 4: Dashboard & Lesson Views
- [ ] Create dashboard/page.tsx — main authenticated view with sidebar + current lesson
- [ ] Create lesson-sidebar.tsx — left sidebar showing all 12 lessons with status icons (locked/available/in-progress/completed), progress bar, current title
- [ ] Create lessons/[lessonId]/page.tsx — individual lesson page with content + video + challenge
- [ ] Create progress-bar.tsx — visual progress ring/bar showing X/12 complete with current title
- [ ] Create proof-submit-form.tsx — challenge submission form (URL input + file upload for screenshots + submit button)
- [ ] Create /api/lessons/progress route — GET user's progress across all lessons, POST to update lesson status
- [ ] Create /api/lessons/verify route — POST proof submission (saves proof URL, marks lesson complete, checks achievement triggers)
- [ ] All lessons are freely accessible (no unlock gating) — user can browse any lesson in any order, but progress bar only fills when they self-mark a challenge as complete

### Phase 5: Homepage & Landing
- [ ] Create app/page.tsx — public landing page with: hero section (course title + description + CTA), 12-lesson roadmap visual, what you'll learn section, call-to-action to sign up
- [ ] Create app/layout.tsx — root layout with metadata, OG tags, navigation header, footer
- [ ] Style with Tailwind — professional dark theme with accent colors (match Opus brand: dark + blue/purple accents), responsive for mobile/tablet/desktop

### Phase 6: Achievements System
- [ ] Create lib/achievements.ts — achievement definitions (badge_id, name, description, icon, check function)
- [ ] Implement achievement checking — triggered after each lesson completion (speed builder, streak master, agent whisperer, etc.)
- [ ] Create achievement-badge.tsx component — badge display with earned/unearned states, tooltip with description
- [ ] Create /api/achievements route — GET user's earned achievements
- [ ] Add achievements section to dashboard sidebar

### Phase 7: Certificate & Profile
- [ ] Create lib/certificate.ts — PDF certificate generation (user name, course title, date, certificate ID, achievements count)
- [ ] Create certificate/page.tsx — certificate view with download button and email option
- [ ] Create /api/certificate/generate route — POST generate PDF, store in certificates table
- [ ] Create /api/certificate/email route — POST email certificate to user
- [ ] Create u/[username]/page.tsx — public profile showing progress, achievements, certificate
- [ ] Create u/[username]/badge/page.tsx — shareable badge page
- [ ] Create u/[username]/badge/image/route.tsx — dynamic OG image generation (1200x630, shows title + achievements + completion status)
- [ ] Create /api/og/route.tsx — default OG image for the site
- [ ] Create completion-celebration.tsx — celebration animation when all 12 lessons completed (confetti, reveal certificate)

### Phase 8: Analytics & Polish
- [ ] Create lib/analytics.ts — event tracking helpers (lesson_start, lesson_complete, achievement_earned, certificate_generated)
- [ ] Create analytics-tracker.tsx — client-side page view tracking
- [ ] Create /api/analytics/track route — POST event logging
- [ ] Create /api/analytics/summary route — GET aggregate stats (total users, completion rates, popular lessons)
- [ ] Create /api/health route — health check endpoint for Railway
- [ ] Add loading states, error boundaries, and empty states across all pages
- [ ] Mobile responsive polish — test and fix all layouts on mobile/tablet
- [ ] Add SEO metadata to all pages (title, description, OG tags)

### Phase 9: Deployment & Launch
- [ ] Configure railway.toml with build/start commands and health check
- [ ] Configure nixpacks.toml for Node.js build
- [ ] Set up Railway persistent volume for SQLite at /data
- [ ] Deploy to Railway and verify health check
- [ ] Configure custom domain (opus-course.learnopenclaw.ai) via Cloudflare DNS
- [ ] Set all environment variables in Railway
- [ ] Test full flow: register → lessons → complete → certificate
- [ ] Final cleanup — remove unused code, add comments, ensure TypeScript strict mode passes

---

## Design Guidelines

### Color Palette
- **Background:** Dark (#0F0F1A or similar)
- **Cards/Surfaces:** Slightly lighter dark (#1E1E3A)
- **Primary accent:** Blue-purple (#6366F1 — matching Opus brand)
- **Success:** Green (#10B981)
- **Text:** White (#FFFFFF) and light gray (#CCCCCC)
- **Borders:** Subtle dark (#333355)

### Typography
- **Headings:** Inter or Cal Sans (bold)
- **Body:** Inter (regular)
- **Code:** JetBrains Mono or Fira Code

### Inspiration
- Hatch Quest app (hatch.learnopenclaw.ai) — gamification, progress, celebrations
- Opus.com — dark professional theme, enterprise feel
- Linear.app — clean, minimal, dark UI

---

## Lesson Content Notes

Each lesson markdown file (content/lesson-XX.md) should include:

```markdown
---
title: "Lesson Title"
description: "One-line description"
duration: "20 minutes"
videoUrl: "https://youtube.com/watch?v=..."
challenge:
  title: "Challenge Name"
  description: "What to build"
  verificationType: "url" | "screenshot"
  hint: "Helpful hint"
---

# Lesson Title

## What You'll Learn
...

## Key Concepts
...

## Step-by-Step Guide
...

## Challenge
...

## Tips & Best Practices
...
```

---

*Modeled after the Hatch Quest app (hatch.learnopenclaw.ai). Same tech stack, same gamification pattern, different content.*
