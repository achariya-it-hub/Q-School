/**
 * CRM Events & Footfall Store (server-only).
 * File-backed persistence in DATA_DIR:
 *   crm-events.json     — event definitions and metadata
 *   crm-attendees.json  — registrations, attendees and footfall check-ins
 */
import { promises as fs } from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/data-dir";
import { ingestLead } from "./store";

const EVENTS_FILE = path.join(DATA_DIR, "crm-events.json");
const ATTENDEES_FILE = path.join(DATA_DIR, "crm-attendees.json");

export type EventType = "bmit" | "workshop" | "seminar" | "webinar" | "open_day" | "competition" | "other";
export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type EventMode = "offline" | "online" | "hybrid";

export interface CrmEvent {
  id: string;
  name: string;
  code: string; // unique slug e.g. "bmit", "q-parenting"
  type: EventType;
  description?: string;
  startDate: string; // ISO date or YYYY-MM-DD
  endDate?: string;
  time?: string; // e.g. "10:00 AM - 1:00 PM"
  mode: EventMode;
  venue?: string;
  centreId?: string;
  targetAudience?: string;
  capacity?: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventStats {
  totalRegistrations: number;
  totalAttended: number; // actual footfall
  turnoutPct: number;
  bmitCount: number;
  workshopCount: number;
}

export interface EventWithStats extends CrmEvent {
  stats: EventStats;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  eventCode: string;
  parentName: string;
  phone: string;
  email?: string;
  city?: string;
  profession?: string;
  childName?: string;
  childAge?: string;
  grade?: string;
  school?: string;
  notes?: string;
  source?: string;
  salesPerson?: string;
  attended: boolean; // Footfall flag
  attendedAt?: string;
  status: "registered" | "attended" | "cancelled" | "no_show";
  bmitInterest?: boolean;
  workshopInterest?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewEventInput {
  name: string;
  code?: string;
  type: EventType;
  description?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  mode?: EventMode;
  venue?: string;
  centreId?: string;
  targetAudience?: string;
  capacity?: number;
  status?: EventStatus;
}

export interface NewAttendeeInput {
  eventId?: string;
  eventCode?: string;
  parentName: string;
  phone: string;
  email?: string;
  city?: string;
  profession?: string;
  childName?: string;
  childAge?: string;
  grade?: string;
  school?: string;
  notes?: string;
  source?: string;
  salesPerson?: string;
  attended?: boolean;
  bmitInterest?: boolean;
  workshopInterest?: boolean;
  syncToCrmLead?: boolean;
}

let chain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

const DEFAULT_EVENTS: CrmEvent[] = [
  {
    id: "ev_bmit",
    name: "Brain Mapping Intelligence Test (BMIT) Assessment",
    code: "bmit",
    type: "bmit",
    description: "Free Brain Mapping Intelligence Test for school students to evaluate cognitive patterns, hemispheric dominance, and learning styles.",
    startDate: new Date().toISOString().split("T")[0],
    time: "Flexible / By Appointment",
    mode: "hybrid",
    venue: "Q-School Learning Centres & Virtual Session",
    targetAudience: "Parents & Students (Grades 1 to 12)",
    capacity: 500,
    status: "ongoing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ev_parenting_workshop",
    name: "2-Hour Online Q-Parenting Workshop",
    code: "q-parenting",
    type: "workshop",
    description: "Expert-guided interactive session on futuristic parenting, emotional intelligence, and holistic development for children.",
    startDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    time: "10:30 AM - 12:30 PM",
    mode: "online",
    venue: "Zoom Live Webinar",
    targetAudience: "Parents of School-going Children",
    capacity: 300,
    status: "upcoming",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function readEvents(): Promise<CrmEvent[]> {
  const events = await readJson<CrmEvent[] | null>(EVENTS_FILE, null);
  if (events && Array.isArray(events)) return events;
  await writeJson(EVENTS_FILE, []);
  return [];
}

async function readAttendees(): Promise<EventAttendee[]> {
  return readJson<EventAttendee[]>(ATTENDEES_FILE, []);
}

export function computeStats(attendees: EventAttendee[], eventId: string): EventStats {
  const list = attendees.filter((a) => a.eventId === eventId);
  const totalRegistrations = list.length;
  const totalAttended = list.filter((a) => a.attended || a.status === "attended").length;
  const turnoutPct = totalRegistrations ? Math.round((totalAttended / totalRegistrations) * 100) : 0;
  const bmitCount = list.filter((a) => a.bmitInterest).length;
  const workshopCount = list.filter((a) => a.workshopInterest).length;

  return {
    totalRegistrations,
    totalAttended,
    turnoutPct,
    bmitCount,
    workshopCount,
  };
}

export async function listEvents(): Promise<EventWithStats[]> {
  const [events, attendees] = await Promise.all([readEvents(), readAttendees()]);
  return events.map((ev) => ({
    ...ev,
    stats: computeStats(attendees, ev.id),
  }));
}

export async function getEvent(idOrCode: string): Promise<EventWithStats | null> {
  const [events, attendees] = await Promise.all([readEvents(), readAttendees()]);
  const ev = events.find((e) => e.id === idOrCode || e.code === idOrCode.toLowerCase());
  if (!ev) return null;
  return {
    ...ev,
    stats: computeStats(attendees, ev.id),
  };
}

export function createEvent(input: NewEventInput): Promise<CrmEvent> {
  return serial(async () => {
    const events = await readEvents();
    const id = `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const baseCode = (input.code || input.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    // Ensure code uniqueness
    let code = baseCode;
    let counter = 1;
    while (events.some((e) => e.code === code)) {
      code = `${baseCode}-${counter++}`;
    }

    const newEv: CrmEvent = {
      id,
      name: input.name.trim(),
      code,
      type: input.type,
      description: input.description?.trim(),
      startDate: input.startDate || new Date().toISOString().split("T")[0],
      endDate: input.endDate,
      time: input.time?.trim(),
      mode: input.mode || "hybrid",
      venue: input.venue?.trim(),
      centreId: input.centreId,
      targetAudience: input.targetAudience?.trim(),
      capacity: input.capacity ? Number(input.capacity) : undefined,
      status: input.status || "upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    events.unshift(newEv);
    await writeJson(EVENTS_FILE, events);
    return newEv;
  });
}

export function updateEvent(id: string, patch: Partial<CrmEvent>): Promise<CrmEvent | null> {
  return serial(async () => {
    const events = await readEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx < 0) return null;

    events[idx] = {
      ...events[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await writeJson(EVENTS_FILE, events);
    return events[idx];
  });
}

export function deleteEvent(id: string): Promise<boolean> {
  return serial(async () => {
    const events = await readEvents();
    const filtered = events.filter((e) => e.id !== id);
    if (filtered.length === events.length) return false;
    await writeJson(EVENTS_FILE, filtered);

    // Also remove attendees for this event
    const attendees = await readAttendees();
    const remainingAttendees = attendees.filter((a) => a.eventId !== id);
    await writeJson(ATTENDEES_FILE, remainingAttendees);
    return true;
  });
}

/* ───────── Attendees & Footfall ───────── */

export async function listAttendees(eventId?: string): Promise<EventAttendee[]> {
  const all = await readAttendees();
  const filtered = eventId ? all.filter((a) => a.eventId === eventId) : all;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

const cleanPhone = (p?: string) => (p || "").replace(/\D/g, "").slice(-10);

export function addAttendee(input: NewAttendeeInput): Promise<{ attendee: EventAttendee; isDuplicate: boolean; event: CrmEvent }> {
  return serial(async () => {
    const events = await readEvents();
    let ev = events.find((e) => e.id === input.eventId || (input.eventCode && e.code === input.eventCode.toLowerCase()));

    // Fallback to primary event (BMIT) if not specified
    if (!ev) {
      ev = events[0] || DEFAULT_EVENTS[0];
    }

    const attendees = await readAttendees();
    const phoneDigits = cleanPhone(input.phone);

    // Check duplicate by eventId and phone
    const existing = attendees.find((a) => a.eventId === ev!.id && cleanPhone(a.phone) === phoneDigits && phoneDigits.length >= 10);

    if (existing) {
      // Update existing if new details provided
      existing.parentName = input.parentName || existing.parentName;
      existing.childName = input.childName || existing.childName;
      existing.grade = input.grade || existing.grade;
      existing.school = input.school || existing.school;
      existing.city = input.city || existing.city;
      existing.profession = input.profession || existing.profession;
      if (input.attended) {
        existing.attended = true;
        existing.status = "attended";
        existing.attendedAt = existing.attendedAt || new Date().toISOString();
      }
      existing.updatedAt = new Date().toISOString();
      await writeJson(ATTENDEES_FILE, attendees);
      return { attendee: existing, isDuplicate: true, event: ev! };
    }

    const id = `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const isAttended = !!input.attended;

    const newAttendee: EventAttendee = {
      id,
      eventId: ev.id,
      eventCode: ev.code,
      parentName: input.parentName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim().toLowerCase(),
      city: input.city?.trim(),
      profession: input.profession?.trim(),
      childName: input.childName?.trim(),
      childAge: input.childAge?.trim(),
      grade: input.grade?.trim(),
      school: input.school?.trim(),
      notes: input.notes?.trim(),
      source: input.source || (ev.code === "bmit" ? "BMIT Registration Form" : "Event Registration"),
      salesPerson: input.salesPerson?.trim(),
      attended: isAttended,
      attendedAt: isAttended ? new Date().toISOString() : undefined,
      status: isAttended ? "attended" : "registered",
      bmitInterest: input.bmitInterest !== undefined ? input.bmitInterest : ev.type === "bmit",
      workshopInterest: input.workshopInterest !== undefined ? input.workshopInterest : ev.type === "workshop",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    attendees.unshift(newAttendee);
    await writeJson(ATTENDEES_FILE, attendees);

    // Optionally sync into CRM Leads pipeline so counsellor can follow up!
    if (input.syncToCrmLead !== false) {
      try {
        await ingestLead({
          sourceKey: "website",
          source: `Event: ${ev.name}`,
          name: input.parentName.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim(),
          interest: `${ev.name}${input.grade ? ` (Grade: ${input.grade})` : ""}`,
          campaign: ev.code,
          formName: ev.name,
          message: `Child: ${input.childName || "Not specified"} | School: ${input.school || "Not specified"} | City: ${input.city || "Not specified"}`,
          extra: {
            childName: input.childName || "",
            grade: input.grade || "",
            school: input.school || "",
            city: input.city || "",
            profession: input.profession || "",
            eventCode: ev.code,
            attended: isAttended ? "Yes" : "No",
          },
        });
      } catch (err) {
        console.warn("[events-store] CRM lead ingest failed:", (err as Error).message);
      }
    }

    return { attendee: newAttendee, isDuplicate: false, event: ev };
  });
}

export function toggleAttendance(attendeeId: string, forceAttended?: boolean): Promise<EventAttendee | null> {
  return serial(async () => {
    const attendees = await readAttendees();
    const attendee = attendees.find((a) => a.id === attendeeId);
    if (!attendee) return null;

    const nextState = forceAttended !== undefined ? forceAttended : !attendee.attended;
    attendee.attended = nextState;
    attendee.status = nextState ? "attended" : "registered";
    attendee.attendedAt = nextState ? new Date().toISOString() : undefined;
    attendee.updatedAt = new Date().toISOString();

    await writeJson(ATTENDEES_FILE, attendees);
    return attendee;
  });
}

export function deleteAttendee(attendeeId: string): Promise<boolean> {
  return serial(async () => {
    const attendees = await readAttendees();
    const filtered = attendees.filter((a) => a.id !== attendeeId);
    if (filtered.length === attendees.length) return false;
    await writeJson(ATTENDEES_FILE, filtered);
    return true;
  });
}
