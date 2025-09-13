"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { 
  splitMarkdownSections, 
  sectionColorClass, 
  boldHeading
} from "@/lib/utils";
import { SectionProps } from "@/types";

export function Section({ title, markdown }: SectionProps) {
  if (!markdown) return null;
  const sections = splitMarkdownSections(markdown);

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-800/80">
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
            className={`rounded-xl p-6 backdrop-blur-sm border border-slate-800/60 transition-all duration-200 hover:border-slate-700/80 ${
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
