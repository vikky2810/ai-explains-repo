import { NextRequest, NextResponse } from "next/server";
import { parseGitHubUrl, GitHubService, AIService } from "@/lib/utils";
import { checkRateLimit, RATE_LIMITS } from "@/lib/services/rateLimit";
import { AskRepoRequest, AskRepoResponse, APIErrorResponse, ChatMessage } from "@/types";

const MAX_QUESTION_LENGTH = 500;

export async function POST(req: NextRequest) {
  let body: AskRepoRequest;
  try {
    body = await req.json();
  } catch {
    const errorResponse: APIErrorResponse = { error: "Invalid request format" };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    const errorResponse: APIErrorResponse = { error: "Question is required" };
    return NextResponse.json(errorResponse, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    const errorResponse: APIErrorResponse = { error: `Keep questions under ${MAX_QUESTION_LENGTH} characters` };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const repoInfo = typeof body.repoUrl === "string" ? parseGitHubUrl(body.repoUrl) : null;
  if (!repoInfo) {
    const errorResponse: APIErrorResponse = { error: "Invalid GitHub URL" };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const history: ChatMessage[] = Array.isArray(body.history)
    ? body.history.filter(
        (m): m is ChatMessage =>
          (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
      )
    : [];

  const rateLimit = await checkRateLimit(req, RATE_LIMITS.ask);
  if (!rateLimit.allowed) {
    const errorResponse: APIErrorResponse = { error: rateLimit.message };
    return NextResponse.json(errorResponse, {
      status: 429,
      headers: { "Retry-After": String(rateLimit.retryAfter) },
    });
  }

  try {
    const { owner, repo } = repoInfo;
    const metadata = await GitHubService.getRepoMetadata(owner, repo);
    // Same context as the deep write-up, so answers can draw on the same files
    const context = await GitHubService.getRepoContext(owner, repo, metadata, "deep");
    const answer = await AIService.answerQuestion(context, metadata, question, history);

    const response: AskRepoResponse = { answer };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Ask error:", error);
    const errorResponse: APIErrorResponse = {
      error: error instanceof Error ? error.message : "Failed to answer the question",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
