import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export interface DbUser {
  id: string;
  email: string;
  password_hash: string | null;
  created_at: string;
}

export async function ensureUserTables() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1` as DbUser[];
  return rows[0] || null;
}

export async function createUser(email: string, password?: string): Promise<DbUser> {
  const sql = getSql();
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;
  const rows = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING *
  ` as DbUser[];
  return rows[0];
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}


