import { neon } from "@neondatabase/serverless";
import { DEFAULT_USERS, type SeedUser, type UserRole } from "@/lib/default-users";
import { DEFAULT_STAFF, type StaffLogin } from "@/lib/default-staff";

export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  centreId?: string;
  status: "Active" | "Suspended";
  joined: string;
  phone?: string;
  password?: string;
}

export function isDbConfigured(): boolean {
  return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

function getSql() {
  const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL)?.trim();
  if (!url) return null;
  return neon(url);
}

let initPromise: Promise<void> | null = null;

export async function ensureTables(): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS qs_users (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            email VARCHAR(160) UNIQUE NOT NULL,
            role VARCHAR(64) NOT NULL,
            location VARCHAR(128),
            centre_id VARCHAR(32),
            status VARCHAR(32) NOT NULL DEFAULT 'Active',
            joined VARCHAR(32),
            phone VARCHAR(32),
            password VARCHAR(128),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS qs_staff_logins (
            email VARCHAR(160) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            salt VARCHAR(64) NOT NULL,
            hash VARCHAR(128) NOT NULL,
            centre VARCHAR(32),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;

        // Check if qs_users is empty, seed if so
        const userCount = await sql`SELECT COUNT(*)::int as count FROM qs_users;`;
        if (userCount[0]?.count === 0) {
          for (const u of DEFAULT_USERS) {
            await sql`
              INSERT INTO qs_users (id, name, email, role, location, centre_id, status, joined, phone, password)
              VALUES (${u.id}, ${u.name}, ${u.email.toLowerCase()}, ${u.role}, ${u.location ?? null}, ${u.centreId ?? null}, ${u.status}, ${u.joined}, ${u.phone ?? ""}, ${u.password ?? null})
              ON CONFLICT (email) DO NOTHING;
            `;
          }
        }

        // Check if qs_staff_logins is empty, seed if so
        const staffCount = await sql`SELECT COUNT(*)::int as count FROM qs_staff_logins;`;
        if (staffCount[0]?.count === 0) {
          for (const s of DEFAULT_STAFF) {
            await sql`
              INSERT INTO qs_staff_logins (email, name, salt, hash, centre)
              VALUES (${s.email.toLowerCase()}, ${s.name}, ${s.salt}, ${s.hash}, ${s.centre ?? null})
              ON CONFLICT (email) DO NOTHING;
            `;
          }
        }
      } catch (err) {
        console.error("[db] Failed to initialize tables:", err);
      }
    })();
  }

  await initPromise;
  return true;
}

/* ─────────── Users Operations ─────────── */

export async function getDbUsers(): Promise<DbUser[] | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  try {
    const rows = await sql`
      SELECT id, name, email, role, location, centre_id as "centreId", status, joined, phone, password
      FROM qs_users
      ORDER BY created_at DESC;
    `;
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      location: r.location || undefined,
      centreId: r.centreId || undefined,
      status: r.status,
      joined: r.joined,
      phone: r.phone || "",
      password: r.password || undefined,
    }));
  } catch (err) {
    console.error("[db] getDbUsers error:", err);
    return null;
  }
}

export async function findDbUserByEmail(email: string): Promise<DbUser | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  try {
    const rows = await sql`
      SELECT id, name, email, role, location, centre_id as "centreId", status, joined, phone, password
      FROM qs_users
      WHERE LOWER(email) = ${email.trim().toLowerCase()}
      LIMIT 1;
    `;
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      location: r.location || undefined,
      centreId: r.centreId || undefined,
      status: r.status,
      joined: r.joined,
      phone: r.phone || "",
      password: r.password || undefined,
    };
  } catch (err) {
    console.error("[db] findDbUserByEmail error:", err);
    return null;
  }
}

export async function insertDbUser(user: DbUser): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  await ensureTables();
  try {
    await sql`
      INSERT INTO qs_users (id, name, email, role, location, centre_id, status, joined, phone, password)
      VALUES (${user.id}, ${user.name}, ${user.email.toLowerCase()}, ${user.role}, ${user.location ?? null}, ${user.centreId ?? null}, ${user.status}, ${user.joined}, ${user.phone ?? ""}, ${user.password ?? null})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        location = EXCLUDED.location,
        centre_id = EXCLUDED.centre_id,
        status = EXCLUDED.status,
        phone = EXCLUDED.phone,
        password = COALESCE(EXCLUDED.password, qs_users.password);
    `;
    return true;
  } catch (err) {
    console.error("[db] insertDbUser error:", err);
    return false;
  }
}

export async function updateDbUser(user: Partial<DbUser> & { id: string }): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  await ensureTables();
  try {
    const existing = await sql`SELECT * FROM qs_users WHERE id = ${user.id} LIMIT 1;`;
    if (!existing.length) return false;
    const cur = existing[0];

    await sql`
      UPDATE qs_users SET
        name = ${user.name ?? cur.name},
        email = ${user.email ? user.email.toLowerCase() : cur.email},
        role = ${user.role ?? cur.role},
        location = ${user.location !== undefined ? user.location : cur.location},
        centre_id = ${user.centreId !== undefined ? user.centreId : cur.centre_id},
        status = ${user.status ?? cur.status},
        phone = ${user.phone !== undefined ? user.phone : cur.phone},
        password = ${user.password ? user.password : cur.password}
      WHERE id = ${user.id};
    `;
    return true;
  } catch (err) {
    console.error("[db] updateDbUser error:", err);
    return false;
  }
}

export async function deleteDbUser(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  await ensureTables();
  try {
    await sql`DELETE FROM qs_users WHERE id = ${id};`;
    return true;
  } catch (err) {
    console.error("[db] deleteDbUser error:", err);
    return false;
  }
}

/* ─────────── Staff Logins Operations ─────────── */

export async function getDbStaffLogins(): Promise<StaffLogin[] | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  try {
    const rows = await sql`
      SELECT name, email, salt, hash, centre
      FROM qs_staff_logins
      ORDER BY name ASC;
    `;
    return rows.map((r: any) => ({
      name: r.name,
      email: r.email,
      salt: r.salt,
      hash: r.hash,
      centre: r.centre || undefined,
    }));
  } catch (err) {
    console.error("[db] getDbStaffLogins error:", err);
    return null;
  }
}

export async function findDbStaffLogin(email: string): Promise<StaffLogin | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  try {
    const rows = await sql`
      SELECT name, email, salt, hash, centre
      FROM qs_staff_logins
      WHERE LOWER(email) = ${email.trim().toLowerCase()}
      LIMIT 1;
    `;
    if (!rows.length) return null;
    const r = rows[0];
    return {
      name: r.name,
      email: r.email,
      salt: r.salt,
      hash: r.hash,
      centre: r.centre || undefined,
    };
  } catch (err) {
    console.error("[db] findDbStaffLogin error:", err);
    return null;
  }
}

export async function saveDbStaffLogin(login: StaffLogin): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  await ensureTables();
  try {
    await sql`
      INSERT INTO qs_staff_logins (email, name, salt, hash, centre)
      VALUES (${login.email.toLowerCase()}, ${login.name}, ${login.salt}, ${login.hash}, ${login.centre ?? null})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        salt = EXCLUDED.salt,
        hash = EXCLUDED.hash,
        centre = EXCLUDED.centre;
    `;
    return true;
  } catch (err) {
    console.error("[db] saveDbStaffLogin error:", err);
    return false;
  }
}
