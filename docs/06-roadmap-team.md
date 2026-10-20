# 06 · Roadmap, Team & Milestones — Q-School

## Phased roadmap (realistic for a 2–4 dev team)

### Phase 0 — Foundations (Weeks 1–2)
Q-School monorepo setup, CI/CD, docker-compose stack, Prisma schema v1 (users, courses, batches, leads), auth (Better Auth + roles), deploy pipeline to staging. **Exit:** staging URL live, empty but deployable.

### Phase 1 — MVP LMS + Landing (Weeks 3–8)
- Landing page + catalog + lead capture forms
- Course CRUD + video upload → FFmpeg HLS pipeline → watermarked player
- Student signup, enrollment (gateway checkout), progress tracking, quizzes v1 (MCQ)
- Admin: user management, manual enrollments, basic KPIs
- **Exit:** 1 real cohort can buy and learn a recorded course end-to-end.

### Phase 2 — Live classes + Mobile (Weeks 9–14)
- BBB integration: scheduling, reminders (push/WhatsApp), attendance, recordings → replay lessons
- Expo app: auth, catalog, video (offline downloads), live join (webview first), push notifications, certificates
- **Exit:** first live batch runs on the platform; app in TestFlight/Play internal track.

### Phase 3 — CRM + Social integrations (Weeks 15–20)
- Lead inbox, pipeline Kanban, tasks/SLA, Chatwoot channels (WhatsApp/FB/IG), Meta leadgen webhook, followup automations, offline conversions
- **Exit:** an ad campaign's leads flow into CRM with zero manual entry and close inside the platform.

### Phase 4 — ERP + Analytics (Weeks 21–26)
- Double-entry ledger, invoices/GST PDFs, Tally export, Frappe HR payroll sync, inventory for study kits, Metabase embed
- **Exit:** accounts team stops exporting spreadsheets; monthly books close inside the platform.

### Phase 5 — Scale & polish (ongoing)
ScaleLite multi-node BBB, LiveKit native mobile live, gamification, referrals, affiliate/partner CRM, multi-org (franchise) tenancy, mobile app store release + ASO.

## Team shape

| Role | Count | Notes |
|---|---|---|
| Full-stack TS lead | 1 | Owns monorepo, API, integrations |
| Frontend/React (web+admin) | 1 | Refine admin + Next web |
| Mobile (Expo) | 0.5–1 | Can be same as frontend at MVP |
| Backend/DevOps | 0.5–1 | Infra, BBB, pipelines, security |
| Content/QA/Support admin | 0.5 | Non-eng, but needed from Phase 1 |

You can start with 2 strong devs + you (product), tighten to 4 by Phase 4.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| BBB quality under load | Dedicated nodes, ScaleLite early, load-test with 60+ fake users; fallback link to LiveKit/Jitsi per session |
| Video piracy | Watermarks, signed URLs, no raw MP4 exposure, DMCA process; accept residual risk |
| WhatsApp policy blocks | Strict opt-in, template pre-approval, low message frequency, quality rating monitoring |
| Scope creep in ERP | Ledger + export philosophy; never rebuild payroll/accounting from scratch |
| Solo-dev bus factor | Everything in monorepo, IaC + runbooks in docs/, restore drills |
| Meta API changes | Version-pinned Graph API, webhook signature checks, integration tests against sandbox |

## Definition of done for Q-School v1 (business terms)

A prospect sees your ad → lands on your page → becomes a lead in your CRM within a minute → gets WhatsApp followup → attends a live demo class on BBB → pays on your gateway → enrolled into batch → attends live + watches replays in app → completes course → receives QR-verifiable certificate → NPS survey → renewed for next batch — **all inside systems you own**.
