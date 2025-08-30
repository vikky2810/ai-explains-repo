import React, { useEffect } from 'react';
import Image from 'next/image';
import previewPng from '../../preview.png';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { HomeProps } from '@/types';

const Home: React.FC<HomeProps> = ({ onTryNow }) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      onTryNow();
    }
  }, [isSignedIn, onTryNow]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-indigo-700/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-700/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_0%,transparent_60%,rgba(79,70,229,0.08)_90%)]" />
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
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Summarize any GitHub repo instantly
        </span>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
          Understand any GitHub repo
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent"> in seconds</span>
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

        <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 text-left transition hover:translate-y-[-2px] hover:border-slate-700/60">
            <div className="text-2xl">⚡</div>
            <h3 className="mt-2 font-semibold text-slate-200">Fast insight</h3>
            <p className="mt-1 text-sm text-slate-400">Skims key files and metadata to give you a clear TL;DR.</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 text-left transition hover:translate-y-[-2px] hover:border-slate-700/60">
            <div className="text-2xl">🧩</div>
            <h3 className="mt-2 font-semibold text-slate-200">Beginner-friendly</h3>
            <p className="mt-1 text-sm text-slate-400">Explains like a human, not a parser. Focus on the big picture.</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 text-left transition hover:translate-y-[-2px] hover:border-slate-700/60">
            <div className="text-2xl">🔒</div>
            <h3 className="mt-2 font-semibold text-slate-200">Optional login</h3>
            <p className="mt-1 text-sm text-slate-400">Sign in to save and revisit your summaries.</p>
          </div>
        </div>

        <div className="mt-14 w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-900/30 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-slate-400">Preview</span>
            <div className="w-10" />
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.08),transparent_60%)]" />
            <Image src={previewPng} alt="Preview" className="relative mx-auto w-full max-w-4xl opacity-90" />
          </div>
        </div>

        <div className="mt-16 w-full max-w-5xl">
          <h2 className="text-left text-xl font-bold text-slate-200 sm:text-2xl">How it works</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <Image src="/globe.svg" alt="Step 1" width={24} height={24} className="h-6 w-6 opacity-80" />
              <h3 className="mt-3 font-semibold text-slate-200">1. Paste a GitHub URL</h3>
              <p className="mt-1 text-sm text-slate-400">Point to any public repository to start the analysis.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <Image src="/file.svg" alt="Step 2" width={24} height={24} className="h-6 w-6 opacity-80" />
              <h3 className="mt-3 font-semibold text-slate-200">2. We read the code</h3>
              <p className="mt-1 text-sm text-slate-400">We scan key files and infer architecture, libraries, and purpose.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <Image src="/next.svg" alt="Step 3" width={24} height={24} className="h-6 w-6 opacity-80" />
              <h3 className="mt-3 font-semibold text-slate-200">3. Get a summary</h3>
              <p className="mt-1 text-sm text-slate-400">Receive a clear, concise brief with next steps and examples.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 pt-4 text-center text-xs text-slate-500">
        <div className="border-t border-slate-800/80 pt-6">
          Built with ❤ Vikram
        </div>
      </footer>
    </div>
  );
};

export default Home;
