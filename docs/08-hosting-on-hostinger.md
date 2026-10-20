# Hosting the Q-School web app on Hostinger (Cloud Startup)

This puts the website, the Console (admin), the CRM and live classes on your Hostinger
Cloud Startup plan. The Flutter app is published separately to the Play Store / App Store
and points to this site's address.

**Time needed:** about 30 minutes the first time.

---

## 1. Build the upload package (on your PC)

Open a terminal in `E:\Q-School LMS` and run:

```
node scripts/build-hostinger.mjs
```

It creates:

| File | What it is |
|---|---|
| `deploy\hostinger\qschool-web.zip` | upload this to Hostinger |
| `deploy\hostinger\qschool-web\` | the same files, unzipped (use this for GitHub instead) |

The package contains the code and the demo courses/users, but **none of your local data**
(leads, settings, uploads, live sessions). Run the script again whenever you change the code.

## 2. Find your Hostinger username

hPanel › **Websites** › your site › **Advanced** › **SSH Access** (or open **File Manager** and
look at the path at the top). It looks like `u123456789`. Your home folder is
`/home/u123456789`.

## 3. Create the Node.js app

1. hPanel › **Websites** › **Add Website** › **Deploy Web App**.
2. Choose **Upload your website files** and upload `qschool-web.zip`.
3. Check the build settings Hostinger detects:
   - Framework: **Next.js**
   - Node.js version: **22.x** (20.x also works)
   - Build command: `npm run build`
   - Start: `npm start` (Hostinger fills this in for Next.js)
4. Pick the domain (for example `qschool.in` or `app.qschool.in`).
5. **Before** clicking **Deploy**, add the environment variables in step 4 if the screen offers
   them. If not, deploy now, add them afterwards, then **Restart**.

## 4. Environment variables (required)

Open the app's dashboard › **Environment Variables** and add:

| Name | Value |
|---|---|
| `ADMIN_EMAIL` | the email you will sign in to the Console with |
| `ADMIN_PASSWORD` | a strong password, **at least 10 characters** |
| `SESSION_SECRET` | 64 random characters (any password generator) |
| `CRM_DATA_DIR` | `/home/u123456789/qschool-data` (your username from step 2) |

Optional ones (BigBlueButton, Meta / Google Ads / WhatsApp lead webhooks) are listed in
`.env.example` inside the package.

> On a live server the Console **refuses to sign in** until `ADMIN_EMAIL`, `ADMIN_PASSWORD`
> and `SESSION_SECRET` are set, and the demo login (`admin@qschool.com / admin123`) is switched
> off. That's on purpose.

After saving, open the app's **Running** status › **Restart**.

## 5. Check it

1. Open `https://your-domain/` and the website should load.
2. Open `https://your-domain/admin/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Open `https://your-domain/api/admin/health` in the same browser. You should see
   `"ok": true` and `"dataDir": "/home/u123456789/qschool-data"`.
   If it shows a warning that data is inside the app folder, `CRM_DATA_DIR` is missing or
   not writable. Fix it before entering real leads.
4. In the Console, go to **Settings › General** and fill in your school's details, then
   **Settings › Live classes** to choose your meeting platforms.

## 5b. WhatsApp (optional)

Console › **Settings › WhatsApp** walks you through it. In short:

1. Create a Meta app (type Business), add WhatsApp, verify your school number.
2. Paste the Phone number ID, WhatsApp Business Account ID and a permanent System User token.
3. Set **Your website address** to `https://your-domain` (used in join links and receipt links).
4. Copy the Callback URL and Verify token into Meta › WhatsApp › Configuration, subscribe to
   `messages`, and paste the App secret.
5. Click **Create templates in Meta** and wait for approval.

Reminders before live sessions are checked every minute by the app itself. As a backup, add
`CRON_SECRET` in Environment Variables and a Hostinger cron job (hPanel › **Advanced** ›
**Cron Jobs**) every 10 minutes that opens
`https://your-domain/api/cron/whatsapp?key=<CRON_SECRET>`.

## 6. Connect your domain and SSL

If the domain is registered elsewhere, point it to Hostinger (hPanel shows the nameservers or
the A record to use). SSL is free: hPanel › **Security** › **SSL** › install. The lead webhooks
(Meta, WhatsApp, Google Ads) need `https://`.

## 7. Updating the site later

1. Change code on your PC and test it with `scripts\start-web.bat`.
2. Run `node scripts/build-hostinger.mjs` again.
3. App dashboard › **Settings & Redeploy** › upload the new zip › **Deploy**.

Your leads, settings, uploads and live sessions are in `qschool-data`, outside the app
folder, so a redeploy never touches them.

**Using GitHub instead of zip uploads:** push the contents of
`deploy\hostinger\qschool-web\` to a private GitHub repository and choose
**Import Git Repository** in step 3. Every push then deploys automatically.

## 8. Backups

Hostinger's daily backups cover your account, but take your own copy of the data folder too:
hPanel › **File Manager** › `/home/u123456789/qschool-data` › right-click › **Compress**, then
download the archive (weekly is a good habit). It holds everything that isn't code: leads,
settings, courses, users, uploaded videos/images and live sessions.

## What runs where

| Part | Where |
|---|---|
| Website, Console, CRM, courses, live-session scheduling | Hostinger Cloud Startup |
| Teams, Zoom, Jitsi, JupiterMeet classes | their own services (just links) |
| BigBlueButton | its own VPS (8 vCPU / 16 GB), only if you choose BBB |
| Flutter app | Play Store / App Store, using this site's address |
| Large course videos | YouTube (unlisted) or Bunny Stream is kinder to the plan's limits than uploading big files |

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails with "Cannot find module" | Make sure you uploaded the zip made by the script, not the `apps\web` folder. |
| Console says login is locked | One of `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` is missing, or the password is shorter than 10 characters. Add it and **Restart**. |
| Data disappeared after a redeploy | `CRM_DATA_DIR` wasn't set. Set it, restart, and check `/api/admin/health`. |
| Everyone got signed out | `SESSION_SECRET` changed. That's expected; sign in again. |
| Site slow or "resource limit" emails | Move large videos to YouTube/Bunny, or upgrade to Cloud Professional. |
