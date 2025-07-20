"use client";

import React, { useState, useRef, RefObject } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [metadata, setMetadata] = useState<any>(null);
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
    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-2">AI Explains This Repo</h1>
      <p className="text-center text-slate-400 mb-8">
        Paste any GitHub repo URL and get a human-friendly explanation
      </p>

      <div className="max-w-xl mx-auto flex flex-col gap-4">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleExplain();
          }}
          placeholder="https://github.com/user/repo"
          className="p-4 rounded-lg bg-slate-800 text-white outline-none"
        />
        <button
          onClick={handleExplain}
          className="p-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold disabled:opacity-50"
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
        <div className="max-w-xl mx-auto mt-8 bg-red-600 text-white p-4 rounded-lg shadow">
          ❗ {error}
        </div>
      )}

      {(explanation || metadata) && !loading && (
        <div className="max-w-xl mx-auto mt-12" ref={explanationRef}>
          {metadata && (
            <div className="p-4 rounded-t-lg bg-slate-800 flex flex-col">
              <a
                href={metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-indigo-400 hover:underline"
              >
                {metadata.name}
              </a>
              <p className="text-slate-300">{metadata.description}</p>
              <div className="flex gap-6 mt-2">
                <span>⭐ {metadata.stars}</span>
                <span>🍴 {metadata.forks}</span>
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

interface SectionProps {
  title: string;
  markdown: string;
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
                <h2 className="text-2xl font-bold mb-3">{children}</h2>
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

function splitMarkdownSections(markdown: string) {
  const regex = /^##\s+(.*)$/gm;
  const matches = [...markdown.matchAll(regex)];

  const sections = matches.map((match, index) => {
    const start = match.index!;
    const end = matches[index + 1]?.index ?? markdown.length;
    const heading = match[1].trim();
    const content = markdown.slice(start, end).replace(match[0], "").trim();
    return { heading, content };
  });

  return sections;
}

function sectionColorClass(heading: string): string {
  const h = heading.toLowerCase();
  if (h.includes("tl;dr")) return "bg-yellow-900/30";
  if (h.includes("what this project")) return "bg-blue-900/30";
  if (h.includes("key feature")) return "bg-green-900/30";
  if (h.includes("intended use")) return "bg-pink-900/30";
  return "bg-slate-700/40";
}

function boldHeading(heading: string): string {
  const match = heading.toLowerCase();
  if (
    match.includes("tl;dr") ||
    match.includes("what this project") ||
    match.includes("key feature")
  ) {
    return `**${heading}**`;
  }
  return heading;
}

// ✅ Fixed scroll function
function smoothScrollToRef(ref: RefObject<HTMLElement | null>) {
  if (ref.current) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
