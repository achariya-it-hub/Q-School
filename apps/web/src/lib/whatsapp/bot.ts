/**
 * WhatsApp chatbot — a fixed menu / button flow (no AI). Server-only.
 *
 *   Main menu → New enquiry · Admission & fees · My child (parents) · Branches · Talk to a counsellor
 *
 * Files in the data folder:
 *   whatsapp-bot.json         per-number conversation step + collected answers + handoff flag
 *   whatsapp-bot-config.json  texts, branch details, courses (edited in Settings › Chatbot)
 *
 * Free-form replies only work within 24 h of the person's last message — which is always true here,
 * because the bot only ever answers a message they just sent.
 */
import { promises as fs } from "fs";
import { ADMISSION_CENTRES, centreName, type StudentRecord } from "@qschool/shared";
import { DATA_DIR } from "@/lib/data-dir";
import { ingestLead, updateLead } from "@/lib/crm/store";
import { listStudents } from "@/lib/students/store";
import { getSettings } from "@/lib/settings/store";
import { enqueue, publicOrigin, send, type SendInput } from "./client";
import type { BotInbound } from "./automations";
import path from "path";

/* ───────── config ───────── */

export interface BotBranch {
  address: string;
  phone: string;
  hours: string;
  /** Google Maps link */
  map: string;
}
export interface BotConfig {
  enabled: boolean;
  greeting: string;
  /** course names offered in the enquiry flow (max 9 — “Not sure yet” is added) */
  courses: string[];
  faqFees: string;
  faqBatches: string;
  faqTimings: string;
  /** optional WhatsApp number that is pinged for every new enquiry / handoff, e.g. 919876543210 */
  notifyNumber: string;
  branches: Record<string, BotBranch>;
}

const CONFIG_FILE = path.join(DATA_DIR, "whatsapp-bot-config.json");
const SESSION_FILE = path.join(DATA_DIR, "whatsapp-bot.json");

export const defaultBotConfig = (): BotConfig => ({
  enabled: true,
  greeting: "Hi{name} 👋 Welcome to Q-School! How can we help you today?",
  courses: ["Abacus", "Vedic Maths", "Handwriting", "Phonics", "Coding"],
  faqFees: "Fees depend on the course and branch. Our counsellor will share the exact fee structure — tap “Talk to counsellor”.",
  faqBatches: "We run weekday-evening and weekend batches. Exact batch timings depend on your branch.",
  faqTimings: "Weekday batches run in the evening and weekend batches in the morning. Your branch will confirm slots.",
  notifyNumber: "",
  branches: Object.fromEntries(ADMISSION_CENTRES.map((c) => [c.id, { address: c.full, phone: "", hours: "Mon–Sat, 10 am – 7 pm", map: "" }])),
});

export async function getBotConfig(): Promise<BotConfig> {
  const d = defaultBotConfig();
  try {
    const saved = JSON.parse(await fs.readFile(CONFIG_FILE, "utf8")) as Partial<BotConfig>;
    return { ...d, ...saved, branches: { ...d.branches, ...(saved.branches ?? {}) } };
  } catch {
    return d;
  }
}

export async function saveBotConfig(p: Partial<BotConfig>): Promise<BotConfig> {
  const cur = await getBotConfig();
  const s = (v: unknown, n: number) => String(v ?? "").slice(0, n);
  const next: BotConfig = {
    enabled: typeof p.enabled === "boolean" ? p.enabled : cur.enabled,
    greeting: p.greeting !== undefined ? s(p.greeting, 500) : cur.greeting,
    courses: Array.isArray(p.courses) ? p.courses.map((c) => s(c, 24).trim()).filter(Boolean).slice(0, 9) : cur.courses,
    faqFees: p.faqFees !== undefined ? s(p.faqFees, 1000) : cur.faqFees,
    faqBatches: p.faqBatches !== undefined ? s(p.faqBatches, 1000) : cur.faqBatches,
    faqTimings: p.faqTimings !== undefined ? s(p.faqTimings, 1000) : cur.faqTimings,
    notifyNumber: p.notifyNumber !== undefined ? s(p.notifyNumber, 20).replace(/\D/g, "") : cur.notifyNumber,
    branches: { ...cur.branches },
  };
  for (const c of ADMISSION_CENTRES) {
    const b = p.branches?.[c.id];
    if (b) next.branches[c.id] = { address: s(b.address, 300), phone: s(b.phone, 30), hours: s(b.hours, 120), map: s(b.map, 300) };
  }
  await fs.writeFile(CONFIG_FILE, JSON.stringify(next, null, 1));
  return next;
}

/* ───────── sessions ───────── */

