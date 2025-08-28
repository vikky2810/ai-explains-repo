/**
 * AI service for generating repository explanations
 */

import { AIExplanationRequest } from "@/types";

export class AIService {
  private static readonly GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  private static readonly DEFAULT_MAX_WORDS = 300;

  /**
   * Generate repository explanation using Gemini API
   */
  static async generateExplanation(request: AIExplanationRequest): Promise<string> {
    const { repositoryContents, maxWords = this.DEFAULT_MAX_WORDS } = request;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const prompt = this.buildPrompt(repositoryContents, maxWords);

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

Repository contents:
${repositoryContents}`;
  }
}
