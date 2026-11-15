# Lead Flow Fix + App Review — Q-School

Fixed in commit `524458d` (pushed to `origin/main`).

## 1. Why the test lead disappeared

| # | Gap | Effect | Fix |
|---|-----|--------|-----|
| 1 | Every read deleted leads that looked like tests: any name containing test/demo/sample/dummy/fake, `@test.com` emails, or phones like 9999999999 / 9876543210 / 1234567890. It also deleted them from the DB, and the browser hid them a second time. | A test lead was deleted on the first refresh after it was created. | Leads are no longer deleted on read. They get an `isTest` flag, a **Test** badge and a **Show test leads** toggle. Only the old bundled sample rows are still hidden. Leads are deleted only by clicking **Remove test leads**. |
| 2 | Location names didn't match. The website saves "Chennai – Adyar", the Console filter used "Adyar, Chennai", and the admission form saves centreId "ad". The filter compared the text directly. | Website leads never appeared under their location. | Shared `resolveCentreId()` / `leadCentreId()`. Every lead is matched to a branch id when saved, and existing leads are fixed when next read. The filter matches on the branch id. Added an "Online / no centre" option. |
| 3 | DB writes didn't wait to finish (`void saveDbLead`). The page reloads right after a create, so it could read the DB before the write landed, and that read overwrote the local file. Serverless hosts can drop the write completely. | The new lead appeared, then vanished. | DB writes now finish before the response is sent. Reads add back recent local leads that never reached the DB and push them to the DB. Deleted ids are remembered so deleted leads don't come back. |
| 4 | Re-using an existing phone number only added a line to the old lead's timeline, and the chosen location was ignored. | The lead never showed under the chosen location. | If the existing lead has no location, it takes the new one. The toast explains it already exists, the drawer opens it, and filters are cleared. |
| 5 | Bulk upload ignored Location and re-wrote every lead to the DB without waiting. | Uploaded leads had no location. | Location / centre / branch / city columns are mapped (also added to the template), and only the uploaded rows are saved. |
| 6 | Centre Heads saw every centre's leads (scoping was only in the UI). | Privacy problem; leads went to the wrong people. | `lib/crm/scope.ts`: branch-bound users only see, edit, create and delete their branch's leads. Students can't use the CRM API. Only admins can bulk-delete. |
| 7 | Lead ids could collide within the same millisecond; Console leads were always assigned to the first agent; test pings were deleted from the ingestion log. | — | Ids have a random suffix, round-robin assignment is restored, and test pings are kept. |

**To check it:** redeploy, then create "Test Lead" in Adyar, Chennai. It should show up with a Test badge, under the Adyar filter, and for adyar@theqschool.com.

## 2. App-wide review (in priority order)

### Critical: security
1. `checkCredentials()` accepts `admin123` / `adminpassword123` for every account, including admin. Remove these fallbacks, hash passwords, and set `ALLOW_DEMO_LOGIN=false` in production.
2. `SESSION_SECRET` falls back to "dev-only-change-me", so anyone could forge an admin cookie. Refuse to start without it.
3. `isAdmin()` is true for any signed-in email, so students and teachers reach admin APIs. Enforce roles on the server for every `/api/admin/*` route.
4. The public lead form has no rate limit, honeypot or captcha. Add a honeypot plus per-IP rate limiting, and Turnstile if spam starts.

### High: data reliability
5. JSON files are the main data store, which breaks with more than one server instance (and on serverless the data sits in /tmp and is lost). Make Postgres the only store with proper tables.
6. One-time bulk DELETEs run inside `ensureTables()`. Move them into versioned migrations that someone runs on purpose.
7. The WhatsApp welcome is still sent without waiting. Use a queue or `waitUntil`.
8. The browser cache (localStorage) can briefly show deleted leads. Move to SWR/React Query.

### Medium: CRM features
9. Store centres and owners as data, and assign leads by branch (not round-robin over 4 hard-coded names).
10. Add a cron job that flags overdue follow-ups (`slaBreached` exists but nothing sets it) and sends WhatsApp reminders.
11. Keep `isTest` leads out of dashboard numbers.
12. Telephony is simulated. Connect Exotel/Knowlarity or label it Beta.
13. Duplicate matching on phone or email can merge siblings. Match on phone + child name and add a manual merge.
14. Add an audit log for stage changes and deletes.

### Quality
15. No automated tests. Add Vitest (ingest, resolveCentreId, scope) and Playwright (website form → lead appears in the Console).
16. Split very large page files (leads page ≈ 1,800 lines, home-sections ≈ 1,900).
17. Extend the health check (disk, DB, env vars). This machine's C: drive is full.
18. The lead-form thank-you message still says "free 45-minute demo session". Change it to BMIT Assessment.