type Step = "menu" | "name" | "grade" | "branch" | "course" | "admission_branch" | "branches" | "handoff";
interface Session {
  step: Step;
  data: { child?: string; grade?: string; branch?: string; course?: string };
  handoff: boolean;
  at: string;
}

const g = globalThis as unknown as { __botChain?: Promise<unknown> };
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = (g.__botChain ?? Promise.resolve()).then(fn, fn);
  g.__botChain = run.catch(() => undefined);
  return run;
}
async function readSessions(): Promise<Record<string, Session>> {
  try {
    return JSON.parse(await fs.readFile(SESSION_FILE, "utf8"));
  } catch {
    return {};
  }
}
const getSession = async (phone: string): Promise<Session> => (await readSessions())[phone] ?? { step: "menu", data: {}, handoff: false, at: "" };
const putSession = (phone: string, s: Session) =>
  serial(async () => {
    const all = await readSessions();
    all[phone] = { ...s, at: new Date().toISOString() };
    await fs.writeFile(SESSION_FILE, JSON.stringify(all, null, 1));
  });

/** Numbers currently waiting for a human (for the admin screen). */
export async function handoffList() {
  const all = await readSessions();
  return Object.entries(all).filter(([, s]) => s.handoff).map(([phone, s]) => ({ phone, since: s.at }));
}
export async function resumeBot(phone: string) {
  const s = await getSession(phone);
  await putSession(phone, { ...s, handoff: false, step: "menu" });
}

/* ───────── helpers ───────── */

const first = (n?: string) => n?.trim().split(/\s+/)[0] || "";
const digits = (s: string) => s.replace(/\D/g, "");
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const BACK = [{ id: "m:menu", title: "🏠 Main menu" }];

const MENU_ROWS = [
  { id: "m:enquiry", title: "New enquiry", description: "Tell us about your child & course interest" },
  { id: "m:admission", title: "Admission & fees", description: "Admission form, fees, batches, timings" },
  { id: "m:child", title: "My child", description: "Admission status & fee payment links" },
  { id: "m:branches", title: "Our branches", description: "Address, phone, timings, directions" },
  { id: "m:human", title: "Talk to counsellor", description: "A person will reply to you" },
];

const branchRows = () => ADMISSION_CENTRES.map((c) => ({ id: `b:${c.id}`, title: c.name.slice(0, 24), description: c.city }));

type Out = Pick<SendInput, "text" | "buttons" | "list">;

/** Match a typed branch / course when the person types instead of tapping. */
const findBranch = (t: string) => {
  const q = t.trim().toLowerCase();
  if (!q) return undefined;
  return ADMISSION_CENTRES.find((c) => c.id === q || c.name.toLowerCase().includes(q) || q.includes(c.name.split(",")[0].toLowerCase()));
};

/* ───────── the flow ───────── */

