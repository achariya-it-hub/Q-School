# 04 · CRM & ERP + Social Media Integrations

## CRM data model (Prisma sketch)

```prisma
model Lead {
  id            String   @id @default(cuid())
  name          String
  phone         String   @unique      // dedupe key #1
  email         String?  @unique      // dedupe key #2
  source        LeadSource // META_ADS | GOOGLE_ADS | WEBSITE | WHATSAPP | REFERRAL | WALKIN | EVENT
  campaignId    String?
  utm           Json?                 // utm_source/medium/campaign snapshot
  status        LeadStatus  // NEW | WORKING | QUALIFIED | CONVERTED | LOST
  ownerId       String?     // crm_agent
  score         Int      @default(0)
  nextFollowupAt DateTime?
  contact       Contact?
  createdAt     DateTime @default(now())
}

model Deal {
  id          String   @id @default(cuid())
  leadId      String
  pipeline    String   // ADMISSIONS | RENEWALS | B2B
  stage       DealStage
  value       Decimal
  expectedCloseAt DateTime?
  activities  Activity[]   // CALL | WHATSAPP | EMAIL | MEETING | NOTE
  ...
}

model FollowupTask {
  id        String
  leadId    String?
  dealId    String?
  assigneeId String
  type      TaskType   // CALL | WHATSAPP | EMAIL | REMINDER
  dueAt     DateTime
  doneAt    DateTime?
  slaBreached Boolean @default(false)
}
```

## Social media connections (the "direct connect" you asked for)

| Channel | Direction | How (all via open APIs, no paid middleware) |
|---|---|---|
| **Meta Lead Ads** | Inbound | Create app in Meta for Developers → subscribe to `leadgen` webhook on your Page/IG → worker verifies signature → `Lead` created instantly, round-robin assigned, WhatsApp ack sent within 1 min |
| **Instagram/Facebook comments → leads** | Inbound | Graph API: poll comments on ad posts for keywords ("intersted", price queries) → auto-create Lead with comment context |
| **FB/IG Messenger & IG DMs** | Both | Messenger platform + IG Messaging API → routed into **Chatwoot** inbox (Chatwoot natively supports FB & IG channels) → agents reply from admin dashboard |
| **WhatsApp** | Both | WhatsApp Cloud API via Chatwoot channel — templated broadcasts + 1:1 followups, opt-in managed |
| **Telegram** | Both | Bot API → Chatwoot channel for community/support |
| **Google Ads lead forms** | Inbound | Google Ads API webhook / polling → same `Lead` normalization |
| **YouTube** | Outbound | Data API v3 — auto-upload trailers/recordings, fetch comments (optional lead mining) |
| **Organic scheduling** | Outbound | **Mixpost** (self-hosted) to schedule posts across FB/IG/LinkedIn/X/YouTube |
| **Offline conversion sync** | Outbound | When a lead converts, push `Lead{phone}` as Enhanced Conversion / offline conversion to Meta & Google → their algorithms optimize on real admissions, cutting CPL over time |

### Meta app setup checklist
1. business.meta.gov verify business → get WABA (WhatsApp Business Account) + Page + IG professional account linked.
2. Meta app: add products — `leadgen` webhook, Messenger, IG Messaging, WhatsApp Cloud API.
3. Webhook endpoint: `POST /integrations/meta/webhook` with `X-Hub-Signature-256` verification.
4. Long-lived system-user token (never user tokens in prod); store encrypted (KMS/pghashicorp-vault or env-encrypted).
5. Per-org token table so multi-tenant later: `SocialAccount { orgId, platform, pageId, accessTokenEnc, expiresAt }`.

## Followup automation examples (BullMQ workflows)

```
new_lead(T+0)     → WhatsApp template "Thanks for enquiry about {course}" + assign agent
T+30min           → agent call task (SLA 1h); escalate to supervisor if breached
T+24h no reply    → email brochure + WhatsApp catalogue
T+72h             → discount offer / demo class invite (Cal.com link)
T+7d              → nurture sequence (Listmonk)
converted         → stop automation, Enhanced Conversion upload, onboarding flow
lost              → re-marketing audience sync (custom audience upload)
```

Every automation is a BullMQ flow with idempotency keys on `(leadId, step)` — safe retries, no spam.

## ERP: keep it honest

- **Double-entry ledger** in Postgres (`LedgerEntry { debitAccount, creditAccount, amount, currency, refType, refId }`) — invoices, receipts, expenses all post to it. P&L and balance sheet become queries, not opinions.
- GST-ready invoice schema (place of supply, HSN, rate-wise summary); PDF via @react-pdf/renderer; Tally XML export.
- **Frappe HR** self-hosted for statutory payroll (PF/ESI/TDS); admin dashboard syncs employees + shows payroll status. Don't rebuild payroll.
- Study-material inventory: simple `Item`, `StockMove`, `PurchaseOrder`, `Vendor` — enough for coaching-style kit distribution.
- Metabase for any report you didn't anticipate; admin home shows only the 8–10 KPIs that matter daily.
