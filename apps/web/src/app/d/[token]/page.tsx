import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDoc } from "@/lib/docs/store";
import { getSettings } from "@/lib/settings/store";
import { SharedDocView } from "@/components/shared-doc";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your document", robots: { index: false, follow: false } };

/** Public: an invoice or receipt sent on WhatsApp. The link itself is the key. */
export default async function SharedDocPage({ params }: { params: { token: string } }) {
  const doc = await getDoc(params.token);
  if (!doc) notFound();
  const st = await getSettings();
  return <SharedDocView doc={doc} org={st.general.orgName} support={st.general.supportPhone} />;
}
