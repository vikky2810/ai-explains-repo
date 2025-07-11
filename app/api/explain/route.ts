import { log } from "console";
import { url } from "inspector";
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

    const readmeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.v3.raw",
          "User-Agent": "ai-explains-this-repo",
        },
      }
    );

    // Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`)

    if (!repoRes.ok) {
      return NextResponse.json({ error: "Repository not found or it's private." }, { status: 404 });
    }
    const repoData = await repoRes.json();
    
    const metadata = {
      name: repoData.full_name,
      stars : repoData.stargazers_count,
      forks: repoData.forks_count,
      url: repoData.html_url
    }

    if (!readmeRes.ok) {
      return NextResponse.json(
        { error: "README not found or inaccessible." },
        { status: 500 }
      );
    }

    const readme = await readmeRes.text();
    const trimmedReadme = readme.slice(0, 5000); // reduce input size

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
            text: `You are an expert software engineer. Read the following GitHub README and provide a clear, concise summary of what this project does, its main features, and its intended use case. Explain it in simple terms for someone new to the project, using no more than 300 words. Avoid copying text verbatim from the README. Focus on the purpose, how it works, and why someone might use it.\n\nREADME:\n${trimmedReadme}`,
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

    return NextResponse.json({ explanation: result ,metadata});
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
