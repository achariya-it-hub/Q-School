import { promises as fs } from "fs";
import { type StudentProgress } from "@qschool/shared";
import { dataFile } from "@/lib/data-dir";
import { isDbConfigured, getDbProgress, saveDbProgress, saveDbProgressBulk, deleteDbProgress as deleteDbProg } from "@/lib/db";
import { listStudents } from "@/lib/students/store";

const PROGRESS_FILE = dataFile("student-progress.json");

const DEFAULT_PROGRESS: StudentProgress[] = [
  {
    id: "PRG-0001",
    studentName: "Aarav Sharma",
    age: 9,
    doj: "12 Jul 2026",
    workshop2Days: "Completed",
    programName: "Quantum Speed Reading",
    batch: "Weekend Batch A (10:00 AM)",
    trainerName: "Priya K.",
    noOfClasses: "12 / 16",
    vision: "Level 2 (Numbers & Colors)",
    videoShare1: "Shared",
    symbolOfElements: "50/50 Passed",
    videoShare2: "Shared",
    qHabit: "21-Day Habit Master",
    tracker: "Up to date",
    abacus: "Level 1 Passed",
    centreId: "moolakulam",
    notes: "Active learner, excels in blindfold card recognition.",
    createdAt: "2026-07-12T10:00:00.000Z",
    updatedAt: "2026-10-28T14:30:00.000Z",
  },
  {
    id: "PRG-0002",
    studentName: "Diya Patel",
    age: 8,
    doj: "18 Jul 2026",
    workshop2Days: "Completed",
    programName: "Midbrain Activation",
    batch: "Weekend Batch B (11:30 AM)",
    trainerName: "Rohit M.",
    noOfClasses: "10 / 16",
    vision: "Color & Shape ID",
    videoShare1: "Shared",
    symbolOfElements: "30 Elements",
    videoShare2: "Pending",
    qHabit: "Active (14 Days)",
    tracker: "Up to date",
    abacus: "Beginner",
    centreId: "lawspet",
    notes: "Regular in daily practice, parent shared video on WhatsApp group.",
    createdAt: "2026-07-18T11:30:00.000Z",
    updatedAt: "2026-10-25T11:00:00.000Z",
  },
  {
    id: "PRG-0003",
    studentName: "Rohan Varma",
    age: 11,
    doj: "05 Aug 2026",
    workshop2Days: "Completed",
    programName: "Super Memory & Vedic Math",
    batch: "Weekend Batch A (10:00 AM)",
    trainerName: "Sneha D.",
    noOfClasses: "8 / 16",
    vision: "Blindfold Reading Passed",
    videoShare1: "Shared",
    symbolOfElements: "118/118 Mastered",
    videoShare2: "Shared",
    qHabit: "Active (21 Days)",
    tracker: "Up to date",
    abacus: "Level 2 Passed",
    centreId: "moolakulam",
    notes: "Completed full periodic table element symbols memory test.",
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-10-29T16:20:00.000Z",
  },
  {
    id: "PRG-0004",
    studentName: "Ananya Iyer",
    age: 7,
    doj: "15 Aug 2026",
    workshop2Days: "Pending",
    programName: "Divya Yoga",
    batch: "Weekday Evening (04:30 PM)",
    trainerName: "Arjun V.",
    noOfClasses: "6 / 16",
    vision: "Sensory Awakening",
    videoShare1: "Pending",
    symbolOfElements: "20 Elements",
    videoShare2: "Pending",
    qHabit: "In Progress",
    tracker: "Pending Review",
    abacus: "Level 1",
    centreId: "lawspet",
    notes: "Workshop scheduled for coming weekend.",
    createdAt: "2026-08-15T16:30:00.000Z",
    updatedAt: "2026-10-20T17:00:00.000Z",
  },
  {
    id: "PRG-0005",
    studentName: "Kavya Nair",
    age: 10,
    doj: "02 Sep 2026",
    workshop2Days: "Completed",
    programName: "Quantum Speed Reading",
    batch: "Weekend Batch A (10:00 AM)",
    trainerName: "Priya K.",
    noOfClasses: "14 / 16",
    vision: "Book Page Scan (Level 3)",
    videoShare1: "Shared",
    symbolOfElements: "118/118 Mastered",
    videoShare2: "Shared",
    qHabit: "Habit Champion (30 Days)",
    tracker: "Up to date",
    abacus: "Level 3 Speed Passed",
    centreId: "moolakulam",
    notes: "High speed flipping & content comprehension verified by trainer.",
    createdAt: "2026-09-02T10:00:00.000Z",
    updatedAt: "2026-10-31T18:00:00.000Z",
  },
];

let lock: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const next = lock.then(fn, fn);
  lock = next.catch(() => {});
  return next;
}

