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
  defaultBranch?: string;
  language?: string;
  license?: string;
  topics?: string[];
  openIssues?: number;
  archived?: boolean;
}

export interface RepoFacts {
  fileCount: number;
  hasTests: boolean;
  hasCI: boolean;
  hasLicense: boolean;
  hasDocker: boolean;
  committedEnvFiles: string[];
}

export interface RepoContext {
  tree: string;
  files: string;
  facts: RepoFacts;
}

export type ExplainDepth = "quick" | "deep";

// AI service types
export interface AIExplanationRequest {
  context: RepoContext;
  metadata: RepoMetadata;
  depth: ExplainDepth;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// API response types
export interface ExplainRepoRequest {
  repoUrl: string;
  depth?: ExplainDepth;
}

export interface ExplainRepoResponse {
  explanation: string;
  metadata: RepoMetadata;
}

export interface AskRepoRequest {
  repoUrl: string;
  question: string;
  history?: ChatMessage[];
}

export interface AskRepoResponse {
  answer: string;
}

export interface APIErrorResponse {
  error: string;
}
