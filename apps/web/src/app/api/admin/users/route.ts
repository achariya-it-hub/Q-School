import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { promises as fs } from "fs";
import path from "path";
import { dataFile } from "@/lib/data-dir";

const USERS_FILE = dataFile("users.json");

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users: unknown[]) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// GET all users
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const users = await readUsers();
    return NextResponse.json({ ok: true, count: users.length, users });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST create user
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, email, role, phone, status } = body;

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
      status: status || "Active",
      phone: phone || "",
      joined: new Date().toISOString().split("T")[0],
    };

    users.unshift(newUser);
    await writeUsers(users);

    return NextResponse.json({ ok: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// PUT update user
export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await req.json();
    const { id, name, email, role, phone, status } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const users = await readUsers();
    const index = users.findIndex((u: { id: string }) => u.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    users[index] = {
      ...users[index],
      name: name ? String(name).trim() : users[index].name,
      email: email ? String(email).trim().toLowerCase() : users[index].email,
      role: role || users[index].role,
      status: status || users[index].status,
      phone: phone !== undefined ? String(phone) : users[index].phone,
    };

    await writeUsers(users);
    return NextResponse.json({ ok: true, user: users[index] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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
    const initialLength = users.length;
    users = users.filter((u: { id: string }) => u.id !== id);

    if (users.length === initialLength) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await writeUsers(users);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
