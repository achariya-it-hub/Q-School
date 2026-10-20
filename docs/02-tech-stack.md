# 02 · Tech Stack — Q-School (Open-Source First)

## Frontend

| Layer | Pick | Why |
|---|---|---|
| Learner web app | **Q-School Learn — Next.js 15 (App Router) + TypeScript** | SSR/SEO for course & landing pages, huge ecosystem |
| Admin / CRM / ERP | **Q-School Console — Next.js + Refine** | Refine gives production-grade CRUD, data tables, auth, i18n over your own API — cuts admin dev time ~50% |
| UI kit | **shadcn/ui + Tailwind CSS** | Ownable components (not a locked SaaS kit), dark mode, fast |
| Landing page | Next.js web app + **Framer Motion** (or plain CSS anims) | Fastest LCP, A/B test ready |
| State (client) | TanStack Query + Zustand | Server cache vs UI state split |
| Forms | react-hook-form + Zod | Shared schemas with API |
| Charts (dashboards) | Recharts / Tremor | Tremor is purpose-built for admin analytics |
| Tables | TanStack Table | Infinite scroll, export CSV |
| Mobile app | **Q-School app — Flutter 3 (Dart 3)**, iOS + Android from one codebase (`apps/flutter`) | Native performance, pixel-consistent UI on both platforms; Riverpod for state, go_router for navigation, dio for the API |
| Mobile video | `video_player` (HLS) | Plays your transcoded HLS |
| Mobile push | **firebase_messaging (FCM + APNs)** | Standard for Flutter; ntfy for self-hosted fallback |
| Mobile OTA updates | **Shorebird** (code push for Flutter) | Ship Dart fixes without a store review |

## Backend

| Layer | Pick | Why |
|---|---|---|
| Core API | **NestJS (Node 22 LTS)** | Modular, DI, guards/interceptors — right size for LMS+CRM+ERP surface area |
| API style | REST (OpenAPI via nestjs-openapi) + **tRPC for admin app** | tRPC gives typed end-to-end for internal tools; REST stays for mobile/public |
| Auth | **Better Auth** (or Keycloak if you need SSO/LDAP later) | Self-hosted, sessions + OAuth (Google login), RBAC built in |
| DB | **PostgreSQL 17** + PgBouncer | JSONB for flexible content, row-level security for tenancy |
| ORM | **Prisma** | Migrations + typed client; speed of iteration |
| Cache/queues | **Redis 7 + BullMQ** | Transcoding jobs, reminders, CRM syncs, rate limiting |
| Realtime | Socket.IO (self-hosted, Redis adapter) | Live chat, presence, notifications, leaderboards |
| Search | **Meilisearch** | Typo-tolerant course/article search, trivial to self-host |
| Storage | **MinIO** (S3-compatible) | Self-hosted object storage; swap to any S3 later with zero code change |
| Media processing | **FFmpeg** workers | HLS transcode, thumbnails, watermarking |
| Video playback | HLS.js (web), video_player (Flutter), **signed expiring URLs** | Basic content protection without DRM vendor lock-in |

## Live classes, webinars, workshops

| Need | Pick | Notes |
|---|---|---|
| Classroom / webinars | **BigBlueButton 3.x** | Whiteboard, breakout rooms, polls, recording; education-native |
| BBB scaling | **ScaleLite** or 1 dedicated node initially | ~50 concurrent users per 8vCPU/16GB node |
| Lightweight live/1:1 | **LiveKit (self-hosted SFU)** | Flutter SDK (`livekit_client`), API-first; use for doubt-clearing 1:1, mobile-first sessions |
| Scheduling | **Cal.com (self-hosted)** | Book workshops/demos; embeds into CRM followups |

## CRM (inside admin dashboard)

| Capability | Pick |
|---|---|
| Lead capture | Meta/Google Lead-ads webhooks, website forms, WhatsApp, missed-call |
| Pipeline | Custom Kanban (dnd-kit + TanStack Query) — models deals, admissions, renewals |
| Conversations | **Chatwoot (self-hosted)** — WhatsApp/FB/IG/Telegram unified inbox, embedded in admin via API/iframe |
| Email sequences | Custom + **Listmonk** (self-hosted campaigns) for bulk marketing mail |
| Telephony (optional) | Exotel/Twilio via integrations package; call logging on lead |
| Followup automations | BullMQ workflows: "enquiry → T+1h WhatsApp → T+24h email → T+72h call task" |

## ERP (inside admin dashboard)

| Module | Approach |
|---|---|
| HR & Payroll (India) | Integrate **Frappe HR** (self-hosted) for payroll/statutory; sync employees via API. Custom light-weight attendance/leave inside admin for day-to-day |
| Finance/Accounting | **Ledger-first double-entry tables in Postgres** (invoices, payments, expenses, GST-ready fields); export Tally-compatible XML/CSV. Avoid full accounting rebuild |
| Inventory (study material/kit shipping) | Simple stock + vendor + purchase-order tables in admin |
| Reports | **Metabase (self-hosted)** embedded for BI; admin dashboard shows curated KPIs, Metabase for ad-hoc |

## Payments (region-specific, pick what applies)

- **India:** Razorpay / Cashfree (payment gateway is the one place closed SaaS is pragmatic — no mature OSS alternative), UPI mandates for subscriptions
- Global fallback: Stripe
- Invoices: custom templates + GST fields, PDF via @react-pdf/renderer

## Marketing / social integrations

| Integration | API |
|---|---|
| Meta (FB/IG) Lead Ads + comment-DM triggers | **Meta Graph API** — webhook `leadgen`, Page messages via Messenger/IG platform |
| WhatsApp | **WhatsApp Cloud API** (Meta) — templated followups, chatbot opt-ins |
| Google Ads leads | Google Ads API (offline conversion upload) |
| YouTube | Data API v3 — auto-publish public trailers/recordings as unlisted |
| Organic posting | Buffer alternative: **Mixpost (self-hosted)** to schedule posts to FB/IG/LinkedIn/X/YouTube |
| Analytics | **Plausible/Umami (self-hosted)** + Meta Pixel + GA4 (consent-gated) |

## DevOps / Platform

| Layer | Pick |
|---|---|
| Monorepo | Turborepo + pnpm |
| Containers | Docker + docker-compose (staging/MVP), optional K8s (k3s) later |
| Reverse proxy / TLS | Traefik or Nginx + Caddy, Let's Encrypt |
| CI/CD | GitHub Actions (or Gitea Actions self-hosted) → build → push GHCR → deploy via watchtower/compose |
| IaC | Ansible playbooks for server bootstrap (simple, auditable) |
| Observability | Grafana + Prometheus + Loki, Sentry (self-hosted) |
| Backups | Restic → S3/Backblaze B2, nightly Postgres dumps + MinIO mirror |
| Uptime | Uptime Kuma |

## Proprietary exceptions (pragmatic, minimal)

1. Payment gateway (Razorpay/Stripe) — regulatory + UPI rails
2. WhatsApp Cloud API — Meta-hosted by definition
3. Firebase Cloud Messaging for mobile push (FCM/APNs)
4. Optional email deliverability: Amazon SES (cheap; self-host Postfix only if you must)

Everything else above is open-source and self-hostable.

## License hygiene

Track licenses in CI (e.g. `license-checker`): keep to MIT/Apache-2.0/BSD for dependencies you ship; AGPL servers (Grafana, Metabase, MinIO community, Chatwoot) are fine to self-host for internal business use — you are not distributing them.
