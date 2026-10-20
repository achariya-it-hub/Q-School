/**
 * Console settings (server-only), stored in settings.json next to the CRM files.
 * Secrets (the BigBlueButton shared secret) never leave the server: `publicSettings()`
 * returns them masked, and `saveSettings()` keeps the old secret when none is sent.
 * Environment variables BBB_URL / BBB_SECRET override the stored values.
 */
import { promises as fs } from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/data-dir";
import type { Platform } from "@/lib/live/types";
import { WA_EVENTS, WA_EVENT_KEYS, type WaEvent } from "@/lib/whatsapp/types";

const FILE = path.join(DATA_DIR, "settings.json");

export interface GeneralSettings {
  orgName: string;
  legalName: string;
  supportEmail: string;
  supportPhone: string;
  whatsapp: string;
  address: string;
  gstin: string;
  timezone: string;
  currency: string;
}

export interface BbbSettings {
  enabled: boolean;
  url: string; // e.g. https://live.qschool.in/bigbluebutton/
  secret: string;
  algorithm: "sha1" | "sha256";
  record: boolean;
  autoStartRecording: boolean;
  muteOnStart: boolean;
  webcamsOnlyForModerator: boolean;
  guestPolicy: "ALWAYS_ACCEPT" | "ASK_MODERATOR";
  welcome: string;
  logoutUrl: string;
  maxParticipants: number;
  joinEarlyMinutes: number;
}

export interface PlatformSettings {
  enabled: Record<Platform, boolean>;
  defaultPlatform: Platform;
  jitsiDomain: string; // e.g. meet.jit.si or your own Jitsi server
  jupiterUrl: string; // base address of your JupiterMeet install (optional, for link checks)
}

export interface WhatsAppSettings {
  enabled: boolean;
  phoneNumberId: string;
  wabaId: string; // WhatsApp Business Account id (for templates)
  token: string; // permanent access token (secret)
  appSecret: string; // Meta app secret, verifies webhooks (secret)
  verifyToken: string; // webhook verify token
  siteUrl: string; // public address used in links, e.g. https://qschool.in
  country: string; // default country code for 10-digit numbers
  language: string; // default template language
  autoReply: boolean;
  autoReplyText: string;
  reminders: number[]; // minutes before a live session
  events: Record<WaEvent, { enabled: boolean; template: string; language: string }>;
}

export interface TelephonySettings {
  enabled: boolean;
  provider: "tatatele" | "zadarma" | "telnyx" | "asterisk" | "exotel" | "other";
  sipServer: string; // e.g. sip.smartflo.tatatele.com or 192.168.1.100:5060
  virtualNumber: string; // e.g. +91 80 6900 1200
  counselorNumber: string; // default agent forwarding number e.g. +91 98765 43210
  apiKey: string; // auth secret / trunk pass
  asteriskAriUrl: string; // e.g. http://127.0.0.1:8088/ari
  recordCalls: boolean;
  autoMoveContacted: boolean;

  // Failover & Backup Channels (Option 2: Android Gateway, Option 4: 4G USB Dongle)
  fallbackEnabled: boolean;
  backupRoute: "android_gateway" | "usb_dongle" | "auto" | "none";
  // Option 2: Spare Android Phone Gateway (Wi-Fi / Local REST Gateway)
  androidGatewayUrl: string; // e.g. http://192.168.1.50:8080
  androidGatewayApiKey: string;
  androidSimSlot: number; // 1 or 2
  // Option 4: 4G USB Dongle Modem (chan_dongle in Asterisk)
  usbDongleId: string; // e.g. dongle0
  usbDonglePort: string; // e.g. /dev/ttyUSB1
}

export interface Settings {
  general: GeneralSettings;
  bbb: BbbSettings;
  platforms: PlatformSettings;
  whatsapp: WhatsAppSettings;
  telephony: TelephonySettings;
}

