# 07 · Running Q-School (Web + Mobile)

## What was built

```
qschool/
├── apps/
│   ├── web/                     Q-School Learn + landing (Next.js 14, App Router, Tailwind)
│   │   ├── src/app/page.tsx              Landing: hero, stats, courses, webinars + lead form
│   │   ├── src/app/courses/              Catalog (search + category filter)
│   │   ├── src/app/courses/[slug]/        Course detail (modules, pricing, enroll CTA)
│   │   ├── src/app/live/                 Q-School Live: sessions, seat meters, registration
│   │   ├── src/app/dashboard/            Student dashboard (progress, streak, tests)
│   │   ├── src/app/login/                Sign-in (stub — Better Auth lands with the API)
│   │   └── src/app/api/leads/            Lead capture API → leads.json (CRM stand-in)
│   └── mobile/                  Q-School app (Expo SDK 54, expo-router)
│       ├── app/(tabs)/index.tsx          Home: stats, continue learning, next live class
│       ├── app/(tabs)/courses.tsx        Catalog with search + filters
│       ├── app/(tabs)/live.tsx           Live class hero + webinars
│       ├── app/(tabs)/profile.tsx        Profile, streak, account menu
│       ├── app/course/[slug].tsx         Course detail with sticky enroll bar
│       └── assets/                       icon.png, adaptive-icon.png, splash.png (from your logo)
└── packages/
    ├── shared/                  Brand tokens + course/webinar data (used by both apps)
    └── config/                  Shared tsconfig / Tailwind presets
```

## Mobile design system (3D)

| Component | File | What it does |
|---|---|---|
| `Icon3D` | `components/ui.tsx` | Glossy 3D icon tile — gradient body, top gloss, bright rim, coloured drop shadow |
| `GlossyButton` | `components/ui.tsx` | 3D button (`primary` / `glass` / `gold`) with gloss strip, depth shadow and spring press animation + haptics |
| `GlassTile` | `components/ui.tsx` | Translucent tile for dark gradient surfaces |
| `Card3D` | `components/ui.tsx` | Elevated card with bright rim and soft shadow |
| `HomeTopBar` | `components/home-top-bar.tsx` | Split-off top bar: brand tile, greeting, streak chip, notification bell |
| `HeroBanner` | `components/hero-banner.tsx` | Gradient hero card only: floating 3D orbs, level/streak chips, headline, subtitle |
| `ProgressCard` | `components/progress-card.tsx` | Separate card that tucks under the banner: current course, %, modules, resume action |
| `ActionRow` | `components/action-row.tsx` | Split action row: primary continue button + live shortcut with pulsing dot |
| `StatTabs` | `components/stat-tabs.tsx` | Interactive segmented tabs (Progress / Certificates / Tests) with sliding indicator and per-tab panels |
| `QuickActions` | `components/quick-actions.tsx` | Four 3D action tiles |
| `PopularCourses` | `components/popular-courses.tsx` | Ranked-by-enrolment course list with medal badges |
| `QTabBar` | `components/tab-bar.tsx` | Light floating bar with a single brand-teal pill that slides to the active tab; crossfading icons, haptic selection, content fade behind |
| `PromoSlider` | `components/promo-slider.tsx` | Swipeable hero carousel: 4 gradient slides (live / referral / new batch / leaderboard), autoplay that pauses on swipe, position label and animated dots |
| `styleFor()` | `components/course-style.ts` | Per-subject 3D icon identity shared by the catalog and the home rails |

Home screen sections in order: hero → promo slider → quick actions → **popular courses** (ranked by
enrolment with medal badges) → continue learning → upcoming live → recommended rail → free webinars.

Only transform/opacity are animated (native driver), so the motion stays at 60fps on device. Haptics
are skipped on web. 3D orb PNGs in `assets/` are generated artwork — see `brand/` for the source kit.

### Hover interactions (desktop / web)

`Icon3D`, `Card3D`, `GlossyButton` and the tab-bar icons animate on pointer hover: the 3D tiles scale
to ~1.1, lift 4px, tilt ~4° and brighten their gloss, rim and glow; buttons scale slightly and deepen
their shadow; cards lift 3px. Hover is driven by `onPointerEnter` / `onPointerLeave` rather than a
nested `Pressable`, so touch handling of parent buttons is never intercepted on native — hover simply
never fires there.

