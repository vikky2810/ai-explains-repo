"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "../components/SiteNav";

export default function ContactPage() {
  return (
    <div className="min-h-[100dvh] bg-slate-950">
      <SiteNav />

      <main className="px-4 sm:px-6 py-10 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-50">
              Contact Us
            </h1>
          </div>

          <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-md p-8 shadow-2xl">
            <form className="space-y-6">
              <div>
                <label className="block text-slate-200 mb-2" htmlFor="name">Name</label>
                <input id="name" name="name" type="text" className="w-full rounded-md bg-slate-800/80 border border-slate-700/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-electric-blue" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-slate-200 mb-2" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="w-full rounded-md bg-slate-800/80 border border-slate-700/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-electric-blue" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-slate-200 mb-2" htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={5} className="w-full rounded-md bg-slate-800/80 border border-slate-700/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-electric-blue" placeholder="How can we help?" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dim rounded-md font-semibold text-slate-950 shadow-lg transition-all duration-200">
                <span>Send</span>
              </button>
            </form>
          </section>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-brand-electric-blue hover:text-brand-electric-blue/80 hover:bg-slate-800/50 rounded-md transition-all duration-200"
            >
              <ArrowLeft size={16} weight="regular" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 pt-4 text-center text-xs text-slate-500">
        <div className="border-t border-slate-800/80 pt-6">Built by Vikram</div>
      </footer>
    </div>
  );
}


