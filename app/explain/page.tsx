"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import AuthButton from "../components/AuthButton";
import { Section } from "../components/Section";
import { smoothScrollToRef } from "@/lib/utils";
import { RepoMetadata } from "@/types";
import SearchHistory from "../components/SearchHistory";

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
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-fuchsia-600 rounded-full mb-6 shadow-2xl">
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-3">
            AI Explains This Repo
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Paste any GitHub repository URL and get a human-friendly explanation in seconds
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col gap-4">
                                 <div className="relative">
                   <input
                     type="text"
                     value={repoUrl || ""}
                     onChange={(e) => setRepoUrl(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === "Enter" && !loading) handleExplain();
                       if (e.key === "Escape") setRepoUrl("");
                     }}
                     placeholder="https://github.com/user/repo"
                     className="w-full p-4 pl-12 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 outline-none text-base border border-slate-700/60 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-200"
                   />
                   {/* Loading indicator when loading from history */}
                   {loading && repoUrl && (
                     <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                       <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-400 border-t-transparent"></div>
                     </div>
                   )}
                 </div>
                <button
                  onClick={handleExplain}
                  className="w-full p-4 bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-600 hover:to-fuchsia-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing Repository...</span>
                    </div>
                  ) : (
                    "🚀 Explain Repository"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

                 {/* Search History Section */}
         <div className="max-w-4xl mx-auto mb-12">
           <SearchHistory onLoadSearch={handleLoadFromHistory} />
         </div>

         {/* Loading from History Indicator */}
         {loading && repoUrl && (
           <div className="max-w-2xl mx-auto mb-8">
             <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 p-4 rounded-xl backdrop-blur-sm text-center">
               <div className="flex items-center justify-center gap-3">
                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-400 border-t-transparent"></div>
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
                <div className="absolute top-0 left-0 w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-200 text-xl font-medium mb-2">Analyzing repository...</p>
              <p className="text-slate-400 text-sm">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-1">⚠️</span>
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
                          className="text-xl sm:text-2xl font-bold text-indigo-300 hover:text-indigo-200 hover:underline break-words transition-colors duration-200"
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
                        <span className="text-sm">🔗</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-slate-200 font-medium">{metadata.stars.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                        <span className="text-blue-400">🍴</span>
                        <span className="text-slate-200 font-medium">{metadata.forks.toLocaleString()}</span>
                      </div>
                      {metadata.lastCommitDate && (
                        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                          <span className="text-green-400">🕒</span>
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
            {explanation && <Section title="🧠 AI Analysis" markdown={explanation} />}

            {/* Reset Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 text-indigo-300 hover:text-indigo-200 hover:bg-slate-800/50 rounded-xl transition-all duration-200 text-base font-medium"
              >
                <span>🔄</span>
                <span>Analyze Another Repository</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

