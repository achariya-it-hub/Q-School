"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { PageHeader } from "@/components/admin/ui";
import { StudentsManager } from "@/components/admin/students-view";
import { StudentsProgressTracker } from "@/components/admin/students-progress-tracker";
import { Icon } from "@/components/icons";

function StudentsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<"admissions" | "tracker">(tabParam === "tracker" ? "tracker" : "admissions");

  useEffect(() => {
    if (tabParam === "tracker") {
      setTab("tracker");
    } else if (tabParam === "admissions") {
      setTab("admissions");
    }
  }, [tabParam]);

  return (
    <>
      <PageHeader
        title={tab === "tracker" ? "Students Progress Tracker" : "Students"}
        sub={
          tab === "tracker"
            ? "Comprehensive tracking of workshops, skill achievement levels, vision milestones & Q-habits"
            : "New admissions arrive as Pending and become Active once the centre confirms the fee payment"
        }
      >
        <div className="flex items-center gap-1.5 rounded-xl border border-[#D9E6E2] bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setTab("admissions")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
              tab === "admissions"
                ? "bg-brand-deep text-white shadow-xs"
                : "text-[#5C716C] hover:bg-[#F0F5F4]"
            }`}
          >
            <Icon name="community" size={14} /> Admissions & Directory
          </button>
          <button
            type="button"
            onClick={() => setTab("tracker")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
              tab === "tracker"
                ? "bg-[#D97706] text-white shadow-xs"
                : "text-[#5C716C] hover:bg-[#F0F5F4]"
            }`}
          >
            <Icon name="clipboard" size={14} /> Progress Tracker
          </button>
        </div>
      </PageHeader>

      {tab === "admissions" ? (
        <StudentsManager mode="admin" />
      ) : (
        <StudentsProgressTracker mode="admin" />
      )}
    </>
  );
}

export default function StudentsPage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="py-12 text-center text-[#7B8E89]">Loading students…</p>}>
        <StudentsContent />
      </Suspense>
    </AdminShell>
  );
}
