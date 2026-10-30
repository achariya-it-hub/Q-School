import { NextResponse } from "next/server";
import { getCurrentUserEmail, isAdmin } from "@/lib/crm/auth";
import { existsSync, promises as fs } from "fs";
import path from "path";
import { dataFile } from "@/lib/data-dir";
import { recordAuditLog } from "@/lib/audit/store";
import { DEFAULT_USERS } from "@/lib/default-users";

async function readUsers() {
  try {
    const file = dataFile("users.json");
    if (!existsSync(file)) {
      await fs.writeFile(file, JSON.stringify(DEFAULT_USERS, null, 2));
      return DEFAULT_USERS;
    }
    const data = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      await fs.writeFile(file, JSON.stringify(DEFAULT_USERS, null, 2));
      return DEFAULT_USERS;
    }
    // Merge any default users not yet present
    const missing = DEFAULT_USERS.filter((d) => !parsed.some((p: any) => p.email?.toLowerCase() === d.email.toLowerCase()));
    if (missing.length) {
      const merged = [...parsed, ...missing];
      await fs.writeFile(file, JSON.stringify(merged, null, 2));
      return merged;
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

async function writeUsers(users: unknown[]) {
  const file = dataFile("users.json");
  await fs.writeFile(file, JSON.stringify(users, null, 2));
}

// GET all users
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const users = await readUsers();
    return NextResponse.json({ ok: true, count: users.length, users });
  } catch (error) {
    return NextResponse.json({ error: (error as Error)?.message || "Failed to fetch users" }, { status: 500 });
  }
}

// POST create user
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised - please log in first" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, email, role, phone, status, password, location, centreId } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const users = await readUsers();
    
    // Check duplicate email
    if (users.some((u: { email: string }) => u.email.toLowerCase() === String(email).toLowerCase())) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role: role || "Student",
      location: location ? String(location).trim() : undefined,
      centreId: centreId ? String(centreId).trim() : undefined,
      status: status || "Active",
      phone: phone || "",
      password: password ? String(password).trim() : undefined,
      joined: new Date().toISOString().split("T")[0],
    };

    users.unshift(newUser);
    await writeUsers(users);

    const currentUser = getCurrentUserEmail();
    await recordAuditLog({
      action: "CREATE",
      module: "Users",
      entityId: newUser.id,
      entityName: newUser.name,
      summary: `Created user "${newUser.name}" (${newUser.role})`,
      performedBy: currentUser,
      newData: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status },
    }).catch(() => {});

    return NextResponse.json({ ok: true, user: newUser });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: (error as Error)?.message || "Failed to create user" }, { status: 500 });
  }
}

// PUT update user
export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await req.json();
    const { id, name, email, role, phone, status, password, location, centreId } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const users = await readUsers();
    const index = users.findIndex((u: { id: string }) => u.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const prevUser = { ...users[index] };

    users[index] = {
      ...users[index],
      name: name ? String(name).trim() : users[index].name,
      email: email ? String(email).trim().toLowerCase() : users[index].email,
      role: role || users[index].role,
      location: location !== undefined ? String(location).trim() : users[index].location,
      centreId: centreId !== undefined ? String(centreId).trim() : users[index].centreId,
      status: status || users[index].status,
      phone: phone !== undefined ? String(phone) : users[index].phone,
      ...(password ? { password: String(password).trim() } : {}),
    };

    await writeUsers(users);

    const currentUser = getCurrentUserEmail();
    await recordAuditLog({
      action: "UPDATE",
      module: "Users",
      entityId: id,
      entityName: users[index].name,
      summary: `Updated user "${users[index].name}"`,
      performedBy: currentUser,
      previousData: { name: prevUser.name, email: prevUser.email, role: prevUser.role, status: prevUser.status },
      newData: { name: users[index].name, email: users[index].email, role: users[index].role, status: users[index].status },
    }).catch(() => {});

    return NextResponse.json({ ok: true, user: users[index] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error)?.message || "Failed to update user" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let users = await readUsers();
    const targetUser = users.find((u: { id: string }) => u.id === id);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    users = users.filter((u: { id: string }) => u.id !== id);
    await writeUsers(users);

    const currentUser = getCurrentUserEmail();
    await recordAuditLog({
      action: "DELETE",
      module: "Users",
      entityId: id,
      entityName: targetUser.name,
      summary: `Deleted user "${targetUser.name}" (${targetUser.email})`,
      performedBy: currentUser,
      previousData: targetUser,
    }).catch(() => {});

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
