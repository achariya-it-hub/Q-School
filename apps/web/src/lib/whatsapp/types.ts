/** WhatsApp shared types and the message templates the app uses (safe for client and server). */

export type WaEvent =
  | "live_registered"
  | "live_reminder"
  | "live_starting"
  | "live_changed"
  | "live_cancelled"
  | "live_replay"
  | "invoice"
  | "receipt"
  | "fee_reminder"
  | "lead_welcome";

export interface WaEventDef {
  label: string;
  group: "Live sessions" | "Bills & payments" | "CRM";
  when: string;
  template: string; // default template name
  vars: string[]; // what {{1}}, {{2}}… mean, in order
  body: string; // suggested template text (submitted to Meta for approval)
  example: string[];
  automatic: boolean; // sent by the app on its own (vs a button in the Console)
}

export const WA_EVENTS: Record<WaEvent, WaEventDef> = {
  live_registered: {
    label: "Registration confirmed",
    group: "Live sessions",
    when: "As soon as someone registers on the website",
    template: "qs_live_registered",
    vars: ["Student name", "Session title", "Date & time", "Personal join link"],
    body: "Hi {{1}}, you're registered for {{2}} on {{3}}. Your personal join link is {{4}} — please don't share it. See you there!",
    example: ["Ananya", "Future of AI in Education", "Sat 3 Oct, 5:00 pm IST", "https://qschool.in/live/join/AbC123"],
    automatic: true,
  },
  live_reminder: {
    label: "Reminder before the session",
    group: "Live sessions",
    when: "At the reminder times you choose (for example 1 day and 1 hour before)",
    template: "qs_live_reminder",
    vars: ["Student name", "Session title", "When (e.g. “tomorrow at 5:00 pm IST”)", "Personal join link"],
    body: "Hi {{1}}, a quick reminder: {{2}} starts {{3}}. Join with your link {{4}} — it opens 15 minutes before the start.",
    example: ["Ananya", "Future of AI in Education", "tomorrow at 5:00 pm IST", "https://qschool.in/live/join/AbC123"],
    automatic: true,
  },
  live_starting: {
    label: "Starting now",
    group: "Live sessions",
    when: "When the host clicks Start",
    template: "qs_live_starting",
    vars: ["Student name", "Session title", "Personal join link"],
    body: "Hi {{1}}, {{2}} is starting now. Join here: {{3}} — see you inside!",
    example: ["Ananya", "Future of AI in Education", "https://qschool.in/live/join/AbC123"],
    automatic: true,
  },
  live_changed: {
    label: "Date or time changed",
    group: "Live sessions",
    when: "When you move a session to a new date or time",
    template: "qs_live_changed",
    vars: ["Student name", "Session title", "New date & time", "Personal join link"],
    body: "Hi {{1}}, {{2}} has moved to {{3}}. Your join link stays the same: {{4}} — see you then.",
    example: ["Ananya", "Future of AI in Education", "Sun 4 Oct, 6:00 pm IST", "https://qschool.in/live/join/AbC123"],
    automatic: true,
  },
  live_cancelled: {
    label: "Session cancelled",
    group: "Live sessions",
    when: "When you cancel a session",
    template: "qs_live_cancelled",
    vars: ["Student name", "Session title", "Original date & time"],
    body: "Hi {{1}}, we're sorry: {{2}} planned for {{3}} has been cancelled. We'll message you when there is a new date.",
    example: ["Ananya", "Future of AI in Education", "Sat 3 Oct, 5:00 pm IST"],
    automatic: true,
  },
  live_replay: {
    label: "Recording ready",
    group: "Live sessions",
    when: "When you show the replay on the website",
    template: "qs_live_replay",
    vars: ["Student name", "Session title", "Replay link"],
    body: "Hi {{1}}, the recording of {{2}} is ready. Watch it here: {{3}} — thank you for joining us.",
    example: ["Ananya", "Future of AI in Education", "https://qschool.in/live"],
    automatic: true,
  },
  invoice: {
    label: "Invoice / bill",
    group: "Bills & payments",
    when: "When you click Send on WhatsApp on an invoice",
    template: "qs_invoice",
    vars: ["Name", "Invoice number", "Towards", "Amount", "Due date", "Invoice link"],
    body: "Hi {{1}}, invoice {{2}} for {{3}} is ready. Amount {{4}}, due {{5}}. View or download it here: {{6}} — thank you.",
    example: ["Ananya", "INV-2026-0142", "Robotics Workshop", "₹4,999", "10 Oct 2026", "https://qschool.in/d/AbC123"],
    automatic: false,
  },
  receipt: {
    label: "Payment receipt",
    group: "Bills & payments",
    when: "When you click Send on WhatsApp on a receipt",
    template: "qs_receipt",
    vars: ["Name", "Amount", "Towards", "Receipt number", "Receipt link"],
    body: "Hi {{1}}, we've received your payment of {{2}} towards {{3}}. Receipt {{4}}: {{5}} — thank you!",
    example: ["Ananya", "₹4,999", "Robotics Workshop", "RCP-2026-0311", "https://qschool.in/d/AbC123"],
    automatic: false,
  },
  fee_reminder: {
    label: "Fee reminder",
    group: "Bills & payments",
    when: "When you click Remind on Fees & Receivables",
    template: "qs_fee_reminder",
    vars: ["Name", "Amount", "Towards", "Due date", "Contact number"],
    body: "Hi {{1}}, a gentle reminder that {{2}} for {{3}} is due on {{4}}. For help with payment, call or WhatsApp {{5}}. Please ignore this if already paid.",
    example: ["Ananya", "₹4,999", "Coding for Beginners (instalment 2)", "10 Oct 2026", "+91 90000 00000"],
    automatic: false,
  },
  lead_welcome: {
    label: "New enquiry welcome",
    group: "CRM",
    when: "When a new lead arrives from Meta, Google Ads, the website or a webhook",
    template: "qs_lead_welcome",
    vars: ["Name", "Course or interest", "School name"],
    body: "Hi {{1}}, thank you for your interest in {{2}} at {{3}}. Our counsellor will contact you shortly. Reply here with any questions.",
    example: ["Ananya", "Robotics Workshop", "Q-School"],
    automatic: true,
  },
};

