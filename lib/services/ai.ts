/**
 * AI service for generating repository explanations
 */

import { AIExplanationRequest, ChatMessage, ExplainDepth, RepoContext, RepoMetadata } from "@/types";

interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SECTION_SPECS: Record<ExplainDepth, string> = {
  quick: `## Summary
Exactly 2 sentences: what it is and who it is for.

## Tech stack
3-8 bullets: language, frameworks, database, hosting, notable libraries. Only what the manifests or code show.

## What this project does
One paragraph, at most 90 words.

## Key features
4-6 bullets. Start each with a short **bold label**, then one sentence. Name the file or folder that implements it when you can see it.

## How to run it
A numbered list of steps with the exact commands in a fenced code block, plus any required environment variables. Take these from the README, manifests, Dockerfile or Makefile. If they are not documented, say so in one sentence instead of guessing.`,

  deep: `## Summary
Exactly 2 sentences: what it is and who it is for.

## Tech stack
3-8 bullets: language, frameworks, database, hosting, notable libraries. Only what the manifests or code show.

## What this project does
One paragraph, at most 90 words.

## How it's organised
4-8 bullets, one per important folder or file, formatted as \`path/\` – what lives there. Use the file tree.

## How it works
A numbered list of 3-6 steps describing the main flow (for example request to response, or input to output). Then a fenced \`mermaid\` code block with a \`flowchart TD\` of 4-8 nodes showing the same flow. Write every node label in double quotes and keep labels under 30 characters, e.g. A["User"] --> B["API route"]. No styling, no subgraphs, no comments.

## Key features
4-6 bullets. Start each with a short **bold label**, then one sentence. Name the file or folder that implements it when you can see it.

## How to run it
A numbered list of steps with the exact commands in a fenced code block, plus any required environment variables. Take these from the README, manifests, Dockerfile or Makefile. If they are not documented, say so in one sentence instead of guessing.

## Where to start reading
3-5 bullets formatted as \`path\` – why to open it first. Only paths from the file tree.

## Things to watch
2-5 bullets on real risks or gaps: missing tests, no license, no CI, committed .env files, outdated or abandoned project, security-sensitive code you can see. Base them on the facts list and the files. If nothing stands out, write one bullet saying so.

## Intended use case
One short paragraph on who should use this and when.`,
};

const MAX_TOKENS: Record<ExplainDepth, number> = { quick: 1400, deep: 2200 };

export class AIService {
  private static readonly GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
  private static readonly GROQ_MODEL = "openai/gpt-oss-120b";
  private static readonly GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

  /**
   * Generate a repository explanation
   */
  static async generateExplanation(request: AIExplanationRequest): Promise<string> {
    const { context, metadata, depth } = request;

    const system = `You are a senior software engineer writing a briefing on a GitHub repository for another developer who is deciding whether to use it or contribute to it.

Rules:
- Describe only what the provided files, file tree and facts show. Never invent features, commands, files or dependencies. When something cannot be determined from what you were given, say "Not clear from the code".
- Be specific: name real files, folders, functions and libraries. Avoid generic filler like "makes it easy to build apps" or "robust and scalable".
- Plain technical language. Short sentences.
- Output markdown with exactly the sections below, in this order, each starting with a '##' heading written exactly as shown. No other headings, no tables, no horizontal rules, no intro or closing text.

${SECTION_SPECS[depth]}`;

    const user = this.describeRepo(context, metadata);

    return this.complete(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      MAX_TOKENS[depth]
    );
  }

  /**
   * Answer a follow-up question about a repository
   */
  static async answerQuestion(
    context: RepoContext,
    metadata: RepoMetadata,
    question: string,
    history: ChatMessage[] = []
  ): Promise<string> {
    const system = `You answer questions about a GitHub repository for a developer. Use only the repository material below: the facts, the file tree and the file contents. Never fill gaps from general knowledge of the project or its ecosystem. Only name a function, method or option if it appears in that material. You have read only the files listed under "Files you have read"; any other file in the tree is a name only, so never describe what it contains. If the material does not answer the question, say so plainly, point to the files in the tree most likely to hold the answer, and stop there. Name real files and folders. Keep answers under 200 words. Markdown is allowed: bullets, numbered lists, inline code and fenced code blocks; no tables, no headings.

${this.describeRepo(context, metadata)}`;

    return this.complete(
      [
        { role: "system", content: system },
        ...history.slice(-6).map((m) => ({ role: m.role, content: m.content.slice(0, 1500) })),
        { role: "user", content: question },
      ],
      900
    );
  }

  private static describeRepo(context: RepoContext, metadata: RepoMetadata): string {
    const { facts } = context;
    const factLines = [
      `Repository: ${metadata.name}`,
      metadata.description && `Description: ${metadata.description}`,
      metadata.language && `Primary language (GitHub): ${metadata.language}`,
      metadata.topics?.length && `Topics: ${metadata.topics.join(", ")}`,
      `Stars: ${metadata.stars}, forks: ${metadata.forks}, open issues: ${metadata.openIssues ?? "unknown"}`,
      `Last commit: ${metadata.lastCommitDate ?? "unknown"}`,
      metadata.archived && "The repository is archived (read-only).",
      `License: ${metadata.license ?? (facts.hasLicense ? "license file present" : "none found")}`,
      `Files in repo: ${facts.fileCount}`,
      `Tests found: ${facts.hasTests ? "yes" : "no"}`,
      `CI config found: ${facts.hasCI ? "yes" : "no"}`,
      `Docker config found: ${facts.hasDocker ? "yes" : "no"}`,
      facts.committedEnvFiles.length > 0 && `Committed .env files: ${facts.committedEnvFiles.join(", ")}`,
    ].filter(Boolean);

    const readFiles = [...context.files.matchAll(/^=== (.+) ===$/gm)].map((m) => m[1]);

    return `Facts:
${factLines.map((l) => `- ${l}`).join("\n")}

File tree (generated folders, lockfiles and binaries omitted):
${context.tree}
Files you have read: ${readFiles.join(", ") || "none"}

Selected file contents:
${context.files || "(no readable files)"}`;
  }

  /**
   * Run a chat completion on Groq, falling back to Gemini
   */
  private static async complete(messages: PromptMessage[], maxTokens: number): Promise<string> {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!groqKey && !geminiKey) {
      throw new Error("No AI API key configured");
    }

    if (groqKey) {
      try {
        return await this.completeWithGroq(messages, maxTokens, groqKey);
      } catch (error) {
        if (!geminiKey) throw error;
        console.error("Groq failed, falling back to Gemini:", error);
      }
    }

    return this.completeWithGemini(messages, geminiKey!);
  }

  private static async completeWithGroq(messages: PromptMessage[], maxTokens: number, apiKey: string): Promise<string> {
    const response = await fetch(this.GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.GROQ_MODEL,
        messages,
        max_completion_tokens: maxTokens,
        reasoning_effort: "low",
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error("No explanation generated from AI service");
    }

    return result;
  }

  private static async completeWithGemini(messages: PromptMessage[], apiKey: string): Promise<string> {
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const response = await fetch(this.GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        ...(system && { systemInstruction: { parts: [{ text: system }] } }),
        contents,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      throw new Error("No explanation generated from AI service");
    }

    return result;
  }
}
