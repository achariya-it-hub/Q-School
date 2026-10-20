"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Btn, Modal, Segmented, Toast, useToast } from "@/components/admin/ui";
import { EDITORS } from "@/components/admin/site-editors";
import { move } from "@/components/admin/site-fields";
import { Icon, type IconName } from "@/components/icons";
import { SECTION_META, type HomeContent, type SectionKey } from "@/lib/site/home-content";

interface State {
  published: HomeContent;
  publishedAt: string | null;
  draft: HomeContent | null;
  draftSavedAt: string | null;
  history: { index: number; at: string; by: string }[];
  defaults: HomeContent;
}

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "never";

/** Home-page editor (rendered under Admin › Settings › Website). */
export function WebsiteEditor() {
  const [state, setState] = useState<State | null>(null);
  const [content, setContent] = useState<HomeContent | null>(null);
  const [saved, setSaved] = useState(""); // JSON of the last saved draft/published version
  const [sel, setSel] = useState<SectionKey>("hero");
  const [busy, setBusy] = useState<"" | "draft" | "publish" | "preview">("");
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [frameKey, setFrameKey] = useState(0);
  const [toast, show] = useToast();
  const editorTop = useRef<HTMLDivElement>(null);

  const apply = useCallback((s: State) => {
    setState(s);
    const c = s.draft ?? s.published;
    setContent(c);
    setSaved(JSON.stringify(c));
  }, []);

  useEffect(() => {
    fetch("/api/admin/site")
      .then((r) => r.json())
      .then(apply);
  }, [apply]);

  const dirty = !!content && JSON.stringify(content) !== saved;

  // warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const call = async (body: Record<string, unknown>) => {
    const r = await fetch("/api/admin/site", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error ?? "Could not save");
    return d as State;
  };

  const saveDraft = async (quiet = false) => {
    if (!content) return;
    setBusy(quiet ? "preview" : "draft");
    try {
      apply(await call({ action: "draft", content }));
      if (!quiet) show("Draft saved. Visitors still see the published page.");
      setFrameKey((k) => k + 1);
    } catch (e) {
      show((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const doPublish = async () => {
    if (!content) return;
    setBusy("publish");
    try {
      apply(await call({ action: "publish", content }));
      setConfirmPublish(false);
      show("Published. The home page is updated.");
      setFrameKey((k) => k + 1);
    } catch (e) {
      show((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const discard = async () => {
    if (!window.confirm("Discard all unpublished changes and go back to the live version?")) return;
    apply(await call({ action: "discard" }));
    show("Draft discarded");
    setFrameKey((k) => k + 1);
  };

  const restore = async (index: number) => {
    if (dirty && !window.confirm("You have unsaved changes. Replace them with this older version?")) return;
    apply(await call({ action: "restore", index }));
    setHistoryOpen(false);
    show("Older version loaded as a draft. Publish it to make it live.");
    setFrameKey((k) => k + 1);
  };

  const openPreview = async () => {
    if (dirty) await saveDraft(true);
    setPreview(true);
    setFrameKey((k) => k + 1);
  };

  const sections = content?.sections ?? [];
  const setSections = (s: HomeContent["sections"]) => content && setContent({ ...content, sections: s });
  const hiddenCount = sections.filter((s) => !s.visible).length;

  const status = useMemo(() => {
    if (!state) return null;
    if (dirty) return { tone: "bg-[#FFF6E0] text-[#8A5A00]", icon: "edit" as IconName, text: "Unsaved changes" };
    if (state.draft) return { tone: "bg-[#EEF2FF] text-[#3B47B5]", icon: "clock" as IconName, text: `Draft saved ${when(state.draftSavedAt)}, not published yet` };
    return { tone: "bg-[#EAF7EA] text-[#0A7F0A]", icon: "check" as IconName, text: state.publishedAt ? `Live · published ${when(state.publishedAt)}` : "Live · showing the original content" };
  }, [state, dirty]);

  const resetSection = () => {
    if (!content || !state) return;
    const msg =
      sel === "hero"
        ? "Reset the hero slides to the original three? Your slide edits will be lost."
        : `Reset “${SECTION_META[sel].label}” to the original content?`;
    if (!window.confirm(msg)) return;
    setContent({ ...content, [sel]: structuredClone(state.defaults[sel]) });
    show(`${SECTION_META[sel].label} reset. Save to keep it.`);
  };

  if (!content || !state) {
    return (
      <p className="p-6 text-sm text-[#6b807b]">Loading website content…</p>
    );
  }

  const Editor = EDITORS[sel] as (p: { value: unknown; onChange: (v: unknown) => void }) => React.ReactNode;
  const selVisible = sections.find((s) => s.key === sel)?.visible ?? true;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <p className="mr-auto text-[13px] text-[#6b807b]">Edit the sections of your public home page. Changes go live only when you publish.</p>
        <Btn variant="ghost" icon="clock" onClick={() => setHistoryOpen(true)}>
          History
        </Btn>
        <Btn variant="ghost" icon="eye" onClick={openPreview} disabled={busy !== ""}>
          {busy === "preview" ? "Saving…" : "Preview"}
        </Btn>
        <Btn variant="ghost" icon="download" onClick={() => saveDraft()} disabled={!dirty || busy !== ""}>
          {busy === "draft" ? "Saving…" : "Save draft"}
        </Btn>
        <Btn icon="globe" onClick={() => setConfirmPublish(true)} disabled={busy !== "" || (!dirty && !state.draft)}>
          Publish
        </Btn>
      </div>

      {/* status bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {status && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${status.tone}`}>
            <Icon name={status.icon} size={14} /> {status.text}
          </span>
        )}
        {(state.draft || dirty) && (
          <button onClick={discard} className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[#C22F33] hover:bg-[#FDF2F2]">
            Discard changes
          </button>
        )}
        <a href="/" target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-brand-teal hover:bg-brand-teal100/60">
          <Icon name="external" size={14} /> View live site
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[290px_1fr]">
        {/* section list */}
        <aside className="h-max rounded-[20px] border border-[#E2ECE9] bg-white p-3 lg:sticky lg:top-[88px]">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#6b807b]">Sections</p>
            <span className="text-[11.5px] text-[#8aa39c]">{hiddenCount ? `${hiddenCount} hidden` : "all showing"}</span>
          </div>
          <ol className="space-y-1">
            {sections.map((s, i) => {
              const m = SECTION_META[s.key];
              const on = s.key === sel;
              return (
                <li key={s.key} className={`group flex items-center gap-1 rounded-xl pr-1 transition ${on ? "bg-brand-deep text-white" : "hover:bg-[#F1F7F5]"}`}>
                  <button
                    onClick={() => {
                      setSel(s.key);
                      editorTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-left"
                    aria-current={on}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${on ? "bg-white/15" : "bg-brand-teal100 text-brand-deep"}`}>
                      <Icon name={m.icon as IconName} size={15} />
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-[13px] font-semibold ${!s.visible ? (on ? "text-white/60 line-through" : "text-[#93a5a0] line-through") : ""}`}>{m.label}</span>
                  </button>
                  <span className={`flex shrink-0 items-center ${on ? "" : "opacity-60 group-hover:opacity-100"}`}>
                    <OrderBtn label={`Move ${m.label} up`} disabled={i === 0} onClick={() => setSections(move(sections, i, -1))} on={on} d="M12 19V5M5 12l7-7 7 7" />
                    <OrderBtn label={`Move ${m.label} down`} disabled={i === sections.length - 1} onClick={() => setSections(move(sections, i, 1))} on={on} d="M12 5v14M19 12l-7 7-7-7" />
                    <button
                      onClick={() => setSections(sections.map((x) => (x.key === s.key ? { ...x, visible: !x.visible } : x)))}
                      aria-label={s.visible ? `Hide ${m.label}` : `Show ${m.label}`}
                      title={s.visible ? "Hide on the page" : "Show on the page"}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${on ? "hover:bg-white/15" : "hover:bg-white"}`}
                    >
                      {s.visible ? (
                        <Icon name="eye" size={15} />
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a13 13 0 0 1-3.2 4.2M6.1 6.1C3.9 7.6 2.5 9.8 2 12c1 2.5 5 7 10 7 1.8 0 3.4-.5 4.8-1.3" />
                        </svg>
                      )}
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 px-2 text-[11.5px] leading-relaxed text-[#8aa39c]">Use the arrows to change the order on the page, and the eye to hide a section without deleting it.</p>
        </aside>

        {/* editor */}
        <section ref={editorTop} className="min-w-0 scroll-mt-24 rounded-[20px] border border-[#E2ECE9] bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#EEF3F1] px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal100 text-brand-deep">
              <Icon name={SECTION_META[sel].icon as IconName} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-semibold text-brand-ink">{SECTION_META[sel].label}</h2>
              <p className="text-[12.5px] text-[#6b807b]">
                {SECTION_META[sel].help}
                {SECTION_META[sel].anchor && <span className="ml-1.5 font-mono text-[11.5px] text-[#8aa39c]">#{SECTION_META[sel].anchor}</span>}
              </p>
            </div>
            {!selVisible && <span className="rounded-full bg-[#FFF6E0] px-2.5 py-1 text-[11.5px] font-semibold text-[#8A5A00]">Hidden on the page</span>}
            <button onClick={resetSection} className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[#6b807b] hover:bg-[#F1F7F5]">
              Reset to original
            </button>
          </div>
          <div className="p-5">
            <Editor key={sel} value={content[sel]} onChange={(v) => setContent({ ...content, [sel]: v })} />
          </div>
          <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 rounded-b-[20px] border-t border-[#EEF3F1] bg-white/95 px-5 py-3 backdrop-blur">
            {dirty && <span className="mr-auto text-[12.5px] font-medium text-[#8A5A00]">You have unsaved changes</span>}
            <Btn variant="ghost" icon="eye" onClick={openPreview} disabled={busy !== ""}>
              Preview
            </Btn>
            <Btn variant="ghost" onClick={() => saveDraft()} disabled={!dirty || busy !== ""}>
              Save draft
            </Btn>
            <Btn icon="globe" onClick={() => setConfirmPublish(true)} disabled={busy !== "" || (!dirty && !state.draft)}>
              Publish
            </Btn>
          </div>
        </section>
      </div>

      {/* preview */}
      {preview && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#0b1f1b]/80 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-3 shadow">
            <p className="text-[14px] font-semibold text-brand-ink">Draft preview</p>
            <Segmented
              label="Preview size"
              value={device}
              onChange={setDevice}
              options={[
                { value: "desktop", label: "Desktop" },
                { value: "mobile", label: "Mobile" },
              ]}
            />
            <span className="text-[12.5px] text-[#6b807b]">Only signed-in Console users can see this.</span>
            <div className="ml-auto flex gap-2">
              <a href="/?preview=draft" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#D9E6E2] px-3 text-[13px] font-semibold text-brand-deep">
                <Icon name="external" size={15} /> New tab
              </a>
              <Btn icon="globe" onClick={() => setConfirmPublish(true)} disabled={busy !== ""}>
                Publish
              </Btn>
              <Btn variant="ghost" icon="x" onClick={() => setPreview(false)}>
                Close
              </Btn>
            </div>
          </div>
          <div className="flex flex-1 justify-center overflow-hidden p-4">
            <iframe
              key={frameKey}
              title="Home page draft preview"
              src="/?preview=draft"
              className={`h-full rounded-xl bg-white shadow-2xl transition-all ${device === "mobile" ? "w-[390px]" : "w-full max-w-[1440px]"}`}
            />
          </div>
        </div>
      )}

      {/* publish confirm */}
      <Modal open={confirmPublish} onClose={() => setConfirmPublish(false)} title="Publish the home page?">
        <p className="text-[14px] text-[#41564f]">Your changes will be visible to everyone visiting the website right away. The current live version is kept in History, so you can bring it back.</p>
        {hiddenCount > 0 && (
          <p className="mt-3 rounded-xl bg-[#FFF6E0] px-3 py-2 text-[13px] text-[#8A5A00]">
            {hiddenCount} section{hiddenCount > 1 ? "s are" : " is"} hidden: {sections.filter((s) => !s.visible).map((s) => SECTION_META[s.key].label).join(", ")}.
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setConfirmPublish(false)}>
            Cancel
          </Btn>
          <Btn icon="globe" onClick={doPublish} disabled={busy === "publish"}>
            {busy === "publish" ? "Publishing…" : "Publish now"}
          </Btn>
        </div>
      </Modal>

      {/* history */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Published versions">
        <p className="mb-3 text-[13px] text-[#6b807b]">The last 10 versions are kept. Loading one puts it in your draft; publish it to make it live again.</p>
        <ul className="divide-y divide-[#EEF3F1] rounded-xl border border-[#E2ECE9]">
          <li className="flex items-center gap-3 px-3.5 py-3">
            <span className="h-2 w-2 rounded-full bg-[#0A7F0A]" />
            <span className="flex-1 text-[13.5px]">
              <b className="text-brand-ink">Live now</b> <span className="text-[#6b807b]">· published {when(state.publishedAt)}</span>
            </span>
          </li>
          {state.history.map((h) => (
            <li key={h.index} className="flex items-center gap-3 px-3.5 py-3">
              <span className="h-2 w-2 rounded-full bg-[#C9D8D4]" />
              <span className="flex-1 text-[13.5px] text-[#41564f]">
                Published {when(h.at)} <span className="text-[#8aa39c]">· replaced by {h.by}</span>
              </span>
              <button onClick={() => restore(h.index)} className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-brand-teal hover:bg-brand-teal100/60">
                Load into draft
              </button>
            </li>
          ))}
          {!state.history.length && <li className="px-3.5 py-3 text-[13px] text-[#8aa39c]">Older versions will appear here after you publish.</li>}
        </ul>
      </Modal>

      <Toast msg={toast} />
    </>
  );
}

function OrderBtn({ label, onClick, disabled, on, d }: { label: string; onClick: () => void; disabled: boolean; on: boolean; d: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-7 w-6 items-center justify-center rounded-lg disabled:opacity-25 ${on ? "hover:bg-white/15" : "hover:bg-white"}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </button>
  );
}
