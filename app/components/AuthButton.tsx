"use client";

import { signOut, useSession } from "next-auth/react";
import React from "react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex gap-2">
        <a 
          href="/login"
          className="rounded-lg border border-indigo-600/60 bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-200 hover:border-indigo-500 hover:bg-indigo-600/30 transition-all duration-200"
        >
          Login
        </a>
        <a 
          href="/register"
          className="rounded-lg border border-fuchsia-600/60 bg-fuchsia-600/20 px-4 py-2 text-sm font-medium text-fuchsia-200 hover:border-fuchsia-500 hover:bg-fuchsia-600/30 transition-all duration-200"
        >
          Register
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-slate-300">Signed in as {session.user?.email}</p>
      <button 
        onClick={() => signOut()} 
        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 transition-all duration-200"
      >
        Sign out
      </button>
    </div>
  );
}


