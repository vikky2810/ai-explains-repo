import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { parseGitHubUrl, GitHubService, AIService } from "@/lib/utils";
import { saveSearchHistory } from "@/lib/services/database";
import { checkRateLimit, RATE_LIMITS } from "@/lib/services/rateLimit";
import { ExplainRepoRequest, ExplainRepoResponse, APIErrorResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { repoUrl, depth: requestedDepth }: ExplainRepoRequest = await req.json();
    const depth = requestedDepth === "quick" ? "quick" : "deep";

    if (!repoUrl) {
      const errorResponse: APIErrorResponse = { error: "Repo URL is required" };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const repoInfo = parseGitHubUrl(repoUrl);
    if (!repoInfo) {
      const errorResponse: APIErrorResponse = { error: "Invalid GitHub URL" };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { owner, repo } = repoInfo;

    const rateLimit = await checkRateLimit(req, RATE_LIMITS.explain);
    if (!rateLimit.allowed) {
      const errorResponse: APIErrorResponse = { error: rateLimit.message };
      return NextResponse.json(errorResponse, {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      });
    }

    try {
      // Metadata gives the default branch the file tree is read from
      const metadata = await GitHubService.getRepoMetadata(owner, repo);
      const context = await GitHubService.getRepoContext(owner, repo, metadata, depth);

      const explanation = await AIService.generateExplanation({
        context,
        metadata,
        depth,
      });

      const response: ExplainRepoResponse = { 
        explanation, 
        metadata 
      };

              // Save search history if user is authenticated
        try {
          const session = await getServerSession(authOptions);
          const userId = session?.user?.email;
          if (typeof userId === 'string' && userId.length > 0) {
            await saveSearchHistory(
              userId,
              repoUrl,
              repo,
              owner,
              explanation,
              metadata
            );
          }
        } catch (historyError) {
          // Don't fail the main request if history saving fails
          console.error("Failed to save search history:", historyError);
        }

      return NextResponse.json(response);
    } catch (error) {
      console.error("Service error:", error);
      
      if (error instanceof Error) {
        const errorResponse: APIErrorResponse = { error: error.message };
        return NextResponse.json(errorResponse, { status: 500 });
      }
      
      const errorResponse: APIErrorResponse = { error: "Failed to process repository" };
      return NextResponse.json(errorResponse, { status: 500 });
    }
  } catch (error) {
    console.error("Request parsing error:", error);
    const errorResponse: APIErrorResponse = { error: "Invalid request format" };
    return NextResponse.json(errorResponse, { status: 400 });
  }
}