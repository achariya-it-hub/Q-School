import Link from "next/link";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WaitingRoom } from "@/components/live/waiting-room";
import { roomOpen } from "@/lib/live/access";
import { findByToken } from "@/lib/live/store";
import { calendarLink } from "@/lib/live/public";
import { KIND_LABEL, PLATFORMS, fmtWhen, phase } from "@/lib/live/types";
import { getSettings } from "@/lib/settings/store";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function JoinPage({ params, searchParams }: { params: { token: string }; searchParams: { wait?: string } }) {
  const f = await findByToken(params.token);
  const st = await getSettings();

  if (!f) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-brand-deep">This join link isn&apos;t valid</h1>
        <p className="mt-2 text-sm text-[#5c7772]">Check the link in your WhatsApp or email, or register again on the Live page.</p>
        <Link href="/live" className="btn-primary mt-5">
          See live sessions
        </Link>
      </Shell>
    );
  }

  const { session: s, reg } = f;
  const p = phase(s);
  const open = await roomOpen(s);
  const pf = PLATFORMS[s.platform];
  const unavailable = s.platform === "bbb" && !st.bbb.enabled;
  const h = headers();
  const self = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}/live/join/${params.token}`;

  return (
    <Shell>
      <div className="flex flex-wrap gap-2">
        <span className="chip">{KIND_LABEL[s.kind]}</span>
        <span className="chip" style={{ color: pf.color, borderColor: `${pf.color}40`, background: `${pf.color}12` }}>
          on {pf.label}
        </span>
      </div>
      <h1 className="mt-3 text-2xl font-bold text-brand-deep sm:text-3xl">{s.title}</h1>
      <p className="mt-2 text-sm text-[#5c7772]">
        {s.host && `${s.host} · `}
        {fmtWhen(s.startsAt)} · {s.durationMin} min
      </p>
      <p className="mt-1 text-[13px] text-[#41564f]">
        Registered as <b>{reg.name}</b>
      </p>

      <div className="card mt-6 p-6 sm:p-8">
        {p === "cancelled" ? (
          <p className="text-center text-[15px] text-[#41564f]">This session was cancelled. We&apos;ll WhatsApp you when it&apos;s rescheduled.</p>
        ) : p === "ended" || p === "past" ? (
          <div className="text-center">
            <p className="text-[15px] font-semibold text-brand-deep">This session has ended.</p>
            {s.replayPublic && s.recordingUrl ? (
              <a href={s.recordingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-3d btn-3d-teal mt-4">
                ▶ Watch the replay
              </a>
            ) : (
              <p className="mt-2 text-sm text-[#5c7772]">If it was recorded, the replay will be shared with you soon.</p>
            )}
          </div>
        ) : unavailable ? (
          <p className="text-center text-[15px] text-[#41564f]">The live classroom isn&apos;t available right now. Please contact us on WhatsApp.</p>
        ) : (
          <>
            {searchParams.wait && !open && <p className="mb-4 rounded-xl bg-[#FFF6E0] px-3 py-2 text-center text-[13px] text-[#8A5A00]">The host hasn&apos;t opened the room yet.</p>}
            <WaitingRoom token={params.token} startsAt={s.startsAt} initiallyOpen={open} platform={pf.label} tip={pf.studentTip} passcode={open ? s.passcode : ""} />
          </>
        )}
      </div>

      {(p === "upcoming" || p === "live") && (
        <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
          <a href={calendarLink(s, self)} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-4 !py-2">
            📅 Add to Google Calendar
          </a>
          <span className="self-center text-[#6b807b]">Bookmark this page. It&apos;s your personal link, please don&apos;t share it.</span>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="container-qs max-w-3xl py-12">{children}</main>
      <SiteFooter />
    </>
  );
}
