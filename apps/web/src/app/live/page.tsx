import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LeadForm } from "@/components/lead-form";
import { RegisterButton } from "@/components/live/register-card";
import { formatINR } from "@qschool/shared";
import { publicSessions } from "@/lib/live/public";
import { KIND_LABEL, PLATFORMS, fmtWhen } from "@/lib/live/types";

// Sessions are scheduled in Admin Console › Live sessions.
export const dynamic = "force-dynamic";

export default async function LivePage() {
  const all = await publicSessions();
  const now = all.filter((s) => s.phase === "live");
  const upcoming = all.filter((s) => s.phase === "upcoming");
  const replays = all.filter((s) => (s.phase === "ended" || s.phase === "past") && s.replayPublic && s.recordingUrl).reverse();

  return (
    <>
      <SiteHeader />
      <main className="container-qs py-12">
        <span className="chip">Q-School Live</span>
        <h1 className="mt-4 text-3xl font-bold text-brand-deep">Live classes, webinars & workshops</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#5c7772]">
          Interactive sessions in our own BigBlueButton classroom: whiteboard, polls, chat, breakout rooms and recordings. Join from any browser, nothing to install.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            {now.length > 0 && (
              <section className="mb-10">
                <h2 className="flex items-center gap-2 text-xl font-bold text-brand-deep">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#E2445C]" /> Live now
                </h2>
                <div className="mt-4 space-y-4">
                  {now.map((s) => (
                    <SessionCard key={s.id} s={s} />
                  ))}
                </div>
              </section>
            )}

            <h2 className="text-xl font-bold text-brand-deep">Upcoming sessions</h2>
            {upcoming.length ? (
              <div className="mt-5 space-y-4">
                {upcoming.map((s) => (
                  <SessionCard key={s.id} s={s} />
                ))}
              </div>
            ) : (
              <p className="card mt-5 p-6 text-sm text-[#5c7772]">New sessions are announced every week. Leave your number and we&apos;ll WhatsApp you the next one.</p>
            )}

            {replays.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-brand-deep">Watch the replays</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {replays.map((s) => (
                    <li key={s.id}>
                      <a href={s.recordingUrl} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-4 transition hover:border-brand-teal">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal100 text-brand-deep">▶</span>
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-semibold text-brand-deep">{s.title}</span>
                          <span className="block text-[12px] text-[#5c7772]">
                            {KIND_LABEL[s.kind]} · {fmtWhen(s.startsAt)}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="card mt-10 p-5">
              <h3 className="text-sm font-semibold text-brand-deep">How a Q-School Live session works</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-4">
                {[
                  ["📝", "Register", "Pick a session and get your personal join link"],
                  ["🔔", "Reminders", "WhatsApp reminders before it starts"],
                  ["🎥", "Join", "One click from web or app, no installs"],
                  ["▶️", "Replay", "Recordings are shared after the session"],
                ].map(([ico, t, d]) => (
                  <div key={t} className="rounded-xl bg-[#f4faf8] p-4">
                    <p className="text-xl">{ico}</p>
                    <p className="mt-2 text-sm font-semibold text-brand-deep">{t}</p>
                    <p className="mt-1 text-xs text-[#5c7772]">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside>
            <div className="card sticky top-24 p-6" id="register">
              <h3 className="text-lg font-bold text-brand-deep">Get notified</h3>
              <p className="mt-1 text-sm text-[#5c7772]">Tell us what your child likes and we&apos;ll WhatsApp new sessions and seat links.</p>
              <div className="mt-5">
                <LeadForm source="live_page" />
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function SessionCard({ s }: { s: Awaited<ReturnType<typeof publicSessions>>[number] }) {
  const pct = s.capacity ? Math.min(100, Math.round((s.registered / s.capacity) * 100)) : 0;
  const full = !!s.capacity && s.registered >= s.capacity;
  return (
    <div className={`card p-5 ${s.phase === "live" ? "border-[#E2445C]/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{KIND_LABEL[s.kind]}</span>
            <span className="text-[11.5px] font-semibold" style={{ color: PLATFORMS[s.platform].color }}>
              on {PLATFORMS[s.platform].label}
            </span>
            {s.phase === "live" && <span className="rounded-full bg-[#E2445C] px-2.5 py-0.5 text-[11px] font-bold text-white">LIVE</span>}
          </div>
          <p className="mt-2 font-semibold text-brand-deep">{s.title}</p>
          <p className="mt-1 text-xs text-[#5c7772]">
            {s.host && `${s.host} · `}
            {fmtWhen(s.startsAt)} · {s.durationMin} min
          </p>
          {s.description && <p className="mt-2 line-clamp-2 text-[13px] text-[#41564f]">{s.description}</p>}
        </div>
        <span className={`chip ${s.price ? "!border-amber-300 !bg-amber-50 !text-amber-700" : ""}`}>{s.price ? formatINR(s.price) : "FREE"}</span>
      </div>
      {s.capacity > 0 && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef5f3]">
            <div className="h-full rounded-full bg-brand-teal" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-[#5c7772]">{full ? "All seats taken" : `${s.capacity - s.registered} of ${s.capacity} seats left`}</p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <RegisterButton sessionId={s.id} title={s.title} full={full} />
        {s.phase === "live" && <span className="text-[12.5px] text-[#5c7772]">Already registered? Open your personal join link.</span>}
      </div>
    </div>
  );
}
