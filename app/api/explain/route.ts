import { log } from "console";
import { url } from "inspector";
import { NextRequest, NextResponse } from "next/server";

async function getLastCommitDate(owner:string, repo:string)
{
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`);
    if(!res.ok) throw new Error('Commit not found');
    const commits = await res.json();

    return commits[0]?.commit?.committer?.date;
}


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

    const lastCommitDate = await getLastCommitDate(owner, repo);

    // Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    if (!repoRes.ok) {
      return NextResponse.json({ error: "Repository not found or it's private." }, { status: 404 });
    }
    const repoData = await repoRes.json();

    const metadata = {
      name: repoData.full_name,
      description: repoData.description,
      stars : repoData.stargazers_count,
      forks: repoData.forks_count,
      url: repoData.html_url,
      lastCommitDate,
    }

    // Fetch repo tree (list of files)
    const branch = repoData.default_branch || "main";
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          "User-Agent": "ai-explains-this-repo",
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!treeRes.ok) {
      return NextResponse.json({ error: "Could not fetch repo tree." }, { status: 500 });
    }
    const treeData = await treeRes.json();
    const files = treeData.tree.filter((item: any) => item.type === "blob");

    // Limit to first 10 code/text files (skip binaries)
    const MAX_FILES = 10;
    let combinedContent = "";
    let fileCount = 0;
    for (let i = 0; i < files.length && fileCount < MAX_FILES; i++) {
      const file = files[i];
      // Only fetch text/code files
      if (/\.(js|ts|jsx|tsx|py|md|json|yml|yaml|css|html)$/i.test(file.path)) {
        const fileRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
          {
            headers: {
              "User-Agent": "ai-explains-this-repo",
              Accept: "application/vnd.github.v3.raw",
            },
          }
        );
        if (fileRes.ok) {
          const content = await fileRes.text();
          combinedContent += `\n\n---\nFile: ${file.path}\n${content}`;
          fileCount++;
        }
      }
    }

    if (!combinedContent) {
      return NextResponse.json({ error: "No code files found to analyze." }, { status: 500 });
    }

    const trimmedContent = combinedContent.slice(0, 15000); // Limit input size for Gemini

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
                  text: `You are an expert software engineer. Read the following GitHub project files and generate an explanation in markdown format with these sections (use '##' markdown heading for each):\n\n## TL;DR\n## What this project does\n## Key features\n## Intended use case\n\nMake it beginner-friendly, avoid copying the files directly. Keep it under 300 words.\n\nPROJECT FILES:\n${trimmedContent}`
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
