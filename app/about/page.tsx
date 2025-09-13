"use client";

import React from "react";
import Link from "next/link";
import AuthButton from "../components/AuthButton";

export default function AboutPage() {
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-fuchsia-600 rounded-full mb-8 shadow-2xl">
              <span className="text-3xl">🧠</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-6">
              About AI Explains This Repo
            </h1>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed">
              Making complex codebases accessible to everyone through AI-powered analysis and human-friendly explanations.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* What We Do */}
            <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <span>What We Do</span>
              </h2>
              <div className="space-y-4 text-slate-200 leading-relaxed">
                <p>
                  AI Explains This Repo is a powerful tool that analyzes GitHub repositories and provides 
                  clear, human-friendly explanations of what the code does, how it&apos;s structured, and what 
                  it&apos;s used for.
                </p>
                <p>
                  Instead of spending hours reading through documentation and code files, you can get a 
                  comprehensive overview in seconds. Our AI examines the repository structure, key files, 
                  dependencies, and metadata to give you insights that would normally take a senior 
                  developer hours to compile.
                </p>
              </div>
            </section>

            {/* How It Works */}
            <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">⚙️</span>
                <span>How It Works</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">1. Paste URL</h3>
                  <p className="text-slate-300">Simply paste any public GitHub repository URL into our interface.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">2. AI Analysis</h3>
                  <p className="text-slate-300">Our AI scans the repository structure, key files, and metadata.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">3. Get Summary</h3>
                  <p className="text-slate-300">Receive a clear, comprehensive explanation of the repository.</p>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">✨</span>
                <span>Key Features</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-indigo-400">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                    <p className="text-slate-300">Get repository insights in seconds, not hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-indigo-400">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Beginner Friendly</h3>
                    <p className="text-slate-300">Explains complex concepts in simple, understandable terms.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-indigo-400">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
                    <p className="text-slate-300">Your data is safe. We only analyze public repositories.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-indigo-400">📚</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Search History</h3>
                    <p className="text-slate-300">Save and revisit your previous repository analyses.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Use Cases */}
            <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                <span>Perfect For</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👨‍💻</span>
                    <h3 className="text-lg font-semibold text-white">Developers</h3>
                  </div>
                  <p className="text-slate-300 ml-8">Quickly understand new codebases before contributing or integrating.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎓</span>
                    <h3 className="text-lg font-semibold text-white">Students</h3>
                  </div>
                  <p className="text-slate-300 ml-8">Learn from real-world projects and understand different coding patterns.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👔</span>
                    <h3 className="text-lg font-semibold text-white">Managers</h3>
                  </div>
                  <p className="text-slate-300 ml-8">Get high-level understanding of technical projects and their scope.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <h3 className="text-lg font-semibold text-white">Researchers</h3>
                  </div>
                  <p className="text-slate-300 ml-8">Analyze codebases for research purposes or academic projects.</p>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 border border-indigo-500/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
                Try analyzing your first repository and see how AI can help you understand complex codebases.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/explain"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-600 hover:to-fuchsia-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span>🚀</span>
                  <span>Try It Now</span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-4 text-indigo-300 hover:text-indigo-200 hover:bg-slate-800/50 rounded-xl transition-all duration-200"
                >
                  <span>←</span>
                  <span>Back to Home</span>
                </Link>
              </div>
            </section>
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
