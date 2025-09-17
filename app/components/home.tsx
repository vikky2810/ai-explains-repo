"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import previewPng from '../../preview.png';
import { useSession } from 'next-auth/react';
import AuthButton from './AuthButton';
import { HomeProps } from '@/types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const Home: React.FC<HomeProps> = ({ onTryNow }) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      onTryNow();
    }
  }, [session, onTryNow]);

  const handleTryNow = () => {
    if (session) {
      onTryNow();
    } else {
      // Redirect to login page if not authenticated
      window.location.href = '/login';
    }
  };

  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>("");

  const presets = useMemo(() => [1, 3, 5], []);
  const unitPrice = 99; // ₹ per coffee
  const totalAmount = useMemo(() => Math.max(1, quantity) * unitPrice, [quantity]);

  const handleSupport = async (amount: number) => {
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, note, quantity }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to create order');
      }
      const data = await res.json();

      if (!window.Razorpay) {
        alert('Payment SDK not loaded. Please try again in a moment.');
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Support AI Explains This Repo',
        description: 'Thanks for your support! ❤️',
        order_id: data.orderId,
        theme: { color: '#6366f1' },
        handler: function () {
          alert('Payment successful. Thank you!');
        },
        modal: { escape: true, confirm_close: true },
      });
      rzp.open();
    } catch (e) {
      console.error(e);
      alert('Unable to start payment. Please try again.');
    }
  };

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
          <AuthButton />
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
            onClick={handleTryNow}
            className="w-full rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-600 sm:w-auto"
          >
            Try it now 🚀
          </button>
          
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

        <div className="mt-12 w-full max-w-5xl">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 text-left shadow-xl">
            <h2 className="text-xl font-bold text-slate-200 sm:text-2xl">Support me</h2>
            <p className="mt-1 text-sm text-slate-400">If this project helps you, consider buying me a coffee.</p>

            <div className="mt-5 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-400/20">☕</div>
                <span className="text-slate-300">x</span>
                <div className="flex items-center gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setQuantity(p)}
                      className={`h-8 w-8 rounded-full text-sm font-medium transition ${
                        quantity === p
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                          : 'bg-slate-900/60 text-slate-200 ring-1 ring-slate-800 hover:ring-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                    className="h-8 w-14 rounded-md border border-slate-800 bg-slate-900/60 px-2 text-center text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Say something nice..."
                className="mt-4 h-20 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/60"
              />

              <button
                onClick={() => handleSupport(totalAmount)}
                className="mt-4 w-full rounded-full bg-indigo-500 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-600"
              >
                Support ₹{totalAmount}
              </button>
            </div>
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
            <Image src="/window.svg" alt="Step 2" width={24} height={24} className="h-6 w-6 opacity-80" />
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
