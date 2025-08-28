/**
 * API and service types
 */

// GitHub API types
export interface GitHubRepoInfo {
  owner: string;
  repo: string;
}

export interface RepoMetadata {
  name: string;
  description: string;
  stars: number;
  forks: number;
  url: string;
  lastCommitDate?: string;
}

export interface RepoFile {
  name: string;
  type: string;
  download_url?: string;
}

// AI service types
export interface AIExplanationRequest {
  repositoryContents: string;
  maxWords?: number;
}

// API response types
export interface ExplainRepoRequest {
  repoUrl: string;
}

export interface ExplainRepoResponse {
  explanation: string;
  metadata: RepoMetadata;
}

export interface APIErrorResponse {
  error: string;
}
