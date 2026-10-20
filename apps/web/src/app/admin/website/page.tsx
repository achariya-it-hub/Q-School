import { redirect } from "next/navigation";

// The home-page editor moved to Settings › Website.
export default function OldWebsiteEditor() {
  redirect("/admin/settings/website");
}
