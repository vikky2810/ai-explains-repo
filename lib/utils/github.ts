/**
 * GitHub API and URL parsing utilities
 */

import { GitHubRepoInfo } from "@/types";

/**
 * Extracts owner and repo name from a GitHub URL
 */
export function parseGitHubUrl(url: string): GitHubRepoInfo | null {
  const match = url.match(/github\.com\/([\w-]+)\/([\w.-]+)/);
  if (!match) return null;
  
  const [, owner, repo] = match;
  return { owner, repo };
}

/**
 * Validates if a string is a valid GitHub repository URL
 */
export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}
