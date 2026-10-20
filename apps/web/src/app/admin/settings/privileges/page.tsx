"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { SettingsNav } from "@/components/admin/settings-nav";
import { Btn, Card, DataGrid, Field, Modal, PageHeader, SearchInput, Segmented, StatusBadge, Td, Th, Toast, inputCls, useToast } from "@/components/admin/ui";
import { Avatar } from "@/components/dashboard/art";
import { Icon } from "@/components/icons";
import {
  DEFAULT_ROLE_PERMISSIONS,
  GROUPS,
  MODULES,
  type ModuleDef,
  type ModulePermission,
  type RoleName,
} from "@/lib/crm/privileges-types";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
}

type Tab = "users" | "roles" | "matrix";

function UserPrivilegesContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("user") || "";

  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId);
  const [roles, setRoles] = useState<Record<string, Record<string, ModulePermission>>>(DEFAULT_ROLE_PERMISSIONS);
  const [userOverrides, setUserOverrides] = useState<Record<string, { inherit: boolean; modules: Record<string, ModulePermission> }>>({});
  const [selectedRole, setSelectedRole] = useState<string>("CentreManager");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [toast, show] = useToast();

  // Local draft state for current user custom editing
  const [inheritFromRole, setInheritFromRole] = useState(true);
  const [draftModules, setDraftModules] = useState<Record<string, ModulePermission>>({});

  // Local draft state for role template editing
  const [draftRoleModules, setDraftRoleModules] = useState<Record<string, ModulePermission>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/privileges").then((r) => r.json()),
      ]);

      const userList: UserItem[] = uRes.users ?? [];
      setUsers(userList);

      if (pRes.ok) {
        setRoles(pRes.roles ?? DEFAULT_ROLE_PERMISSIONS);
        setUserOverrides(pRes.userOverrides ?? {});
      }

      if (!selectedUserId && userList.length > 0) {
        setSelectedUserId(userList[0].id);
      }
    } catch {
      show("Could not load privileges data");
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, show]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) ?? users[0] ?? null;
  }, [users, selectedUserId]);

  // Sync draft state when selected user changes
  useEffect(() => {
    if (!currentUser) return;
    const override = userOverrides[currentUser.id];
    const roleBase = roles[currentUser.role] || roles["Student"] || DEFAULT_ROLE_PERMISSIONS.Student;

    if (override && !override.inherit) {
      setInheritFromRole(false);
      // Merge with all known modules
      const initialDraft: Record<string, ModulePermission> = {};
      for (const m of MODULES) {
        initialDraft[m.key] = override.modules[m.key] || roleBase[m.key] || { view: false, createEdit: false, delete: false, export: false };
      }
      setDraftModules(initialDraft);
    } else {
      setInheritFromRole(true);
      const initialDraft: Record<string, ModulePermission> = {};
      for (const m of MODULES) {
        initialDraft[m.key] = roleBase[m.key] || { view: false, createEdit: false, delete: false, export: false };
      }
      setDraftModules(initialDraft);
    }
  }, [currentUser, userOverrides, roles]);

  // Sync draft state when selected role changes in role tab
  useEffect(() => {
    const roleBase = roles[selectedRole] || DEFAULT_ROLE_PERMISSIONS.Admin;
    const copy: Record<string, ModulePermission> = {};
    for (const m of MODULES) {
      copy[m.key] = { ...(roleBase[m.key] || { view: false, createEdit: false, delete: false, export: false }) };
    }
    setDraftRoleModules(copy);
  }, [selectedRole, roles]);

  const handleSaveUser = async () => {
    if (!currentUser) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/privileges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "user",
          userId: currentUser.id,
          inherit: inheritFromRole,
          modules: inheritFromRole ? undefined : draftModules,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not save user privileges");

      setUserOverrides(d.state?.userOverrides ?? userOverrides);
      show(inheritFromRole ? `Reset ${currentUser.name} to inherit ${currentUser.role} privileges` : `Custom privileges saved for ${currentUser.name}`);
    } catch (e) {
      show((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveRole = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/privileges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "role",
          role: selectedRole,
          modules: draftRoleModules,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not save role permissions");

      setRoles(d.state?.roles ?? roles);
      show(`Default privileges updated for role "${selectedRole}"`);
    } catch (e) {
      show((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const updateDraftModule = (key: string, patch: Partial<ModulePermission>) => {
    setDraftModules((prev) => {
      const curr = prev[key] || { view: false, createEdit: false, delete: false, export: false };
      const next = { ...curr, ...patch };
      // If view is turned off, sub-actions turn off
      if (patch.view === false) {
        next.createEdit = false;
        next.delete = false;
        next.export = false;
      }
      // If edit/delete/export is enabled, view must be on
      if (patch.createEdit || patch.delete || patch.export) {
        next.view = true;
      }
      return { ...prev, [key]: next };
    });
  };

  const updateDraftRoleModule = (key: string, patch: Partial<ModulePermission>) => {
    setDraftRoleModules((prev) => {
      const curr = prev[key] || { view: false, createEdit: false, delete: false, export: false };
      const next = { ...curr, ...patch };
      if (patch.view === false) {
        next.createEdit = false;
        next.delete = false;
        next.export = false;
      }
      if (patch.createEdit || patch.delete || patch.export) {
        next.view = true;
      }
      return { ...prev, [key]: next };
    });
  };

  const setAllModulesUser = (grant: boolean) => {
    const next: Record<string, ModulePermission> = {};
    for (const m of MODULES) {
      next[m.key] = grant
        ? { view: true, createEdit: true, delete: true, export: true }
        : { view: false, createEdit: false, delete: false, export: false };
    }
    setDraftModules(next);
  };

  const setAllModulesRole = (grant: boolean) => {
    const next: Record<string, ModulePermission> = {};
    for (const m of MODULES) {
      next[m.key] = grant
        ? { view: true, createEdit: true, delete: true, export: true }
        : { view: false, createEdit: false, delete: false, export: false };
    }
    setDraftRoleModules(next);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        return `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, userSearch]);

  return (
    <AdminShell>
      <SettingsNav />

      {/* Tabs */}
      <div className="mb-4">
        <Segmented<Tab>
          label="Privileges mode"
          value={tab}
          onChange={setTab}
          options={[
            { value: "users", label: "User Privileges" },
            { value: "roles", label: "Role Default Templates" },
            { value: "matrix", label: "Access Matrix" },
          ]}
        />
      </div>

      {/* TAB 1: User-Specific Privileges */}
      {tab === "users" && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
          {/* User selector list */}
          <div className="space-y-3">
            <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Search user by name…" />
            <div className="space-y-1.5 overflow-y-auto max-h-[750px] pr-1">
              {filteredUsers.map((u) => {
                const isSelected = u.id === currentUser?.id;
                const hasCustom = userOverrides[u.id] && !userOverrides[u.id].inherit;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                      isSelected
                        ? "border-brand-teal bg-white shadow-sm ring-2 ring-brand-teal/20"
                        : "border-[#E2ECE9] bg-white hover:border-[#CADBD5]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={u.name} size={34} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-brand-ink">{u.name}</p>
                        <p className="truncate text-[11.5px] text-[#7B8E89]">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="rounded bg-[#F1F5F4] px-2 py-0.5 text-[10.5px] font-medium text-[#41564F]">
                        {u.role}
                      </span>
                      {hasCustom && (
                        <span className="block mt-0.5 rounded bg-[#EAF7EA] px-1.5 py-0.2 text-[9.5px] font-bold text-[#0A7F0A]">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Privilege Editor */}
          {currentUser ? (
            <div className="space-y-4">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEF3F1] pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={currentUser.name} size={46} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[18px] font-bold text-brand-ink">{currentUser.name}</h2>
                        <span className="rounded-md bg-[#E3F4F0] px-2.5 py-0.5 text-[11px] font-semibold text-brand-deep">
                          Role: {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-[#6b807b]">{currentUser.email} · {currentUser.phone || "No phone"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Btn variant="primary" onClick={handleSaveUser} disabled={busy}>
                      {busy ? "Saving…" : "Save Privileges"}
                    </Btn>
                  </div>
                </div>

                {/* Mode Selector: Inherit vs Custom */}
                <div className="mt-4 rounded-xl border border-[#D7EAE4] bg-[#F4FAF8] p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-brand-ink">
                      <input
                        type="radio"
                        name="privilegeMode"
                        checked={inheritFromRole}
                        onChange={() => setInheritFromRole(true)}
                        className="accent-brand-teal"
                      />
                      <span>Inherit base permissions from role (<b>{currentUser.role}</b>)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-brand-ink">
                      <input
                        type="radio"
                        name="privilegeMode"
                        checked={!inheritFromRole}
                        onChange={() => setInheritFromRole(false)}
                        className="accent-brand-teal"
                      />
                      <span>Custom privileges for this user</span>
                    </label>
                  </div>

                  {!inheritFromRole && (
                    <div className="flex items-center gap-2 text-[12px]">
                      <button
                        type="button"
                        onClick={() => setAllModulesUser(true)}
                        className="font-semibold text-brand-teal hover:underline"
                      >
                        Grant All
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setAllModulesUser(false)}
                        className="font-semibold text-[#B42E2E] hover:underline"
                      >
                        Revoke All
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Module-wise Permissions Grid */}
              <div className="space-y-4">
                {GROUPS.map((grp) => {
                  const grpModules = MODULES.filter((m) => m.group === grp);
                  return (
                    <Card key={grp} title={`${grp} Module Privileges`}>
                      <div className="divide-y divide-[#F1F5F4]">
                        {grpModules.map((m) => {
                          const p = draftModules[m.key] || { view: false, createEdit: false, delete: false, export: false };
                          const disabled = inheritFromRole;
                          return (
                            <div key={m.key} className="py-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0 max-w-sm">
                                <p className="text-[13.5px] font-semibold text-brand-ink">{m.name}</p>
                                <p className="text-[11.5px] text-[#7B8E89]">{m.description}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-[12.5px]">
                                <label className={`flex items-center gap-1.5 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                                  <input
                                    type="checkbox"
                                    checked={p.view}
                                    disabled={disabled}
                                    onChange={(e) => updateDraftModule(m.key, { view: e.target.checked })}
                                    className="h-4 w-4 rounded accent-brand-teal"
                                  />
                                  <span className="font-medium text-brand-ink">View</span>
                                </label>

                                <label className={`flex items-center gap-1.5 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                                  <input
                                    type="checkbox"
                                    checked={p.createEdit}
                                    disabled={disabled}
                                    onChange={(e) => updateDraftModule(m.key, { createEdit: e.target.checked })}
                                    className="h-4 w-4 rounded accent-brand-teal"
                                  />
                                  <span className="font-medium text-brand-ink">Create / Edit</span>
                                </label>

                                <label className={`flex items-center gap-1.5 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                                  <input
                                    type="checkbox"
                                    checked={p.delete}
                                    disabled={disabled}
                                    onChange={(e) => updateDraftModule(m.key, { delete: e.target.checked })}
                                    className="h-4 w-4 rounded accent-brand-teal"
                                  />
                                  <span className="font-medium text-[#B42E2E]">Delete</span>
                                </label>

                                <label className={`flex items-center gap-1.5 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                                  <input
                                    type="checkbox"
                                    checked={!!p.export}
                                    disabled={disabled}
                                    onChange={(e) => updateDraftModule(m.key, { export: e.target.checked })}
                                    className="h-4 w-4 rounded accent-brand-teal"
                                  />
                                  <span className="font-medium text-brand-ink">Export</span>
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CFDFDA] p-12 text-center bg-white">
              <h3 className="text-base font-semibold text-brand-ink">No User Selected</h3>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Role Templates Configuration */}
      {tab === "roles" && (
        <div className="space-y-4">
          <Card
            title="Role Permission Presets"
            action={
              <Btn variant="primary" onClick={handleSaveRole} disabled={busy}>
                {busy ? "Saving…" : `Save ${selectedRole} Permissions`}
              </Btn>
            }
          >
            <p className="-mt-2 mb-4 text-[12.5px] text-[#6b807b]">
              Configure default module permissions inherited by users assigned to each role. Users without custom overrides automatically inherit these rights.
            </p>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF3F1] pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-[#7B8E89]">Select Role:</span>
                {(["Admin", "CentreManager", "Counsellor", "Finance", "Faculty", "Student"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`rounded-xl px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                      selectedRole === r
                        ? "bg-brand-deep text-white shadow-xs"
                        : "border border-[#E2ECE9] bg-white text-[#41564F] hover:border-brand-teal"
                    }`}
                  >
                    {r === "CentreManager" ? "Centre Manager" : r}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[12px]">
                <button
                  type="button"
                  onClick={() => setAllModulesRole(true)}
                  className="font-semibold text-brand-teal hover:underline"
                >
                  Grant All Modules
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setAllModulesRole(false)}
                  className="font-semibold text-[#B42E2E] hover:underline"
                >
                  Revoke All
                </button>
              </div>
            </div>

            {/* Modules editor for role */}
            <div className="space-y-4">
              {GROUPS.map((grp) => {
                const grpModules = MODULES.filter((m) => m.group === grp);
                return (
                  <div key={grp} className="rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-4">
                    <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wider text-brand-deep">{grp}</h3>
                    <div className="divide-y divide-[#E2ECE9] bg-white rounded-lg px-3">
                      {grpModules.map((m) => {
                        const p = draftRoleModules[m.key] || { view: false, createEdit: false, delete: false, export: false };
                        return (
                          <div key={m.key} className="py-2.5 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[13px] font-semibold text-brand-ink">{m.name}</p>
                              <p className="text-[11px] text-[#7B8E89]">{m.description}</p>
                            </div>
                            <div className="flex items-center gap-4 text-[12px]">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.view}
                                  onChange={(e) => updateDraftRoleModule(m.key, { view: e.target.checked })}
                                  className="h-4 w-4 rounded accent-brand-teal"
                                />
                                <span>View</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.createEdit}
                                  onChange={(e) => updateDraftRoleModule(m.key, { createEdit: e.target.checked })}
                                  className="h-4 w-4 rounded accent-brand-teal"
                                />
                                <span>Create / Edit</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.delete}
                                  onChange={(e) => updateDraftRoleModule(m.key, { delete: e.target.checked })}
                                  className="h-4 w-4 rounded accent-brand-teal"
                                />
                                <span className="text-[#B42E2E]">Delete</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!p.export}
                                  onChange={(e) => updateDraftRoleModule(m.key, { export: e.target.checked })}
                                  className="h-4 w-4 rounded accent-brand-teal"
                                />
                                <span>Export</span>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Access Matrix Overview */}
      {tab === "matrix" && (
        <Card title="Privilege Matrix Overview">
          <p className="-mt-2 mb-4 text-[12.5px] text-[#6b807b]">
            High-level overview showing effective view & edit permissions across modules for each role.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-[#E2ECE9] bg-[#F7FAF9]">
                  <th className="p-3 font-semibold text-brand-ink">Module</th>
                  <th className="p-3 font-semibold text-brand-ink">Group</th>
                  <th className="p-3 font-semibold text-center text-brand-ink">Admin</th>
                  <th className="p-3 font-semibold text-center text-brand-ink">Centre Manager</th>
                  <th className="p-3 font-semibold text-center text-brand-ink">Counsellor</th>
                  <th className="p-3 font-semibold text-center text-brand-ink">Finance</th>
                  <th className="p-3 font-semibold text-center text-brand-ink">Faculty</th>
                  <th className="p-3 font-semibold text-center text-brand-ink">Student</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F4]">
                {MODULES.map((m) => (
                  <tr key={m.key} className="hover:bg-[#FAFCFB]">
                    <td className="p-3 font-medium text-brand-ink">{m.name}</td>
                    <td className="p-3 text-[#7B8E89]">{m.group}</td>
                    {(["Admin", "CentreManager", "Counsellor", "Finance", "Faculty", "Student"] as const).map((r) => {
                      const perm = roles[r]?.[m.key] || { view: false, createEdit: false, delete: false, export: false };
                      return (
                        <td key={r} className="p-3 text-center">
                          {perm.view ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                perm.createEdit ? "bg-[#EAF7EA] text-[#0A7F0A]" : "bg-[#FFF6E0] text-[#8A5A00]"
                              }`}
                            >
                              {perm.createEdit ? "Full" : "View"}
                            </span>
                          ) : (
                            <span className="text-[#C4D1CD]">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Toast msg={toast} />
    </AdminShell>
  );
}

export default function UserPrivilegesPage() {
  return (
    <Suspense
      fallback={
        <AdminShell>
          <PageHeader
            title="User Privileges & Security"
            sub="Configure granular module-wise access, permissions, and roles."
          />
          <SettingsNav />
          <div className="p-8 text-center text-[#7B8E89]">Loading user privileges...</div>
        </AdminShell>
      }
    >
      <UserPrivilegesContent />
    </Suspense>
  );
}