export const WA_EVENT_KEYS = Object.keys(WA_EVENTS) as WaEvent[];

export type WaStatus = "sending" | "sent" | "delivered" | "read" | "failed" | "received";

export interface WaMessage {
  id: string;
  wamid?: string;
  dir: "out" | "in";
  phone: string; // digits with country code, e.g. 919845011122
  name?: string;
  kind: "template" | "text";
  template?: string;
  text: string; // what the person sees (rendered template or the text)
  event?: WaEvent | "broadcast" | "manual" | "auto_reply" | "bot";
  ref?: string; // lead id, session id, invoice/receipt number…
  status: WaStatus;
  error?: string;
  at: string;
  updatedAt?: string;
}

export interface WaTemplate {
  name: string;
  language: string;
  status: string; // APPROVED, PENDING, REJECTED, PAUSED…
  category: string;
  body: string;
  header?: string;
  footer?: string;
  buttons?: string[];
  params: number;
}

/** Fill {{1}}, {{2}}… with values. */
export function renderTemplate(body: string, params: string[]) {
  return body.replace(/\{\{(\d+)\}\}/g, (_m, n) => params[Number(n) - 1] ?? `{{${n}}}`);
}

export const countParams = (body: string) => {
  const nums = Array.from(body.matchAll(/\{\{(\d+)\}\}/g), (m) => Number(m[1]));
  return nums.length ? Math.max(...nums) : 0;
};

/** India-first phone normalisation to WhatsApp's format: digits only, with country code. */
export function waPhone(raw: string, country = "91") {
  const d = (raw || "").replace(/\D/g, "").replace(/^0+/, "");
  if (!d) return "";
  if ((raw || "").trim().startsWith("+")) return d;
  if (d.length === 10) return `${country}${d}`;
  return d;
}

export const prettyWa = (p: string) => {
  const m = p.match(/^91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : `+${p}`;
};
