"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Segmented, StatusBadge, Toast, useToast } from "@/components/admin/ui";
import { Group, Row, StringList, TextField, Toggle, NumberField, fieldInput, move } from "@/components/admin/site-fields";
import { Dropzone, FileChip, checkFile, uploadFile, videoMinutes } from "@/components/admin/course-upload";
import { Icon, type IconName } from "@/components/icons";
import {
  CATEGORIES,
  EMPTY_COURSE,
  LESSON_TYPES,
  LEVELS,
  fmtMinutes,
  fmtSize,
  lessonCount,
  lessonTypeForFile,
  newLesson,
  newSection,
  toEmbedUrl,
  totalMinutes,
  type Course,
  type Lesson,
  type LessonType,
} from "@/lib/courses/types";

const TYPE_STYLE: Record<LessonType, { color: string; icon: IconName; label: string }> = {
  video: { color: "#E2557A", icon: "video", label: "Video" },
  document: { color: "#5B6CF0", icon: "lessons", label: "Document" },
  image: { color: "#F29A2E", icon: "palette", label: "Images" },
  link: { color: "#0E937E", icon: "external", label: "Link" },
  text: { color: "#41564F", icon: "pencil", label: "Text" },
};

/** What's missing for a lesson to be usable (null = ready). */
function missing(l: Lesson): string | null {
  if (!l.title.trim()) return "Add a title";
  if (l.type === "video") return l.source === "upload" ? (l.file ? null : "Upload a video") : toEmbedUrl(l.url) ? null : "Add a YouTube or Vimeo link";
  if (l.type === "document") return l.file ? null : "Upload a document";
  if (l.type === "image") return l.images.length ? null : "Add at least one image";
  if (l.type === "link") return /^https?:\/\//.test(l.url) ? null : "Add a link";
  return l.body.trim() ? null : "Write the lesson text";
}

function lessonMeta(l: Lesson) {
  const bits: string[] = [];
  if (l.type === "video") bits.push(l.source === "embed" ? (l.url.includes("vimeo") ? "Vimeo" : "YouTube") : l.file ? fmtSize(l.file.size) : "");
  if (l.type === "document" && l.file) bits.push(`${l.file.name.split(".").pop()?.toUpperCase()} · ${fmtSize(l.file.size)}`);
  if (l.type === "image") bits.push(`${l.images.length} image${l.images.length === 1 ? "" : "s"}`);
  if (l.type === "link" && l.url) {
    try {
      bits.push(new URL(l.url).hostname.replace(/^www\./, ""));
    } catch {}
  }
  if (l.durationMin) bits.push(fmtMinutes(l.durationMin));
  if (l.attachments.length) bits.push(`${l.attachments.length} attachment${l.attachments.length > 1 ? "s" : ""}`);
  return bits.filter(Boolean).join(" · ");
}

const titleFromFile = (n: string) =>
  n
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