export async function handleBotMessage(m: BotInbound, origin: string) {
  const cfg = await getBotConfig();
  const st = await getSettings();
  if (!cfg.enabled || !st.whatsapp.enabled || !st.whatsapp.token) return;

  const sess = await getSession(m.phone);
  const text = m.text.trim();
  const low = text.toLowerCase();
  const id = m.id ?? "";
  const reply = (o: Out) => send({ to: m.phone, name: m.name, event: "bot", respectOptOut: true, ...o }).catch(() => undefined);
  const say = async (o: Out, next: Partial<Session> = {}) => {
    await putSession(m.phone, { ...sess, ...next, data: { ...sess.data, ...(next.data ?? {}) } });
    await reply(o);
  };
  const menu = (intro?: string): Out => ({
    text: intro ?? cfg.greeting.replace("{name}", m.name ? ` ${first(m.name)}` : ""),
    list: { button: "Choose an option", rows: MENU_ROWS },
  });
  const toMenu = (intro?: string) => say(menu(intro), { step: "menu", data: {}, handoff: false });

  // a person is handling this chat — stay quiet until they type MENU / BOT
  if (sess.handoff) {
    if (/^(menu|bot|hi|hello|start over)$/i.test(low) || id === "m:menu") return toMenu();
    return;
  }

  if (id === "m:menu" || /^(menu|hi|hii|hello|hey|start|start over|restart|namaste|vanakkam)$/i.test(low)) return toMenu();

  if (id === "m:human" || /\b(agent|human|counsel+or|call me|talk to (a )?person|speak to)\b/i.test(low)) return handoff(m, sess, cfg, st, say, "asked to talk to a counsellor");

  /* ── main-menu choices ── */
  if (id === "m:enquiry") return say({ text: "Great! Let's get you started. 😊\n\nWhat is your child's name?" }, { step: "name", data: {} });

  if (id === "m:admission")
    return say(
      {
        text: "What would you like to know?",
        list: {
          button: "Choose",
          rows: [
            { id: "a:form", title: "Admission form", description: "Get the form link for a branch" },
            { id: "a:fees", title: "Course fees", description: "Fee information" },
            { id: "a:batches", title: "Batches", description: "Batch details" },
            { id: "a:timings", title: "Class timings", description: "When classes run" },
            { id: "m:menu", title: "Main menu" },
          ],
        },
      },
      { step: "menu" },
    );

  if (id === "a:fees") return say({ text: cfg.faqFees, buttons: [{ id: "m:enquiry", title: "Make an enquiry" }, { id: "m:human", title: "Talk to counsellor" }, ...BACK] });
  if (id === "a:batches") return say({ text: cfg.faqBatches, buttons: [{ id: "m:enquiry", title: "Make an enquiry" }, { id: "m:human", title: "Talk to counsellor" }, ...BACK] });
  if (id === "a:timings") return say({ text: cfg.faqTimings, buttons: [{ id: "m:enquiry", title: "Make an enquiry" }, { id: "m:human", title: "Talk to counsellor" }, ...BACK] });
  if (id === "a:form") return say({ text: "Which branch is the admission for?", list: { button: "Pick a branch", rows: branchRows() } }, { step: "admission_branch" });

  if (id === "m:branches") return say({ text: "Which branch would you like details for?", list: { button: "Pick a branch", rows: branchRows() } }, { step: "branches" });

  if (id === "m:child") return childInfo(m, cfg, origin, say);

  /* ── branch picked (id b:xx) or typed ── */
  const pickedBranch = id.startsWith("b:") ? ADMISSION_CENTRES.find((c) => c.id === id.slice(2)) : sess.step === "branch" || sess.step === "admission_branch" || sess.step === "branches" ? findBranch(text) : undefined;

  if (sess.step === "branches" && pickedBranch) {
    const b = cfg.branches[pickedBranch.id];
    return say(
      {
        text: `📍 *${pickedBranch.name}*\n${b.address}\n${b.phone ? `\n📞 ${b.phone}` : ""}\n🕒 ${b.hours}${b.map ? `\n\n🗺️ Directions: ${b.map}` : ""}`,
        buttons: [{ id: "m:branches", title: "Another branch" }, { id: "m:human", title: "Talk to counsellor" }, ...BACK],
      },
      { step: "menu" },
    );
  }

  if (sess.step === "admission_branch" && pickedBranch) {
    const url = `${origin}/admission/?centre=${pickedBranch.id}`;
    return say(
      { text: `📝 Admission form for *${pickedBranch.name}*:\n${url}\n\nFill it in and our team at the branch will confirm your admission.`, buttons: [{ id: "m:human", title: "Need help?" }, ...BACK] },
      { step: "menu" },
    );
  }

  /* ── enquiry steps ── */
  if (sess.step === "name") {
    if (text.length < 2) return reply({ text: "Please type your child's name." });
    return say({ text: `Nice to meet ${first(text)}! 🎉\n\nWhich class / grade is ${first(text)} in? (e.g. 3rd, UKG)` }, { step: "grade", data: { child: text.slice(0, 60) } });
  }
  if (sess.step === "grade") {
    if (!text) return reply({ text: "Please type the grade, e.g. 3rd." });
    return say({ text: "Which branch is closest to you?", list: { button: "Pick a branch", rows: branchRows() } }, { step: "branch", data: { grade: text.slice(0, 30) } });
  }
  if (sess.step === "branch") {
    if (!pickedBranch) return reply({ text: "Please pick a branch from the list 👇", list: { button: "Pick a branch", rows: branchRows() } });
    const rows = [...cfg.courses.map((c) => ({ id: `c:${c}`, title: c })), { id: "c:Not sure yet", title: "Not sure yet" }].slice(0, 10);
    return say({ text: "Which course is your child interested in?", list: { button: "Pick a course", rows } }, { step: "course", data: { branch: pickedBranch.id } });
  }
  if (sess.step === "course") {
    const course = id.startsWith("c:") ? id.slice(2) : cfg.courses.find((c) => c.toLowerCase() === low) ?? (low ? text.slice(0, 40) : "");
    if (!course) return reply({ text: "Please pick a course from the list 👆" });
    return finishEnquiry(m, { ...sess.data, course }, cfg, st, say);
  }

  // anything else → show the menu again
  return toMenu("Sorry, I didn't get that. Please choose an option 👇");
}

type Say = (o: Out, next?: Partial<Session>) => Promise<unknown>;

