"use client";

import { useEffect, useState } from "react";

/** Polls the room status and shows a countdown; turns into a Join button when the host opens the room. */
export function WaitingRoom({
  token,
  startsAt,
  initiallyOpen,
  platform = "the live room",
  tip = "",
  passcode: initialPasscode = "",
}: {
  token: string;
  startsAt: string;
  initiallyOpen: boolean;
  platform?: string;
  tip?: string;
  passcode?: string;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [passcode, setPasscode] = useState(initialPasscode);
  // null until mounted, so server and browser render the same HTML (no clock in SSR)
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (open) return;
    let stop = false;
    const poll = async () => {
      const d = await fetch(`/api/live/status/${token}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);
      if (!stop && d?.open) {
        setPasscode(typeof d.passcode === "string" ? d.passcode : "");
        setOpen(true);
      }
    };
    poll();
    const t = window.setInterval(poll, 15000);
    return () => {
      stop = true;
      window.clearInterval(t);
    };
  }, [open, token]);

  const left = now === null ? 0 : Date.parse(startsAt) - now;
  const parts = now !== null && left > 0 ? [Math.floor(left / 86400000), Math.floor((left % 86400000) / 3600000), Math.floor((left % 3600000) / 60000), Math.floor((left % 60000) / 1000)] : null;

  if (open)
    return (
      <div className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-[#E2445C] px-3 py-1 text-[12px] font-bold text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> LIVE NOW
        </p>
        <p className="mt-3 text-[15px] text-[#41564f]">The room is open.</p>
        <a href={`/api/live/join/${token}`} className="btn-primary btn-3d btn-3d-teal mt-4 !px-8 !py-3.5 !text-[15px]">
          Join on {platform} →
        </a>
        {passcode && (
          <p className="mt-4 text-[13.5px] text-[#41564f]">
            Passcode: <b className="rounded-lg bg-[#F1F7F5] px-2 py-1 font-mono text-[15px] tracking-wider text-brand-deep">{passcode}</b>
          </p>
        )}
        {tip && <p className="mx-auto mt-3 max-w-md text-[12px] text-[#6b807b]">{tip}</p>}
      </div>
    );

  return (
    <div className="text-center">
      {now === null ? (
        <p className="text-[13px] font-semibold uppercase tracking-wide text-brand-teal">Getting the room ready…</p>
      ) : parts ? (
        <>
          <p className="text-[13px] font-semibold uppercase tracking-wide text-brand-teal">Starts in</p>
          <div className="mt-3 flex justify-center gap-2">
            {(["days", "hrs", "min", "sec"] as const).map((l, i) =>
              i === 0 && parts[0] === 0 ? null : (
                <span key={l} className="emboss min-w-[68px] rounded-2xl px-3 py-3">
                  <span className="block text-2xl font-bold tabular-nums text-brand-deep">{String(parts[i]).padStart(2, "0")}</span>
                  <span className="text-[11px] text-[#6b807b]">{l}</span>
                </span>
              ),
            )}
          </div>
        </>
      ) : (
        <p className="text-[15px] font-semibold text-brand-deep">Waiting for the host to start the session…</p>
      )}
      <p className="mt-4 text-[13px] text-[#6b807b]">Keep this page open. The Join button appears here automatically when the room opens.</p>
      {tip && <p className="mx-auto mt-2 max-w-md text-[12px] text-[#8aa39c]">Tip: {tip}</p>}
    </div>
  );
}