export default function CourseBuilder({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  const [course, setCourse] = useState<Course | null>(isNew ? { ...structuredClone(EMPTY_COURSE), id: "", slug: "" } : null);
  const [saved, setSaved] = useState(isNew ? "" : "__loading__");
  const [tab, setTab] = useState<"details" | "curriculum">(isNew ? "details" : "curriculum");
  const [editing, setEditing] = useState<{ s: number; l: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [toast, show] = useToast();

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/courses?id=${encodeURIComponent(params.id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setCourse(d.course);
        setSaved(JSON.stringify(d.course));
      })
      .catch(() => setNotFound(true));
  }, [isNew, params.id]);

  const dirty = !!course && JSON.stringify(course) !== saved;
  const anyUploading = Object.keys(uploading).length > 0;

  useEffect(() => {
    if (!dirty && !anyUploading) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty, anyUploading]);

  const set = useCallback(<K extends keyof Course>(k: K, v: Course[K]) => setCourse((c) => (c ? { ...c, [k]: v } : c)), []);
  const setCurriculum = useCallback((fn: (c: Course["curriculum"]) => Course["curriculum"]) => setCourse((c) => (c ? { ...c, curriculum: fn(c.curriculum) } : c)), []);
  /** Functional update by lesson id: safe for uploads that finish after reorders or other edits. */
  const updateLesson = useCallback(
    (id: string, fn: (l: Lesson) => Lesson) => setCurriculum((cur) => cur.map((sec) => ({ ...sec, lessons: sec.lessons.map((x) => (x.id === id ? fn(x) : x)) }))),
    [setCurriculum],
  );
  const setLesson = (s: number, l: number, v: Lesson) => setCurriculum((cur) => cur.map((sec, i) => (i === s ? { ...sec, lessons: sec.lessons.map((x, k) => (k === l ? v : x)) } : sec)));

  const save = async (status?: Course["status"]) => {
    if (!course) return;
    if (!course.title.trim()) {
      setTab("details");
      return show("Give the course a title first");
    }
    if (anyUploading) return show("Wait for uploads to finish before saving");
    if (status === "published") {
      const gaps = course.curriculum.flatMap((s) => s.lessons).filter((l) => missing(l));
      if (!lessonCount(course)) return show("Add at least one lesson before publishing");
      if (gaps.length && !window.confirm(`${gaps.length} lesson${gaps.length > 1 ? "s are" : " is"} missing content. Publish anyway?`)) return;
    }
    setBusy(true);
    const body = { ...course, ...(status ? { status } : {}) };
    const r = await fetch("/api/admin/courses", {
      method: course.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return show(d.error ?? "Could not save");
    setCourse(d.course);
    setSaved(JSON.stringify(d.course));
    show(status === "published" ? "Published. Students can now see this course." : status === "draft" ? "Moved back to draft" : "Saved");
    if (!course.id) router.replace(`/admin/courses/${d.course.id}`);
  };

  /** Bulk: drop many files on a section → one lesson per file, uploading in the background. */
  const bulkAdd = async (sIdx: number, files: File[]) => {
    for (const file of files.slice(0, 30)) {
      const type = lessonTypeForFile(file.name, file.type);
      if (!type) {
        show(`${file.name}: drop videos, PDFs/slides/docs or images`);
        continue;
      }
      const kind = type === "video" ? "video" : type === "document" ? "document" : "image";
      const bad = checkFile(file, kind);
      if (bad) {
        show(bad);
        continue;
      }
      const l = { ...newLesson(type, titleFromFile(file.name)) };
      setCurriculum((cur) => cur.map((sec, i) => (i === sIdx ? { ...sec, lessons: [...sec.lessons, l] } : sec)));
      setUploading((u) => ({ ...u, [l.id]: 0 }));
      const minutes = type === "video" ? await videoMinutes(file) : 0;
      uploadFile(file, kind, (pct) => setUploading((u) => ({ ...u, [l.id]: pct })))
        .then((f) => {
          setCurriculum((cur) =>
            cur.map((sec) => ({
              ...sec,
              lessons: sec.lessons.map((x) =>
                x.id !== l.id ? x : type === "image" ? { ...x, images: [{ ...f, caption: "" }] } : { ...x, file: f, durationMin: x.durationMin || minutes },
              ),
            })),
          );
        })
        .catch((e: Error) => show(`${file.name}: ${e.message}`))
        .finally(() =>
          setUploading((u) => {
            const { [l.id]: _, ...rest } = u;
            return rest;
          }),
        );
    }
  };

  if (notFound) {
    return (
      <AdminShell>
        <div className="p-8 text-center">
          <p className="text-[15px] font-semibold text-brand-ink">Course not found</p>
          <Link href="/admin/courses" className="mt-3 inline-block text-[13px] font-semibold text-brand-teal">
            ← Back to courses
          </Link>
        </div>
      </AdminShell>
    );
  }
  if (!course) {
    return (
      <AdminShell>
        <p className="p-6 text-sm text-[#6b807b]">Loading course…</p>
      </AdminShell>
    );
  }

  const lessons = lessonCount(course);
  const minutes = totalMinutes(course);
  const previews = course.curriculum.flatMap((s) => s.lessons).filter((l) => l.preview).length;
  const incomplete = course.curriculum.flatMap((s) => s.lessons).filter((l) => missing(l)).length;
  const edit = editing ? course.curriculum[editing.s]?.lessons[editing.l] : null;

  return (
    <AdminShell>
      {/* header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/admin/courses" className="text-[12.5px] font-semibold text-brand-teal hover:underline">
            ← Courses
          </Link>
          <h1 className="mt-1 truncate text-[24px] font-bold leading-tight text-brand-ink">{course.title || "New course"}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12.5px] text-[#6b807b]">
            <StatusBadge tone={course.status === "published" ? "good" : "neutral"}>{course.status === "published" ? "Published" : "Draft"}</StatusBadge>
            <span>
              {course.curriculum.length} section{course.curriculum.length === 1 ? "" : "s"} · {lessons} lesson{lessons === 1 ? "" : "s"}{minutes ? ` · ${fmtMinutes(minutes)}` : ""}
            </span>
            {dirty && <span className="font-semibold text-[#8A5A00]">· Unsaved changes</span>}
            {anyUploading && <span className="font-semibold text-brand-teal">· Uploading…</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {course.id && (
            <a href={`/courses/${course.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D9E6E2] bg-white px-4 text-[13px] font-semibold text-brand-deep hover:border-brand-teal">
              <Icon name="eye" size={16} /> View course page
            </a>
          )}
          <Btn variant="ghost" icon="check" onClick={() => save()} disabled={busy || (!dirty && !!course.id)}>
            {busy ? "Saving…" : "Save"}
          </Btn>
          {course.status === "published" ? (
            <Btn variant="ghost" onClick={() => save("draft")} disabled={busy}>
              Unpublish
            </Btn>
          ) : (
            <Btn icon="globe" onClick={() => save("published")} disabled={busy}>
              Publish
            </Btn>
          )}
        </div>
      </div>

      <div className="mb-4">
        <Segmented
          label="Course builder section"
          value={tab}
          onChange={setTab}
          options={[
            { value: "details", label: "1 · Details" },
            { value: "curriculum", label: `2 · Curriculum & content (${lessons})` },
          ]}
        />
      </div>

      {tab === "details" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          <section className="space-y-5 rounded-[20px] border border-[#E2ECE9] bg-white p-5">
            <TextField label="Course title" value={course.title} onChange={(v) => set("title", v)} max={160} placeholder="e.g. Coding for Beginners" />
            <TextField label="Subtitle" hint="one line shown under the title" value={course.subtitle} onChange={(v) => set("subtitle", v)} max={200} />
            <Row cols={3}>
              <Select label="Category" value={course.category} options={CATEGORIES} onChange={(v) => set("category", v)} />
              <Select label="Level" value={course.level} options={LEVELS} onChange={(v) => set("level", v)} />
              <Select
                label="Mode"
                value={course.mode}
                options={["live", "recorded", "hybrid"]}
                labels={{ live: "Live", recorded: "Recorded", hybrid: "Hybrid" }}
                onChange={(v) => set("mode", v as Course["mode"])}
              />
            </Row>
            <Row cols={3}>
              <NumberField label="Price (₹)" hint="0 = free" value={course.price} max={10_000_000} onChange={(v) => set("price", v)} />
              <TextField label="Language" value={course.language} onChange={(v) => set("language", v)} max={40} />
              {lessons ? (
                <div>
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Lessons</span>
                  <p className={`${fieldInput} text-[#6b807b]`}>{lessons} (from curriculum)</p>
                </div>
              ) : (
                <NumberField label="Planned lessons" value={course.lessons} onChange={(v) => set("lessons", v)} />
              )}
            </Row>
            <TextField label="Description" value={course.description} onChange={(v) => set("description", v)} max={5000} multiline rows={5} />
            <StringList label="What students will learn" items={course.outcomes} onChange={(v) => set("outcomes", v)} max={12} placeholder="e.g. Build and publish a simple game" />
          </section>

          <aside className="space-y-4">
            <section className="rounded-[20px] border border-[#E2ECE9] bg-white p-5">
              <p className="mb-3 text-[14px] font-semibold text-brand-ink">Cover image</p>
              {course.cover ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={course.cover} alt="" className="aspect-[16/10] w-full rounded-xl object-cover" />
                  <div className="flex gap-2">
                    <button onClick={() => set("cover", "")} className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[#C22F33] hover:bg-[#FDF2F2]">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <Dropzone kind="image" title="Upload a cover image" onUploaded={(f) => set("cover", f.url)} />
              )}
              <p className="mt-2 text-[11.5px] text-[#8aa39c]">Landscape, about 1280 × 800 px. Shown on course cards and the course page.</p>
            </section>
            <section className="rounded-[20px] border border-[#E2ECE9] bg-white p-5">
              <p className="text-[14px] font-semibold text-brand-ink">Next step</p>
              <p className="mt-1 text-[13px] text-[#6b807b]">Add sections and lessons: upload videos, PDFs, slides, images, or add links and notes.</p>
              <button onClick={() => setTab("curriculum")} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-teal">
                Go to curriculum →
              </button>
            </section>
          </aside>
        </div>
      ) : (
        <div className="space-y-4">
          {/* summary */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(
              [
                ["Sections", String(course.curriculum.length), "kanban"],
                ["Lessons", String(lessons), "lessons"],
                ["Total length", minutes ? fmtMinutes(minutes) : "—", "clock"],
                [incomplete ? "Need content" : "Free previews", incomplete ? String(incomplete) : String(previews), incomplete ? "alert" : "eye"],
              ] as const
            ).map(([l, v, i]) => (
              <div key={l} className={`rounded-[18px] border bg-white p-4 ${l === "Need content" ? "border-[#F5D9A8]" : "border-[#E2ECE9]"}`}>
                <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#5C716C]">
                  <Icon name={i as IconName} size={15} /> {l}
                </p>
                <p className={`mt-1.5 text-[22px] font-semibold leading-none ${l === "Need content" ? "text-[#8A5A00]" : "text-brand-ink"}`}>{v}</p>
              </div>
            ))}
          </div>

          {course.curriculum.map((sec, sIdx) => (
            <section key={sec.id} className="rounded-[20px] border border-[#E2ECE9] bg-white">
              <div className="flex flex-wrap items-center gap-2 border-b border-[#EEF3F1] px-4 py-3">
                <span className="rounded-lg bg-brand-deep px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Section {sIdx + 1}</span>
                <input
                  value={sec.title}
                  maxLength={160}
                  onChange={(e) => setCurriculum((cur) => cur.map((x, i) => (i === sIdx ? { ...x, title: e.target.value } : x)))}
                  className="min-w-[180px] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[15px] font-semibold text-brand-ink outline-none hover:border-[#E2ECE9] focus:border-brand-teal focus:bg-white"
                  aria-label={`Section ${sIdx + 1} title`}
                />
                <span className="text-[12px] text-[#8aa39c]">
                  {sec.lessons.length} lesson{sec.lessons.length === 1 ? "" : "s"}
                </span>
                <Mini label="Move section up" disabled={sIdx === 0} onClick={() => setCurriculum((c) => move(c, sIdx, -1))} d="M12 19V5M5 12l7-7 7 7" />
                <Mini label="Move section down" disabled={sIdx === course.curriculum.length - 1} onClick={() => setCurriculum((c) => move(c, sIdx, 1))} d="M12 5v14M19 12l-7 7-7-7" />
                <Mini
                  label="Delete section"
                  danger
                  onClick={() => {
                    if (window.confirm(sec.lessons.length ? `Delete “${sec.title}” and its ${sec.lessons.length} lessons?` : `Delete “${sec.title}”?`))
                      setCurriculum((c) => c.filter((_, i) => i !== sIdx));
                  }}
                  d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
                />
              </div>

              <ol className="divide-y divide-[#F1F5F4]">
                {sec.lessons.map((l, lIdx) => {
                  const st = TYPE_STYLE[l.type];
                  const gap = missing(l);
                  const pct = uploading[l.id];
                  return (
                    <li key={l.id} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAFCFB]">
                      <span className="w-5 text-right text-[12px] tabular-nums text-[#93a5a0]">{lIdx + 1}</span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: st.color }}>
                        <Icon name={st.icon} size={17} />
                      </span>
                      <button onClick={() => setEditing({ s: sIdx, l: lIdx })} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-[13.5px] font-semibold text-brand-ink">{l.title || "Untitled lesson"}</span>
                        <span className="flex flex-wrap items-center gap-x-2 text-[11.5px] text-[#6b807b]">
                          <span>{st.label}</span>
                          {lessonMeta(l) && <span>· {lessonMeta(l)}</span>}
                          {l.preview && <span className="rounded-full bg-brand-teal100 px-1.5 font-semibold text-brand-deep">Free preview</span>}
                          {pct !== undefined ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-brand-teal">
                              Uploading {pct}%
                              <span className="h-1 w-16 overflow-hidden rounded-full bg-[#E3F0EC]">
                                <span className="block h-full bg-brand-teal" style={{ width: `${pct}%` }} />
                              </span>
                            </span>
                          ) : (
                            gap && (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#8A5A00]">
                                <Icon name="alert" size={12} /> {gap}
                              </span>
                            )
                          )}
                        </span>
                      </button>
                      <span className="flex shrink-0 items-center opacity-70 group-hover:opacity-100">
                        <Mini label="Move lesson up" disabled={lIdx === 0} onClick={() => setCurriculum((c) => c.map((x, i) => (i === sIdx ? { ...x, lessons: move(x.lessons, lIdx, -1) } : x)))} d="M12 19V5M5 12l7-7 7 7" />
                        <Mini
                          label="Move lesson down"
                          disabled={lIdx === sec.lessons.length - 1}
                          onClick={() => setCurriculum((c) => c.map((x, i) => (i === sIdx ? { ...x, lessons: move(x.lessons, lIdx, 1) } : x)))}
                          d="M12 5v14M19 12l-7 7-7-7"
                        />
                        <button onClick={() => setEditing({ s: sIdx, l: lIdx })} className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-brand-teal hover:bg-brand-teal100/60">
                          Edit
                        </button>
                        <Mini
                          label="Delete lesson"
                          danger
                          onClick={() => window.confirm(`Delete “${l.title || "this lesson"}”?`) && setCurriculum((c) => c.map((x, i) => (i === sIdx ? { ...x, lessons: x.lessons.filter((_, k) => k !== lIdx) } : x)))}
                          d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
                        />
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="space-y-3 border-t border-[#EEF3F1] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[12.5px] font-semibold text-[#41564f]">Add lesson:</span>
                  {LESSON_TYPES.map((t) => (
                    <button
                      key={t.type}
                      title={t.help}
                      onClick={() => {
                        setCurriculum((c) => c.map((x, i) => (i === sIdx ? { ...x, lessons: [...x.lessons, newLesson(t.type)] } : x)));
                        setEditing({ s: sIdx, l: sec.lessons.length });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2ECE9] bg-white px-3 py-2 text-[12.5px] font-semibold text-brand-deep transition hover:-translate-y-0.5 hover:border-brand-teal hover:shadow-sm"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-md text-white" style={{ background: TYPE_STYLE[t.type].color }}>
                        <Icon name={TYPE_STYLE[t.type].icon} size={12} />
                      </span>
                      {t.label}
                    </button>
                  ))}
                </div>
                <BulkDrop onFiles={(files) => bulkAdd(sIdx, files)} />
              </div>
            </section>
          ))}

          <button
            onClick={() => setCurriculum((c) => [...c, newSection(`Section ${c.length + 1}`)])}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-brand-teal/40 py-4 text-[14px] font-semibold text-brand-teal hover:bg-brand-teal100/40"
          >
            <Icon name="plus" size={17} /> Add section
          </button>
        </div>
      )}

      {/* lesson editor */}
      {editing && edit && (
        <LessonDrawer
          lesson={edit}
          position={`Section ${editing.s + 1} · Lesson ${editing.l + 1}`}
          onChange={(v) => setLesson(editing.s, editing.l, v)}
          onUpdate={(fn) => updateLesson(edit.id, fn)}
          onClose={() => setEditing(null)}
          onDelete={() => {
            if (!window.confirm("Delete this lesson?")) return;
            setCurriculum((c) => c.map((x, i) => (i === editing.s ? { ...x, lessons: x.lessons.filter((_, k) => k !== editing.l) } : x)));
            setEditing(null);
          }}
        />
      )}

      {/* sticky save bar */}
      {(dirty || anyUploading) && (
        <div className="sticky bottom-4 z-30 mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E2ECE9] bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <span className="text-[13px] font-medium text-[#41564f]">{anyUploading ? "Files are uploading. Save when they finish." : "You have unsaved changes."}</span>
          <span className="ml-auto flex gap-2">
            <Btn icon="check" onClick={() => save()} disabled={busy || anyUploading}>
              {busy ? "Saving…" : "Save changes"}
            </Btn>
          </span>
        </div>
      )}
      <Toast msg={toast} />
    </AdminShell>
  );
}

/* ───────── pieces ───────── */

function Select({ label, value, options, onChange, labels }: { label: string; value: string; options: string[]; onChange: (v: string) => void; labels?: Record<string, string> }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldInput}>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Mini({ label, onClick, disabled, danger, d }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; d: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-25 ${danger ? "text-[#C22F33] hover:bg-[#FDF2F2]" : "text-[#41564f] hover:bg-[#EEF6F3]"}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </button>
  );
}

function BulkDrop({ onFiles }: { onFiles: (f: File[]) => void }) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-3.5 py-3 transition ${over ? "border-brand-teal bg-brand-teal100/60" : "border-[#D6E5E1] hover:border-brand-teal/60"}`}
    >
      <Icon name="download" size={17} className="rotate-180 text-brand-teal" />
      <span className="text-[12.5px] text-[#41564f]">
        <b className="text-brand-ink">Quick add:</b> drop several videos, PDFs, slides or images here. Each file becomes a lesson.
      </span>
      <input
        ref={input}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}

function LessonDrawer({
  lesson: l,
  position,
  onChange,
  onUpdate,
  onClose,
  onDelete,
}: {
  lesson: Lesson;
  position: string;
  onChange: (l: Lesson) => void;
  onUpdate: (fn: (l: Lesson) => Lesson) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  // async upload callbacks patch the *latest* lesson state, not the one captured when the upload began
  const patch = (p: Partial<Lesson> | ((x: Lesson) => Partial<Lesson>)) => onUpdate((x) => ({ ...x, ...(typeof p === "function" ? p(x) : p) }));
  const u = <K extends keyof Lesson>(k: K) => (v: Lesson[K]) => onChange({ ...l, [k]: v });
  const embed = l.type === "video" && l.source === "embed" ? toEmbedUrl(l.url) : null;

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-[#021c18]/40" onClick={onClose} />
      <aside role="dialog" aria-label="Edit lesson" className="absolute inset-y-0 right-0 flex w-full max-w-[600px] flex-col bg-white shadow-2xl animate-[slideIn_.2s_ease]">
        <div className="flex items-center gap-3 border-b border-[#EEF3F1] px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: TYPE_STYLE[l.type].color }}>
            <Icon name={TYPE_STYLE[l.type].icon} size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#8aa39c]">{position}</p>
            <h3 className="truncate text-[16px] font-semibold text-brand-ink">{l.title || "New lesson"}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#6b807b] hover:bg-[#F1F5F4]" aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <TextField label="Lesson title" value={l.title} onChange={u("title")} max={160} />

          <div>
            <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Lesson type</span>
            <div className="grid grid-cols-5 gap-1.5">
              {LESSON_TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => onChange({ ...l, type: t.type, downloadable: t.type === "document" ? true : l.downloadable })}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[11.5px] font-semibold transition ${
                    l.type === t.type ? "border-brand-teal bg-brand-teal100/60 text-brand-deep" : "border-[#E2ECE9] text-[#41564f] hover:border-brand-teal/50"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: TYPE_STYLE[t.type].color }}>
                    <Icon name={TYPE_STYLE[t.type].icon} size={15} />
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* type-specific content */}
          {l.type === "video" && (
            <Group title="Video">
              <Segmented
                label="Video source"
                value={l.source}
                onChange={u("source")}
                options={[
                  { value: "upload", label: "Upload a file" },
                  { value: "embed", label: "YouTube / Vimeo link" },
                ]}
              />
              {l.source === "upload" ? (
                l.file ? (
                  <div className="space-y-2">
                    <video src={l.file.url} controls preload="metadata" className="aspect-video w-full rounded-xl bg-black" />
                    <FileChip f={l.file} onRemove={() => onChange({ ...l, file: null })} />
                  </div>
                ) : (
                  <Dropzone
                    kind="video"
                    onFiles={async ([f]) => {
                      if (f && !l.durationMin) {
                        const m = await videoMinutes(f);
                        if (m) patch((x) => (x.durationMin ? {} : { durationMin: m }));
                      }
                    }}
                    onUploaded={(file) => patch({ file })}
                  />
                )
              ) : (
                <div className="space-y-2">
                  <TextField label="Video link" hint="YouTube (incl. unlisted) or Vimeo" value={l.url} onChange={u("url")} max={500} placeholder="https://www.youtube.com/watch?v=…" />
                  {l.url && !embed && <p className="text-[12px] text-[#C22F33]">That doesn&apos;t look like a YouTube or Vimeo video link.</p>}
                  {embed && (
                    <iframe
                      src={embed}
                      title="Video preview"
                      className="aspect-video w-full rounded-xl bg-black"
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  )}
                </div>
              )}
            </Group>
          )}

          {l.type === "document" && (
            <Group title="Document">
              {l.file ? (
                <div className="space-y-2">
                  {l.file.mime === "application/pdf" && <iframe src={l.file.url} title="PDF preview" className="h-[340px] w-full rounded-xl border border-[#E2ECE9]" />}
                  <FileChip f={l.file} onRemove={() => onChange({ ...l, file: null })} />
                </div>
              ) : (
                <Dropzone kind="document" onUploaded={(file) => patch((x) => ({ file, title: x.title || titleFromFile(file.name) }))} />
              )}
              <Toggle label="Students can download" hint="otherwise PDFs open in the viewer only" checked={l.downloadable} onChange={u("downloadable")} />
            </Group>
          )}

          {l.type === "image" && (
            <Group title="Images">
              {l.images.length > 0 && (
                <ul className="space-y-2">
                  {l.images.map((img, i) => (
                    <li key={img.url} className="flex gap-3 rounded-xl border border-[#E2ECE9] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <input
                          value={img.caption}
                          maxLength={200}
                          placeholder="Caption (optional)"
                          onChange={(e) => onChange({ ...l, images: l.images.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)) })}
                          className={`${fieldInput} !py-2 text-[13px]`}
                        />
                        <div className="flex gap-1 text-[12px]">
                          <button disabled={i === 0} onClick={() => onChange({ ...l, images: move(l.images, i, -1) })} className="rounded-md px-2 py-0.5 font-semibold text-[#41564f] hover:bg-[#EEF6F3] disabled:opacity-30">
                            ↑ Up
                          </button>
                          <button onClick={() => onChange({ ...l, images: l.images.filter((_, k) => k !== i) })} className="rounded-md px-2 py-0.5 font-semibold text-[#C22F33] hover:bg-[#FDF2F2]">
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {l.images.length < 30 && (
                <Dropzone kind="image" multiple compact={l.images.length > 0} onUploaded={(f) => patch((x) => ({ images: [...x.images, { ...f, caption: "" }] }))} />
              )}
            </Group>
          )}

          {l.type === "link" && (
            <Group title="Link">
              <TextField label="Web address" value={l.url} onChange={u("url")} max={1000} placeholder="https://…" />
              {l.url && !/^https?:\/\//.test(l.url) && <p className="text-[12px] text-[#C22F33]">Start the link with https://</p>}
              <TextField label="What students should do there" value={l.body} onChange={u("body")} max={2000} multiline rows={3} />
            </Group>
          )}

          {l.type === "text" && (
            <Group title="Lesson text">
              <TextField label="Content" hint="line breaks are kept" value={l.body} onChange={u("body")} max={20000} multiline rows={12} />
            </Group>
          )}

          {l.type !== "text" && l.type !== "link" && (
            <TextField label="Notes under the content" hint="optional" value={l.body} onChange={u("body")} max={5000} multiline rows={3} />
          )}

          <Group title="Settings">
            <Row>
              <NumberField label="Duration (minutes)" hint={l.type === "video" && l.source === "upload" ? "filled from the video" : undefined} value={l.durationMin} max={1000} onChange={u("durationMin")} />
              <div className="self-end">
                <Toggle label="Free preview" hint="anyone can open it" checked={l.preview} onChange={u("preview")} />
              </div>
            </Row>
          </Group>

          <Group title="Downloadable resources">
            <p className="-mt-2 text-[12px] text-[#6b807b]">Worksheets, slides or reference images students can download with this lesson.</p>
            {l.attachments.map((a, i) => (
              <FileChip key={a.url} f={a} onRemove={() => onChange({ ...l, attachments: l.attachments.filter((_, k) => k !== i) })} />
            ))}
            {l.attachments.length < 20 && <Dropzone kind="attachment" multiple compact onUploaded={(f) => patch((x) => ({ attachments: [...x.attachments, f] }))} />}
          </Group>
        </div>

        <div className="flex items-center gap-2 border-t border-[#EEF3F1] px-5 py-3">
          <button onClick={onDelete} className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#C22F33] hover:bg-[#FDF2F2]">
            Delete lesson
          </button>
          <span className="ml-auto text-[12px] text-[#8aa39c]">Changes apply to the course. Save the course to keep them.</span>
          <Btn onClick={onClose} icon="check">
            Done
          </Btn>
        </div>
      </aside>
    </div>
  );
}
