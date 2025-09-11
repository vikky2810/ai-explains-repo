import { NextResponse } from 'next/server';
import { createUser, ensureUserTables, findUserByEmail } from '@/lib/services/users';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await ensureUserTables();
    const existing = await findUserByEmail(email);
    if (existing && existing.password_hash) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    await createUser(email, password);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}


