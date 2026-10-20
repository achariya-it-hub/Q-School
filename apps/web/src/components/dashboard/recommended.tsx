"use client";

import Link from "next/link";
import { useState } from "react";
import { PROGRAMS, fmtCount, type Program } from "@qschool/shared";
import { Icon } from "@/components/icons";
import { Art } from "./art";

const FILTERS = [
  { label: "All", match: () => true },
  { label: "Courses", match: (p: Program) => p.type === "course" },
  { label: "Live Classes", match: (p: Program) => p.type === "live" || p.type === "webinar" },
  { label: "Workshops", match: (p: Program) => p.type === "workshop" },
  { label: "Webinars", match: (p: Program) => p.type === "webinar" },
];

const TYPE_BADGE: Record<string, string> = { workshop: "Workshop", webinar: "Webinar" };

function Card({ p }: { p: Program }) {
  const [liked, setLiked] = useState(false);
  const badge = p.badge ?? TYPE_BADGE[p.type];
  const isEvent = p.type === "workshop" || p.type === "webinar";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2ECE9] bg-white p-2.5 transition hover:-translate-y-1 hover:shadow-[0_16px_30px_-18px_rgba(5,64,56,.45)]">
      <Art art={p.art} className="h-[132px] rounded-xl" iconSize={52}>
        {badge && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              p.badge ? "bg-[#FFC845] text-[#3d2a00]" : "bg-[#2BD6B4] text-brand-deep"
            }`}
          >
            {badge}
          </span>
        )}
        <button
          onClick={() => setLiked((v) => !v)}
          aria-label="Save"
          className="absolute right-2.5 top-2.5 text-white transition hover:scale-110"
        >
          <Icon name="heart" size={22} fill={liked ? "#FF5A5F" : "none"} className={liked ? "text-[#FF5A5F]" : ""} />
        </button>
      </Art>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/courses`} className="text-[15px] font-semibold leading-snug text-brand-ink hover:text-brand-teal">
            {p.title}
          </Link>
          <Icon name="more" size={18} className="mt-0.5 shrink-0 text-[#6b807b]" />
        </div>
        <p className="mt-0.5 text-xs text-[#6b807b]">{p.format}</p>
        <p className="mt-1.5 flex items-center gap-1 text-[13px]">
          <Icon name="star" size={14} fill="#F5A623" className="text-[#F5A623]" />
          <span className="font-semibold text-[#F5A623]">{p.rating}</span>
          <span className="text-[#6b807b]">({fmtCount(p.ratings)})</span>
        </p>

        <div className="mt-2.5 space-y-1 text-[12px] text-[#4f6560]">
          {isEvent ? (
            <>
              <p className="flex items-center gap-1.5">
                <Icon name="calendar" size={14} /> {p.duration} • {p.date}
              </p>
              <p className="flex items-center gap-1.5 text-brand-teal">
                <Icon name="clock" size={14} /> {p.seatsLeft ? `${p.seatsLeft} Seats Left` : "Live Online"}
              </p>
            </>
          ) : (
            <p className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Icon name="lessons" size={14} /> {p.lessons} Lessons</span>
              <span className="flex items-center gap-1.5"><Icon name="clock" size={14} /> {p.hours} Hours</span>
            </p>
          )}
        </div>

        <button className="mt-auto pt-3">
          <span className="flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#0B6E5F] to-[#054038] py-2.5 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.18)] transition group-hover:from-[#0E937E] group-hover:to-[#065247]">
            {isEvent ? "Register Now" : "Enroll Now"}
          </span>
        </button>
      </div>
    </article>
  );
}

export function Recommended() {
  const [f, setF] = useState(0);
  const items = PROGRAMS.filter(FILTERS[f].match).slice(0, 4);

  return (
    <section id="recommended" className="rounded-[22px] border border-[#E2ECE9] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="mr-auto text-xl font-semibold text-brand-ink">Recommended for You</h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((x, k) => (
            <button
              key={x.label}
              onClick={() => setF(k)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                k === f
                  ? "border-brand-teal bg-brand-teal text-white"
                  : "border-[#E2ECE9] text-[#41564f] hover:border-brand-teal hover:text-brand-teal"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <Link href="/courses" className="flex items-center gap-1 text-[13px] font-semibold text-brand-teal hover:underline">
          View All <Icon name="arrowRight" size={14} />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(205px,1fr))] gap-4">
        {items.length ? (
          items.map((p) => <Card key={p.slug} p={p} />)
        ) : (
          <p className="col-span-full py-10 text-center text-sm text-[#6b807b]">Nothing here yet — check back soon.</p>
        )}
      </div>
    </section>
  );
}
