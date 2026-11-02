"use client";

import Link from "next/link";
import { AdminShell } from "@/components/admin/shell";
import { PageHeader } from "@/components/admin/ui";
import { StudentsProgressTracker } from "@/components/admin/students-progress-tracker";
import { Icon } from "@/components/icons";

export default function StudentsProgressPage() {
  return (
    <AdminShell>
      <PageHeader
        title="Students Progress Tracker"
        sub="Comprehensive tracking of workshops, skill achievement levels, vision milestones & Q-habits"
      >
        <Link
          href="/admin/enrolments"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D9E6E2] bg-white px-4 text-[13px] font-semibold text-brand-deep hover:border-brand-teal transition shadow-2xs"
        >
          <Icon name="community" size={16} /> Admissions & Directory
        </Link>
      </PageHeader>
      <StudentsProgressTracker mode="admin" />
    </AdminShell>
  );
}

