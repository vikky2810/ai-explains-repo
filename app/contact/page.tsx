"use client";

import React from "react";
import Link from "next/link";
import AuthButton from "../components/AuthButton";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30 flex items-center justify-center">
            <span className="text-xl">🧠</span>
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
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Contact Us
            </h1>
          </div>

          <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
            <form className="space-y-6">
              <div>
                <label className="block text-slate-200 mb-2" htmlFor="name">Name</label>
                <input id="name" name="name" type="text" className="w-full rounded-lg bg-slate-800/80 border border-slate-700/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-slate-200 mb-2" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="w-full rounded-lg bg-slate-800/80 border border-slate-700/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-slate-200 mb-2" htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={5} className="w-full rounded-lg bg-slate-800/80 border border-slate-700/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="How can we help?" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-600 hover:to-fuchsia-700 rounded-xl font-semibold text-white shadow-lg transition-all duration-200">
                <span>Send</span>
              </button>
            </form>
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


