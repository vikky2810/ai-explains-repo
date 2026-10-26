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
  // One accent only: the summary gets the lime tint, risks keep the theme's
  // warning amber, everything else stays neutral.
  if (h === "summary" || h.includes("tl;dr")) return "bg-accent/[0.05] border-accent/20";
  if (h.includes("things to watch")) return "bg-amber-900/20";
  return "bg-slate-900/40";
}

/**
 * Applies bold formatting to important section headings
 */
export function boldHeading(heading: string): string {
  const match = heading.toLowerCase();
  if (
    match === "summary" ||
    match.includes("tl;dr") ||
    match.includes("what this project") ||
    match.includes("key feature")
  ) {
    return `**${heading}**`;
  }
  return heading;
}
