"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Section } from "../components/Section";
import { smoothScrollToRef } from "@/lib/utils";
import { ExplainDepth, RepoMetadata } from "@/types";
import { RepoChat } from "../components/RepoChat";
import SearchHistory from "../components/SearchHistory";
import Spotlight from "../components/Spotlight";
import { ArrowsClockwise, Clock, Code, GitFork, Info, LinkSimple, Scales, Star, Warning } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "../components/SiteNav";

const DEPTH_OPTIONS: { value: ExplainDepth; label: string; hint: string }[] = [
  { value: "quick", label: "Quick summary", hint: "Stack, features and how to run it" },
  { value: "deep", label: "Deep dive", hint: "Adds structure, flow diagram, where to start and risks" },
];

function maturityLabel(metadata: RepoMetadata): string | null {
  if (metadata.archived) return "Archived";
  if (!metadata.lastCommitDate) return null;
  const days = (Date.now() - new Date(metadata.lastCommitDate).getTime()) / 86_400_000;
  const activity = days <= 90 ? "Actively maintained" : days <= 365 ? "Occasionally updated" : "Inactive for over a year";
  const reach = metadata.stars >= 1000 ? "widely used" : metadata.stars >= 100 ? "some adoption" : "small project";
  return `${activity} · ${reach}`;
}

