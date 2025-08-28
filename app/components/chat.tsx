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
    <div className="min-h-screen bg-slate-900 text-white px-4 sm:px-6 py-10 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">AI Explains This Repo</h1>
      <p className="text-center text-slate-400 mb-8 text-sm sm:text-base">
        Paste any GitHub repo URL and get a human-friendly explanation
      </p>

      <div className="max-w-xl mx-auto flex flex-col gap-3 sm:gap-4">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleExplain();
          }}
          placeholder="https://github.com/user/repo"
          className="w-full p-3 sm:p-4 rounded-lg bg-slate-800 text-white outline-none text-sm sm:text-base"
        />
        <button
          onClick={handleExplain}
          className="w-full p-3 sm:p-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold disabled:opacity-50 text-sm sm:text-base"
          disabled={loading}
        >
          {loading ? "Explaining..." : "Explain Repo 🚀"}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center mt-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
        </div>
      )}

      {error && (
        <div className="max-w-xl mx-auto mt-8 bg-red-600 text-white p-3 sm:p-4 rounded-lg shadow text-sm sm:text-base">
          ❗ {error}
        </div>
      )}

      {(explanation || metadata) && !loading && (
        <div className="max-w-xl mx-auto mt-10 sm:mt-12" ref={explanationRef}>
          {metadata && (
            <div className="p-4 rounded-t-lg bg-slate-800 flex flex-col gap-1">
              <a
                href={metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base sm:text-lg font-bold text-indigo-400 hover:underline break-words"
              >
                {metadata.name}
              </a>
              <p className="text-slate-300 text-sm sm:text-base">{metadata.description}</p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2 text-sm sm:text-base">
                <span className="shrink-0">⭐ {metadata.stars}</span>
                <span className="shrink-0">🍴 {metadata.forks}</span>
                {metadata.lastCommitDate && (
                  <span>
                    🕒 Last commit:{" "}
                    {new Date(metadata.lastCommitDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {explanation && <Section title="🧠 Summary" markdown={explanation} />}

          <div className="text-center mt-4">
            <button
              onClick={handleReset}
              className="text-indigo-400 hover:underline text-sm"
            >
              🔄 Explain another repo
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
    <div className="bg-slate-800/70 p-6 rounded-xl shadow-xl space-y-6 mt-6 border border-slate-700">
      <h2 className="text-2xl font-bold text-white">{title}</h2>

      {sections.map((sec, i) => (
        <div
          key={i}
          className={`rounded-lg p-4 prose prose-invert max-w-none text-slate-200 ${
            sectionColorClass(sec.heading)
          }`}
        >
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mb-3">{children}</h2>
              ),
            }}
          >
            {`## ${boldHeading(sec.heading)}\n${sec.content}`}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
