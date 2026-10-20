"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COURSE_STATS, formatINR, inr } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Card, DataGrid, Figure, PageHeader, SearchInput, StatusBadge, Td, Th, Toast, useToast, type Tone } from "@/components/admin/ui";
import { lessonCount, type Course as FullCourse } from "@/lib/courses/types";
import { Icon } from "@/components/icons";

type Course = FullCourse;

const STATUS_TONE: Record<string, Tone> = { Published: "good", "In review": "warning", Draft: "neutral" };

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [q, setQ] = useState("");
  const [toast, show] = useToast();

  const load = () =>
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses ?? []));
  useEffect(() => {
    load();
  }, []);

  const list = courses.filter((c) => `${c.title} ${c.category}`.toLowerCase().includes(q.toLowerCase()));
  const learners = courses.reduce((a, c) => a + c.learners, 0);
  const revenue = courses.reduce((a, c) => a + (COURSE_STATS[c.title]?.revenue ?? 0), 0);
  const avgRating = courses.length ? courses.reduce((a, c) => a + c.rating, 0) / courses.length : 0;

  const remove = async (c: Course) => {
    if (!window.confirm(`Delete “${c.title}”? Its lessons are removed from the catalogue. This can't be undone.`)) return;
    const r = await fetch(`/api/admin/courses?id=${encodeURIComponent(c.id)}`, { method: "DELETE" });
    if (!r.ok) return show("Could not delete");
    show("Course deleted");
    load();
  };
  const statusOf = (c: Course) => (c.status ? (c.status === "published" ? "Published" : "Draft") : (COURSE_STATS[c.title]?.status ?? "Draft"));

  return (
    <AdminShell>
      <PageHeader title="Courses" sub="Catalogue, publishing status and performance">
        <Link href="/admin/courses/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-b from-[#0B6E5F] to-[#054038] px-4 text-[13px] font-semibold text-white hover:from-[#0E937E] hover:to-[#065247]">
          <Icon name="plus" size={16} /> New course
        </Link>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label="Courses" value={String(courses.length)} sub={`${courses.filter((c) => statusOf(c) === "Published").length} published`} icon="book" />
        <Figure label="Learners enrolled" value={learners.toLocaleString("en-IN")} sub="Across all courses" icon="users" />
        <Figure label="Course revenue" value={inr(revenue, true)} sub="Lifetime, incl. GST" icon="rupee" />
        <Figure label="Average rating" value={avgRating.toFixed(1)} sub="From student reviews" icon="star" />
      </section>

      <Card className="mt-5">
        <div className="mb-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search courses…" />
        </div>
        <DataGrid minWidth={900}>
          <thead>
            <tr className="border-b border-[#EEF3F1]">
              <Th>Course</Th>
              <Th>Mode</Th>
              <Th right>Price</Th>
              <Th right>Learners</Th>
              <Th>Completion</Th>
              <Th right>Revenue</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const st = COURSE_STATS[c.title];
              const s = { completion: st?.completion ?? 0, revenue: st?.revenue ?? 0, status: statusOf(c) as "Published" | "Draft" | "In review" };
              const n = c.curriculum?.length ? lessonCount(c) : c.lessons;
              return (
                <tr key={c.id} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                  <Td>
                    <Link href={`/admin/courses/${c.id}`} className="flex items-center gap-3">
                      {c.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.cover} alt="" className="h-10 w-16 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-teal100 text-brand-deep">
                          <Icon name="book" size={17} />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block font-semibold text-brand-ink hover:text-brand-teal">{c.title}</span>
                        <span className="flex items-center gap-1 text-[11.5px] text-[#6b807b]">
                          {c.category} · {c.curriculum?.length ? `${c.curriculum.length} sections · ` : ""}
                          {n} lessons · <Icon name="star" size={12} fill="#F5A623" className="text-[#F5A623]" /> {c.rating}
                        </span>
                      </span>
                    </Link>
                  </Td>
                  <Td className="capitalize text-[#41564f]">{c.mode}</Td>
                  <Td right className="text-brand-ink">{formatINR(c.price)}</Td>
                  <Td right className="text-brand-ink">{c.learners.toLocaleString("en-IN")}</Td>
                  <Td>
                    <div className="flex w-[130px] items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#D7F0EB]">
                        <div className="h-full rounded-full bg-[#0E937E]" style={{ width: `${s.completion}%` }} />
                      </div>
                      <span className="text-[12px] tabular-nums text-brand-ink">{s.completion}%</span>
                    </div>
                  </Td>
                  <Td right className="font-semibold text-brand-ink">{s.revenue ? inr(s.revenue, true) : "—"}</Td>
                  <Td>
                    <StatusBadge tone={STATUS_TONE[s.status]}>{s.status}</StatusBadge>
                  </Td>
                  <Td right>
                    <span className="inline-flex gap-1">
                      <Link href={`/admin/courses/${c.id}`} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">
                        Edit content
                      </Link>
                      <button onClick={() => remove(c)} aria-label={`Delete ${c.title}`} className="rounded-lg px-2 py-1.5 text-[#C22F33] hover:bg-[#FDF2F2]">
                        <Icon name="trash" size={15} />
                      </button>
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </DataGrid>
      </Card>

      <Toast msg={toast} />
    </AdminShell>
  );
}
