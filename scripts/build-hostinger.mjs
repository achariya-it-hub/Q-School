#!/usr/bin/env node
/**
 * Builds a Hostinger-ready copy of the web app (website + Console + CRM + live classes).
 *
 *   node scripts/build-hostinger.mjs
 *
 * Output:
 *   deploy/hostinger/qschool-web/         plain npm project (no pnpm workspace), upload or push this
 *   deploy/hostinger/qschool-web.zip      the same folder zipped, for hPanel › Node.js › Upload
 *
 * What changes compared with apps/web:
 *   - the shared package (packages/shared) is copied into ./shared and wired with a tsconfig path,
 *     so `npm install` works without pnpm workspaces
 *   - build tools (Tailwind, TypeScript…) move to "dependencies" so Hostinger's build installs them
 *   - `npm start` listens on the port Hostinger gives the app (PORT)
 *   - local data (leads, settings, uploads, live sessions) is NOT included; on the server it lives in
 *     CRM_DATA_DIR (default ~/qschool-data), outside the deploy folder
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync } from "fs";
import { spawnSync } from "child_process";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB = path.join(ROOT, "apps", "web");
const SHARED = path.join(ROOT, "packages", "shared", "src");
const BASE_TS = path.join(ROOT, "packages", "config", "tsconfig.base.json");
const OUT_PARENT = path.join(ROOT, "deploy", "hostinger");
const OUT = path.join(OUT_PARENT, "qschool-web");
const ZIP = path.join(OUT_PARENT, "qschool-web.zip");

// Folders and files that are local data or build output, never shipped.
const SKIP = new Set([
  "node_modules",
  ".next",
  "tsconfig.tsbuildinfo",
  "next-env.d.ts",
  ".env",
  ".env.local",
  "settings.json",
  "live-sessions.json",
  "site-content.json",
  "site-media",
  "course-media",
  "leads.json",
]);
const skip = (name) => SKIP.has(name) || name.startsWith("crm-") || name.endsWith(".tmp");

const log = (m) => console.log(`  ${m}`);
console.log("\nQ-School › building the Hostinger package\n");

// 1. fresh output folder
rmSync(OUT_PARENT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// 2. copy the web app
for (const name of readdirSync(WEB)) {
  if (skip(name)) continue;
  cpSync(path.join(WEB, name), path.join(OUT, name), {
    recursive: true,
    filter: (src) => !skip(path.basename(src)),
  });
}
log("copied apps/web (without local data and build output)");

// 3. fold in the shared package
cpSync(SHARED, path.join(OUT, "shared"), { recursive: true });
log("copied packages/shared → shared/");

// 4. stand-alone tsconfig (no ../../packages reference)
const base = JSON.parse(readFileSync(BASE_TS, "utf8"));
const web = JSON.parse(readFileSync(path.join(WEB, "tsconfig.json"), "utf8"));
const tsconfig = {
  compilerOptions: {
    ...base.compilerOptions,
    ...web.compilerOptions,
    incremental: false,
    paths: { "@/*": ["./src/*"], "@qschool/shared": ["./shared/index.ts"] },
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"],
};
writeFileSync(path.join(OUT, "tsconfig.json"), JSON.stringify(tsconfig, null, 2) + "\n");
log("tsconfig.json made stand-alone");

// 5. next.config without the workspace package
writeFileSync(
  path.join(OUT, "next.config.mjs"),
  `/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // starts the WhatsApp reminder scheduler when the server boots (src/instrumentation.ts)
  experimental: { instrumentationHook: true },
};

export default nextConfig;
`,
);

// 6. package.json for plain npm
const pkg = JSON.parse(readFileSync(path.join(WEB, "package.json"), "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
delete deps["@qschool/shared"];
const sorted = Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(
  path.join(OUT, "package.json"),
  JSON.stringify(
    {
      name: "qschool-web",
      version: pkg.version,
      private: true,
      scripts: {
        build: "next build",
        // no -p: Next.js uses the PORT the host provides (3000 when none is set)
        start: "next start",
        typecheck: "tsc --noEmit",
      },
      engines: { node: ">=18.18" },
      dependencies: sorted,
    },
    null,
    2,
  ) + "\n",
);
log("package.json rewritten for npm (build tools moved into dependencies)");

// 7. environment template + ignore file
writeFileSync(
  path.join(OUT, ".env.example"),
  `# Copy these into hPanel › Websites › (your Node.js app) › Environment variables.
# Never upload a real .env file with your passwords.

# --- required on a live server -------------------------------------------
ADMIN_EMAIL=you@yourschool.in
ADMIN_PASSWORD=choose-a-long-password
# any long random text; changing it signs everyone out of the Console
SESSION_SECRET=paste-64-random-characters-here

# where leads, settings, courses, users and uploads are kept (outside the deploy folder)
# replace u123456789 with your Hostinger username (shown in hPanel › SSH access or File Manager)
CRM_DATA_DIR=/home/u123456789/qschool-data

# --- optional -------------------------------------------------------------
# BigBlueButton (or enter these in Console › Settings › Live classes)
# BBB_URL=https://live.yourschool.in/bigbluebutton/
# BBB_SECRET=

# Lead sources (Console › Lead Sources shows the webhook URLs)
# META_APP_SECRET=
# META_VERIFY_TOKEN=
# META_PAGE_ACCESS_TOKEN=
# META_FORM_IDS=
# GOOGLE_ADS_WEBHOOK_KEY=
# WhatsApp (or enter these in Console › Settings › WhatsApp)
# WHATSAPP_TOKEN=
# WHATSAPP_PHONE_NUMBER_ID=
# WHATSAPP_BUSINESS_ACCOUNT_ID=
# WHATSAPP_VERIFY_TOKEN=
# WHATSAPP_APP_SECRET=
# the public address used in WhatsApp links, e.g. https://qschool.in
# PUBLIC_URL=
# optional: a key for the backup reminder URL /api/cron/whatsapp?key=…
# CRON_SECRET=
# WHATSAPP_AUTO_REPLY=Hi {name}! Thanks for contacting Q-School. A counsellor will call you shortly.
# LEADS_WEBHOOK_KEY=
`,
);
writeFileSync(path.join(OUT, ".gitignore"), "node_modules\n.next\n.env\n.env.local\n*.tmp\n");

// 8. deployment guide
const guide = path.join(ROOT, "docs", "08-hosting-on-hostinger.md");
if (existsSync(guide)) cpSync(guide, path.join(OUT, "DEPLOY-HOSTINGER.md"));

// 9. zip it (folder contents at the zip root, which is what hPanel expects)
const zipped = (() => {
  // build in the temp folder first, then copy (some synced/network folders dislike zip's temp files)
  const tmp = path.join(os.tmpdir(), `qschool-web-${Date.now()}.zip`);
  const isWin = process.platform === "win32";
  // Windows 10+ ships bsdtar, which writes zip files with -a
  const r = isWin
    ? spawnSync("tar", ["-a", "-c", "-f", tmp, "-C", OUT, "."], { stdio: "inherit" })
    : spawnSync("zip", ["-qr", tmp, "."], { cwd: OUT, stdio: "inherit" });
  if (r.status !== 0 || !existsSync(tmp)) return false;
  cpSync(tmp, ZIP);
  rmSync(tmp, { force: true });
  return statSync(ZIP).size > 0;
})();

const size = (p) => {
  let n = 0;
  for (const f of readdirSync(p, { recursive: true })) {
    const s = statSync(path.join(p, String(f)));
    if (s.isFile()) n += s.size;
  }
  return n;
};
console.log(`\nDone.\n  Folder: ${path.relative(ROOT, OUT)}  (${(size(OUT) / 1e6).toFixed(1)} MB)`);
console.log(zipped ? `  Zip:    ${path.relative(ROOT, ZIP)}  (${(statSync(ZIP).size / 1e6).toFixed(1)} MB)` : "  Zip:    not created. Zip the folder's contents yourself (select all inside it › Send to › Compressed folder).");
console.log("  Next:   follow docs/08-hosting-on-hostinger.md\n");
