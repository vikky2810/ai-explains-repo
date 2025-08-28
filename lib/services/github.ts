/**
 * GitHub API service for repository operations
 */

import { GitHubRepoInfo, RepoMetadata, RepoFile } from "@/types";

export class GitHubService {
  private static readonly USER_AGENT = "ai-explains-this-repo";
  private static readonly API_BASE = "https://api.github.com";

  /**
   * Get the last commit date for a repository
   */
  static async getLastCommitDate(owner: string, repo: string): Promise<string | undefined> {
    try {
      const response = await fetch(
        `${this.API_BASE}/repos/${owner}/${repo}/commits?per_page=1`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": this.USER_AGENT,
          },
        }
      );

      if (!response.ok) {
        // Empty or private repos, or API limits; don't fail the whole request
        return undefined;
      }

      const commits = await response.json();
      return commits[0]?.commit?.committer?.date;
    } catch {
      return undefined;
    }
  }

  /**
   * Get repository metadata
   */
  static async getRepoMetadata(owner: string, repo: string): Promise<RepoMetadata> {
    const response = await fetch(`${this.API_BASE}/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": this.USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error("Repository not found or it's private.");
    }

    const repoData = await response.json();
    const lastCommitDate = await this.getLastCommitDate(owner, repo);

    return {
      name: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      url: repoData.html_url,
      lastCommitDate,
    };
  }

  /**
   * Get repository contents
   */
  static async getRepoContents(owner: string, repo: string): Promise<RepoFile[]> {
    const response = await fetch(`${this.API_BASE}/repos/${owner}/${repo}/contents`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": this.USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error("Repository not found or it's private.");
    }

    return response.json();
  }

  /**
   * Get file content from download URL
   */
  static async getFileContent(downloadUrl: string): Promise<string> {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file content: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Get concatenated repository contents (limited to specified length)
   */
  static async getConcatenatedContents(owner: string, repo: string, maxLength: number = 5000): Promise<string> {
    const files = await this.getRepoContents(owner, repo);
    let concatenatedContents = "";

    for (const file of files) {
      if (file.type === "file" && file.download_url) {
        try {
          const fileContents = await this.getFileContent(file.download_url);
          concatenatedContents += fileContents;
          
          // Stop if we've reached the max length
          if (concatenatedContents.length >= maxLength) {
            break;
          }
        } catch (error) {
          console.error(`Error fetching file ${file.name}:`, error);
          // Continue with other files instead of failing completely
        }
      }
    }

    return concatenatedContents.slice(0, maxLength);
  }
}
