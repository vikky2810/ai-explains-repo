"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PaperPlaneRight, Warning } from "@phosphor-icons/react/dist/ssr";
import { ChatMessage } from "@/types";
import { markdownComponents } from "./Section";

const SUGGESTED_QUESTIONS = [
  "Where is the main logic?",
  "How do I add a new feature?",
  "What would I need to change to deploy this?",
];

export function RepoChat({ repoUrl }: { repoUrl: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    setLoading(true);
    setQuestion("");
    const history = messages;
    setMessages([...history, { role: "user", content: trimmed }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, question: trimmed, history }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      // Drop the unanswered question so it can be asked again
      setMessages(history);
      setQuestion(trimmed);
      setError(
        err instanceof Error && err.name === "TimeoutError"
          ? "That took too long. Please try again."
          : err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-md border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white">Ask about this repo</h2>
      <p className="mt-1 text-sm text-slate-400">
        Answers only use the files read from this repo.
      </p>

      {messages.length > 0 && (
        <div className="mt-6 space-y-4" aria-live="polite">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto w-fit max-w-[85%] rounded-md bg-slate-800 px-4 py-2.5 text-[15px] text-slate-100">
                {m.content}
              </div>
            ) : (
              <div key={i} className="rounded-md border border-slate-800/60 bg-slate-950/60 p-4 text-[15px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {m.content}
                </ReactMarkdown>
              </div>
            )
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent"></span>
              Reading the code
            </div>
          )}
        </div>
      )}

      {messages.length === 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              disabled={loading}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 disabled:opacity-60"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-red-300">
          <Warning size={16} weight="regular" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <label htmlFor="repo-question" className="sr-only">Your question</label>
        <input
          id="repo-question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          placeholder="e.g. How is authentication handled?"
          className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-accent-dim active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PaperPlaneRight size={16} weight="bold" />
          <span className="hidden sm:inline">Ask</span>
          <span className="sr-only sm:hidden">Ask</span>
        </button>
      </form>
    </div>
  );
}