async function readFromDisk(): Promise<StudentProgress[]> {
  try {
    const raw = await fs.readFile(PROGRESS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return [];
}

async function writeToDisk(items: StudentProgress[]): Promise<void> {
  try {
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    console.warn("[progress-store] disk write error:", err);
  }
}

async function readAll(): Promise<StudentProgress[]> {
  // Check Database first if configured
  if (isDbConfigured()) {
    try {
      const dbItems = await getDbProgress();
      if (Array.isArray(dbItems) && dbItems.length > 0) {
        return dbItems;
      }
    } catch (e) {
      console.warn("[progress-store] DB read failed, falling back to disk:", e);
    }
  }

  // Fallback to disk
  let diskItems = await readFromDisk();
  if (diskItems.length === 0) {
    diskItems = DEFAULT_PROGRESS;
    await writeToDisk(diskItems);
    if (isDbConfigured()) {
      void saveDbProgressBulk(diskItems);
    }
  }
  return diskItems;
}

export async function listProgress(centreId?: string): Promise<StudentProgress[]> {
  return serial(async () => {
    const all = await readAll();
    const filtered = centreId && centreId !== "all" ? all.filter((p) => p.centreId === centreId) : all;
    return filtered.sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""));
  });
}

export async function getProgress(id: string): Promise<StudentProgress | null> {
  return serial(async () => {
    const all = await readAll();
    return all.find((p) => p.id === id) ?? null;
  });
}

export async function saveProgress(
  data: Partial<StudentProgress> & { studentName: string }
): Promise<StudentProgress> {
  return serial(async () => {
    const all = await readAll();
    const now = new Date().toISOString();

    if (data.id) {
      const idx = all.findIndex((p) => p.id === data.id);
      if (idx >= 0) {
        const updated: StudentProgress = {
          ...all[idx],
          ...data,
          updatedAt: now,
        };
        all[idx] = updated;
        await writeToDisk(all);
        if (isDbConfigured()) {
          void saveDbProgress(updated);
        }
        return updated;
      }
    }

    // Create new
    const nextNum = all.reduce((max, p) => Math.max(max, parseInt(p.id.replace(/\D/g, ""), 10) || 0), 0) + 1;
    const newId = `PRG-${String(nextNum).padStart(4, "0")}`;

    const item: StudentProgress = {
      id: newId,
      studentId: data.studentId,
      studentName: data.studentName.trim(),
      age: data.age ?? "8 yrs",
      doj: data.doj ?? new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      workshop2Days: data.workshop2Days ?? "Completed",
      programName: data.programName ?? "Quantum Speed Reading",
      batch: data.batch ?? "Weekend Batch A",
      trainerName: data.trainerName ?? "Priya K.",
      noOfClasses: data.noOfClasses ?? "1 / 16",
      vision: data.vision ?? "Level 1 (Colors)",
      videoShare1: data.videoShare1 ?? "Pending",
      symbolOfElements: data.symbolOfElements ?? "Pending",
      videoShare2: data.videoShare2 ?? "Pending",
      qHabit: data.qHabit ?? "Active",
      tracker: data.tracker ?? "Logged",
      abacus: data.abacus ?? "Beginner",
      centreId: data.centreId || "moolakulam",
      notes: data.notes || "",
      createdAt: now,
      updatedAt: now,
    };

    all.unshift(item);
    await writeToDisk(all);
    if (isDbConfigured()) {
      void saveDbProgress(item);
    }
    return item;
  });
}

export async function deleteProgress(id: string): Promise<boolean> {
  return serial(async () => {
    const all = await readAll();
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    await writeToDisk(filtered);
    if (isDbConfigured()) {
      void deleteDbProg(id);
    }
    return true;
  });
}

/**
 * Automatically populates progress tracker from registered student admissions.
 * Any admitted active student who does not yet have a progress entry is created with starter levels.
 */
export async function syncFromAdmissions(): Promise<{ added: number; total: number }> {
  return serial(async () => {
    const students = await listStudents();
    const all = await readAll();
    let added = 0;
    const now = new Date().toISOString();

    for (const s of students) {
      const exists = all.some(
        (p) => (p.studentId && p.studentId === s.id) || p.studentName.toLowerCase() === s.studentName.toLowerCase()
      );
      if (!exists) {
        const nextNum = all.reduce((max, p) => Math.max(max, parseInt(p.id.replace(/\D/g, ""), 10) || 0), 0) + 1;
        const newId = `PRG-${String(nextNum).padStart(4, "0")}`;
        const doj = s.createdAt
          ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : "Recently";

        const item: StudentProgress = {
          id: newId,
          studentId: s.id,
          studentName: s.studentName,
          age: s.age ? `${s.age} yrs` : "8 yrs",
          doj,
          workshop2Days: s.status === "Active" ? "Completed" : "Scheduled",
          programName: "Quantum Speed Reading",
          batch: "Weekend Batch A",
          trainerName: "Priya K.",
          noOfClasses: s.status === "Active" ? "4 / 16" : "0 / 16",
          vision: "Level 1 (Colors)",
          videoShare1: "Pending",
          symbolOfElements: "Pending",
          videoShare2: "Pending",
          qHabit: "Active",
          tracker: "Daily Logged",
          abacus: "Beginner",
          centreId: s.centreId,
          notes: `Enrolled via admissions (${s.id})`,
          createdAt: now,
          updatedAt: now,
        };

        all.push(item);
        added++;
      }
    }

    if (added > 0) {
      await writeToDisk(all);
      if (isDbConfigured()) {
        void saveDbProgressBulk(all);
      }
    }

    return { added, total: all.length };
  });
}

