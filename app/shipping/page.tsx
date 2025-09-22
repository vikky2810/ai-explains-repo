"use client";

import React from "react";
import Link from "next/link";
import AuthButton from "../components/AuthButton";
import Logo from "../components/Logo";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-electric-blue/20 ring-1 ring-brand-electric-blue/30 flex items-center justify-center">
            <Logo size="sm" />
          </div>
          <span className="text-lg font-semibold text-slate-200">AI Explains This Repo</span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <span>←</span>
            <span>Home</span>
          </Link>
          <AuthButton />
        </div>
      </header>

      <main className="px-4 sm:px-6 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Shipping
            </h1>
          </div>

          <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-4">Regions</h2>
            <p className="text-slate-300 leading-relaxed">
              Shipping availability depends on your location and selected service level.
            </p>
          </section>

          <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-4">Timelines</h2>
            <ul className="text-slate-300 space-y-2 list-disc list-inside">
              <li>Standard delivery: typical processing and transit windows.</li>
              <li>Expedited options may be available at checkout.</li>
            </ul>
          </section>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-indigo-300 hover:text-indigo-200 hover:bg-slate-800/50 rounded-xl transition-all duration-200"
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 pt-4 text-center text-xs text-slate-500">
        <div className="border-t border-slate-800/80 pt-6">Built with ❤️ by Vikram</div>
      </footer>
    </div>
  );
}


