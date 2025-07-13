"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState("");


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
      } else {
        setExplanation("Could not generate explanation.");
        setMetadata(null);
      }
    } catch (error) {
      console.error(error);
      setExplanation("Something went wrong.");
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-2">
        AI Explains This Repo
      </h1>
      <p className="text-center text-slate-400 mb-8">
        Paste any GitHub repo URL and get a human-friendly explanation
      </p>

      <div className="max-w-xl mx-auto flex flex-col gap-4">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
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
        <div className="max-w-xl mx-auto mt-12">
              {metadata && (
              <div className="p-4 rounded-t-lg bg-slate-800 flex flex-col ">
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
                    <span>🕒 Last commit: {new Date(metadata.lastCommitDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}
          {explanation && (
            <Section title="🧠 Summary" markdown={explanation} />
          )}
        </div>

        
      )}
    </div>


  );
}

interface SectionProps {
  title: string;
  markdown: string;
}

function Section({ title, markdown }: SectionProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-b-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="prose prose-invert max-w-none text-slate-300">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
