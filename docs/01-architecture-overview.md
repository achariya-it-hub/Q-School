# 01 · Architecture Overview — Q-School Platform

## Guiding principles

1. **Open-source first** — every proprietary SaaS is a candidate to be replaced by a self-hosted OSS equivalent (Chatwoot not Intercom, Metabase not Looker, Cal.com not Calendly…).
2. **One monorepo, one language** — TypeScript end-to-end. Shared types, validation schemas (Zod) and API clients across web, admin and mobile.
3. **Boring, proven core** — Postgres + Redis + Next.js. Exotic tech only where it earns its keep (LiveKit/BBB for realtime media).
4. **Modular monolith now, services later** — a single well-structured NestJS-style API. Extract realtime/media ingestion into worker services only when load demands it.
5. **Multi-tenant-ready from day 1** — even if you start with one brand, schema design assumes orgs/branches (city-wise coaching chains, franchise expansion).

## High-level system map

```
                         ┌────────────────────────────────────────────┐
                         │            Q-SCHOOL PLATFORM               │
                         │                CLIENTS                     │
   Learners ────────────▶│  Q-School Learn      Q-School app (Expo)   │
   Instructors ─────────▶│  Q-School Console (Admin/CRM/ERP)          │
                         └───────────────┬────────────────────────────┘
                                         │ HTTPS / WSS
                         ┌───────────────▼────────────────────────────┐
                         │              API GATEWAY (Nginx/Traefik)   │
                         │  TLS, rate limit, routing, static assets   │
                         └───────┬──────────────┬───────────┬─────────┘
                                 │              │           │
                 ┌───────────────▼──┐  ┌────────▼────────┐ ┌▼───────────────┐
                 │  Core API        │  │  Realtime svc   │ │ Media workers  │
                 │  (NestJS)        │  │  (Socket.IO/    │ │ (BullMQ)       │
                 │  REST + tRPC     │  │   LiveKit web-  │ │ transcode,     │
                 │  Auth, courses,  │  │   hooks)        │ │ certificates,  │
                 │  CRM, ERP        │  └────────┬────────┘ │ emails, syncs  │
                 └───┬──────┬───────┘           │          └───────┬────────┘
                     │      │                   │                  │
        ┌────────────▼─┐ ┌──▼───────┐   ┌───────▼──────┐  ┌────────▼─────────┐
        │ PostgreSQL   │ │ Redis    │   │ LiveKit SFU  │  │ Object storage   │
        │ (+ PgBouncer)│ │ (cache,  │   │ + BigBlueBttn│  │ MinIO (videos,   │
        │              │ │ queues)  │   │  (recordings)│  │ PDFs, recordings)│
        └──────────────┘ └──────────┘   └──────────────┘  └──────────────────┘
                                         │
                        ┌────────────────▼─────────────────┐
                        │  Integrations (outbound workers) │
                        │  Meta Graph API · WhatsApp Cloud │
                        │  Telegram · YouTube/Vimeo ·      │
                        │  Cal.com · Chatwoot · Meilisearch│
                        └──────────────────────────────────┘
```

## Monorepo layout (Turborepo + pnpm)

```
lms/
├── apps/
│   ├── web/            # Q-School Learn: learner + marketing web (Next.js)
│   ├── admin/          # Q-School Console: Admin/CRM/ERP (Next.js)
│   ├── api/            # Core API (NestJS, REST + tRPC endpoints)
│   ├── realtime/       # Socket.IO gateway (presence, chat, notifications)
│   └── mobile/         # Q-School mobile app (Expo React Native)
├── packages/
│   ├── db/             # Prisma schema, migrations, seed
│   ├── shared/         # Zod schemas, DTOs, constants, feature flags
│   ├── ui/             # Shared design system (web + admin; RN variant)
│   ├── emails/         # React Email templates
│   ├── integrations/   # Meta/WhatsApp/Telegram/YouTube/BBB/LiveKit clients
│   └── config/         # eslint, tsconfig, tailwind presets
├── infra/              # Dockerfiles, docker-compose, k8s manifests, scripts
└── docs/
```

## Domain model (core entities)

```
Organization ─┬─ Users (roles: superadmin, admin, crm_agent, instructor,
              │            content_creator, student, guardian)
              ├─ Leads ──▶ Contact ──▶ Deal ──▶ Enrollment (CRM funnel)
              ├─ Courses ─┬─ Modules ─┬─ Lessons (video/pdf/quiz/live)
              │           │           └─ Attachments
              │           ├─ Batches (cohort + schedule)  ◀── ERP: timetable
              │           ├─ PricingPlans ── Offers/Coupons
              │           └─ Certificates
              ├─ LiveSessions (BBB/LiveKit) ─▶ Attendance ─▶ Recordings
              ├─ Workshops / Webinars (one-off events, paid/free)
              ├─ Orders ── Payments ── Subscriptions (billing)
              ├─ Tasks / Tickets / Support threads (CRM followups)
              ├─ Employees, Attendance, Payroll (ERP-HR)
              ├─ Expenses, Vendors, Invoices, Taxes (ERP-Finance)
              ├─ Campaigns ─▶ AdsSync (Meta/Google) ─▶ Leads
              └─ AuditLog, Notifications, FeatureFlags
```

Key relationships to get right early:

- **Batch-centric scheduling** — Indian-style edu businesses sell *batches* (timetable, seat count), not just self-paced courses. `Course → Batch → LiveSession → Attendance` is the spine.
- **Lead is not a User** — a lead becomes a user only on enrollment. Keep CRM entities decoupled from auth.
- **Everything audited** — `AuditLog` on every admin mutation; required for ERP credibility.

## Critical flows

**1. Ad → Lead → Enrollment (the money flow)**
Meta/Google webhooks → `integrations` service → normalized `Lead` + auto-assigned `crm_agent` (round-robin) → followups via WhatsApp/email templates → `Deal` moves through pipeline → payment link → `Order` paid → auto-enrollment into `Batch` → welcome notification.

**2. Live class**
Instructor schedules session → system provisions BBB room (or LiveKit room via API) 10 min prior → reminders (push + WhatsApp) at T-60/T-10 → join via browser or mobile SDK → attendance marks at join/leave → recording auto-processed → uploaded to MinIO → published as replay lesson with DRM-signed URLs.

**3. Recorded content pipeline**
Instructor uploads VOD → BullMQ worker transcodes with FFmpeg to HLS (1080p/720p/480p) → watermarked player (HLS.js, signed URLs, per-user watermark) → lesson published → progress tracked by resume events → quiz/certificate on completion.

**4. Notifications**
Single `NotificationService` fans out to push (Expo), email (SMTP/SES), WhatsApp (Cloud API), in-app (Socket.IO) — one template registry, per-channel provider adapters.
