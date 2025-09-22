"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import previewPng from '../../preview.png';
import { useSession } from 'next-auth/react';
import AuthButton from './AuthButton';
import Logo from './Logo';
import { HomeProps } from '@/types';

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme?: { color?: string };
  handler?: () => void;
  modal?: { escape?: boolean; confirm_close?: boolean };
};

interface RazorpayInstance {
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
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
        theme: { color: '#3b82f6' },
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
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-brand-deep-blue/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-brand-electric-blue/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-deep-blue/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_0%,transparent_60%,rgba(30,64,175,0.08)_90%)]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-electric-blue/20 ring-1 ring-brand-electric-blue/30 flex items-center justify-center">
            <Logo size="sm" />
          </div>
          <span className="text-lg font-semibold text-slate-200">AI Explains This Repo</span>
        </div>
        <div className="flex items-center gap-3">
          <AuthButton />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-electric-blue/30 bg-brand-electric-blue/10 px-4 py-1 text-xs font-medium text-brand-electric-blue">
          New
          <span className="h-1.5 w-1.5 rounded-full bg-brand-electric-blue animate-pulse" />
          AI-powered repository analysis
        </span>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
          AI Explains Your GitHub Repos
          <br />
          <span className="bg-gradient-to-r from-brand-electric-blue via-brand-success-green to-brand-electric-blue bg-clip-text text-transparent" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Instant insights. Actionable recommendations.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
          Analyze code quality, security, performance, and architecture in seconds. Get AI-generated explanations in plain English with actionable improvement suggestions.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={handleTryNow}
            className="w-full rounded-lg bg-brand-electric-blue px-6 py-3 font-semibold text-white shadow-lg shadow-brand-electric-blue/30 transition hover:bg-brand-deep-blue sm:w-auto"
          >
            Analyze Repository 🚀
          </button>
          
        </div>

        <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 text-left transition hover:translate-y-[-2px] hover:border-slate-700/60">
            <div className="text-2xl">🔍</div>
            <h3 className="mt-2 font-semibold text-slate-200">Code Quality Analysis</h3>
            <p className="mt-1 text-sm text-slate-400">Detect complexity, maintainability issues, and code smells with AI explanations.</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 text-left transition hover:translate-y-[-2px] hover:border-slate-700/60">
            <div className="text-2xl">🛡️</div>
            <h3 className="mt-2 font-semibold text-slate-200">Security Insights</h3>
            <p className="mt-1 text-sm text-slate-400">Identify vulnerabilities, risky dependencies, and secrets with mitigation guidance.</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 text-left transition hover:translate-y-[-2px] hover:border-slate-700/60">
            <div className="text-2xl">⚡</div>
            <h3 className="mt-2 font-semibold text-slate-200">Performance Optimization</h3>
            <p className="mt-1 text-sm text-slate-400">Spot bottlenecks, memory issues, and get AI-driven optimization recommendations.</p>
          </div>
        </div>

        <div className="mt-12 w-full max-w-5xl">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 text-left shadow-xl">
            <h2 className="text-xl font-bold text-slate-200 sm:text-2xl">Support me</h2>
            <p className="mt-1 text-sm text-slate-400">If this project helps you, consider buying me a coffee.</p>

            <div className="mt-5 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-electric-blue/10 ring-1 ring-brand-electric-blue/20">☕</div>
                <span className="text-slate-300">x</span>
                <div className="flex items-center gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setQuantity(p)}
                      className={`h-8 w-8 rounded-full text-sm font-medium transition ${
                        quantity === p
                          ? 'bg-brand-electric-blue text-white shadow-lg shadow-brand-electric-blue/30'
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
                    className="h-8 w-14 rounded-md border border-slate-800 bg-slate-900/60 px-2 text-center text-slate-200 placeholder-slate-500 outline-none focus:border-brand-electric-blue/60"
                  />
                </div>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Say something nice..."
                className="mt-4 h-20 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-brand-electric-blue/60"
              />

              <button
                onClick={() => handleSupport(totalAmount)}
                className="mt-4 w-full rounded-full bg-brand-electric-blue py-3 text-center text-sm font-semibold text-white shadow-lg shadow-brand-electric-blue/30 transition hover:bg-brand-deep-blue"
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
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),transparent_60%)]" />
            <Image src={previewPng} alt="Preview" className="relative mx-auto w-full max-w-4xl opacity-90" />
          </div>
        </div>

        <div className="mt-16 w-full max-w-5xl">
          <h2 className="text-left text-xl font-bold text-slate-200 sm:text-2xl">How it works</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <Image src="/globe.svg" alt="Step 1" width={24} height={24} className="h-6 w-6 opacity-80" />
              <h3 className="mt-3 font-semibold text-slate-200">1. Enter Repository URL</h3>
              <p className="mt-1 text-sm text-slate-400">Paste any public GitHub repository URL into the analyzer.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <Image src="/file.svg" alt="Step 2" width={24} height={24} className="h-6 w-6 opacity-80" />
              <h3 className="mt-3 font-semibold text-slate-200">2. AI Analysis</h3>
              <p className="mt-1 text-sm text-slate-400">Our AI scans code quality, security, performance, and architecture, generating plain-language explanations.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <Image src="/window.svg" alt="Step 3" width={24} height={24} className="h-6 w-6 opacity-80" />
              <h3 className="mt-3 font-semibold text-slate-200">3. Get Insights</h3>
              <p className="mt-1 text-sm text-slate-400">Receive detailed reports with actionable recommendations to improve your repository.</p>
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
