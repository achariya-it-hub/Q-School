# 03 · Feature Modules — Q-School

Brand tokens for all UI: see `00-brand.md`. Admin surface is named **Q-School Console**, learner web **Q-School Learn**, mobile **Q-School**.

## A. Landing page (marketing web)

- Hero with program highlights, stats, instructor/testimonial carousel
- Course & workshop catalog with filters (category, mode: live/recorded/hybrid, price)
- Upcoming webinars/workshops with registration (email/WhatsApp capture → creates Lead)
- Free trial lesson / demo class booking (Cal.com embed)
- Pricing, FAQ, blog (MD/MDX, SEO), about/contact
- Analytics: Plausible + Meta Pixel (consent-gated), lead form → CRM
- Performance budget: LCP < 2s, CLS < 0.1 (matters for ad Quality Score)

## B. LMS (learner web + mobile)

**Catalog & enrollment** — categories, course detail (syllabus, instructor, preview lesson), batches with seats & timetable, coupons, EMI via gateway, scholarships/manual enrollment by admin.

**Learning experience**
- Video player: HLS, resume-from-last-position, playback speed, per-user watermark + signed URLs (anti-piracy basics)
- Notes (timestamped), downloadable resources (PDF, gated)
- Quizzes: MCQ/multi-select, timed, auto-graded, attempts policy; question bank per course
- Assignments: text/file submission → instructor review → rubric grades
- Progress: lesson-level completion, course %, streaks; certificate (PDF, QR-verified) on completion
- Live sessions: join BBB (web) / LiveKit (mobile), calendar sync (ICS), recordings published as lessons, attendance-based access rules
- Doubt support: per-course discussion forum + Chatwoot inbox handoff
- Mobile app: offline downloads (encrypted local HLS), push notifications, attendance for live classes, in-app purchases via gateway web flow

**Gamification (phase 2):** leaderboards, badges, weekly goals.

## C. Instructor portal (subset of admin, scoped role)

- Create courses/modules/lessons, upload videos (direct-to-MinIO presigned), quiz builder
- Batch timetable management, take live attendance manually
- Grade assignments, answer doubts, view student progress & at-risk list
- Revenue share reports (if applicable)

## D. Q-School Console (admin) = CRM + ERP + LMS ops

**LMS ops:** user management, bulk import (CSV), manual enrollment, content publishing workflow (draft → review → published), coupon & offer engine, certificates issuing, support tickets.

**CRM (lead → revenue)**
- Lead inbox: sources (Meta ads, website, WhatsApp, referral, walk-in), dedupe by phone/email
- Pipeline: Kanban stages (Enquiry → Contacted → Demo → Negotiated → Admitted/Dropped), SLA timers, assignment rules (round-robin / agent capacity)
- Followups: activity timeline per contact (calls, WhatsApp, email, notes), reminders & tasks, templated messages, bulk campaigns (Listmonk)
- Chatwoot embedded: unified WhatsApp/FB/IG inbox with contact 360
- Conversion analytics: source-wise CPL, funnel conversion, agent performance, revenue attribution

**ERP**
- HR: employee records, roles, attendance, leave; payroll via Frappe HR integration
- Finance: invoices (GST fields), payments ledger, expenses, vendor POs for study material, P&L snapshot, Tally export
- Inventory: study kits, stock levels, purchase orders
- Reports: Metabase embedded; curated KPIs on home (MRR, admissions funnel, attendance rate, course completion, agent SLA compliance)

**Admin UX notes:** Refine-based CRUD, dark/light, global command palette (⌘K search across leads/students/courses), full AuditLog viewer, RBAC guard on every mutation.

## E. Q-School mobile app (Expo)

- Auth (email/OTP + Google), home (continue learning, upcoming live, announcements)
- Course player with offline downloads, notes, quizzes (best-effort offline, sync on reconnect)
- Live classes (LiveKit SDK), calendar view, push reminders
- Profile, certificates, invoices/receipts, support chat (Chatwoot SDK)
- OTA updates via EAS Update; store releases via EAS Build

## F. Cross-cutting

- **RBAC:** `superadmin > admin > crm_agent > instructor > content_creator > student` (+ guardian role later for K-12)
- **Notifications:** single fan-out service, per-user channel preferences
- **Audit log:** who/what/before/after on every admin mutation
- **Feature flags:** simple DB-backed flags per org
- **i18n-ready:** content fields + UI strings structured for multi-language from day 1 (react-i18next web / i18n-js mobile)