export const DEFAULT_SETTINGS: Settings = {
  general: {
    orgName: "Q-School",
    legalName: "Q-School Learning Pvt. Ltd.",
    supportEmail: "hello@qschool.example",
    supportPhone: "+91 90000 00000",
    whatsapp: "+91 90000 00000",
    address: "2nd Floor, 14 Anna Nagar East, Chennai 600102, Tamil Nadu",
    gstin: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
  },
  bbb: {
    enabled: false,
    url: "",
    secret: "",
    algorithm: "sha256",
    record: true,
    autoStartRecording: false,
    muteOnStart: true,
    webcamsOnlyForModerator: true,
    guestPolicy: "ALWAYS_ACCEPT",
    welcome: "Welcome to <b>%%CONFNAME%%</b>! Please keep your microphone muted unless the host asks you to speak.",
    logoutUrl: "",
    maxParticipants: 0,
    joinEarlyMinutes: 15,
  },
  platforms: {
    enabled: { bbb: true, teams: true, zoom: true, jitsi: true, jupitermeet: true, other: true },
    defaultPlatform: "bbb",
    jitsiDomain: "meet.jit.si",
    jupiterUrl: "",
  },
  whatsapp: {
    enabled: false,
    phoneNumberId: "",
    wabaId: "",
    token: "",
    appSecret: "",
    verifyToken: "",
    siteUrl: "",
    country: "91",
    language: "en",
    autoReply: true,
    autoReplyText: "Hi {name}! Thanks for contacting Q-School. A counsellor will call you shortly.",
    reminders: [1440, 60],
    events: Object.fromEntries(WA_EVENT_KEYS.map((k) => [k, { enabled: true, template: WA_EVENTS[k].template, language: "en" }])) as WhatsAppSettings["events"],
  },
  telephony: {
    enabled: true,
    provider: "tatatele",
    sipServer: "sip.smartflo.tatatele.com",
    virtualNumber: "+91 80 6900 1200",
    counselorNumber: "+91 98765 43210",
    apiKey: "",
    asteriskAriUrl: "http://127.0.0.1:8088/ari",
    recordCalls: true,
    autoMoveContacted: true,
    fallbackEnabled: true,
    backupRoute: "auto",
    androidGatewayUrl: "http://192.168.1.50:8080",
    androidGatewayApiKey: "",
    androidSimSlot: 1,
    usbDongleId: "dongle0",
    usbDonglePort: "/dev/ttyUSB1",
  },
};

const PLATFORM_KEYS: Platform[] = ["bbb", "teams", "zoom", "jitsi", "jupitermeet", "other"];

