import { AdminShell } from "@/components/admin/shell";
import { SettingsNav } from "@/components/admin/settings-nav";
import { WebsiteEditor } from "@/components/admin/website-editor";

export default function WebsiteSettingsPage() {
  return (
    <AdminShell>
      <SettingsNav />
      <WebsiteEditor />
    </AdminShell>
  );
}
