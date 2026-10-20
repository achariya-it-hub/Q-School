"use client";

/* Upload helpers for the course builder: XHR upload with progress, a drop zone and file chips. */

import { useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { UPLOAD_KINDS, fmtSize, type MediaFile, type UploadKind } from "@/lib/courses/types";

const EXT_OK: Record<UploadKind, RegExp> = {
  video: /\.(mp4|m4v|mov|webm)$/i,
  document: /\.(pdf|pptx?|docx?|xlsx?)$/i,
  image: /\.(jpe?g|png|webp|gif)$/i,
  attachment: /\.(pdf|pptx?|docx?|xlsx?|zip|jpe?g|png|webp|gif)$/i,
};

/** Quick checks before sending (the server re-checks the file signature). */
export function checkFile(file: File, kind: UploadKind): string | null {
  const rule = UPLOAD_KINDS[kind];
  if (!EXT_OK[kind].test(file.name)) return `${file.name}: not allowed here. Use ${rule.label}.`;
  if (file.size > rule.max) return `${file.name} is ${fmtSize(file.size)}. The limit is ${rule.label.split("up to ")[1]}.`;
  if (file.size === 0) return `${file.name} is empty.`;
  return null;
}

/** PUT the raw file with progress events. Resolves to the stored MediaFile. */
export function uploadFile(file: File, kind: UploadKind, onProgress?: (pct: number) => void, signal?: AbortSignal): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `/api/admin/courses/media?kind=${kind}&name=${encodeURIComponent(file.name)}`);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let d: { file?: MediaFile; error?: string } = {};
      try {
        d = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && d.file) resolve(d.file);
      else reject(new Error(d.error || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(file);
  });
}

/** Read a local video's duration (minutes, rounded up) before/while it uploads. */
export function videoMinutes(file: File): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    const url = URL.createObjectURL(file);
    const done = (m: number) => {
      URL.revokeObjectURL(url);
      resolve(m);
    };
    v.onloadedmetadata = () => done(Number.isFinite(v.duration) ? Math.max(1, Math.ceil(v.duration / 60)) : 0);
    v.onerror = () => done(0);
    v.src = url;
  });
}

export function iconForMime(mime: string): IconName {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "palette";
  if (mime.includes("pdf")) return "lessons";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "live";
  if (mime.includes("sheet") || mime.includes("excel")) return "table";
  if (mime.includes("zip")) return "box";
  return "clipboard";
}

/** Drop zone + picker. Handles one or many files and shows per-file progress. */
export function Dropzone({
  kind,
  multiple = false,
  onUploaded,
  onFiles,
  title,
  compact = false,
}: {
  kind: UploadKind;
  multiple?: boolean;
  /** called once per uploaded file, with the local File for metadata */
  onUploaded: (f: MediaFile, local: File) => void;
  /** optional: intercept chosen files (e.g. to read video length) before upload */
  onFiles?: (files: File[]) => void;
  title?: string;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [jobs, setJobs] = useState<{ id: string; name: string; pct: number; err?: string; ctrl: AbortController }[]>([]);

  const start = (list: FileList | File[]) => {
    const files = Array.from(list).slice(0, multiple ? 30 : 1);
    onFiles?.(files);
    for (const file of files) {
      const id = Math.random().toString(36).slice(2);
      const bad = checkFile(file, kind);
      const ctrl = new AbortController();
      setJobs((j) => [...j, { id, name: file.name, pct: 0, err: bad ?? undefined, ctrl }]);
      if (bad) continue;
      uploadFile(file, kind, (pct) => setJobs((j) => j.map((x) => (x.id === id ? { ...x, pct } : x))), ctrl.signal)
        .then((f) => {
          onUploaded(f, file);
          setJobs((j) => j.filter((x) => x.id !== id));
        })
        .catch((e: Error) => setJobs((j) => j.map((x) => (x.id === id ? { ...x, err: e.message } : x))));
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files.length) start(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed text-left transition ${
          compact ? "px-3.5 py-3" : "flex-col justify-center px-4 py-7 text-center"
        } ${over ? "border-brand-teal bg-brand-teal100/60" : "border-[#CFE0DB] bg-[#F7FAF9] hover:border-brand-teal/60 hover:bg-[#F1F8F6]"}`}
      >
        <span className={`flex shrink-0 items-center justify-center rounded-xl bg-white text-brand-teal shadow-sm ${compact ? "h-9 w-9" : "h-12 w-12"}`}>
          <Icon name="download" size={compact ? 17 : 22} className="rotate-180" />
        </span>
        <span>
          <span className="block text-[13.5px] font-semibold text-brand-ink">{title ?? (multiple ? "Drop files here or click to browse" : "Drop a file here or click to browse")}</span>
          <span className="block text-[12px] text-[#6b807b]">{UPLOAD_KINDS[kind].label}</span>
        </span>
        <input
          ref={input}
          type="file"
          multiple={multiple}
          accept={UPLOAD_KINDS[kind].accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) start(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {jobs.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {jobs.map((j) => (
            <li key={j.id} className={`rounded-xl border px-3 py-2 text-[12.5px] ${j.err ? "border-[#F3C9CA] bg-[#FDF2F2]" : "border-[#E2ECE9] bg-white"}`}>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate font-medium text-brand-ink">{j.name}</span>
                {j.err ? (
                  <button onClick={() => setJobs((x) => x.filter((y) => y.id !== j.id))} className="font-semibold text-[#C22F33]">
                    Dismiss
                  </button>
                ) : (
                  <>
                    <span className="tabular-nums text-[#6b807b]">{j.pct}%</span>
                    <button onClick={() => j.ctrl.abort()} className="font-semibold text-[#6b807b] hover:text-[#C22F33]">
                      Cancel
                    </button>
                  </>
                )}
              </div>
              {j.err ? (
                <p className="mt-0.5 text-[#C22F33]">{j.err}</p>
              ) : (
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E3F0EC]">
                  <div className="h-full rounded-full bg-brand-teal transition-all" style={{ width: `${j.pct}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FileChip({ f, onRemove }: { f: MediaFile; onRemove?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E2ECE9] bg-white px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal100 text-brand-deep">
        <Icon name={iconForMime(f.mime)} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-brand-ink">{f.name}</span>
        <span className="block text-[11.5px] text-[#6b807b]">{fmtSize(f.size)}</span>
      </span>
      <a href={f.url} target="_blank" rel="noreferrer" className="rounded-lg px-2 py-1 text-[12px] font-semibold text-brand-teal hover:bg-brand-teal100/60">
        Open
      </a>
      {onRemove && (
        <button onClick={onRemove} className="rounded-lg px-2 py-1 text-[12px] font-semibold text-[#C22F33] hover:bg-[#FDF2F2]">
          Remove
        </button>
      )}
    </div>
  );
}
