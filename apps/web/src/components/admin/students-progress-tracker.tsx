"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ADMISSION_CENTRES, AGENTS, QSCHOOL_PROGRAMS, centreName, type StudentProgress, type StudentRecord } from "@qschool/shared";
import { Btn, Card, DataGrid, Field, Figure, Modal, SearchInput, StatusBadge, Toast, inputCls, useToast } from "@/components/admin/ui";
import { downloadCsv } from "@/components/admin/store";
import { Icon } from "@/components/icons";

const PROGRAM_OPTIONS = [
  "Quantum Speed Reading",
  "Midbrain Activation",
  "Super Memory & Vedic Math",
  "Divya Yoga",
  "Divya Mantra",
  "Divya Mudra",
  "Divya Tratak",
  "Abacus & Mental Math",
  ...QSCHOOL_PROGRAMS.map((p) => p.name),
].filter((v, i, a) => a.indexOf(v) === i);

const VISION_OPTIONS = [
  "Level 1 (Color & Shape ID)",
  "Level 2 (Numbers & Cards)",
  "Level 3 (Word & Sentence Reading)",
  "Blindfold Reading Passed",
  "Book Page Scanning",
  "Sensory Awakening",
  "In Progress",
  "Pending Assessment",
];

const VIDEO_OPTIONS = ["Shared", "Pending", "Parent Approved", "Uploaded to LMS", "Not Started"];

const ELEMENTS_OPTIONS = [
  "118/118 Mastered",
  "50/50 Passed",
  "30 Elements",
  "20 Elements",
  "Level 1 Passed",
  "In Progress",
  "Pending",
];

const QHABIT_OPTIONS = [
  "21-Day Habit Master",
  "Habit Champion (30 Days)",
  "Active (Streak 15+ Days)",
  "Active (Streak 7+ Days)",
  "In Progress",
  "Needs Improvement",
];

const TRACKER_OPTIONS = ["Up to date", "Daily Logged", "Weekly Logged", "Pending Review", "Incomplete"];

const ABACUS_OPTIONS = [
  "Level 1 Passed",
  "Level 2 Passed",
  "Level 3 Speed Passed",
  "Level 4 Advanced",
  "Mental Math Speedster",
  "Beginner",
  "Not Applicable",
];

const PROGRESS_CACHE_KEY = "qs_progress_tracker_cache";

function getCachedProgress(): StudentProgress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROGRESS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveCachedProgress(items: StudentProgress[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(items));
  } catch {}
}

