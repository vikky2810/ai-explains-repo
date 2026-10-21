/**
 * AI service for generating repository explanations
 */

import { AIExplanationRequest } from "@/types";

export class AIService {
  private static readonly GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
  private static readonly GROQ_MODEL = "openai/gpt-oss-120b";
  private static readonly GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";
  private static readonly DEFAULT_MAX_WORDS = 300;

  /**
   * Generate repository explanation using Groq, falling back to Gemini
   */
  static async generateExplanation(request: AIExplanationRequest): Promise<string> {
    const { repositoryContents, maxWords = this.DEFAULT_MAX_WORDS } = request;

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!groqKey && !geminiKey) {
      throw new Error("No AI API key configured");
    }

    const prompt = this.buildPrompt(repositoryContents, maxWords);

    if (groqKey) {
      try {
        return await this.generateWithGroq(prompt, groqKey);
      } catch (error) {
        if (!geminiKey) throw error;
        console.error("Groq failed, falling back to Gemini:", error);
      }
    }

    return this.generateWithGemini(prompt, geminiKey!);
  }

  private static async generateWithGroq(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch(this.GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
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

  private static async generateWithGemini(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch(this.GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
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

  /**
   * Build the prompt for the AI service
   */
  private static buildPrompt(repositoryContents: string, maxWords: number): string {
    return `You are an expert software engineer. Read the following repository contents and generate an explanation in markdown format with these sections (use '##' markdown heading for each):

## TL;DR
## What this project does
## Key features
## Intended use case

Make it beginner-friendly, avoid copying the contents directly. Keep it under ${maxWords} words.
Use paragraphs and bullet lists only: no tables, no horizontal rules, no other heading levels.

Repository contents:
${repositoryContents}`;
  }
}
