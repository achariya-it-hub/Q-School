"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Btn, Modal, inputCls } from "./ui";

const LANGUAGES = [
  { code: "en_US", label: "English (US)" },
  { code: "en_GB", label: "English (UK)" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", label: "Malayalam (മലയാളം)" },
  { code: "mr", label: "Marathi (मराठी)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "gu", label: "Gujarati (ગુજરાતી)" },
];

export interface CreateTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  showToast: (m: string) => void;
}

interface TemplateButton {
  type: "QUICK_REPLY" | "URL";
  text: string;
  url?: string;
}

export function CreateTemplateModal({ open, onClose, onCreated, showToast }: CreateTemplateModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"UTILITY" | "MARKETING">("UTILITY");
  const [language, setLanguage] = useState("en_US");
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [exampleParams, setExampleParams] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formId = useId();

  // Find all variable numbers {{1}}, {{2}}...
  const paramCount = useMemo(() => {
    const nums = Array.from(body.matchAll(/\{\{(\d+)\}\}/g), (m) => Number(m[1]));
    return nums.length ? Math.max(...nums) : 0;
  }, [body]);

  // Clean formatted name
  const cleanName = useMemo(() => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }, [name]);

  const insertVariable = (num: number) => {
    const token = `{{${num}}}`;
    const textarea = textareaRef.current;
    if (!textarea) {
      setBody((prev) => `${prev} ${token}`.trim());
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextBody = body.substring(0, start) + token + body.substring(end);
    setBody(nextBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 10);
  };

  const handleParamChange = (index: number, val: string) => {
    const next = [...exampleParams];
    next[index] = val;
    setExampleParams(next);
  };

  const addButton = () => {
    if (buttons.length >= 3) return;
    setButtons([...buttons, { type: "QUICK_REPLY", text: "" }]);
  };

  const updateButton = (index: number, patch: Partial<TemplateButton>) => {
    setButtons(buttons.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!cleanName) {
      setError("Please specify a valid template name (lowercase letters, numbers, and underscores).");
      return;
    }
    if (!body.trim()) {
      setError("Template message body is required.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/whatsapp/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom: true,
          name: cleanName,
          category,
          language,
          header: header.trim() || undefined,
          body: body.trim(),
          footer: footer.trim() || undefined,
          buttons: buttons.length ? buttons : undefined,
          exampleParams: Array.from({ length: paramCount }, (_, i) => exampleParams[i]?.trim() || `Sample_${i + 1}`),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create template on Meta.");
      }

      showToast(`Template "${cleanName}" submitted to Meta for approval!`);
      // Reset form
      setName("");
      setHeader("");
      setBody("");
      setFooter("");
      setButtons([]);
      setExampleParams([]);
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Preview body with sample values filled in
  const previewBody = useMemo(() => {
    if (!body.trim()) return "Your message preview will appear here…";
    return body.replace(/\{\{(\d+)\}\}/g, (_m, n) => {
      const idx = Number(n) - 1;
      return exampleParams[idx]?.trim() || `[Value ${n}]`;
    });
  }, [body, exampleParams]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Create WhatsApp Message Template" wide>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_310px]">
        {/* Left column: Form inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#F8D7DA] bg-[#FCEDED] p-3 text-[13px] text-[#B42E2E]">
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1 leading-snug">{error}</div>
            </div>
          )}

          {/* Template Name */}
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-[#41564f]">
              Template Name <span className="text-[#B42E2E]">*</span>
            </label>
            <input
              type="text"
              className={`${inputCls} font-mono text-[13px]`}
              placeholder="e.g. session_reminder_v1"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
              maxLength={512}
              required
            />
            <p className="mt-1 text-[11.5px] text-[#7B8E89]">
              Lowercase letters, numbers, and underscores only. Meta identifier:{" "}
              <span className="font-mono font-medium text-brand-teal">{cleanName || "…"}</span>
            </p>
          </div>

          {/* Category & Language */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12.5px] font-semibold text-[#41564f]">
                Category <span className="text-[#B42E2E]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-1">
                <button
                  type="button"
                  onClick={() => setCategory("UTILITY")}
                  className={`rounded-lg py-1.5 text-center text-[12px] font-semibold transition ${
                    category === "UTILITY" ? "bg-white text-brand-deep shadow-sm" : "text-[#7B8E89] hover:text-brand-ink"
                  }`}
                >
                  Utility
                </button>
                <button
                  type="button"
                  onClick={() => setCategory("MARKETING")}
                  className={`rounded-lg py-1.5 text-center text-[12px] font-semibold transition ${
                    category === "MARKETING" ? "bg-white text-brand-deep shadow-sm" : "text-[#7B8E89] hover:text-brand-ink"
                  }`}
                >
                  Marketing
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#7B8E89]">
                {category === "UTILITY" ? "Order updates, reminders, account notices" : "Offers, promotions, welcome invites"}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-[12.5px] font-semibold text-[#41564f]">
                Language <span className="text-[#B42E2E]">*</span>
              </label>
              <select
                className={inputCls}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label} ({l.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Header (Optional) */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[12.5px] font-semibold text-[#41564f]">Header (Optional)</label>
              <span className="text-[11px] text-[#7B8E89]">{header.length}/60</span>
            </div>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Session Reminder or Special Announcement"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              maxLength={60}
            />
          </div>

          {/* Body Text */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[12.5px] font-semibold text-[#41564f]">
                Body Text <span className="text-[#B42E2E]">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#7B8E89]">Insert variable:</span>
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => insertVariable(n)}
                    className="rounded bg-[#E3F4F0] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-brand-teal transition hover:bg-brand-teal hover:text-white"
                  >
                    +{`{{${n}}}`}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              ref={textareaRef}
              rows={4}
              className="w-full rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-3 text-sm text-brand-ink outline-none transition focus:border-brand-teal focus:bg-white"
              placeholder="Hello {{1}}, your live workshop at Q-School starts at {{2}}. See you there!"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={1024}
              required
            />
            <p className="mt-0.5 text-[11.5px] text-[#7B8E89]">
              Use <code className="font-mono font-medium text-brand-teal">{"{{1}}"}</code>,{" "}
              <code className="font-mono font-medium text-brand-teal">{"{{2}}"}</code> for dynamic recipient names, dates or details.
            </p>
          </div>

          {/* Sample Values (if variables exist) */}
          {paramCount > 0 && (
            <div className="rounded-xl border border-[#D7EAE4] bg-[#F4FAF8] p-3.5">
              <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-brand-deep">
                <Icon name="clipboard" size={15} />
                <span>Variable Sample Values (Required by Meta)</span>
              </div>
              <p className="mb-3 text-[11.5px] text-[#55736C]">
                Meta reviews sample values to verify that content matches your chosen category before approving.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Array.from({ length: paramCount }, (_, i) => (
                  <div key={i}>
                    <label className="mb-1 block font-mono text-[11px] text-[#41564f]">
                      Sample for {`{{${i + 1}}}`}:
                    </label>
                    <input
                      type="text"
                      className="h-9 w-full rounded-lg border border-[#D0E2DD] bg-white px-2.5 text-[12.5px] text-brand-ink outline-none focus:border-brand-teal"
                      placeholder={i === 0 ? "e.g. John Doe" : i === 1 ? "e.g. 5:00 PM" : `Sample ${i + 1}`}
                      value={exampleParams[i] ?? ""}
                      onChange={(e) => handleParamChange(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer (Optional) */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[12.5px] font-semibold text-[#41564f]">Footer Text (Optional)</label>
              <span className="text-[11px] text-[#7B8E89]">{footer.length}/60</span>
            </div>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Reply STOP to opt out"
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              maxLength={60}
            />
          </div>

          {/* Interactive Buttons (Optional) */}
          <div className="border-t border-[#EEF3F1] pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#41564f]">
                Buttons (Optional, max 3)
              </span>
              {buttons.length < 3 && (
                <button
                  type="button"
                  onClick={addButton}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-teal hover:underline"
                >
                  <Icon name="plus" size={14} /> Add Button
                </button>
              )}
            </div>

            {buttons.map((btn, idx) => (
              <div key={idx} className="mb-2 flex items-center gap-2 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-2.5">
                <select
                  value={btn.type}
                  onChange={(e) => updateButton(idx, { type: e.target.value as any })}
                  className="h-8 rounded-lg border border-[#D9E6E2] bg-white px-2 text-[11.5px] font-medium"
                >
                  <option value="QUICK_REPLY">Quick Reply</option>
                  <option value="URL">Website URL</option>
                </select>

                <input
                  type="text"
                  placeholder="Button label (e.g. Yes / View Details)"
                  className="h-8 flex-1 rounded-lg border border-[#D9E6E2] bg-white px-2.5 text-[12px] outline-none focus:border-brand-teal"
                  value={btn.text}
                  maxLength={25}
                  onChange={(e) => updateButton(idx, { text: e.target.value })}
                />

                {btn.type === "URL" && (
                  <input
                    type="url"
                    placeholder="https://qschool.in/event"
                    className="h-8 flex-1 rounded-lg border border-[#D9E6E2] bg-white px-2.5 text-[12px] outline-none focus:border-brand-teal"
                    value={btn.url ?? ""}
                    onChange={(e) => updateButton(idx, { url: e.target.value })}
                  />
                )}

                <button
                  type="button"
                  onClick={() => removeButton(idx)}
                  className="rounded-lg p-1 text-[#9CA3AF] transition hover:bg-[#FDEFE8] hover:text-[#B42E2E]"
                >
                  <Icon name="x" size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Action row */}
          <div className="flex items-center justify-end gap-2 border-t border-[#EEF3F1] pt-4">
            <Btn variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Btn>
            <Btn variant="primary" type="submit" disabled={busy || !cleanName || !body.trim()}>
              {busy ? "Submitting to Meta…" : "Submit Template to Meta"}
            </Btn>
          </div>
        </form>

        {/* Right column: Live WhatsApp Chat Mobile Preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#41564f]">Live WhatsApp Preview</span>
            <span className="rounded-full bg-[#EAF7EA] px-2 py-0.5 text-[10.5px] font-semibold text-[#0A7F0A]">
              {category}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#D4E3DE] bg-[#EFEAE2] shadow-sm">
            {/* Mock WA Header Bar */}
            <div className="flex items-center gap-2.5 bg-[#075E54] px-3.5 py-2.5 text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[12px] font-bold">
                Q
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-[12px] font-semibold leading-tight">Q-School</p>
                  <span className="inline-block text-[#25D366]">✓</span>
                </div>
                <p className="text-[10px] text-white/80">Official Business Account</p>
              </div>
            </div>

            {/* Chat Canvas with WhatsApp Bubble */}
            <div className="p-3">
              <div className="max-w-[95%] rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm">
                {header && (
                  <p className="mb-1 text-[13px] font-bold text-brand-ink">
                    {header}
                  </p>
                )}

                <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-[#111B21]">
                  {previewBody}
                </p>

                {footer && (
                  <p className="mt-1.5 text-[11px] text-[#667781]">
                    {footer}
                  </p>
                )}

                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781]">
                  <span>10:45 AM</span>
                  <span className="text-[#53BDEB]">✓✓</span>
                </div>
              </div>

              {/* Action Buttons in preview */}
              {buttons.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {buttons.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/60 bg-white/90 py-2 text-center text-[12px] font-medium text-[#00A884] shadow-xs"
                    >
                      {b.type === "URL" ? <Icon name="external" size={13} /> : <Icon name="message" size={13} />}
                      <span>{b.text || `Button ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#E4DCD3] px-3 py-2 text-center text-[10.5px] text-[#667781]">
              Recipients will receive this message from your verified WhatsApp number.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
