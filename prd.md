# PRD: Opus Course App v2 — Robot Assembly Hatch + UI Overhaul

## Overview

Major UI overhaul of the existing Opus Mastery course app. Three core changes:
1. **Minimal landing page** — single viewport, Opus-branded, no scrolling
2. **Robot assembly hatch mechanism** — 13-stage SVG robot that builds up as lessons complete
3. **Split-screen layout** — robot hatch on left, lesson content on right (like hatch.learnopenclaw.ai)
4. **Proof verification per lesson** — specific commands/outputs students must paste to prove completion
5. **Certificate cleanup** — remove EAS, keep PDF generation + social sharing

**Live app:** https://glorious-warmth-production-d8d2.up.railway.app
**Repo:** /root/projects/opus-course-app
**Reference:** https://hatch.learnopenclaw.ai (split-screen layout pattern)
**Brand reference:** https://www.opus.com/ (visual style)

---

## 1. Landing Page Redesign

### Requirements
- **Single viewport** — no scrolling, everything fits in one screen
- **Opus-branded** — dark background (#0A0A1A), clean minimal style inspired by opus.com
- **Content:**
  - Opus Mastery logo/wordmark at top
  - Tagline: "Master AI Workflow Automation in 12 Hands-On Lessons" (or similar)
  - Brief 1-2 sentence description
  - Single prominent "Start Learning" button (links to /dashboard)
  - Subtle footer with "Powered by OpenClaw" or similar
- **No lesson grid, no roadmap, no highlights section** — just the essentials
- **Responsive** — works on mobile without scrolling too

### Design Notes
- Think opus.com homepage energy — bold, dark, spacious, confident
- Large typography for the tagline
- Maybe a subtle animated gradient or glow effect on the CTA button
- The robot SVG could appear as a subtle background element or preview

---

## 2. Robot Assembly Hatch Mechanism

### Concept
A robot/AI machine is assembled piece by piece as the user completes lessons. 13 stages total (0 = empty workbench, 1-12 = one part added per lesson). At stage 12, the fully assembled robot activates with a jetpack and "launches."

### The 13 Stages

| Stage | Lessons Done | Visual |
|-------|-------------|--------|
| 0 | 0 | Empty workbench / assembly platform with faint blueprint outline |
| 1 | 1 | Base chassis / frame appears on the workbench |
| 2 | 2 | Core processor unit installed (glowing center piece) |
| 3 | 3 | Head/sensor array attached (eyes light up dimly) |
| 4 | 4 | Left arm assembled with tool hand |
| 5 | 5 | Right arm assembled with data connector hand |
| 6 | 6 | Chest panel with status display (shows heartbeat line) |
| 7 | 7 | Left leg with stabilizer |
| 8 | 8 | Right leg with thruster port |
| 9 | 9 | Antenna array + communication dish on back |
| 10 | 10 | Armor plating / outer shell snaps on |
| 11 | 11 | Jetpack mounted on back (not yet lit) |
| 12 | 12 | 🚀 FULL ACTIVATION — eyes glow bright, jetpack ignites, robot hovers/launches, celebration particles |

### Implementation
- **All SVG** — inline React SVG components, no external images
- **Single component:** `<RobotAssembly stage={0-12} />` 
- **Each stage adds elements** on top of previous (additive, not replacement)
- **Color scheme:** Dark metal (#2A2A4A), glowing blue accents (#6366F1), green status lights (#10B981), orange jetpack flame (#F59E0B)
- **Stage 12 animation:** CSS keyframe animation — eyes pulse, jetpack flames flicker, robot gently hovers up and down, particle effects
- **The blueprint outline at stage 0** hints at the full robot shape, motivating completion
- **Smooth transitions** between stages (CSS transition on opacity/transform when new parts appear)

### Component Structure
```
components/
  robot-assembly/
    robot-assembly.tsx        # Main component, takes stage prop
    parts/
      workbench.tsx           # Stage 0 base
      chassis.tsx             # Stage 1
      processor.tsx           # Stage 2
      head.tsx                # Stage 3
      left-arm.tsx            # Stage 4
      right-arm.tsx           # Stage 5
      chest-panel.tsx         # Stage 6
      left-leg.tsx            # Stage 7
      right-leg.tsx           # Stage 8
      antenna.tsx             # Stage 9
      armor.tsx               # Stage 10
      jetpack.tsx             # Stage 11
      activation.tsx          # Stage 12 animation overlay
```

---

## 3. Split-Screen Dashboard Layout

### Structure (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│  OPUS MASTERY                              [lesson nav] │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│   🤖 ROBOT ASSEMBLY  │  LESSON CONTENT                  │
│                      │                                  │
│   [SVG robot at      │  Lesson 3: The Opus Agent        │
│    current stage]    │                                  │
│                      │  📝 Written guide content         │
│   ████████░░░ 3/12   │  📺 Video embed                  │
│   "Workflow Builder" │  🛠️ Challenge                    │
│                      │  ✅ Proof submission              │
│   Lesson List:       │                                  │
│   ✅ 1. First Flow   │                                  │
│   ✅ 2. Builder      │                                  │
│   → 3. Opus Agent   │                                  │
│   ○ 4. Decisions    │                                  │
│   ...               │                                  │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

- **Left panel (35-40%):** Robot SVG + progress bar + lesson list
- **Right panel (60-65%):** Active lesson content, scrollable
- **Mobile:** Stacks vertically — robot on top (compact), content below
- **Left panel is fixed/sticky**, right panel scrolls

### Navigation
- Clicking a lesson in the left sidebar loads it in the right panel
- Current lesson highlighted in sidebar
- Completed lessons show ✅, current shows →, future shows ○

---

## 4. Proof Verification System

### Requirements
Each lesson requires specific proof of completion — not just a self-check. The student must paste a specific command output, URL, or verification code that demonstrates they actually did the work.

### Verification Types

| Lesson | Proof Required |
|--------|---------------|
| 1 | Paste the workflow preview output (the summarized text) |
| 2 | Paste the workflow ID or URL from the builder showing 3+ connected tasks |
| 3 | Paste the JSON output showing sentiment analysis result |
| 4 | Paste the decision branch output showing ticket routed to correct priority |
| 5 | Paste the model configuration showing custom agent setup |
| 6 | Paste the human review step output or approval log |
| 7 | Paste the structured JSON extracted from the invoice PDF |
| 8 | Paste the integration response showing enriched lead data |
| 9 | Paste the sub-workflow execution log showing parent→child flow |
| 10 | Paste the Python code task output from Opus Code |
| 11 | Paste the Jobs page output showing 3+ completed job IDs |
| 12 | Paste the full workflow URL + describe the architecture in 2-3 sentences |

### UI Component
- Replace current `ProofSubmitForm` with new `LessonVerification` component
- Show the specific proof instruction for each lesson
- Text area for pasting proof (not just URL input)
- Basic validation: non-empty, minimum length
- On valid submission → marks lesson complete → robot gains new part
- Visual feedback: green checkmark animation on successful verification

### Data Model Update
- Add `verificationType` field to lesson metadata: `'text_output' | 'url' | 'json_output' | 'mixed'`
- Add `verificationPrompt` field: the specific instruction shown to the user
- Add `verificationMinLength` field: minimum paste length to accept
- Store proof text in localStorage alongside completion status

---

## 5. Certificate System Cleanup

### Changes
- **Remove EAS (Ethereum Attestation Service)** — no blockchain, just PDF
- **Keep:** PDF certificate generation with user name, course title, date, unique ID
- **Keep:** Social sharing (OG image, shareable profile URL, badge page)
- **Keep:** OTP email sign-in to generate certificate (only gate)
- **Add:** "Share on LinkedIn" / "Share on Twitter" buttons with pre-filled text
- **Certificate is free** — no payment gate, just complete all 12 lessons

---

## Tasks

### Phase 1: Landing Page Redesign
- [x] Redesign app/page.tsx as a single-viewport landing page (no scrolling)
- [x] Dark background (#0A0A1A), large centered tagline, single "Start Learning" CTA button
- [x] Add subtle animated glow/gradient effect on the CTA button
- [x] Add "Powered by OpenClaw" footer text
- [x] Ensure fully responsive — fits single viewport on mobile and desktop
- [x] Remove the lesson grid, highlights section, and roadmap from the landing page

### Phase 2: Robot Assembly SVG Components
- [x] Create components/robot-assembly/robot-assembly.tsx — main wrapper that takes `stage` prop (0-12) and renders appropriate parts
- [x] Create components/robot-assembly/parts/workbench.tsx — Stage 0: empty assembly platform with faint blueprint outline of the full robot shape
- [x] Create components/robot-assembly/parts/chassis.tsx — Stage 1: metal base frame/chassis on the workbench
- [x] Create components/robot-assembly/parts/processor.tsx — Stage 2: glowing core processor unit in the center of the chassis
- [x] Create components/robot-assembly/parts/head.tsx — Stage 3: head with sensor array, eyes glow dimly
- [x] Create components/robot-assembly/parts/left-arm.tsx — Stage 4: left arm with tool/wrench hand
- [x] Create components/robot-assembly/parts/right-arm.tsx — Stage 5: right arm with data connector hand
- [x] Create components/robot-assembly/parts/chest-panel.tsx — Stage 6: chest display panel showing a heartbeat/status line
- [x] Create components/robot-assembly/parts/left-leg.tsx — Stage 7: left leg with stabilizer foot
- [x] Create components/robot-assembly/parts/right-leg.tsx — Stage 8: right leg with thruster port
- [x] Create components/robot-assembly/parts/antenna.tsx — Stage 9: back-mounted antenna array and communication dish
- [x] Create components/robot-assembly/parts/armor.tsx — Stage 10: outer armor plating that snaps over the frame
- [x] Create components/robot-assembly/parts/jetpack.tsx — Stage 11: jetpack mounted on back (unlit)
- [x] Create components/robot-assembly/parts/activation.tsx — Stage 12: full activation overlay — eyes glow bright, jetpack flames ignite, hover animation, celebration particles
- [x] Add CSS transitions so new parts fade/slide in smoothly when stage increments
- [x] Add CSS keyframe animations for Stage 12: pulsing eyes, flickering flames, gentle hover float, particle burst

### Phase 3: Split-Screen Dashboard Layout
- [x] Restructure app/dashboard/page.tsx to split-screen layout: left panel (robot + nav) and right panel (lesson content)
- [x] Left panel (35-40% width): sticky/fixed, contains robot SVG, progress bar, title, and lesson list
- [x] Right panel (60-65% width): scrollable lesson content area
- [x] Integrate RobotAssembly component into left panel, stage driven by getTotalCompleted()
- [x] Move lesson sidebar navigation into the left panel below the robot
- [x] Show progress bar and current title ("Workflow Builder", etc.) between robot and lesson list
- [x] Mobile layout: stack vertically — compact robot on top, lesson list collapsible, content below
- [x] Clicking a lesson in the left sidebar navigates to that lesson's content in the right panel (use Next.js routing or client-side state)

### Phase 4: Proof Verification System
- [x] Update LessonMeta type in lib/lessons.ts — add `verificationPrompt` (string), `verificationMinLength` (number), and update verificationType to include 'text_output' | 'json_output' | 'mixed'
- [x] Update all 12 lesson definitions in lib/lessons.ts with specific verification prompts and minimum lengths (see proof table in PRD above)
- [x] Create components/lesson-verification.tsx — new proof submission component replacing ProofSubmitForm: shows lesson-specific instruction, textarea for pasting proof, validates minimum length, shows success animation on completion
- [x] Replace ProofSubmitForm usage in dashboard and lesson pages with LessonVerification component
- [x] Update localStorage progress to store proof text alongside completion timestamp
- [x] Add green checkmark animation on successful verification submission
- [x] Ensure completing a lesson immediately updates the robot stage in the left panel (no page refresh needed)

### Phase 5: Certificate Cleanup
- [ ] Remove any EAS/blockchain references from certificate generation (lib/certificate.ts, API routes)
- [ ] Verify PDF certificate generation works: user name, "Opus Mastery" title, completion date, unique certificate ID, achievements count
- [ ] Add "Share on LinkedIn" button to certificate page — pre-filled post text with course name and certificate URL
- [ ] Add "Share on Twitter/X" button to certificate page — pre-filled tweet with course name and profile URL
- [ ] Ensure OTP sign-in flow still works: complete 12 lessons → click "Get Certificate" → enter email → verify OTP → generate PDF
- [ ] Test certificate download and social sharing end-to-end

### Phase 6: Integration & Polish
- [ ] Update lesson content pages (app/lessons/[lessonId]/page.tsx) to use new LessonVerification component and fit within split-screen right panel
- [ ] Ensure all lesson markdown content renders correctly in the new layout
- [ ] Video embeds work properly within the right panel
- [ ] Test full flow: landing → start → complete lessons 1-12 → watch robot assemble → request certificate → download PDF → share
- [ ] Mobile responsive testing — all layouts work on small screens
- [ ] Ensure dark theme consistency across all pages (landing, dashboard, lessons, certificate, profile)
- [ ] Clean up any unused components (old ProofSubmitForm, old landing page sections)
- [ ] Commit all changes and deploy to Railway

---

## Design Tokens

```css
/* Backgrounds */
--bg-deep: #0A0A1A;
--bg-surface: #12122A;
--bg-panel: #1A1A36;

/* Robot colors */
--robot-metal: #2A2A4A;
--robot-metal-light: #3A3A5A;
--robot-glow: #6366F1;
--robot-glow-dim: rgba(99, 102, 241, 0.3);
--robot-status: #10B981;
--robot-flame: #F59E0B;
--robot-flame-hot: #EF4444;

/* UI */
--primary: #6366F1;
--success: #10B981;
--text: #FFFFFF;
--text-muted: #9CA3CF;
--border: #2A2A4A;
```

---

## Important Notes

- The existing backend (API routes, auth, database) stays mostly intact — this is primarily a frontend overhaul
- localStorage-based progress system remains — no account needed to track progress
- All 12 lessons remain freely accessible
- Certificate generation remains the only gated feature (requires email OTP)
- The robot SVG must be entirely inline (no external image dependencies) for reliability and performance
- Keep the existing video embed, code block, and markdown rendering components — just integrate them into the new layout