async function finishEnquiry(m: BotInbound, d: Session["data"], cfg: BotConfig, st: Awaited<ReturnType<typeof getSettings>>, say: Say) {
  const centre = d.branch ? centreName(d.branch) : "";
  let owner = "";
  try {
    const { lead } = await ingestLead({
      sourceKey: "whatsapp",
      externalId: `wa:${m.phone}`,
      name: m.name,
      phone: m.phone,
      interest: d.course,
      message: `Child: ${d.child} · Grade: ${d.grade} · Branch: ${centre} · Course: ${d.course}`,
      extra: { child: d.child ?? "", grade: d.grade ?? "", branch: centre, course: d.course ?? "", via: "WhatsApp chatbot" },
    });
    owner = lead.owner;
    await updateLead(lead.id, { activity: `Chatbot enquiry — child ${d.child}, grade ${d.grade}, ${centre}, interested in ${d.course}` });
  } catch {
    /* the lead is already created from the first message; carry on */
  }
  await notify(cfg, st, `🔔 New WhatsApp enquiry\nParent: ${m.name || "+" + m.phone}\nChild: ${d.child} (${d.grade})\nBranch: ${centre}\nCourse: ${d.course}\nPhone: +${m.phone}`);
  await say(
    {
      text: `Thank you! ✅ We've noted:\n• Child: ${d.child} (${d.grade})\n• Branch: ${centre}\n• Course: ${d.course}\n\n${owner ? `*${owner}* from our team` : "Our counsellor"} will contact you shortly.`,
      buttons: [{ id: "a:form", title: "Admission form" }, { id: "m:human", title: "Talk to counsellor" }, ...BACK],
    },
    { step: "menu", data: {} },
  );
}

async function handoff(m: BotInbound, sess: Session, cfg: BotConfig, st: Awaited<ReturnType<typeof getSettings>>, say: Say, why: string) {
  try {
    const { lead } = await ingestLead({ sourceKey: "whatsapp", externalId: `wa:${m.phone}`, name: m.name, phone: m.phone, message: "Asked for a counsellor on WhatsApp" });
    await updateLead(lead.id, { activity: `WhatsApp: ${why}. Reply from Admin › WhatsApp.` });
  } catch {}
  await notify(cfg, st, `🙋 WhatsApp handoff\n${m.name || "+" + m.phone} ${why}.\nOpen Admin › WhatsApp to reply. (+${m.phone})`);
  await say({ text: "Sure! 🙋 A counsellor will message you here shortly. You can also type *MENU* anytime to see the options again." }, { step: "handoff", handoff: true });
  void sess;
}

async function notify(cfg: BotConfig, st: Awaited<ReturnType<typeof getSettings>>, text: string) {
  if (!cfg.notifyNumber || !st.whatsapp.token) return;
  await send({ to: cfg.notifyNumber, text, event: "bot" }).catch(() => undefined); // only reaches them if they messaged the bot in the last 24 h
}

async function childInfo(m: BotInbound, cfg: BotConfig, origin: string, say: Say) {
  const last10 = digits(m.phone).slice(-10);
  const kids = (await listStudents()).filter((s) => digits(s.phone).slice(-10) === last10);
  void cfg;
  if (!kids.length) {
    return say(
      { text: "We couldn't find an admission linked to this WhatsApp number. 🤔\nIf you registered with a different number, please talk to our counsellor.", buttons: [{ id: "a:form", title: "Admission form" }, { id: "m:human", title: "Talk to counsellor" }, ...BACK] },
      { step: "menu" },
    );
  }
  const line = (s: StudentRecord) => {
    const open = (s.payLinks ?? []).filter((l) => l.status === "Created");
    const paid = s.payment ? `Paid ${inr(s.payment.amount)} (receipt ${s.payment.receiptNo})` : "No payment received yet";
    return `👦 *${s.studentName}* (${s.grade}) — ${centreName(s.centreId)}\nAdmission: ${s.status}\n${paid}${open.map((l) => `\n💳 Pay ${inr(l.amount)} — ${l.description}\n${l.url}`).join("")}`;
  };
  void origin;
  await say(
    { text: `${kids.slice(0, 3).map(line).join("\n\n")}\n\nFor attendance or fee-ledger questions, please talk to your branch.`, buttons: [{ id: "m:human", title: "Talk to counsellor" }, ...BACK] },
    { step: "menu" },
  );
}

/** Entry point from the webhook: process each inbound message in the background, in order. */
export async function runBot(msgs: BotInbound[], req?: Request) {
  if (!msgs.length) return 0;
  const st = await getSettings();
  const origin = publicOrigin(st, req);
  return enqueue(msgs.map((m) => () => handleBotMessage(m, origin)));
}

export const botIsOn = async () => {
  const [cfg, st] = await Promise.all([getBotConfig(), getSettings()]);
  return cfg.enabled && st.whatsapp.enabled && !!st.whatsapp.token && !!st.whatsapp.phoneNumberId;
};
