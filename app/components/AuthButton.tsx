"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";

export default function AuthButton() {
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submitCredentials = async () => {
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      mode,
    });
    if (res?.error) setError(res.error);
    if (res?.ok) setOpen(false);
  };

  if (!session) {
    return (
      <>
        <div className="flex gap-2">
          <button onClick={() => { setMode('login'); setOpen(true); }} className="rounded-lg border border-indigo-600/60 bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-200 hover:border-indigo-500 hover:bg-indigo-600/30">Login</button>
          <button onClick={() => { setMode('register'); setOpen(true); }} className="rounded-lg border border-fuchsia-600/60 bg-fuchsia-600/20 px-4 py-2 text-sm font-medium text-fuchsia-200 hover:border-fuchsia-500 hover:bg-fuchsia-600/30">Register</button>
        </div>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white capitalize">{mode}</h3>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => signIn('google')} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700">Continue with Google</button>
                <button onClick={() => setMode(mode)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 cursor-default">Email & Password</button>
              </div>
              <div className="space-y-3">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500" />
                {error && <div className="text-red-400 text-xs">{error}</div>}
                <button onClick={submitCredentials} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white">{mode === 'login' ? 'Login' : 'Register'}</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-slate-300">Signed in as {session.user?.email}</p>
      <button onClick={() => signOut()} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700">Sign out</button>
    </div>
  );
}


