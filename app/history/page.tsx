"use client";

import React from "react";
import Link from "next/link";
import AuthButton from "../components/AuthButton";
import SearchHistory from "../components/SearchHistory";

export default function HistoryPage() {
  const handleLoadFromHistory = (repoUrl: string) => {
    // Redirect to explain page with the selected URL
    window.location.href = `/explain?url=${encodeURIComponent(repoUrl)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
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

      <div className="px-4 sm:px-6 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-fuchsia-600 rounded-full mb-6 shadow-2xl">
              <span className="text-2xl">📚</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-3">
              Search History
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Revisit your previous repository analyses and continue exploring
            </p>
          </div>

          {/* Search History Component */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-2xl">🔍</span>
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-600 hover:to-fuchsia-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span>🚀</span>
                <span>Analyze New Repository</span>
              </a>
              <a
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 text-indigo-300 hover:text-indigo-200 hover:bg-slate-800/50 rounded-xl transition-all duration-200"
              >
                <span>ℹ️</span>
                <span>Learn More</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 pt-4 text-center text-xs text-slate-500">
        <div className="border-t border-slate-800/80 pt-6">
          Built with ❤️ by Vikram
        </div>
      </footer>
    </div>
  );
}