export default function ChatPage() {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [depth, setDepth] = useState<ExplainDepth>("deep");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [metadata, setMetadata] = useState<RepoMetadata | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState("");
  const [error, setError] = useState("");
  const explanationRef = useRef<HTMLDivElement>(null);
  // Guards against React Strict Mode running the URL-param effect twice in dev
  const loadedUrlParamRef = useRef<string | null>(null);

  const handleExplainWithUrl = useCallback(async (url: string, selectedDepth: ExplainDepth) => {
    if (!url || typeof url !== 'string') {
      return;
    }

    setError("");
    setLoading(true);
    setExplanation("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: url, depth: selectedDepth }),
        signal: AbortSignal.timeout(60000),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      if (data.explanation) {
        setExplanation(data.explanation);
        setMetadata(data.metadata);
        setAnalyzedUrl(url);

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
      if (error instanceof Error && error.name === 'TimeoutError') {
        setError("Request timed out. Please try again.");
      } else {
        setExplanation("Something went wrong.");
        setMetadata(null);
        setError("Failed to fetch explanation. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadFromHistory = useCallback((repoUrl: string, selectedDepth: ExplainDepth = "deep") => {
    // Clear previous results first
    setExplanation("");
    setMetadata(null);
    setError("");

    setRepoUrl(repoUrl);
    setDepth(selectedDepth);
    handleExplainWithUrl(repoUrl, selectedDepth);
  }, [handleExplainWithUrl]);

  // Handle URL parameters for loading from history
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlParam = urlParams.get('url');
    if (urlParam && loadedUrlParamRef.current !== urlParam) {
      loadedUrlParamRef.current = urlParam;
      handleLoadFromHistory(
        decodeURIComponent(urlParam),
        urlParams.get('depth') === 'quick' ? 'quick' : 'deep'
      );
    }
  }, [handleLoadFromHistory]);

  const handleExplain = () => handleExplainWithUrl(repoUrl, depth);

  const handleReset = () => {
    setRepoUrl("");
    setExplanation("");
    setMetadata(null);
    setAnalyzedUrl("");
    setError("");
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      {/* Header */}
      <SiteNav />

      <div className="mx-auto w-full max-w-content px-5 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="animate-rise-in text-3xl font-medium tracking-[-0.02em] text-slate-50 sm:text-4xl">
            Analyze a repository
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
            Paste a public GitHub URL. The write-up covers architecture, security,
            performance, and quality.
          </p>

          {/* Input Section */}
          <Spotlight className="animate-rise-in mt-8 rounded-md border border-slate-800 bg-slate-900/60 p-5" style={{ animationDelay: "80ms" }}>
            <div
              role="note"
              className="mb-3 flex items-start gap-2 rounded-md border border-slate-700/80 bg-slate-800/50 px-3 py-2.5 text-xs leading-relaxed text-slate-300"
            >
              <Info size={16} weight="regular" className="mt-px shrink-0 text-slate-400" />
              <span>
                Works with public GitHub repositories only. Private repos are
                not supported.
              </span>
            </div>
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
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3.5 py-3 pr-11 font-mono text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-[border-color,box-shadow] duration-200 hover:border-slate-600 focus:border-accent focus:shadow-[0_0_0_3px_rgb(163_230_53/0.15)]"
              />
              {/* Loading indicator when loading from history */}
              {loading && repoUrl && (
                <div className="absolute right-3.5 top-1/2 mt-1 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
                </div>
              )}
            </div>
            <fieldset className="mt-4">
              <legend className="font-mono text-xs text-slate-300">Depth</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {DEPTH_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-md border px-3 py-2.5 transition-all duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                      depth === option.value
                        ? "border-accent bg-accent/10"
                        : "border-slate-700 hover:-translate-y-px hover:border-slate-500 hover:bg-slate-800/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="depth"
                      value={option.value}
                      checked={depth === option.value}
                      onChange={() => setDepth(option.value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-medium text-slate-100">{option.label}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-slate-400">{option.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              onClick={handleExplain}
              className="btn-primary mt-3 w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
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
          </Spotlight>
        </div>

                 {/* Search History Section */}
         <div className="mx-auto mb-12 mt-5 max-w-4xl">
           <SearchHistory onLoadSearch={handleLoadFromHistory} signedOutView="compact" />
         </div>

        {/* Loading: a skeleton shaped like the report that is about to land */}
        {loading && (
          <div className="mx-auto max-w-4xl" role="status" aria-live="polite">
            <p className="mb-4 flex items-center gap-2.5 text-sm text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Reading the repository. This usually takes 10 to 30 seconds.
            </p>
            <div className="rounded-md border border-slate-800 bg-slate-900/60 p-6">
              <div className="skeleton h-6 w-48" />
              <div className="skeleton mt-3 h-4 w-3/4" />
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-5">
                {[64, 56, 120, 80].map((w) => (
                  <div key={w} className="skeleton h-8" style={{ width: w }} />
                ))}
              </div>
            </div>
            <div className="mt-8 space-y-4 rounded-md border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
              {[0, 1, 2].map((block) => (
                <div key={block} className="rounded-md border border-slate-800/60 p-6">
                  <div className="skeleton h-5 w-40" />
                  <div className="skeleton mt-4 h-3.5 w-full" />
                  <div className="skeleton mt-2.5 h-3.5 w-[92%]" />
                  <div className="skeleton mt-2.5 h-3.5 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State - Centered Modal for Critical Errors */}
        {error && error.includes("Repository not found or it's private") && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 px-4">
            <div className="max-w-md w-full">
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-8 rounded-md backdrop-blur-sm text-center shadow-2xl">
                <div className="mb-6">
                  <Warning size={48} weight="regular" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-red-200">Something went wrong</h3>
                <p className="text-base mb-6 text-red-300">{error}</p>
                <button 
                  onClick={() => setError("")}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-md transition-all duration-200 text-red-200 font-medium"
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
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-6 rounded-md backdrop-blur-sm">
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
          <div className="animate-rise-in max-w-4xl mx-auto" ref={explanationRef}>
            {/* Repository Metadata Card */}
            {metadata && (
              <div className="mb-8">
                <Spotlight className="rounded-md border border-slate-800/80 bg-slate-900/60 p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <a
                          href={metadata.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-draw break-words text-xl font-semibold text-slate-100 transition-colors duration-200 hover:text-accent sm:text-2xl"
                        >
                          {metadata.name}
                        </a>
                        {metadata.description && (
                          <p className="text-slate-200 text-base mt-2 leading-relaxed">
                            {metadata.description}
                          </p>
                        )}
                        {maturityLabel(metadata) && (
                          <p className="mt-2 font-mono text-xs text-slate-400">{maturityLabel(metadata)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <LinkSimple size={16} weight="regular" />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 rounded-md border border-transparent bg-slate-800/50 px-3 py-2 text-slate-300 transition-colors duration-200 hover:border-slate-700 hover:bg-slate-800">
                        <Star size={16} weight="regular" className="text-slate-400" />
                        <span className="text-slate-200 font-medium">{metadata.stars.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-md border border-transparent bg-slate-800/50 px-3 py-2 text-slate-300 transition-colors duration-200 hover:border-slate-700 hover:bg-slate-800">
                        <GitFork size={16} weight="regular" className="text-accent" />
                        <span className="text-slate-200 font-medium">{metadata.forks.toLocaleString()}</span>
                      </div>
                      {metadata.lastCommitDate && (
                        <div className="flex items-center gap-2 rounded-md border border-transparent bg-slate-800/50 px-3 py-2 text-slate-300 transition-colors duration-200 hover:border-slate-700 hover:bg-slate-800">
                          <Clock size={16} weight="regular" className="text-slate-400" />
                          <span className="text-sm">
                            Last commit: {new Date(metadata.lastCommitDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {metadata.language && (
                        <div className="flex items-center gap-2 rounded-md border border-transparent bg-slate-800/50 px-3 py-2 text-slate-300 transition-colors duration-200 hover:border-slate-700 hover:bg-slate-800">
                          <Code size={16} weight="regular" className="text-slate-400" />
                          <span className="text-sm">{metadata.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 rounded-md border border-transparent bg-slate-800/50 px-3 py-2 text-slate-300 transition-colors duration-200 hover:border-slate-700 hover:bg-slate-800">
                        <Scales size={16} weight="regular" className="text-slate-400" />
                        <span className="text-sm">{metadata.license ?? "No license"}</span>
                      </div>
                    </div>
                  </div>
                </Spotlight>
              </div>
            )}

            {/* AI Explanation */}
            {explanation && <Section title="AI Analysis" markdown={explanation} />}

            {explanation && analyzedUrl && <RepoChat key={analyzedUrl} repoUrl={analyzedUrl} />}

            {/* Reset Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleReset}
                className="group inline-flex items-center gap-2 rounded-md border border-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-900 hover:text-slate-50"
              >
                <ArrowsClockwise size={16} weight="regular" className="transition-transform duration-500 group-hover:rotate-180" />
                <span>Analyze Another Repository</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