## Q-School Console (admin) — `/admin`

Sign in at `/admin/login` (demo credentials pre-filled). Pages share one sidebar (`src/components/admin/shell.tsx`):

| Group | Route | What it does |
|---|---|---|
| Overview | `/admin/dashboard` | KPI tiles, revenue trend, admissions funnel, leads by source, today's sessions, needs-attention, recent payments |
| CRM | `/admin/leads` | Kanban pipeline (drag between stages), lead drawer with call/WhatsApp/demo actions and activity timeline; website enquiries from `/api/leads` appear in Enquiry |
| CRM | `/admin/followups` | One call queue: sales follow-ups + fee collection reminders |
| Academics | `/admin/students` | User list (students/faculty/admins via `/api/admin/users`) joined with each student's fee status |
| Academics | `/admin/courses` · `/admin/schedule` | Catalogue & performance (`/api/admin/courses`), weekly session schedule with seat fill |
| Finance | `/admin/fees` | Fees & receivables: per-student ledger, installments, overdue ageing, **Collect** → payment + receipt, new fee plan, CSV |
| Finance | `/admin/invoices` | GST tax invoices (CGST/SGST split, amount in words), print / save PDF, GSTR-1 CSV |
| Finance | `/admin/payments` · `/admin/receipts` | Transaction log (success/failed/refunded) and printable fee receipts |
| Finance | `/admin/expenses` | Expenses by category/centre, approvals, Tally CSV |
| ERP | `/admin/staff` · `/admin/inventory` | Staff directory, attendance, leave approvals; stock levels, reorder alerts, purchase orders |

**Data:** finance is one ledger (`packages/shared/src/finance.ts` → fee accounts with installments). Invoices, payments,
receipts and receivables are derived from it, so every page agrees. Actions (collect, move lead, approve…) update a
client-side store (`src/components/admin/store.ts`) for the session and reset on reload — swap each action for an API
call when the NestJS backend lands. Users and courses already persist via the existing JSON-file APIs.

### Automatic lead capture (CRM → Lead Sources)

Leads arrive in the pipeline on their own, de-duplicated by source id, phone or email, and assigned round-robin to the counsellors:

| Source | Endpoint | Verified by |
|---|---|---|
| Meta Lead Ads (FB + Instagram) | `/api/integrations/meta` (+ `/meta/sync`) | `X-Hub-Signature-256`, then the full lead is read from Graph API v25.0 |
| Google Ads lead forms | `/api/integrations/google-ads` | `google_key` |
| WhatsApp Cloud API (incl. Click-to-WhatsApp ads) | `/api/integrations/whatsapp` | `X-Hub-Signature-256`; optional instant auto-reply |
| Website forms | `/api/leads` | — (public form) |
| JustDial / Sulekha / IndiaMART / Zapier / Make… | `/api/integrations/webhook/<source>?key=…` | `LEADS_WEBHOOK_KEY` |

Configure with `apps/web/.env.local` (see `.env.example`). The platforms can only reach a **public HTTPS URL**.
Deploy the app or use a tunnel (Cloudflare Tunnel / ngrok) while testing, and set `PUBLIC_BASE_URL`.
Setup steps for each platform are on the Lead Sources page. Data lives in `apps/web/crm-*.json` until Postgres/BullMQ replace it.
The Console now uses a server session (httpOnly cookie). Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `SESSION_SECRET` before deploying.

## Flutter app (iOS & Android) — `apps/flutter`

The student mobile app is now Flutter. It has the same screens as the Expo app below, and the Expo app is
kept until the Flutter one is signed off. Setup:

```bash
cd apps/flutter
flutter create . --org com.qschool --project-name qschool --platforms android,ios   # once: native folders
flutter pub get
flutter run
```

See `apps/flutter/README.md` for the screen map.

## Student UI v2 (Oct 2026) — matches the student app & dashboard mockups

**Mobile (`apps/mobile`)** — new flow: Welcome → Login → tabs (Home · Learn · Explore ◉ · Community · Profile).

