"use client";

import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  splitMarkdownSections,
  sectionColorClass,
  boldHeading
} from "@/lib/utils";
import { SectionProps } from "@/types";
import { MermaidDiagram } from "./MermaidDiagram";

export const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
      <span className="w-2 h-2 bg-accent rounded-full"></span>
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p className="text-slate-200 leading-relaxed mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-slate-200 space-y-2 mb-3 last:mb-0 list-disc pl-5 marker:text-accent">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-slate-200 space-y-2 mb-3 last:mb-0 list-decimal pl-5 marker:text-accent marker:font-mono marker:text-sm">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-2 hover:underline">
      {children}
    </a>
  ),
  pre: ({ children, node }) => {
    // Mermaid blocks render as a diagram, not inside a <pre>
    const first = node?.children[0];
    const className = first && "properties" in first ? first.properties?.className : undefined;
    if (Array.isArray(className) && className.includes("language-mermaid")) {
      return <>{children}</>;
    }
    return (
      <pre className="mb-3 overflow-x-auto rounded-md border border-slate-800 bg-slate-950 p-4 font-mono text-[13px] leading-relaxed text-slate-200 last:mb-0">
        {children}
      </pre>
    );
  },
  code: ({ children, className }) => {
    if (className?.includes("language-mermaid")) {
      return <MermaidDiagram chart={String(children).trim()} />;
    }
    if (className) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-100">{children}</code>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3 last:mb-0">
      <table className="w-full text-left text-slate-200 border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="py-2 pr-4 font-semibold text-white border-b border-slate-700">{children}</th>
  ),
  td: ({ children }) => (
    <td className="py-2 pr-4 align-top border-b border-slate-800">{children}</td>
  ),
};

export function Section({ title, markdown }: SectionProps) {
  if (!markdown) return null;
  const sections = splitMarkdownSections(markdown);

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-md shadow-2xl border border-slate-800/80">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-3xl">{title.split(' ')[0]}</span>
        <span className="text-slate-50">
          {title.split(' ').slice(1).join(' ')}
        </span>
      </h2>

      <div className="space-y-6">
        {sections.map((sec, i) => (
          <div
            key={i}
            className={`rounded-md p-6 backdrop-blur-sm border border-slate-800/60 transition-all duration-200 hover:border-slate-700/80 ${
              sectionColorClass(sec.heading)
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {`## ${boldHeading(sec.heading)}\n${sec.content}`}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );
}
