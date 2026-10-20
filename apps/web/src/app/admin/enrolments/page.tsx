"use client";

import { AdminShell } from "@/components/admin/shell";
import { PageHeader } from "@/components/admin/ui";
import { StudentsManager } from "@/components/admin/students-view";

/** Admissions from the public form land here as Pending; a centre confirms payment to make them Active. */
export default function StudentsPage() {
  return (
    <AdminShell>
      <PageHeader title="Students" sub="New admissions arrive as Pending and become Active once the centre confirms the fee payment" />
      <StudentsManager mode="admin" />
    </AdminShell>
  );
}
