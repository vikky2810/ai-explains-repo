"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import AuthButton from "../components/AuthButton";
import { Section } from "../components/Section";
import { smoothScrollToRef } from "@/lib/utils";
import { RepoMetadata } from "@/types";
import SearchHistory from "../components/SearchHistory";
import Logo from "../components/Logo";
import { ArrowLeft, ArrowsClockwise, Clock, GitFork, LinkSimple, Star, Warning } from "@phosphor-icons/react/dist/ssr";

export default function ChatPage() {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [metadata, setMetadata] = useState<RepoMetadata | null>(null);
  const [error, setError] = useState("");
  const explanationRef = useRef<HTMLDivElement>(null);
  const repoUrlRef = useRef<string>("");

  // Keep ref in sync with state
  useEffect(() => {
    repoUrlRef.current = repoUrl;
  }, [repoUrl]);

  const handleLoadFromHistory = useCallback((repoUrl: string) => {
    // Clear previous results first
    setExplanation("");
    setMetadata(null);
    setError("");
    
    // Update state immediately
    setRepoUrl(repoUrl);
    
    // Trigger search immediately with the URL parameter
    handleExplainWithUrl(repoUrl);
  }, []);

  // Handle URL parameters for loading from history
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlParam = urlParams.get('url');
    if (urlParam) {
      handleLoadFromHistory(decodeURIComponent(urlParam));
    }
  }, [handleLoadFromHistory]);

  const handleExplainWithUrl = async (url: string) => {
    if (!url || typeof url !== 'string') {
      return;
    }
    
    setError("");
    setLoading(true);
    setExplanation("");

    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: url }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      
      if (data.explanation) {
        setExplanation(data.explanation);
        setMetadata(data.metadata);

        // Smooth scroll after data loads
        setTimeout(() => {
          smoothScrollToRef(explanationRef);
        }, 200);
      } else {
        setExplanation("Could not generate explanation.");
        setMetadata(null);
      }
    } catch (error) {
      console.error('Error in handleExplainWithUrl:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else {
        setExplanation("Something went wrong.");
        setMetadata(null);
        setError("Failed to fetch explanation. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!repoUrl || typeof repoUrl !== 'string') {
      return;
    }
    setError("");
    setLoading(true);
    setExplanation("");

    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      if (data.explanation) {
        setExplanation(data.explanation);
        setMetadata(data.metadata);

        // Smooth scroll after data loads
        setTimeout(() => {
          smoothScrollToRef(explanationRef);
        }, 200);
      } else {
        setExplanation("Could not generate explanation.");
        setMetadata(null);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else {
        setExplanation("Something went wrong.");
        setMetadata(null);
        setError("Failed to fetch explanation. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRepoUrl("");
    setExplanation("");
    setMetadata(null);
    setError("");
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-md">
        <nav className="mx-auto flex h-[68px] w-full max-w-content items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 text-slate-100">
            <Logo size="sm" className="shrink-0 text-accent" />
            <span className="hidden truncate text-[15px] font-medium tracking-tight sm:inline">
              AI Explains This Repo
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:text-slate-100"
            >
              <ArrowLeft size={15} weight="regular" />
              <span>Home</span>
            </Link>
            <AuthButton />
          </div>
        </nav>
      </header>

      <div className="mx-auto w-full max-w-content px-5 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-medium tracking-[-0.02em] text-slate-50 sm:text-4xl">
            Analyze a repository
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
            Paste a public GitHub URL. The write-up covers architecture, security,
            performance, and quality.
          </p>

          {/* Input Section */}
          <div className="mt-8 rounded-md border border-slate-800 bg-slate-900/60 p-5">
            <label htmlFor="repo-url" className="block font-mono text-xs text-slate-300">
              Repository URL
            </label>
            <div className="relative">
              <input
                id="repo-url"
                type="text"
                value={repoUrl || ""}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) handleExplain();
                  if (e.key === "Escape") setRepoUrl("");
                }}
                placeholder="https://github.com/owner/name"
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3.5 py-3 pr-11 font-mono text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-accent"
              />
              {/* Loading indicator when loading from history */}
              {loading && repoUrl && (
                <div className="absolute right-3.5 top-1/2 mt-1 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
                </div>
              )}
            </div>
            <button
              onClick={handleExplain}
              className="mt-3 w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-accent-dim active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></span>
                  Analyzing repository
                </span>
              ) : (
                "Explain repository"
              )}
            </button>
          </div>
        </div>

                 {/* Search History Section */}
         <div className="max-w-4xl mx-auto mb-12">
           <SearchHistory onLoadSearch={handleLoadFromHistory} />
         </div>

         {/* Loading from History Indicator */}
         {loading && repoUrl && (
           <div className="max-w-2xl mx-auto mb-8">
             <div className="bg-accent/10 border border-accent/30 text-slate-200 p-4 rounded-xl backdrop-blur-sm text-center">
               <div className="flex items-center justify-center gap-3">
                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent border-t-transparent"></div>
                 <span className="text-sm font-medium">Loading repository from history...</span>
               </div>
             </div>
           </div>
         )}

        
         

        

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50">
            <div className="text-center flex flex-col items-center">
              <div className="relative mx-auto mb-6">
                <div className="w-24 h-24 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-24 h-24 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-200 text-xl font-medium mb-2">Analyzing repository...</p>
              <p className="text-slate-400 text-sm">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Error State - Centered Modal for Critical Errors */}
        {error && error.includes("Repository not found or it's private") && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 px-4">
            <div className="max-w-md w-full">
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-8 rounded-2xl backdrop-blur-sm text-center shadow-2xl">
                <div className="mb-6">
                  <Warning size={48} weight="regular" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-red-200">Something went wrong</h3>
                <p className="text-base mb-6 text-red-300">{error}</p>
                <button 
                  onClick={() => setError("")}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl transition-all duration-200 text-red-200 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regular Error State for Other Errors */}
        {error && !error.includes("Repository not found or it's private") && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <Warning size={22} weight="regular" className="mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                  <p className="text-base mb-3">{error}</p>
                  <button 
                    onClick={() => setError("")}
                    className="text-red-300 hover:text-red-200 underline text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {(explanation || metadata) && !loading && (
          <div className="max-w-4xl mx-auto" ref={explanationRef}>
            {/* Repository Metadata Card */}
            {metadata && (
              <div className="mb-8">
                <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <a
                          href={metadata.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl sm:text-2xl font-bold text-slate-300 hover:text-slate-200 hover:underline break-words transition-colors duration-200"
                        >
                          {metadata.name}
                        </a>
                        {metadata.description && (
                          <p className="text-slate-200 text-base mt-2 leading-relaxed">
                            {metadata.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <LinkSimple size={16} weight="regular" />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                        <Star size={16} weight="regular" className="text-slate-400" />
                        <span className="text-slate-200 font-medium">{metadata.stars.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                        <GitFork size={16} weight="regular" className="text-accent" />
                        <span className="text-slate-200 font-medium">{metadata.forks.toLocaleString()}</span>
                      </div>
                      {metadata.lastCommitDate && (
                        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                          <Clock size={16} weight="regular" className="text-slate-400" />
                          <span className="text-sm">
                            Last commit: {new Date(metadata.lastCommitDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Explanation */}
            {explanation && <Section title="AI Analysis" markdown={explanation} />}

            {/* Reset Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl transition-all duration-200 text-base font-medium"
              >
                <ArrowsClockwise size={16} weight="regular" />
                <span>Analyze Another Repository</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

