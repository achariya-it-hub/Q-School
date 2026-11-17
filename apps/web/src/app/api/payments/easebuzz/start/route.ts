/**
 * Public: start an Easebuzz checkout for a payment link.
 * POST (form or JSON) { linkId } → 303 redirect to the Easebuzz hosted checkout.
 * Each click gets a fresh txnid (Easebuzz rejects a reused one), recorded on the link.
 */
import { NextResponse } from "next/server";
import { initiatePayment, publicBase } from "@/lib/payments/easebuzz";
import { addPayLinkAttempt, findPayLink } from "@/lib/students/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const base = publicBase(req);
  let linkId = "";
  const ct = req.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  if (isJson) linkId = String((await req.json().catch(() => ({}))).linkId ?? "");
  else linkId = String((await req.formData().catch(() => null))?.get("linkId") ?? "");
  linkId = linkId.trim();

  const back = (q: string) => NextResponse.redirect(`${base}/pay/${encodeURIComponent(linkId)}?${q}`, 303);
  const found = linkId ? await findPayLink(linkId) : null;
  if (!found || found.link.provider !== "easebuzz") return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
  const { student, link } = found;
  if (link.status === "Paid") {
    return isJson ? NextResponse.json({ error: "This fee has already been paid" }, { status: 400 }) : back("result=paid");
  }
  if (link.status !== "Created") {
    return isJson ? NextResponse.json({ error: `Link is ${link.status.toLowerCase()}` }, { status: 400 }) : back(`result=${link.status.toLowerCase()}`);
  }

  const txnid = `${link.id}-${(link.attempts?.length ?? 0) + 1}`.replace(/[^A-Za-z0-9\-_]/g, "");
  try {
    const { url } = await initiatePayment({
      txnid,
      amount: link.amount,
      productinfo: link.description || `Q-School fee ${student.studentName}`,
      firstname: student.parentName || student.fatherName || student.motherName || "Parent",
      phone: student.phone,
      email: student.email,
      surl: `${base}/api/payments/easebuzz/return`,
      furl: `${base}/api/payments/easebuzz/return`,
      udf: { udf1: link.id, udf2: student.id, udf3: student.centreId },
    });
    await addPayLinkAttempt(link.id, txnid);
    if (isJson) return NextResponse.json({ ok: true, url, txnid });
    return NextResponse.redirect(url, 303);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not start the payment";
    console.error("[easebuzz] initiate failed:", msg);
    if (isJson) return NextResponse.json({ error: msg }, { status: 400 });
    return back(`result=error&msg=${encodeURIComponent(msg.slice(0, 200))}`);
  }
}