export function StudentsProgressTracker({ mode = "admin" }: { mode?: "admin" | "centre" }) {
  const [items, setItems] = useState<StudentProgress[]>(getCachedProgress);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [q, setQ] = useState("");
  const [progFilter, setProgFilter] = useState("all");
  const [centreFilter, setCentreFilter] = useState("all");
  const [workshopFilter, setWorkshopFilter] = useState("all");
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [editItem, setEditItem] = useState<Partial<StudentProgress> | null>(null);
  const [toast, show] = useToast();

  const loadProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/students/progress", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && Array.isArray(data.items)) {
        setItems((prev) => {
          if (!data.items || data.items.length === 0) {
            saveCachedProgress([]);
            return [];
          }
          // Merge preserving any locally edited items that still exist on server
          const serverIds = new Set(data.items.map((it: StudentProgress) => it.id));
          const map = new Map<string, StudentProgress>();
          for (const it of prev) {
            if (serverIds.has(it.id)) map.set(it.id, it);
          }
          for (const it of data.items) map.set(it.id, it);
          const merged = Array.from(map.values());
          saveCachedProgress(merged);
          return merged;
        });
      }
    } catch (err) {
      console.warn("Failed to load progress records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadProgress();
    loadAdmissions();
  }, [loadProgress, loadAdmissions]);

  // Filtered rows
  const filtered = useMemo(() => {
    return items
      .filter((p) => progFilter === "all" || p.programName === progFilter)
      .filter((p) => centreFilter === "all" || p.centreId === centreFilter)
      .filter((p) => workshopFilter === "all" || p.workshop2Days.toLowerCase().includes(workshopFilter.toLowerCase()))
      .filter((p) => trainerFilter === "all" || p.trainerName === trainerFilter)
      .filter((p) =>
        `${p.studentName} ${p.programName} ${p.trainerName} ${p.batch} ${p.vision} ${p.abacus} ${p.id}`
          .toLowerCase()
          .includes(q.toLowerCase())
      );
  }, [items, progFilter, centreFilter, workshopFilter, trainerFilter, q]);

  // Statistics
  const totalCount = items.length;
  const workshopCompleted = items.filter((p) => p.workshop2Days?.toLowerCase().includes("complete")).length;
  const videosShared = items.filter((p) => p.videoShare1 === "Shared" || p.videoShare2 === "Shared").length;
  const habitsActive = items.filter((p) => p.qHabit?.toLowerCase().includes("master") || p.qHabit?.toLowerCase().includes("active")).length;

  const handleSave = async (record: Partial<StudentProgress>) => {
    if (!record.studentName?.trim()) {
      return show("Student name is required");
    }
    try {
      const isUpdate = Boolean(record.id);
      const res = await fetch("/api/students/progress", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return show(data.error || "Failed to save record");
      }
      show(isUpdate ? `Updated progress for ${record.studentName}` : `Added ${record.studentName} to tracker`);
      setEditItem(null);
      if (data.item) {
        setItems((prev) => {
          const exists = prev.some((p) => p.id === data.item.id);
          const next = exists ? prev.map((p) => (p.id === data.item.id ? data.item : p)) : [data.item, ...prev];
          saveCachedProgress(next);
          return next;
        });
      }
      await loadProgress();
    } catch (err) {
      show("Network error saving record");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the Progress Tracker?`)) return;
    try {
      const res = await fetch(`/api/students/progress?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        show(`Removed ${name} from tracker`);
        setItems((prev) => {
          const next = prev.filter((p) => p.id !== id);
          saveCachedProgress(next);
          return next;
        });
      } else {
        show(data.error || "Could not delete record");
      }
    } catch {
      show("Network error deleting record");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/students/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      const data = await res.json();
      if (data.ok) {
        show(data.added > 0 ? `Synced ${data.added} new enrolled students into tracker!` : "All enrolled students are already on the tracker.");
        if (data.items) setItems(data.items);
      } else {
        show(data.error || "Sync failed");
      }
    } catch {
      show("Sync request failed");
    } finally {
      setSyncing(false);
    }
  };

  const exportTrackerCsv = () => {
    downloadCsv(
      "qschool-progress-tracker.csv",
      [
        "Students Name",
        "Age",
        "DOJ",
        "2 Days workshop",
        "Program Name",
        "Batch",
        "Trainer Name",
        "No.of class",
        "Vision",
        "Video share 1",
        "Symbol of elements",
        "Video share 2",
        "Q-Habit",
        "Tracker",
        "ABACUS",
        "Centre",
        "Notes",
      ],
      filtered.map((p) => [
        p.studentName,
        String(p.age),
        p.doj,
        p.workshop2Days,
        p.programName,
        p.batch,
        p.trainerName,
        String(p.noOfClasses),
        p.vision,
        p.videoShare1,
        p.symbolOfElements,
        p.videoShare2,
        p.qHabit,
        p.tracker,
        p.abacus,
        p.centreId ? centreName(p.centreId) : "—",
        p.notes || "",
      ])
    );
  };

  return (
    <div className="space-y-5">
      {/* Exact Header Banner matching user screenshot */}
      <div className="w-full rounded-2xl border-2 border-yellow-400 bg-[#FFFF00] p-3 text-center shadow-sm">
        <h2 className="text-base sm:text-lg font-black tracking-widest text-black uppercase">
          Q-SCHOOL PROGRESS TRACKER
        </h2>
        <p className="text-[11.5px] font-bold text-gray-800 tracking-wide mt-0.5">
          Student Achievement Levels, Sensory Vision Milestones, Element Symbols & Q-Habit Matrix
        </p>
      </div>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Figure label="Students Tracked" value={String(totalCount)} sub="Active in progression" icon="users" />
        <Figure label="2-Day Workshop" value={`${workshopCompleted} / ${totalCount}`} sub="Foundational induction completed" icon="checkCircle" />
        <Figure label="Video Milestones" value={String(videosShared)} sub="Parent & group shares verified" icon="play" />
        <Figure label="Q-Habit Active" value={String(habitsActive)} sub="Daily habit streaks maintained" icon="star" />
      </section>

      {/* Controls & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Search student, trainer, batch, program…"
            />

            <select
              aria-label="Filter Program"
              value={progFilter}
              onChange={(e) => setProgFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#E2ECE9] bg-white px-3 text-[12.5px] font-medium text-brand-ink outline-none focus:border-brand-teal"
            >
              <option value="all">All Programs</option>
              {PROGRAM_OPTIONS.map((prg) => (
                <option key={prg} value={prg}>
                  {prg}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter Workshop"
              value={workshopFilter}
              onChange={(e) => setWorkshopFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#E2ECE9] bg-white px-3 text-[12.5px] font-medium text-brand-ink outline-none focus:border-brand-teal"
            >
              <option value="all">All Workshops</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="attended">Attended</option>
            </select>

            {mode === "admin" && (
              <select
                aria-label="Filter Centre"
                value={centreFilter}
                onChange={(e) => setCentreFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#E2ECE9] bg-white px-3 text-[12.5px] font-medium text-brand-ink outline-none focus:border-brand-teal"
              >
                <option value="all">All Centres</option>
                {ADMISSION_CENTRES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <select
              aria-label="Filter Trainer"
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#E2ECE9] bg-white px-3 text-[12.5px] font-medium text-brand-ink outline-none focus:border-brand-teal"
            >
              <option value="all">All Trainers</option>
              {AGENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              disabled={syncing}
              onClick={handleSync}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-teal-200 bg-[#E8F5F1] px-3.5 text-[12.5px] font-bold text-[#054038] hover:bg-[#D4EFE8] transition"
              title="Auto-import any newly admitted students into the progress tracker"
            >
              <Icon name="switch" size={14} className={syncing ? "animate-spin" : ""} />
              <span>{syncing ? "Syncing…" : "Sync Enrolled Students"}</span>
            </button>

            <Btn variant="ghost" icon="download" onClick={exportTrackerCsv}>
              Export CSV
            </Btn>

            <Btn
              icon="plus"
              onClick={() =>
                setEditItem({
                  studentName: "",
                  age: 8,
                  doj: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                  workshop2Days: "Completed",
                  programName: "Quantum Speed Reading",
                  batch: "Weekend Batch A (10:00 AM)",
                  trainerName: AGENTS[0],
                  noOfClasses: "1 / 16",
                  vision: "Level 1 (Color & Shape ID)",
                  videoShare1: "Pending",
                  symbolOfElements: "Pending",
                  videoShare2: "Pending",
                  qHabit: "Active",
                  tracker: "Daily Logged",
                  abacus: "Beginner",
                  centreId: ADMISSION_CENTRES[0].id,
                })
              }
            >
              Add Student
            </Btn>
          </div>
        </div>

        {/* The Two-Tier Progress Grid */}
        <div className="overflow-x-auto rounded-xl border border-[#D0DFDB]">
          <table className="w-full text-left text-xs border-collapse min-w-[1450px]">
            <thead>
              {/* Row 1 Header */}
              <tr className="border-b border-[#D0DFDB] text-brand-ink">
                <th rowSpan={2} className="bg-[#FDEBD0] px-3 py-2.5 font-black border-r border-[#E5D7CE] whitespace-nowrap">
                  Students Name
                </th>
                <th rowSpan={2} className="bg-[#FDEBD0] px-2.5 py-2.5 font-bold border-r border-[#E5D7CE] text-center whitespace-nowrap">
                  Age
                </th>
                <th rowSpan={2} className="bg-[#FDEBD0] px-3 py-2.5 font-bold border-r border-[#E5D7CE] whitespace-nowrap">
                  DOJ
                </th>
                <th rowSpan={2} className="bg-[#FDEBD0] px-3 py-2.5 font-bold border-r border-[#E5D7CE] text-center whitespace-nowrap">
                  2 Days workshop
                </th>
                <th rowSpan={2} className="bg-[#FDEBD0] px-3 py-2.5 font-bold border-r border-[#E5D7CE] whitespace-nowrap">
                  Program Name
                </th>
                <th rowSpan={2} className="bg-[#FDEBD0] px-3 py-2.5 font-bold border-r border-[#E5D7CE] whitespace-nowrap">
                  Batch
                </th>
                <th rowSpan={2} className="bg-[#FDEBD0] px-3 py-2.5 font-bold border-r border-[#E5D7CE] whitespace-nowrap">
                  Trainer Name
                </th>
                <th rowSpan={2} className="bg-[#FDEBD0] px-2.5 py-2.5 font-bold border-r border-[#E5D7CE] text-center whitespace-nowrap">
                  No.of class
                </th>
                {/* Spanning Header: Students Achievement Level */}
                <th
                  colSpan={7}
                  className="bg-[#FADBD8] px-3 py-2 font-black text-center border-b border-[#F5B7B1] border-r border-[#E5D7CE] text-[#78281F] uppercase tracking-wider"
                >
                  Students Achievement Level
                </th>
                <th rowSpan={2} className="bg-[#FDEBD0] px-3 py-2.5 font-bold text-center whitespace-nowrap">
                  Actions
                </th>
              </tr>

              {/* Row 2 Subheaders under Students Achievement Level */}
              <tr className="border-b border-[#D0DFDB]">
                <th className="bg-[#D4E6F1] px-2.5 py-2 font-bold text-center border-r border-[#BDC3C7] text-[#1B4F72] whitespace-nowrap">
                  Vision
                </th>
                <th className="bg-[#D4E6F1] px-2.5 py-2 font-bold text-center border-r border-[#BDC3C7] text-[#1B4F72] whitespace-nowrap">
                  Video share
                </th>
                <th className="bg-[#D4E6F1] px-2.5 py-2 font-bold text-center border-r border-[#BDC3C7] text-[#1B4F72] whitespace-nowrap">
                  Symbol of elements
                </th>
                <th className="bg-[#D4E6F1] px-2.5 py-2 font-bold text-center border-r border-[#BDC3C7] text-[#1B4F72] whitespace-nowrap">
                  Video share
                </th>
                <th className="bg-[#D4E6F1] px-2.5 py-2 font-bold text-center border-r border-[#BDC3C7] text-[#1B4F72] whitespace-nowrap">
                  Q-Habit
                </th>
                <th className="bg-[#D4E6F1] px-2.5 py-2 font-bold text-center border-r border-[#BDC3C7] text-[#1B4F72] whitespace-nowrap">
                  Tracker
                </th>
                <th className="bg-[#D4E6F1] px-2.5 py-2 font-bold text-center border-r border-[#E5D7CE] text-[#1B4F72] whitespace-nowrap">
                  ABACUS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E6EEEB] bg-white">
              {loading && (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-[#7B8E89]">
                    Loading student progress ledger…
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-[#7B8E89]">
                    No progress records match your filters. Click &quot;Add Student&quot; or &quot;Sync Enrolled Students&quot; to begin.
                  </td>
                </tr>
              )}

              {filtered.map((p) => {
                const isWorkshopDone = p.workshop2Days?.toLowerCase().includes("complete");
                const isVideo1Shared = p.videoShare1 === "Shared";
                const isVideo2Shared = p.videoShare2 === "Shared";

                return (
                  <tr key={p.id} className="hover:bg-[#F9FCFA] transition group">
                    {/* Students Name */}
                    <td className="px-3 py-2.5 font-bold text-brand-ink border-r border-[#F0F4F2] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditItem(p)}
                        className="text-left hover:text-brand-teal transition flex items-center gap-2"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5F1] text-[11px] font-bold text-brand-deep">
                          {p.studentName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span>{p.studentName}</span>
                          {p.notes && <p className="text-[10px] text-[#7B8E89] font-normal truncate max-w-[150px]">{p.notes}</p>}
                        </div>
                      </button>
                    </td>

                    {/* Age */}
                    <td className="px-2.5 py-2.5 text-center text-[#41564f] border-r border-[#F0F4F2] whitespace-nowrap font-medium">
                      {p.age}
                    </td>

                    {/* DOJ */}
                    <td className="px-3 py-2.5 text-[#41564f] border-r border-[#F0F4F2] whitespace-nowrap">
                      {p.doj}
                    </td>

                    {/* 2 Days Workshop */}
                    <td className="px-3 py-2.5 text-center border-r border-[#F0F4F2] whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          isWorkshopDone
                            ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
                            : "bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]"
                        }`}
                      >
                        {isWorkshopDone ? "✓ Completed" : p.workshop2Days || "Pending"}
                      </span>
                    </td>

                    {/* Program Name */}
                    <td className="px-3 py-2.5 font-semibold text-brand-ink border-r border-[#F0F4F2] whitespace-nowrap">
                      <span className="rounded-md bg-purple-50 text-purple-900 border border-purple-200/70 px-2 py-0.5 text-[11px]">
                        {p.programName}
                      </span>
                    </td>

                    {/* Batch */}
                    <td className="px-3 py-2.5 text-[#41564f] border-r border-[#F0F4F2] whitespace-nowrap font-medium">
                      {p.batch}
                    </td>

                    {/* Trainer Name */}
                    <td className="px-3 py-2.5 text-brand-ink border-r border-[#F0F4F2] whitespace-nowrap font-semibold">
                      {p.trainerName}
                    </td>

                    {/* No. of Class */}
                    <td className="px-2.5 py-2.5 text-center font-bold text-brand-ink border-r border-[#F0F4F2] whitespace-nowrap">
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">
                        {p.noOfClasses}
                      </span>
                    </td>

                    {/* 1. Vision */}
                    <td className="px-2.5 py-2.5 text-center border-r border-[#F0F4F2] whitespace-nowrap">
                      <span className="inline-flex rounded-md bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC] px-2 py-0.5 text-[11px] font-bold">
                        {p.vision || "Level 1"}
                      </span>
                    </td>

                    {/* 2. Video share 1 */}
                    <td className="px-2.5 py-2.5 text-center border-r border-[#F0F4F2] whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          isVideo1Shared
                            ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isVideo1Shared ? "✓ Shared" : p.videoShare1 || "Pending"}
                      </span>
                    </td>

                    {/* 3. Symbol of elements */}
                    <td className="px-2.5 py-2.5 text-center border-r border-[#F0F4F2] whitespace-nowrap">
                      <span className="inline-flex rounded-md bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF] px-2 py-0.5 text-[11px] font-bold">
                        {p.symbolOfElements || "Pending"}
                      </span>
                    </td>

                    {/* 4. Video share 2 */}
                    <td className="px-2.5 py-2.5 text-center border-r border-[#F0F4F2] whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          isVideo2Shared
                            ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isVideo2Shared ? "✓ Shared" : p.videoShare2 || "Pending"}
                      </span>
                    </td>

                    {/* 5. Q-Habit */}
                    <td className="px-2.5 py-2.5 text-center border-r border-[#F0F4F2] whitespace-nowrap">
                      <span className="inline-flex rounded-md bg-[#FEF3D6] text-[#B06000] border border-[#FEEFC3] px-2 py-0.5 text-[11px] font-bold">
                        ⭐ {p.qHabit || "Active"}
                      </span>
                    </td>

                    {/* 6. Tracker */}
                    <td className="px-2.5 py-2.5 text-center border-r border-[#F0F4F2] whitespace-nowrap">
                      <span className="inline-flex rounded-md bg-[#E8F5F1] text-[#0E937E] border border-[#BFE6DC] px-2 py-0.5 text-[11px] font-bold">
                        ✓ {p.tracker || "Up to date"}
                      </span>
                    </td>

                    {/* 7. ABACUS */}
                    <td className="px-2.5 py-2.5 text-center border-r border-[#F0F4F2] whitespace-nowrap">
                      <span className="inline-flex rounded-md bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF] px-2 py-0.5 text-[11px] font-bold">
                        🧮 {p.abacus || "Level 1"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditItem(p)}
                          className="rounded-lg border border-[#D9E6E2] bg-white px-2.5 py-1 text-[11px] font-bold text-brand-deep hover:border-brand-teal transition shadow-2xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.studentName)}
                          className="rounded-lg p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete record"
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Progress Modal */}
      {editItem && (
        <ProgressModal
          item={editItem}
          students={students}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
        />
      )}

      <Toast msg={toast} />
    </div>
  );
}

function ProgressModal({
  item,
  students,
  onClose,
  onSave,
}: {
  item: Partial<StudentProgress>;
  students: StudentRecord[];
  onClose: () => void;
  onSave: (record: Partial<StudentProgress>) => void;
}) {
  const [f, setF] = useState<Partial<StudentProgress>>({ ...item });
  const isEdit = Boolean(item.id);

  const handleSelectStudent = (studentId: string) => {
    const s = students.find((x) => x.id === studentId);
    if (!s) return;
    setF((prev) => ({
      ...prev,
      studentId: s.id,
      studentName: s.studentName,
      age: s.age ? `${s.age} yrs` : prev.age || "8 yrs",
      centreId: s.centreId,
      doj: s.createdAt
        ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : prev.doj,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.studentName?.trim()) return;
    onSave(f);
  };

  return (
    <Modal open={true} title={isEdit ? `Edit Progress: ${item.studentName}` : "Add Student to Progress Tracker"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pre-fill selector if adding new */}
        {!isEdit && students.length > 0 && (
          <div className="rounded-xl border border-teal-200 bg-[#E8F5F1] p-3 text-xs">
            <label className="block mb-1 font-bold text-brand-deep">
              Quick Pre-fill from Enrolled Admissions:
            </label>
            <select
              className="h-10 w-full rounded-lg border border-[#BFE6DC] bg-white px-3 text-xs font-semibold text-brand-ink outline-none"
              onChange={(e) => handleSelectStudent(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                -- Choose from active admissions to autofill details --
              </option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentName} ({s.id}) · {centreName(s.centreId)} · {s.grade || "Grade"}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Basic Student Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Students Name *">
            <input
              required
              className={inputCls}
              value={f.studentName || ""}
              onChange={(e) => setF({ ...f, studentName: e.target.value })}
              placeholder="Full student name"
            />
          </Field>

          <Field label="Age">
            <input
              className={inputCls}
              value={f.age ?? ""}
              onChange={(e) => setF({ ...f, age: e.target.value })}
              placeholder="e.g. 8 yrs"
            />
          </Field>

          <Field label="DOJ (Date of Joining)">
            <input
              className={inputCls}
              value={f.doj || ""}
              onChange={(e) => setF({ ...f, doj: e.target.value })}
              placeholder="e.g. 15 Jul 2026"
            />
          </Field>
        </div>

        {/* Academic Course & Batch */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Field label="2 Days Workshop">
            <select
              className={inputCls}
              value={f.workshop2Days || "Completed"}
              onChange={(e) => setF({ ...f, workshop2Days: e.target.value })}
            >
              <option value="Completed">Completed</option>
              <option value="Attended">Attended</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </Field>

          <Field label="Program Name">
            <select
              className={inputCls}
              value={f.programName || PROGRAM_OPTIONS[0]}
              onChange={(e) => setF({ ...f, programName: e.target.value })}
            >
              {PROGRAM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Batch">
            <input
              className={inputCls}
              value={f.batch || ""}
              onChange={(e) => setF({ ...f, batch: e.target.value })}
              placeholder="e.g. Weekend Batch A"
            />
          </Field>

          <Field label="Trainer Name">
            <select
              className={inputCls}
              value={f.trainerName || AGENTS[0]}
              onChange={(e) => setF({ ...f, trainerName: e.target.value })}
            >
              {AGENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="No. of Classes">
            <input
              className={inputCls}
              value={f.noOfClasses ?? "1 / 16"}
              onChange={(e) => setF({ ...f, noOfClasses: e.target.value })}
              placeholder="e.g. 8 / 16"
            />
          </Field>

          <Field label="Centre / Campus">
            <select
              className={inputCls}
              value={f.centreId || ADMISSION_CENTRES[0].id}
              onChange={(e) => setF({ ...f, centreId: e.target.value })}
            >
              {ADMISSION_CENTRES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Section 2: Students Achievement Level */}
        <div className="rounded-2xl border border-red-200 bg-[#FDF2E9]/40 p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-600 text-white text-xs font-bold">
              ★
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-orange-950">
              Students Achievement Level Matrix
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Vision Level">
              <select
                className={inputCls}
                value={f.vision || VISION_OPTIONS[0]}
                onChange={(e) => setF({ ...f, vision: e.target.value })}
              >
                {VISION_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Video Share (Milestone 1)">
              <select
                className={inputCls}
                value={f.videoShare1 || VIDEO_OPTIONS[0]}
                onChange={(e) => setF({ ...f, videoShare1: e.target.value })}
              >
                {VIDEO_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Symbol of Elements">
              <select
                className={inputCls}
                value={f.symbolOfElements || ELEMENTS_OPTIONS[0]}
                onChange={(e) => setF({ ...f, symbolOfElements: e.target.value })}
              >
                {ELEMENTS_OPTIONS.map((el) => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Field label="Video Share (Milestone 2)">
              <select
                className={inputCls}
                value={f.videoShare2 || VIDEO_OPTIONS[1]}
                onChange={(e) => setF({ ...f, videoShare2: e.target.value })}
              >
                {VIDEO_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Q-Habit Status">
              <select
                className={inputCls}
                value={f.qHabit || QHABIT_OPTIONS[0]}
                onChange={(e) => setF({ ...f, qHabit: e.target.value })}
              >
                {QHABIT_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Practice Tracker">
              <select
                className={inputCls}
                value={f.tracker || TRACKER_OPTIONS[0]}
                onChange={(e) => setF({ ...f, tracker: e.target.value })}
              >
                {TRACKER_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="ABACUS Level">
              <select
                className={inputCls}
                value={f.abacus || ABACUS_OPTIONS[0]}
                onChange={(e) => setF({ ...f, abacus: e.target.value })}
              >
                {ABACUS_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Assessment Notes & Special Highlights">
            <input
              className={inputCls}
              value={f.notes || ""}
              onChange={(e) => setF({ ...f, notes: e.target.value })}
              placeholder="e.g. Excelling in blindfold card tests, verified by trainer"
            />
          </Field>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-deep px-5 py-2 text-xs font-bold text-white hover:bg-brand-teal transition shadow-sm"
          >
            <Icon name="check" size={14} />
            {isEdit ? "Update Progress Record" : "Save to Progress Tracker"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

