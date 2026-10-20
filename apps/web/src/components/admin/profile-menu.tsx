"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/dashboard/art";
import { Btn, Field, Modal, Toast, inputCls, useToast } from "@/components/admin/ui";
import { Icon } from "@/components/icons";

interface Me {
  name: string;
  email: string;
  role: string;
  hasPhoto: boolean;
}

/** Shrinks a picked photo to a 400px square JPEG data URL (centre-cropped). */
function squarePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const c = document.createElement("canvas");
      c.width = c.height = 400;
      c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 400, 400);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = url;
  });
}

function Face({ me, size, bust }: { me: Me; size: number; bust: number }) {
  return me.hasPhoto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/api/admin/profile/photo?v=${bust}`} alt={me.name} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <Avatar name={me.name} size={size} />
  );
}

/** Header profile chip: opens a menu with Edit profile, Change password and Sign out. */
export function ProfileMenu() {
  const router = useRouter();
  const [me, setMe] = useState<Me>({ name: "Admin", email: "", role: "Super Admin", hasPhoto: false });
  const [bust, setBust] = useState(0);
  const [menu, setMenu] = useState(false);
  const [edit, setEdit] = useState(false);
  const [pw, setPw] = useState(false);
  const [toast, show] = useToast();
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch("/api/admin/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setMe(j))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    if (!menu) return;
    const h = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menu]);

  const logout = () => {
    try {
      localStorage.removeItem("qschool_admin_session");
    } catch {}
    fetch("/api/admin/session", { method: "DELETE" }).finally(() => router.push("/admin/login"));
  };

  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-brand-ink hover:bg-[#F1F7F5]";

  return (
    <div className="relative" ref={box}>
      <button onClick={() => setMenu(!menu)} aria-haspopup="menu" aria-expanded={menu} className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-[#EEF6F3]">
        <Face me={me} size={40} bust={bust} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[14px] font-semibold text-brand-ink">{me.name}</span>
          <span className="block text-xs text-[#6b807b]">{me.role}</span>
        </span>
        <Icon name="chevronDown" size={16} />
      </button>

      {menu && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-[240px] rounded-2xl border border-[#E2ECE9] bg-white p-2 shadow-xl">
          <div className="flex items-center gap-3 border-b border-[#EEF3F1] px-3 pb-3 pt-2">
            <Face me={me} size={40} bust={bust} />
            <div className="min-w-0 text-[12px] leading-tight">
              <p className="truncate text-[13.5px] font-semibold text-brand-ink">{me.name}</p>
              <p className="truncate text-[#6b807b]">{me.email}</p>
            </div>
          </div>
          <div className="pt-1.5">
            <button className={item} onClick={() => { setMenu(false); setEdit(true); }}><Icon name="user" size={16} /> Edit profile</button>
            <button className={item} onClick={() => { setMenu(false); setPw(true); }}><Icon name="shield" size={16} /> Change password</button>
            <button className={item + " text-[#B42E2E]"} onClick={logout}><Icon name="logout" size={16} /> Sign out</button>
          </div>
        </div>
      )}

      <EditProfile
        open={edit}
        me={me}
        onClose={() => setEdit(false)}
        onSaved={(m) => {
          setMe(m);
          setBust(Date.now());
          setEdit(false);
          show("Profile updated");
        }}
      />
      <ChangePassword open={pw} onClose={() => setPw(false)} onDone={() => { setPw(false); show("Password changed"); }} />
      <Toast msg={toast} />
    </div>
  );
}

function EditProfile({ open, me, onClose, onSaved }: { open: boolean; me: Me; onClose: () => void; onSaved: (m: Me) => void }) {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [removing, setRemoving] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setName(me.name);
      setPhoto("");
      setRemoving(false);
      setErr("");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const preview = removing ? "" : photo || (me.hasPhoto ? "/api/admin/profile/photo?v=" + Date.now() : "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/admin/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, ...(photo ? { photo } : {}), ...(removing ? { removePhoto: true } : {}) }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error ?? "Could not save");
    onSaved(j);
  };

  return (
    <Modal open={open} title="Edit profile" onClose={onClose}>
      <form className="space-y-4" onSubmit={save}>
        <div className="flex items-center gap-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <Avatar name={name || me.name} size={80} />
          )}
          <div className="space-y-2 text-[13px]">
            <label className="inline-block cursor-pointer rounded-lg border border-[#E2ECE9] px-3 py-1.5 font-medium text-brand-deep hover:border-brand-teal">
              Change photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setPhoto(await squarePhoto(f));
                    setRemoving(false);
                  } catch (x) {
                    setErr(x instanceof Error ? x.message : "Bad image");
                  }
                }}
              />
            </label>
            {(me.hasPhoto || photo) && !removing && (
              <button type="button" className="block text-[12px] text-[#B42E2E] hover:underline" onClick={() => { setPhoto(""); setRemoving(true); }}>
                Remove photo
              </button>
            )}
          </div>
        </div>
        <Field label="Display name"><input required maxLength={60} className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Login e-mail"><input disabled className={inputCls + " opacity-60"} value={me.email} /></Field>
        {err && <p className="text-[12.5px] font-semibold text-[#B42E2E]">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" icon="check" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Btn>
        </div>
      </form>
    </Modal>
  );
}

function ChangePassword({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setCur("");
      setNext("");
      setAgain("");
      setErr("");
    }
  }, [open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== again) return setErr("The new passwords do not match");
    setBusy(true);
    setErr("");
    const r = await fetch("/api/admin/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: cur, newPassword: next }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error ?? "Could not change password");
    onDone();
  };

  return (
    <Modal open={open} title="Change password" onClose={onClose}>
      <form className="space-y-3" onSubmit={save}>
        <Field label="Current password"><input required type="password" autoComplete="current-password" className={inputCls} value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
        <Field label="New password (min. 10 characters)"><input required minLength={10} type="password" autoComplete="new-password" className={inputCls} value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <Field label="Repeat new password"><input required type="password" autoComplete="new-password" className={inputCls} value={again} onChange={(e) => setAgain(e.target.value)} /></Field>
        {err && <p className="text-[12.5px] font-semibold text-[#B42E2E]">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" icon="check" disabled={busy}>{busy ? "Saving…" : "Update password"}</Btn>
        </div>
      </form>
    </Modal>
  );
}
