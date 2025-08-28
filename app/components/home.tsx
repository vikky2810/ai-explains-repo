import React, { useEffect } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';

import {useRouter} from 'next/navigation';

interface HomeProps {
  onTryNow: () => void;
}

const Home: React.FC<HomeProps> = ({ onTryNow }) => {
  const  {isSignedIn} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn){
      router.push('/chat');
    }
  },[isSignedIn, router]);


  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-indigo-700/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-700/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30 flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
          <span className="text-lg font-semibold text-slate-200">AI Explains This Repo</span>
        </div>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="rounded-lg border border-indigo-600/60 bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-200 hover:border-indigo-500 hover:bg-indigo-600/30">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-medium text-indigo-200">
          New
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          Summarize any GitHub repo instantly
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
          Understand any GitHub repo in seconds
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
          Paste a link. Get a clean, human-friendly summary with key features and use cases. Like a senior engineer explaining it to you.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={onTryNow}
            className="w-full rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-600 sm:w-auto"
          >
            Try it now 🚀
          </button>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 sm:w-auto">
                Login 
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left">
            <div className="text-2xl">⚡</div>
            <h3 className="mt-2 font-semibold text-slate-200">Fast insight</h3>
            <p className="mt-1 text-sm text-slate-400">Skims key files and metadata to give you a clear TL;DR.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left">
            <div className="text-2xl">🧩</div>
            <h3 className="mt-2 font-semibold text-slate-200">Beginner-friendly</h3>
            <p className="mt-1 text-sm text-slate-400">Explains like a human, not a parser. Focus on the big picture.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left">
            <div className="text-2xl">🔒</div>
            <h3 className="mt-2 font-semibold text-slate-200">Optional login</h3>
            <p className="mt-1 text-sm text-slate-400">Sign in with Clerk to save and revisit your summaries.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
