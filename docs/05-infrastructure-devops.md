# 05 · Infrastructure, DevOps & Cost — Q-School

## Server topology (self-hosted, start small)

```
Internet ──▶ Cloudflare (DNS, WAF, CDN — free tier)
                │
        ┌───────▼──────────────────────────────┐
        │  Edge server (4 vCPU / 8 GB)          │  Traefik + TLS, web app,
        │  apps: web, admin, landing            │  rate-limit
        └───────┬───────────────────────────────┘
                │ private network (WireGuard or VPC)
        ┌───────▼───────────────────────────────┐
        │  Core server (8 vCPU / 32 GB)          │  Postgres 17, Redis, MinIO,
        │  data: postgres, redis, minio          │  Meilisearch, Metabase,
        │  services: api, realtime, workers      │  Chatwoot, Cal.com, Listmonk,
        │                                        │  Frappe HR, Sentry
        └───────┬───────────────────────────────┘
        ┌───────▼───────────────────────────────┐
        │  BBB server (8 vCPU / 16 GB, bare)     │  BigBlueButton 3.x
        │  (add ScaleLite when > ~50 concurrent) │  (Ubuntu 22.04, bbb-install)
        └───────┬───────────────────────────────┘
        ┌───────▼───────────────────────────────┐
        │  CI server (2 vCPU) or GitHub Actions  │  build + deploy
        └────────────────────────────────────────┘
```

- BBB wants **bare metal / dedicated vCPU** (noisy neighbors kill A/V). Hetzner AX-series or DO dedicated droplets. Keep it separate from everything.
- LiveKit self-hosted optional at first; mobile live can start on BBB via browser webview, then LiveKit SDK when mobile-native live matters.
- All infra in `infra/` — docker-compose per server, Ansible bootstrap, `.env` via SOPS-encrypted secrets.

## Backup & DR (non-negotiable from day 1)

- Postgres: nightly `pg_dump` + WAL archiving (pgBackRest) → Restic → Backblaze B2 (3 copies rule: prod, B2, one restore-tested)
- MinIO: versioned buckets, weekly mirror to B2
- Monthly **restore drill** (scripted) — an untested backup is not a backup
- RPO 24h / RTO 4h acceptable for MVP; tighten to WAL-based RPO 5min when revenue depends on it

## CI/CD

```
PR  → lint + typecheck + unit tests + prisma migrate diff check
main → build docker images (web/admin/api/realtime/mobile EAS) → GHCR
     → deploy staging (auto) → deploy prod (manual gate / tag)
mobile → EAS Build profiles: development / preview / production; OTA via EAS Update
```

- DB migrations: `prisma migrate deploy` runs as pre-deploy job; every migration must be backward-compatible (expand → migrate → contract).
- Smoke tests post-deploy (API health, login, one lesson play, one lead webhook).

## Observability

- Grafana + Prometheus + Loki: API latency, queue depth, BBB room health, worker failures
- Sentry: web, admin, api, mobile (self-hosted or SaaS free tier)
- Uptime Kuma: public endpoints + BBB turn ports

## Cost model (monthly, rough)

| Phase | Setup | Est. infra/month |
|---|---|---|
| MVP (≤ 300 students) | Q-School v1: 1 edge + 1 core + 1 BBB | **$150–250** (Hetzner/DO) |
| Growth (≤ 2k students, ~150 live concurrent) | +2nd BBB node, ScaleLite, pg upgrade | **$400–700** |
| Scale (5k+, multi-branch) | k3s cluster, managed PG optional | $1k–2k+ |

Compare: typical SaaS LMS+CRM+webinar tools for the same scale run $500–2,000/mo and you still don't own the data. Self-host pays back within the first year.

Hidden costs to budget: WhatsApp Cloud API per-conversation fees, SES email, domain/SSL (free), EAS Build ($29/mo production), Cloudflare free → pro.

## Security checklist (pre-launch)

- [ ] OWASP top-10 review, rate limiting, CORS locked to your domains
- [ ] Signed expiring URLs + per-user watermarks on all video
- [ ] 2FA for admin roles; IP allowlist optional for superadmin
- [ ] Secrets: SOPS + age (or Vault), never in git
- [ ] DPDP Act (India) compliance: consent capture, data deletion workflow, privacy policy
- [ ] PCI: never touch card data — gateway checkout pages/SDK only
