"use client";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { 
  splitMarkdownSections, 
  sectionColorClass, 
  boldHeading,
  smoothScrollToRef 
} from "@/lib/utils";
import { RepoMetadata, SectionProps } from "@/types";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [metadata, setMetadata] = useState<RepoMetadata | null>(null);
  const [error, setError] = useState("");
  const explanationRef = useRef<HTMLDivElement>(null);

  const handleExplain = async () => {
    if (!repoUrl) return;
    setError("");
    setLoading(true);
    setExplanation("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

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
      setExplanation("Something went wrong.");
      setMetadata(null);
      setError("Failed to fetch explanation. Please try again later.");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 sm:px-6 py-10 sm:py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6 shadow-2xl">
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
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExplain();
                  }}
                  placeholder="https://github.com/user/repo"
                  className="w-full p-4 pl-12 rounded-xl bg-slate-700/50 text-white placeholder-slate-400 outline-none text-base border border-slate-600/50 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  🔗
                </div>
              </div>
              <button
                onClick={handleExplain}
                className="w-full p-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed text-base"
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

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
          <div className="text-center flex flex-col items-center">
            <div className="relative mx-auto mb-4">
              <div className="w-20 h-20 border-4 border-slate-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-200 text-lg font-medium">Fetching repository data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="text-base">{error}</span>
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
              <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
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
                  
                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-600/50">
                    <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-slate-200 font-medium">{metadata.stars.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
                      <span className="text-blue-400">🍴</span>
                      <span className="text-slate-200 font-medium">{metadata.forks.toLocaleString()}</span>
                    </div>
                    {metadata.lastCommitDate && (
                      <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
                        <span className="text-green-400">🕒</span>
                        <span className="text-slate-200 text-sm">
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
  );
}

export function Section({ title, markdown }: SectionProps) {
  if (!markdown) return null;
  const sections = splitMarkdownSections(markdown);

  return (
    <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-600/50">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-3xl">{title.split(' ')[0]}</span>
        <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
          {title.split(' ').slice(1).join(' ')}
        </span>
      </h2>

      <div className="space-y-6">
        {sections.map((sec, i) => (
          <div
            key={i}
            className={`rounded-xl p-6 backdrop-blur-sm border border-slate-600/30 transition-all duration-200 hover:border-slate-500/50 ${
              sectionColorClass(sec.heading)
            }`}
          >
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    {children}
                  </h2>
                ),
                p: ({ children }) => (
                  <p className="text-slate-200 leading-relaxed mb-3 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="text-slate-200 space-y-2 mb-3 last:mb-0">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">{children}</strong>
                ),
              }}
            >
              {`## ${boldHeading(sec.heading)}\n${sec.content}`}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );
}
