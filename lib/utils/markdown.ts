/**
 * Markdown processing utilities for repository explanations
 */

import { MarkdownSection } from "@/types";

/**
 * Splits markdown content into sections based on ## headings
 */
export function splitMarkdownSections(markdown: string): MarkdownSection[] {
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

/**
 * Returns appropriate background color class based on section heading
 */
export function sectionColorClass(heading: string): string {
  const h = heading.toLowerCase();
  if (h.includes("tl;dr")) return "bg-yellow-900/30";
  if (h.includes("what this project")) return "bg-blue-900/30";
  if (h.includes("key feature")) return "bg-green-900/30";
  if (h.includes("intended use")) return "bg-pink-900/30";
  return "bg-slate-700/40";
}

/**
 * Applies bold formatting to important section headings
 */
export function boldHeading(heading: string): string {
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