const s = (v: unknown, max = 300, fb = "") => (typeof v === "string" ? v.trim().slice(0, max) : fb);
const b = (v: unknown, fb: boolean) => (typeof v === "boolean" ? v : fb);
const n = (v: unknown, min: number, max: number, fb: number) => {
  const x = Number(v);
  return Number.isFinite(x) ? Math.min(max, Math.max(min, Math.round(x))) : fb;
};
const o = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** BBB API base, normalised to ".../bigbluebutton/api/". */
export function normaliseBbbUrl(raw: string) {
  let u = raw.trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    const url = new URL(u);
    let p = url.pathname.replace(/\/+$/, "");
    if (!p.endsWith("/api")) p = p.endsWith("/bigbluebutton") ? `${p}/api` : `${p || ""}/bigbluebutton/api`;
    url.pathname = `${p}/`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function normalise(input: unknown, prev: Settings): Settings {
  const i = o(input);
  const g = o(i.general);
  const bb = o(i.bbb);
  const pl = o(i.platforms);
  const pg = prev.general;
  const pb = prev.bbb;
  const pp = prev.platforms ?? DEFAULT_SETTINGS.platforms;
  const en = o(pl.enabled);
  const w = o(i.whatsapp);
  const pw = prev.whatsapp ?? DEFAULT_SETTINGS.whatsapp;
  const we = o(w.events);
  const tpl = (v: unknown, fb: string) => {
    const x = s(v, 120, fb).toLowerCase();
    return /^[a-z0-9_]+$/.test(x) ? x : fb;
  };
  const lang = (v: unknown, fb: string) => (/^[a-z]{2,3}(_[A-Z]{2})?$/.test(s(v, 10)) ? s(v, 10) : fb);
  const host = (v: string) => v.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
  return {
    general: {
      orgName: s(g.orgName, 80, pg.orgName) || pg.orgName,
      legalName: s(g.legalName, 160, pg.legalName),
      supportEmail: s(g.supportEmail, 160, pg.supportEmail),
      supportPhone: s(g.supportPhone, 30, pg.supportPhone),
      whatsapp: s(g.whatsapp, 30, pg.whatsapp),
      address: s(g.address, 400, pg.address),
      gstin: s(g.gstin, 20, pg.gstin).toUpperCase(),
      timezone: s(g.timezone, 60, pg.timezone) || "Asia/Kolkata",
      currency: s(g.currency, 3, pg.currency) || "INR",
    },
    bbb: {
      enabled: b(bb.enabled, pb.enabled),
      url: "url" in bb ? normaliseBbbUrl(s(bb.url, 300)) : pb.url,
      // empty / missing secret = keep the stored one
      secret: s(bb.secret, 200) || pb.secret,
      algorithm: bb.algorithm === "sha1" ? "sha1" : bb.algorithm === "sha256" ? "sha256" : pb.algorithm,
      record: b(bb.record, pb.record),
      autoStartRecording: b(bb.autoStartRecording, pb.autoStartRecording),
      muteOnStart: b(bb.muteOnStart, pb.muteOnStart),
      webcamsOnlyForModerator: b(bb.webcamsOnlyForModerator, pb.webcamsOnlyForModerator),
      guestPolicy: bb.guestPolicy === "ASK_MODERATOR" ? "ASK_MODERATOR" : bb.guestPolicy === "ALWAYS_ACCEPT" ? "ALWAYS_ACCEPT" : pb.guestPolicy,
      welcome: "welcome" in bb ? s(bb.welcome, 1000) : pb.welcome,
      logoutUrl: "logoutUrl" in bb ? (/^https?:\/\//.test(s(bb.logoutUrl, 300)) ? s(bb.logoutUrl, 300) : "") : pb.logoutUrl,
      maxParticipants: n(bb.maxParticipants, 0, 5000, pb.maxParticipants),
      joinEarlyMinutes: n(bb.joinEarlyMinutes, 0, 120, pb.joinEarlyMinutes),
    },
    platforms: {
      enabled: Object.fromEntries(PLATFORM_KEYS.map((k) => [k, b(en[k], pp.enabled[k] ?? true)])) as Record<Platform, boolean>,
      defaultPlatform: PLATFORM_KEYS.includes(pl.defaultPlatform as Platform) ? (pl.defaultPlatform as Platform) : pp.defaultPlatform,
      jitsiDomain: "jitsiDomain" in pl ? host(s(pl.jitsiDomain, 120)) || "meet.jit.si" : pp.jitsiDomain,
      jupiterUrl: "jupiterUrl" in pl ? (/^https:\/\//i.test(s(pl.jupiterUrl, 300)) ? s(pl.jupiterUrl, 300).replace(/\/+$/, "") : "") : pp.jupiterUrl,
    },
    whatsapp: {
      enabled: b(w.enabled, pw.enabled),
      phoneNumberId: "phoneNumberId" in w ? s(w.phoneNumberId, 40).replace(/\D/g, "") : pw.phoneNumberId,
      wabaId: "wabaId" in w ? s(w.wabaId, 40).replace(/\D/g, "") : pw.wabaId,
      // empty / missing secret = keep the stored one
      token: s(w.token, 1000) || pw.token,
      appSecret: s(w.appSecret, 200) || pw.appSecret,
      verifyToken: "verifyToken" in w ? s(w.verifyToken, 100) : pw.verifyToken,
      siteUrl: "siteUrl" in w ? (/^https?:\/\/[^\s/]+/i.test(s(w.siteUrl, 200)) ? s(w.siteUrl, 200).replace(/\/+$/, "") : "") : pw.siteUrl,
      country: "country" in w ? s(w.country, 4).replace(/\D/g, "") || "91" : pw.country,
      language: lang(w.language, pw.language),
      autoReply: b(w.autoReply, pw.autoReply),
      autoReplyText: "autoReplyText" in w ? s(w.autoReplyText, 1000) : pw.autoReplyText,
      reminders: Array.isArray(w.reminders)
        ? Array.from(new Set(w.reminders.map((x) => n(x, 5, 10080, 0)).filter((x) => x > 0))).sort((a, c) => c - a).slice(0, 4)
        : pw.reminders,
      events: Object.fromEntries(
        WA_EVENT_KEYS.map((k) => {
          const x = o(we[k]);
          const p0 = pw.events?.[k] ?? DEFAULT_SETTINGS.whatsapp.events[k];
          return [k, { enabled: b(x.enabled, p0.enabled), template: tpl(x.template, p0.template), language: lang(x.language, p0.language) }];
        }),
      ) as WhatsAppSettings["events"],
    },
    telephony: {
      enabled: b(o(i.telephony).enabled, (prev.telephony ?? DEFAULT_SETTINGS.telephony).enabled),
      provider: ((["tatatele", "zadarma", "telnyx", "asterisk", "exotel", "other"].includes(o(i.telephony).provider as any)
        ? o(i.telephony).provider
        : (prev.telephony ?? DEFAULT_SETTINGS.telephony).provider) || "tatatele") as TelephonySettings["provider"],
      sipServer: s(o(i.telephony).sipServer, 150, (prev.telephony ?? DEFAULT_SETTINGS.telephony).sipServer),
      virtualNumber: s(o(i.telephony).virtualNumber, 30, (prev.telephony ?? DEFAULT_SETTINGS.telephony).virtualNumber),
      counselorNumber: s(o(i.telephony).counselorNumber, 30, (prev.telephony ?? DEFAULT_SETTINGS.telephony).counselorNumber),
      apiKey: s(o(i.telephony).apiKey, 200) || (prev.telephony ?? DEFAULT_SETTINGS.telephony).apiKey,
      asteriskAriUrl: s(o(i.telephony).asteriskAriUrl, 200, (prev.telephony ?? DEFAULT_SETTINGS.telephony).asteriskAriUrl),
      recordCalls: b(o(i.telephony).recordCalls, (prev.telephony ?? DEFAULT_SETTINGS.telephony).recordCalls),
      autoMoveContacted: b(o(i.telephony).autoMoveContacted, (prev.telephony ?? DEFAULT_SETTINGS.telephony).autoMoveContacted),
      fallbackEnabled: b(o(i.telephony).fallbackEnabled, (prev.telephony ?? DEFAULT_SETTINGS.telephony).fallbackEnabled),
      backupRoute: ((["android_gateway", "usb_dongle", "auto", "none"].includes(o(i.telephony).backupRoute as any)
        ? o(i.telephony).backupRoute
        : (prev.telephony ?? DEFAULT_SETTINGS.telephony).backupRoute) || "auto") as TelephonySettings["backupRoute"],
      androidGatewayUrl: s(o(i.telephony).androidGatewayUrl, 200, (prev.telephony ?? DEFAULT_SETTINGS.telephony).androidGatewayUrl),
      androidGatewayApiKey: s(o(i.telephony).androidGatewayApiKey, 200) || (prev.telephony ?? DEFAULT_SETTINGS.telephony).androidGatewayApiKey,
      androidSimSlot: n(o(i.telephony).androidSimSlot, 1, 2, (prev.telephony ?? DEFAULT_SETTINGS.telephony).androidSimSlot || 1),
      usbDongleId: s(o(i.telephony).usbDongleId, 50, (prev.telephony ?? DEFAULT_SETTINGS.telephony).usbDongleId),
      usbDonglePort: s(o(i.telephony).usbDonglePort, 50, (prev.telephony ?? DEFAULT_SETTINGS.telephony).usbDonglePort),
    },
  };
}

export async function getSettings(): Promise<Settings> {
  // a fresh copy, so the environment overrides below never leak into the defaults
  let saved: Settings = normalise({}, DEFAULT_SETTINGS);
  try {
    saved = normalise(JSON.parse(await fs.readFile(FILE, "utf8")), DEFAULT_SETTINGS);
  } catch {}
  // environment overrides (recommended for production secrets)
  if (process.env.BBB_URL) saved.bbb.url = normaliseBbbUrl(process.env.BBB_URL);
  if (process.env.BBB_SECRET) saved.bbb.secret = process.env.BBB_SECRET;
  if (process.env.BBB_URL && process.env.BBB_SECRET && process.env.BBB_ENABLED !== "false") saved.bbb.enabled = true;
  const e = process.env;
  if (e.WHATSAPP_TOKEN) saved.whatsapp.token = e.WHATSAPP_TOKEN;
  if (e.WHATSAPP_PHONE_NUMBER_ID) saved.whatsapp.phoneNumberId = e.WHATSAPP_PHONE_NUMBER_ID;
  if (e.WHATSAPP_BUSINESS_ACCOUNT_ID) saved.whatsapp.wabaId = e.WHATSAPP_BUSINESS_ACCOUNT_ID;
  if (e.WHATSAPP_VERIFY_TOKEN) saved.whatsapp.verifyToken = e.WHATSAPP_VERIFY_TOKEN;
  if (e.WHATSAPP_APP_SECRET || e.META_APP_SECRET) saved.whatsapp.appSecret = (e.WHATSAPP_APP_SECRET || e.META_APP_SECRET)!;
  if (e.WHATSAPP_AUTO_REPLY) saved.whatsapp.autoReplyText = e.WHATSAPP_AUTO_REPLY;
  if (e.PUBLIC_URL && !saved.whatsapp.siteUrl) saved.whatsapp.siteUrl = e.PUBLIC_URL.replace(/\/+$/, "");
  if (e.WHATSAPP_TOKEN && e.WHATSAPP_PHONE_NUMBER_ID && e.WHATSAPP_ENABLED !== "false") saved.whatsapp.enabled = true;
  return saved;
}

export async function saveSettings(input: unknown) {
  let prev: Settings = DEFAULT_SETTINGS;
  try {
    prev = normalise(JSON.parse(await fs.readFile(FILE, "utf8")), DEFAULT_SETTINGS);
  } catch {}
  const next = normalise(input, prev);
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2));
  await fs.rename(tmp, FILE);
  return getSettings();
}

/** Safe to send to the browser. */
export function publicSettings(st: Settings) {
  const sec = st.bbb.secret;
  return {
    general: st.general,
    platforms: st.platforms,
    bbb: {
      ...st.bbb,
      secret: "",
      hasSecret: !!sec,
      secretHint: sec ? `••••••••${sec.slice(-4)}` : "",
      fromEnv: { url: !!process.env.BBB_URL, secret: !!process.env.BBB_SECRET },
      configured: !!(st.bbb.url && sec),
    },
    whatsapp: {
      ...st.whatsapp,
      token: "",
      appSecret: "",
      hasToken: !!st.whatsapp.token,
      tokenHint: st.whatsapp.token ? `••••${st.whatsapp.token.slice(-4)}` : "",
      hasAppSecret: !!st.whatsapp.appSecret,
      fromEnv: {
        token: !!process.env.WHATSAPP_TOKEN,
        phoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
        wabaId: !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        verifyToken: !!process.env.WHATSAPP_VERIFY_TOKEN,
        appSecret: !!(process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET),
      },
      configured: !!(st.whatsapp.token && st.whatsapp.phoneNumberId),
    },
    telephony: {
      ...st.telephony,
      apiKey: "",
      hasApiKey: !!st.telephony.apiKey,
      apiKeyHint: st.telephony.apiKey ? `••••••••${st.telephony.apiKey.slice(-4)}` : "",
      androidGatewayApiKey: "",
      hasAndroidApiKey: !!st.telephony.androidGatewayApiKey,
      configured: !!(st.telephony.sipServer && st.telephony.virtualNumber),
    },
  };
}
export type PublicSettings = ReturnType<typeof publicSettings>;
