"use client";

import React from "react";
import SearchHistory from "../components/SearchHistory";
import Logo from "../components/Logo";
import { ArrowRight, Info, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "../components/SiteNav";

export default function HistoryPage() {
  const handleLoadFromHistory = (repoUrl: string) => {
    // Redirect to explain page with the selected URL
    window.location.href = `/explain?url=${encodeURIComponent(repoUrl)}`;
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      {/* Header */}
      <SiteNav />

      <div className="px-4 sm:px-6 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-md mb-6 shadow-2xl">
              <Logo size="md" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-3">
              Search History
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Revisit your previous repository analyses and continue exploring
            </p>
          </div>

          {/* Search History Component */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-md p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <MagnifyingGlass size={22} weight="regular" />
                <span>Your Previous Searches</span>
              </h2>
              <p className="text-slate-300">
                Click on any repository below to analyze it again or view the results.
              </p>
            </div>
            
            <SearchHistory onLoadSearch={handleLoadFromHistory} />
          </div>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/explain"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dim rounded-md font-semibold text-slate-950 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <ArrowRight size={16} weight="regular" />
                <span>Analyze New Repository</span>
              </a>
              <a
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-slate-200 hover:bg-slate-800/50 rounded-md transition-all duration-200"
              >
                <Info size={16} weight="regular" />
                <span>Learn More</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 pt-4 text-center text-xs text-slate-500">
        <div className="border-t border-slate-800/80 pt-6">
          Built by Vikram
        </div>
      </footer>
    </div>
  );
}
