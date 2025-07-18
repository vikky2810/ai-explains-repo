import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repo URL is required" },
        { status: 400 }
      );
    }

    const match = repoUrl.match(/github\.com\/([\w-]+)\/([\w.-]+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid GitHub URL" },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;

    // Fetch all files in the repository
    try {
      const filesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ai-explains-this-repo",
        },
      });

      if (!filesRes.ok) {
        return NextResponse.json({ error: "Repository not found or it's private." }, { status: 404 });
      }

      const files = await filesRes.json();

      // Concatenate contents of all files
      let concatenatedContents = "";
      for (const file of files) {
        if (file.type === "file") {
          try {
            const fileContentsRes = await fetch(file.download_url);
            const fileContents = await fileContentsRes.text();
            concatenatedContents += fileContents;
          } catch (error) {
            console.error(`Error fetching file ${file.name}:`, error);
          }
        }
      }

      // Trim concatenated contents to 5000 characters
      const trimmedContents = concatenatedContents.slice(0, 5000);

      // Generate explanation using Gemini API
      try {
        const geminiRes = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": process.env.GEMINI_API_KEY || "",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an expert software engineer. Read the following repository contents and generate an explanation in markdown format with these sections (use '##' markdown heading for each):

                        ## TL;DR
                        ## What this project does
                        ## Key features
                        ## Intended use case

                        Make it beginner-friendly, avoid copying the contents directly. Keep it under 300 words.

                        Repository contents:
                        ${trimmedContents}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await geminiRes.json();

        const result =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Explanation not available.";

        return NextResponse.json({ explanation: result });
      } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
    } catch (error) {
      console.error("Server error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}