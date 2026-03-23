# PRD: Certificate Improvements - Name Prompt & Professional Design

## Project
**LearnOpus.com** - Gamified Opus course platform at `/root/projects/opus-course-app`

## Overview
Enhance the certificate system by:
1. Prompting users for their name after OTP verification
2. Replacing the basic white PDF certificate with a professional, branded design

## Current State
- **Database**: `display_name` field already exists in `users` table ✅
- **OTP flow**: Verifies code but doesn't prompt for name
- **Certificate**: Basic text-only PDF (white background, plain text) - see `lib/certificate.ts`
- User completes 12 lessons → gets certificate with their display_name

## Goals
1. **Name Prompt After OTP**: Ask for user's full name after successful OTP verification
2. **Professional Certificate Design**: Replace basic PDF with branded, visually appealing design

## Implementation Tasks

### Phase 1: Name Prompt in OTP Flow

#### 1.1 Update OTP Verification API
**File**: `app/api/auth/otp-verify/route.ts`

- Accept optional `displayName` parameter in request body
- After successful OTP verification, if `displayName` is provided:
  ```typescript
  run('UPDATE users SET display_name = ?, updated_at = datetime(\'now\') WHERE id = ?', displayName, user.id);
  ```
- Return success response

#### 1.2 Update OTP Modal Component
**File**: `components/otp-modal.tsx`

Current flow:
1. User enters email → receives OTP
2. User enters code → verified

New flow:
1. User enters email → receives OTP
2. User enters code → verified
3. **NEW**: Show "Please enter your full name for the certificate" input
4. Submit name with session creation

**Implementation**:
- Add `step` state: `'email'` | `'code'` | `'name'`
- After successful OTP verification, check if user has `display_name`
- If not, show name input step before completing login
- Submit name to `/api/auth/otp-verify` or new endpoint `/api/user/update-name`

#### 1.3 Allow Name Updates
Users should be able to update their display name later (if they made a typo).

- Add UI in dashboard/settings
- Create `/api/user/update-name` endpoint
- Validate name (non-empty, reasonable length)

### Phase 2: Professional Certificate Design

#### 2.1 Replace Basic PDF Generation
**File**: `lib/certificate.ts` - function `generateCertificatePdfBuffer()`

**Current**: Raw PDF commands, plain text, white background
**Goal**: Professional, branded certificate

**Design Requirements**:
- **Layout**: Landscape A4 (like OpenClaw Quests has)
- **Theme**: Dark background with colored accents
- **Branding**: "Opus Mastery" / LearnOpus branding
- **Content**:
  - Certificate header
  - User's display name prominently
  - Completion date
  - Course stats (12/12 lessons, X achievements)
  - Certificate ID (for verification)
  - Professional border/decorative elements

**Implementation Options**:

**Option A: Use jsPDF library** (recommended - same as OpenClaw Quests)
```bash
npm install jspdf
```
Benefits:
- Easy to create professional designs
- Better control over layout, colors, fonts
- Can add borders, backgrounds, decorative elements
- See `/root/projects/openclaw-quests-mvp/lib/generate-certificate-pdf.ts` for reference

**Option B: HTML → PDF** (using Playwright/Puppeteer)
- Create HTML/CSS template
- Use headless browser to render PDF
- More flexible but heavier dependency

**Recommended: Option A (jsPDF)**

Adapt the design from OpenClaw Quests but with Opus branding:
- Dark background (deep blue or dark gray)
- Gold/amber accents for borders and headings
- "OPUS MASTERY" header
- "Certificate of Completion" title
- User's name in large elegant font
- Course completion details in structured layout
- Professional borders and decorative corners
- Certificate ID at bottom

#### 2.2 Update Certificate Page UI
**File**: `app/certificate/page.tsx` (if exists)

- Ensure it displays the certificate properly
- Show preview before download
- Display user's name
- "Download PDF" button

### Phase 3: Testing

#### Test Cases:
- [x] New user: email → OTP → name prompt → registration complete
- [x] Display name stored in database
- [x] Certificate displays user's name correctly
- [x] Certificate PDF has professional design (not plain white)
- [x] Certificate downloads successfully
- [x] Existing users can update their display name
- [x] Long names display properly (truncate if needed)
- [x] Special characters in names handled correctly
- [x] Certificate ID is unique and displays correctly

### Phase 4: Migration for Existing Users

Users who already exist but don't have `display_name`:
- Prompt for name on next login
- Or prompt when they try to generate certificate
- Show banner: "Add your name to enable certificate download"

## Files to Modify

1. `app/api/auth/otp-verify/route.ts` - Accept displayName parameter
2. `components/otp-modal.tsx` - Add name input step
3. `lib/certificate.ts` - Replace PDF generation with jsPDF
4. `app/certificate/page.tsx` - Update UI (if needed)
5. `package.json` - Add jsPDF dependency
6. New: `app/api/user/update-name/route.ts` - Allow name updates

## Success Criteria

✅ New users prompted for display name after OTP verification
✅ Display name stored in database
✅ Certificate has professional dark-themed design with branding
✅ User's name displayed prominently on certificate
✅ Existing users can add/update their display name
✅ Certificate PDF downloads successfully
✅ No breaking changes to existing functionality

## Design Reference

Use `/root/projects/openclaw-quests-mvp/lib/generate-certificate-pdf.ts` as inspiration:
- Dark theme (background: `26, 26, 46`)
- Accent color (orange/amber: `217, 119, 6`)
- Decorative borders with corner elements
- Professional typography
- Structured layout with sections
- Footer with verification details

Adapt this design for Opus Mastery branding.

## Priority
**HIGH** - User experience improvement requested by Ahmad

## Notes
- Database already has `display_name` field ✅
- Current certificate is very basic (just raw PDF text commands)
- Need to make it look professional and branded
- Keep certificate ID for verification purposes