| Route | File | Screen |
|---|---|---|
| `/` | `app/index.tsx` | Welcome / onboarding (3 slides, Get Started) |
| `/login` | `app/login.tsx` | Login / Sign up, social buttons |
| `/home` | `app/(tabs)/home.tsx` | Greeting, search, hero, 8-tile hub, recommended |
| `/learn` | `app/(tabs)/learn.tsx` | My Learning — In progress / Completed / Bookmarks, upcoming live class |
| `/explore` | `app/(tabs)/explore.tsx` | Search + filter chips + catalogue (centre tab button) |
| `/community` | `app/(tabs)/community.tsx` | Peer feed |
| `/profile` | `app/(tabs)/profile.tsx` | Profile header, stats, account menu |
| `/course/[slug]` | `app/course/[slug].tsx` | Course detail — preview, tabs, what you'll learn, Enroll |
| `/live-class` | `app/live-class.tsx` | Live class — video stage, chat, raise hand |
| `/workshops` · `/webinars` · `/offline` · `/certificates` | `app/*.tsx` | List screens from the hub |

UI kit: `components/kit.tsx` (Art thumbnails, Page, Segments, Chips, Btn, PillBtn, Progress…) and
`components/qs-tab-bar.tsx` (tab bar with floating centre search). Mock data: `packages/shared/src/student.ts`.

**Web (`apps/web`)** — `/dashboard` rebuilt: deep-green sidebar, top bar, hero carousel, 8-tile hub,
Recommended (filterable), Continue Learning, Popular Categories, profile progress, Today's Schedule,
Upcoming Events. Components in `src/components/dashboard/`, icons in `src/components/icons.tsx`.

Thumbnails are illustrated gradients (`Art`) — pass `src` (web) or swap in an `Image` (mobile) when real
course photos exist. Previous screens are kept in `_backup-ui-v1/`.

## Prerequisites

- Node 20+ (tested on 24) · pnpm 11 (`npm i -g pnpm`)
- Mobile: **Expo Go** app on your phone, or Xcode/Android Studio simulator

## Install

```bash
pnpm install
```

## Run the web app

```bash
pnpm dev:web        # → http://localhost:3100
```

Production build check:

```bash
pnpm build:web && pnpm start:web
```

## Run the mobile app

```bash
pnpm mobile         # Expo dev server → scan the QR with Expo Go
```

Platform shortcuts: `pnpm --filter @qschool/mobile android` · `… ios`

Preview the app in a browser (React Native Web — handy for quick UI checks, not a substitute for a
real device):

```bash
pnpm --filter @qschool/mobile exec expo start --web --port 8081   # → http://localhost:8081
```

> **Device note:** on a physical phone, API calls can't use `localhost`. Once the NestJS API
> exists, set `EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:3200`. Screens currently use local data,
> so the app runs standalone today.

## Typecheck everything

```bash
pnpm typecheck      # web + mobile, both clean
```

## What's real vs mocked right now

| Area | Status |
|---|---|
| Brand system (colors, logo, icons, splash, favicon) | ✅ Real — extracted from your logo |
| Landing, catalog, course detail, live page, dashboard UI | ✅ Real, responsive |
| Mobile app (4 tabs + course detail, branded) | ✅ Real, typechecked |
| Lead capture → `apps/web/leads.json` | ✅ Real (file-based, so you can see the CRM feed) |
| Auth / sessions / RBAC | ⏳ Stub (login redirects to dashboard) |
| Database (Prisma + Postgres) | ⏳ Not yet — data lives in `packages/shared` |
| Video playback (HLS), BBB live join | ⏳ Planned Phase 1–2 |

## Verifying lead capture manually

```bash
curl -X POST http://localhost:3100/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"9876543210","source":"manual"}'

curl http://localhost:3100/api/leads
```

Each lead gets `status: "NEW"` and a `source` tag — the exact shape the CRM pipeline will consume
(see `docs/04-crm-erp-social-integrations.md`).

## Next build steps

1. `apps/api` (NestJS) + Prisma schema → move `COURSES`/lead data into Postgres
2. Better Auth with student/agent/admin roles; protect `/dashboard` and `/api/leads`
3. Video pipeline (MinIO + FFmpeg → HLS) and lesson pages
4. BigBlueButton room provisioning for the Live tab
5. Q-School Console (`apps/admin`, Refine) for CRM + ERP
