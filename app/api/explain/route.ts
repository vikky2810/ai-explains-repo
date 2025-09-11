import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { parseGitHubUrl, GitHubService, AIService } from "@/lib/utils";
import { saveSearchHistory } from "@/lib/services/database";
import { ExplainRepoRequest, ExplainRepoResponse, APIErrorResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { repoUrl }: ExplainRepoRequest = await req.json();

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

    try {
      // Get repository metadata and contents using services
      const [metadata, repositoryContents] = await Promise.all([
        GitHubService.getRepoMetadata(owner, repo),
        GitHubService.getConcatenatedContents(owner, repo, 5000)
      ]);

      // Generate explanation using AI service
      const explanation = await AIService.generateExplanation({
        repositoryContents,
        maxWords: 300
      });

      const response: ExplainRepoResponse = { 
        explanation, 
        metadata 
      };

              // Save search history if user is authenticated
        try {
          const session = await getServerSession(authOptions);
          const userId = session?.user?.email || session?.user?.id;
          if (userId) {
            await saveSearchHistory(
              userId,
              repoUrl,
              metadata.name,
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