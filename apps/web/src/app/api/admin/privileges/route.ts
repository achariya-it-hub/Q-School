import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import {
  GROUPS,
  MODULES,
  getPrivilegesState,
  saveRolePermissions,
  saveUserPermissions,
} from "@/lib/crm/privileges-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const state = await getPrivilegesState();
    return NextResponse.json({
      ok: true,
      roles: state.roles,
      userOverrides: state.userOverrides,
      modules: MODULES,
      groups: GROUPS,
      updatedAt: state.updatedAt,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await req.json();

    if (body.type === "role") {
      const { role, modules } = body;
      if (!role || !modules) {
        return NextResponse.json({ error: "Role and modules are required" }, { status: 400 });
      }
      const state = await saveRolePermissions(role, modules);
      return NextResponse.json({ ok: true, state });
    }

    if (body.type === "user") {
      const { userId, inherit, modules } = body;
      if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
      }
      const state = await saveUserPermissions(userId, !!inherit, modules);
      return NextResponse.json({ ok: true, state });
    }

    return NextResponse.json({ error: "Invalid type. Must be 'role' or 'user'." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
