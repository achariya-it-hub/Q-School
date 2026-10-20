/**
 * User Privileges and Module-Wise Access Control Store (server-only).
 * File-backed persistence in DATA_DIR:
 *   user-privileges.json — role presets and user-specific module overrides
 */
import { promises as fs } from "fs";
import path from "path";
import { DATA_DIR, dataFile } from "@/lib/data-dir";
import {
  DEFAULT_ROLE_PERMISSIONS,
  GROUPS,
  MODULES,
  noAccess,
  type ModuleDef,
  type ModulePermission,
  type RoleName,
} from "./privileges-types";

export * from "./privileges-types";

const FILE = path.join(DATA_DIR, "user-privileges.json");
const USERS_FILE = dataFile("users.json");

export interface PrivilegesState {
  roles: Record<string, Record<string, ModulePermission>>;
  userOverrides: Record<string, { inherit: boolean; modules: Record<string, ModulePermission> }>;
  updatedAt: string;
}

let chain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

export async function getPrivilegesState(): Promise<PrivilegesState> {
  const state = await readJson<PrivilegesState | null>(FILE, null);
  if (state && state.roles) return state;

  const initial: PrivilegesState = {
    roles: DEFAULT_ROLE_PERMISSIONS,
    userOverrides: {},
    updatedAt: new Date().toISOString(),
  };
  await writeJson(FILE, initial);
  return initial;
}

export async function getUserEffectivePermissions(userId: string, role?: string): Promise<{
  role: string;
  isCustom: boolean;
  modules: Record<string, ModulePermission>;
}> {
  const state = await getPrivilegesState();
  const override = state.userOverrides[userId];

  // Map user role name
  const effectiveRole = role || "Student";
  const roleBase = state.roles[effectiveRole] || state.roles["Student"] || DEFAULT_ROLE_PERMISSIONS.Student;

  if (override && !override.inherit) {
    // Fill any missing modules from role
    const merged: Record<string, ModulePermission> = {};
    for (const m of MODULES) {
      merged[m.key] = override.modules[m.key] || roleBase[m.key] || noAccess();
    }
    return {
      role: effectiveRole,
      isCustom: true,
      modules: merged,
    };
  }

  return {
    role: effectiveRole,
    isCustom: false,
    modules: roleBase,
  };
}

export function saveRolePermissions(role: string, modules: Record<string, ModulePermission>): Promise<PrivilegesState> {
  return serial(async () => {
    const state = await getPrivilegesState();
    state.roles[role] = modules;
    state.updatedAt = new Date().toISOString();
    await writeJson(FILE, state);
    return state;
  });
}

export function saveUserPermissions(
  userId: string,
  inherit: boolean,
  modules?: Record<string, ModulePermission>
): Promise<PrivilegesState> {
  return serial(async () => {
    const state = await getPrivilegesState();
    if (inherit) {
      delete state.userOverrides[userId];
    } else if (modules) {
      state.userOverrides[userId] = {
        inherit: false,
        modules,
      };
    }
    state.updatedAt = new Date().toISOString();
    await writeJson(FILE, state);
    return state;
  });
}
