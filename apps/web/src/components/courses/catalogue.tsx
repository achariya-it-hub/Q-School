"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/components/course-card";
import type { Course } from "@/lib/courses/types";

export function Catalogue({ courses }: { courses: Course[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = useMemo(() => ["All", ...Array.from(new Set(courses.map((c) => c.category)))], [courses]);
  const filtered = useMemo(
    () =>
      courses.filter(
        (c) => (category === "All" || c.category === category) && `${c.title} ${c.subtitle} ${c.description}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [courses, category, query],
  );

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses…"
          className="w-full max-w-xs rounded-xl border border-[#dce8e4] bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                category === c ? "bg-brand-teal text-white" : "border border-[#dce8e4] bg-white text-[#41564f] hover:border-brand-teal"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
      {filtered.length === 0 && <p className="mt-16 text-center text-sm text-[#5c7772]">No courses match. Try another search.</p>}
    </>
  );
}
