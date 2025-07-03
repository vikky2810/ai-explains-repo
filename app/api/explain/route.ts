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

    if (!readmeRes.ok) {
      return NextResponse.json(
        { error: "Could not fetch README" },
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
                  text: `Explain this GitHub project in simple terms and in short in 500 wokrds  :\n\n${trimmedReadme}`,
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
}
