"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { SettingsNav } from "@/components/admin/settings-nav";
import { Btn, Card, Toast, useToast } from "@/components/admin/ui";
import { NumberField, Row, TextField, Toggle, fieldInput } from "@/components/admin/site-fields";
import { useSettings } from "@/components/admin/use-settings";
import { Icon } from "@/components/icons";
import type { BbbSettings, PlatformSettings, PublicSettings } from "@/lib/settings/store";
import { PLATFORMS, type Platform } from "@/lib/live/types";

type Form = Omit<BbbSettings, "secret"> & { secret: string };

export default function LiveSettingsPage() {
  const { data, save } = useSettings();
  const [f, setF] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [toast, show] = useToast();

  useEffect(() => {
    if (!data) return;
    const { hasSecret: _h, secretHint: _s, fromEnv: _e, configured: _c, ...rest } = data.bbb;
    setF({ ...rest, secret: "" });
  }, [data]);

  if (!f || !data) {
    return (
      <AdminShell>
        <SettingsNav />
        <p className="p-4 text-sm text-[#6b807b]">Loading…</p>
      </AdminShell>
    );
  }
  const u = <K extends keyof Form>(k: K) => (v: Form[K]) => setF({ ...f, [k]: v });
  const { hasSecret: _h, secretHint, fromEnv, configured, ...saved } = data.bbb;
  const dirty = JSON.stringify({ ...saved, secret: "" }) !== JSON.stringify(f);

  const runTest = async () => {
    setTesting(true);
    setTest(null);
    const r = await fetch("/api/admin/settings/bbb-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: f.url, secret: f.secret, algorithm: f.algorithm }),
    });
    const d = await r.json();
    setTesting(false);
    setTest(d.ok ? { ok: true, text: `Connected${d.version ? ` to BigBlueButton ${d.version}` : ""}. ${d.meetings} meeting${d.meetings === 1 ? "" : "s"} running right now.` } : { ok: false, text: d.error ?? "Connection failed" });
  };

  return (
    <AdminShell>
      <SettingsNav />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (f.enabled && !f.url) return show("Add the server URL before switching live classes on");
          setBusy(true);
          try {
            await save({ bbb: f });
            show("Live class settings saved");
          } catch (err) {
            show((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
        className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]"
      >
        <div className="space-y-4">
          <PlatformsCard data={data} save={save} show={show} />

          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-deep text-[#2BD6B4]">
                <Icon name="live" size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold text-brand-ink">BigBlueButton</p>
                <p className="text-[12.5px] text-[#6b807b]">Open-source virtual classroom: video, audio, whiteboard, polls, breakout rooms and recordings.</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                  configured && saved.enabled ? "bg-[#EAF7EA] text-[#0A7F0A]" : configured ? "bg-[#F1F5F4] text-[#41564F]" : "bg-[#FFF6E0] text-[#8A5A00]"
                }`}
              >
                {configured && saved.enabled ? "● Connected & on" : configured ? "Set up, switched off" : "Not connected"}
              </span>
            </div>
            <div className="mt-4">
              <Toggle label="Use BigBlueButton for live sessions" hint="Webinars, workshops and live classes open in your BBB server" checked={f.enabled} onChange={u("enabled")} />
            </div>
          </Card>

          <Card title="Server connection">
            <div className="space-y-4">
              <TextField
                label="Server URL"
                hint={fromEnv.url ? "set by BBB_URL on the server" : "from bbb-conf --secret"}
                value={f.url}
                onChange={u("url")}
                max={300}
                placeholder="https://live.yourschool.in/bigbluebutton/"
              />
              <label className="block">
                <span className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-[12px] font-semibold text-[#41564f]">
                    Shared secret
                    <span className="ml-1.5 font-normal text-[#8aa39c]">{fromEnv.secret ? "set by BBB_SECRET on the server" : "stored on the server, never shown again"}</span>
                  </span>
                  {secretHint && <span className="font-mono text-[11.5px] text-[#6b807b]">current: {secretHint}</span>}
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={f.secret}
                  onChange={(e) => u("secret")(e.target.value)}
                  placeholder={secretHint ? "Leave blank to keep the current secret" : "Paste the secret"}
                  className={`${fieldInput} font-mono`}
                />
              </label>
              <Row>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Checksum algorithm</span>
                  <select value={f.algorithm} onChange={(e) => u("algorithm")(e.target.value as Form["algorithm"])} className={fieldInput}>
                    <option value="sha256">SHA-256 (BBB 2.6 and newer)</option>
                    <option value="sha1">SHA-1 (older servers)</option>
                  </select>
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={runTest}
                    disabled={testing || !f.url || (!f.secret && !_h)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-teal bg-white text-[13px] font-semibold text-brand-teal transition hover:bg-brand-teal100/50 disabled:opacity-40"
                  >
                    <Icon name="live" size={16} /> {testing ? "Testing…" : "Test connection"}
                  </button>
                </div>
              </Row>
              {test && (
                <p className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-[13px] ${test.ok ? "bg-[#EAF7EA] text-[#0A6B0A]" : "bg-[#FDF2F2] text-[#B42E2E]"}`}>
                  <Icon name={test.ok ? "check" : "alert"} size={16} className="mt-0.5 shrink-0" /> {test.text}
                </p>
              )}
            </div>
          </Card>

          <Card title="Room defaults">
            <div className="space-y-3">
              <Row>
                <Toggle label="Allow recording" hint="each session can still turn it off" checked={f.record} onChange={u("record")} />
                <Toggle label="Start recording automatically" hint="otherwise the host presses Record" checked={f.autoStartRecording} onChange={u("autoStartRecording")} />
              </Row>
              <Row>
                <Toggle label="Mute students when they join" checked={f.muteOnStart} onChange={u("muteOnStart")} />
                <Toggle label="Only hosts see webcams" hint="protects students' privacy" checked={f.webcamsOnlyForModerator} onChange={u("webcamsOnlyForModerator")} />
              </Row>
              <Row>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Entry</span>
                  <select value={f.guestPolicy} onChange={(e) => u("guestPolicy")(e.target.value as Form["guestPolicy"])} className={fieldInput}>
                    <option value="ALWAYS_ACCEPT">Registered students enter directly</option>
                    <option value="ASK_MODERATOR">Host approves each person (waiting room)</option>
                  </select>
                </label>
                <NumberField label="Max people per room" hint="0 = no limit" max={5000} value={f.maxParticipants} onChange={u("maxParticipants")} />
              </Row>
              <TextField label="Welcome message" hint="shown in the chat; %%CONFNAME%% = session title" value={f.welcome} onChange={u("welcome")} max={1000} multiline rows={2} />
              <TextField label="After leaving, send people to" hint="optional, defaults to your Live page" value={f.logoutUrl} onChange={u("logoutUrl")} max={300} placeholder="https://…" />
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            {dirty && <span className="mr-auto self-center text-[12.5px] font-medium text-[#8A5A00]">Unsaved changes</span>}
            <Btn type="submit" icon="check" disabled={!dirty || busy}>
              {busy ? "Saving…" : "Save settings"}
            </Btn>
          </div>
        </div>

        <aside className="space-y-4">
          <Card title="Where to find these">
            <ol className="list-decimal space-y-2 pl-5 text-[13px] text-[#41564f]">
              <li>Sign in to your BigBlueButton server over SSH.</li>
              <li>
                Run <code className="rounded bg-[#F1F5F4] px-1.5 py-0.5 font-mono text-[12px]">sudo bbb-conf --secret</code>
              </li>
              <li>Copy the URL and Secret it prints into this page.</li>
              <li>Click Test connection, then switch live sessions on and save.</li>
            </ol>
            <p className="mt-3 text-[12px] text-[#6b807b]">
              Using a managed BigBlueButton host instead? Ask them for the API URL and shared secret.
            </p>
          </Card>
          <Card title="How sessions work">
            <ul className="space-y-2 text-[13px] text-[#41564f]">
              <li>• Schedule webinars and workshops in <Link href="/admin/live" className="font-semibold text-brand-teal">Live sessions</Link>.</li>
              <li>• Students register on the website&apos;s Live page and get a personal join link. Each registration also lands in CRM › Leads.</li>
              <li>• The room opens when the host clicks <b>Start</b>; students waiting on their link are let in automatically.</li>
              <li>• Recordings appear on the session afterwards, and you can show a replay on the website.</li>
            </ul>
          </Card>
          <Card title="Keep the secret safe">
            <p className="text-[13px] text-[#41564f]">
              The secret is kept on the server and used only to sign links. In production you can set <code className="font-mono text-[12px]">BBB_URL</code> and{" "}
              <code className="font-mono text-[12px]">BBB_SECRET</code> as environment variables instead.
            </p>
          </Card>
        </aside>
      </form>
      <Toast msg={toast} />
    </AdminShell>
  );
}

const KEYS = Object.keys(PLATFORMS) as Platform[];

function PlatformsCard({ data, save, show }: { data: PublicSettings; save: (p: Record<string, unknown>) => Promise<PublicSettings>; show: (m: string) => void }) {
  const [p, setP] = useState<PlatformSettings>(data.platforms);
  const [busy, setBusy] = useState(false);
  useEffect(() => setP(data.platforms), [data.platforms]);
  const dirty = JSON.stringify(p) !== JSON.stringify(data.platforms);
  const on = KEYS.filter((k) => p.enabled[k]);

  const submit = async () => {
    if (!on.length) return show("Keep at least one platform switched on");
    setBusy(true);
    try {
      await save({ platforms: { ...p, defaultPlatform: p.enabled[p.defaultPlatform] ? p.defaultPlatform : on[0] } });
      show("Platforms saved");
    } catch (err) {
      show((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Meeting platforms">
      <p className="-mt-1 mb-3 text-[12.5px] text-[#6b807b]">
        Choose where each session runs when you schedule it. BigBlueButton rooms are created automatically; for Teams, Zoom, JupiterMeet or any other link you paste the
        meeting link, and students only see it on their personal join page when the room opens.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {KEYS.map((k) => (
          <div key={k} className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full" style={{ background: PLATFORMS[k].color }} />
            <div className="[&>label]:pl-8">
              <Toggle
                label={PLATFORMS[k].label}
                hint={k === "bbb" ? (data.bbb.configured ? "server connected below" : "needs the server below") : k === "jitsi" ? "rooms created automatically" : "paste the meeting link"}
                checked={p.enabled[k]}
                onChange={(v) => setP({ ...p, enabled: { ...p.enabled, [k]: v } })}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Default for new sessions</span>
          <select value={p.defaultPlatform} onChange={(e) => setP({ ...p, defaultPlatform: e.target.value as Platform })} className={fieldInput}>
            {on.map((k) => (
              <option key={k} value={k}>
                {PLATFORMS[k].label}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Jitsi server" hint="or your own" value={p.jitsiDomain} onChange={(v) => setP({ ...p, jitsiDomain: v })} max={120} placeholder="meet.jit.si" />
        <TextField label="JupiterMeet site" hint="optional" value={p.jupiterUrl} onChange={(v) => setP({ ...p, jupiterUrl: v })} max={300} placeholder="https://meet.yourschool.in" />
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        {dirty && <span className="mr-auto text-[12.5px] font-medium text-[#8A5A00]">Unsaved changes</span>}
        <Btn type="button" icon="check" disabled={!dirty || busy} onClick={submit}>
          {busy ? "Saving…" : "Save platforms"}
        </Btn>
      </div>
    </Card>
  );
}
