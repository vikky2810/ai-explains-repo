/**
 * GitHub API service for repository operations
 */

import { RepoMetadata, RepoContext, RepoFacts } from "@/types";

interface TreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  size?: number;
}

// Folders that are generated, vendored, or editor noise
const IGNORED_DIRS = new Set([
  "node_modules", "dist", "build", "out", ".next", ".nuxt", ".svelte-kit", ".turbo",
  "coverage", "vendor", "target", "bin", "obj", "__pycache__", ".venv", "venv",
  ".git", ".idea", ".vscode", ".cache", ".parcel-cache", "Pods", ".gradle",
]);

const LOCKFILES = new Set([
  "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "bun.lock",
  "Cargo.lock", "poetry.lock", "Pipfile.lock", "composer.lock", "Gemfile.lock",
  "go.sum", "uv.lock", "mix.lock", "pubspec.lock", "packages.lock.json",
]);

const BINARY_EXT = /\.(png|jpe?g|gif|svg|ico|webp|avif|bmp|tiff?|psd|pdf|zip|tar|gz|tgz|rar|7z|woff2?|ttf|eot|otf|mp[34]|mov|avi|webm|wav|ogg|flac|exe|dll|so|dylib|a|o|jar|class|wasm|pyc|bin|dat|db|sqlite3?|map)$/i;

// Files that describe the stack and how to run the project, in priority order
const MANIFESTS = [
  "package.json", "pyproject.toml", "requirements.txt", "setup.py", "Pipfile",
  "go.mod", "Cargo.toml", "pom.xml", "build.gradle", "build.gradle.kts",
  "Gemfile", "composer.json", "mix.exs", "pubspec.yaml", "deno.json",
  "Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yaml",
  "Makefile", ".env.example", ".env.sample",
];

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|rb|php|cs|swift|c|cc|cpp|h|hpp|ex|exs|dart|scala|vue|svelte|lua|sh)$/i;
const CORE_DIR = /^(src|app|lib|cmd|server|pkg|internal|api|core|services?)$/i;
const NON_CORE_PATH = /(^|\/)(tests?|__tests__|spec|specs|mocks?|fixtures?|examples?|demos?|docs?|benchmarks?|scripts|types?|typings)\/|\.(test|spec|stories)\.\w+$|\.d\.ts$|config\.\w+$/i;
const ENTRY_NAME = /^(main|index|app|server|cli|__main__|mod|lib|route|page|layout|program|application)\./i;

const BUDGETS = {
  quick: { total: 9000, readme: 3500, manifest: 1200, tree: 1500, source: 1400, sourceFiles: 2 },
  deep: { total: 15000, readme: 4000, manifest: 1500, tree: 2500, source: 1800, sourceFiles: 4 },
} as const;

// Per-instance caches so follow-up questions don't refetch the same repo
const CACHE_TTL_MS = 10 * 60 * 1000;
const contextCache = new Map<string, { at: number; value: RepoContext }>();
const metadataCache = new Map<string, { at: number; value: RepoMetadata }>();

export class GitHubService {
  private static readonly USER_AGENT = "ai-explains-this-repo";
  private static readonly API_BASE = "https://api.github.com";

  private static headers(): HeadersInit {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": this.USER_AGENT,
    };
    // Optional: raises GitHub's limit from 60 to 5,000 requests per hour
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
  }

  /**
   * Get the last commit date for a repository
   */
  static async getLastCommitDate(owner: string, repo: string): Promise<string | undefined> {
    try {
      const response = await fetch(
        `${this.API_BASE}/repos/${owner}/${repo}/commits?per_page=1`,
        { headers: this.headers() }
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
    const cacheKey = `${owner}/${repo}`.toLowerCase();
    const cached = metadataCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.value;
    }

    const response = await fetch(`${this.API_BASE}/repos/${owner}/${repo}`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error("GitHub rate limit reached. Please try again in a few minutes.");
      }
      throw new Error("Repository not found or it's private.");
    }

    const repoData = await response.json();
    const lastCommitDate = await this.getLastCommitDate(owner, repo);

    const metadata: RepoMetadata = {
      name: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      url: repoData.html_url,
      lastCommitDate,
      defaultBranch: repoData.default_branch,
      language: repoData.language ?? undefined,
      license: repoData.license?.spdx_id && repoData.license.spdx_id !== "NOASSERTION"
        ? repoData.license.spdx_id
        : undefined,
      topics: repoData.topics ?? [],
      openIssues: repoData.open_issues_count,
      archived: Boolean(repoData.archived),
    };
    metadataCache.set(cacheKey, { at: Date.now(), value: metadata });
    return metadata;
  }

  /**
   * Build the context the AI reads: file tree, README, manifests and a few
   * entry-point source files, trimmed to fit the model's input budget
   */
  static async getRepoContext(
    owner: string,
    repo: string,
    metadata: RepoMetadata,
    depth: "quick" | "deep" = "deep"
  ): Promise<RepoContext> {
    const cacheKey = `${owner}/${repo}@${metadata.defaultBranch}:${depth}`.toLowerCase();
    const cached = contextCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.value;
    }

    const budget = BUDGETS[depth];
    const branch = metadata.defaultBranch || "HEAD";
    const allFiles = await this.getFileTree(owner, repo, branch);
    const files = allFiles.filter((f) => !this.isIgnored(f.path));

    const facts = this.collectFacts(allFiles, metadata);
    const tree = this.formatTree(files.map((f) => f.path), budget.tree);

    const readme = files
      .filter((f) => /^readme(\.(md|markdown|rst|txt))?$/i.test(f.path))
      .sort((a, b) => a.path.length - b.path.length)[0];
    const manifests = MANIFESTS
      .map((name) => files.find((f) => f.path === name))
      .filter((f): f is TreeEntry => Boolean(f));
    const sources = this.pickSourceFiles(files, budget.sourceFiles);

    const picks: { path: string; limit: number }[] = [
      ...(readme ? [{ path: readme.path, limit: budget.readme }] : []),
      ...manifests.map((f) => ({ path: f.path, limit: budget.manifest })),
      ...sources.map((f) => ({ path: f.path, limit: budget.source })),
    ];

    const contents = await Promise.all(
      picks.map(async (pick) => ({
        ...pick,
        text: await this.getRawFile(owner, repo, branch, pick.path),
      }))
    );

    let remaining = budget.total - tree.length;
    const sections: string[] = [];
    for (const file of contents) {
      if (!file.text || remaining <= 200) continue;
      const limit = Math.min(file.limit, remaining);
      const body = file.text.length > limit
        ? `${file.text.slice(0, limit)}\n… (truncated)`
        : file.text;
      sections.push(`=== ${file.path} ===\n${body}`);
      remaining -= body.length + file.path.length + 10;
    }

    const value: RepoContext = {
      tree,
      files: sections.join("\n\n"),
      facts,
    };
    contextCache.set(cacheKey, { at: Date.now(), value });
    return value;
  }

  private static async getFileTree(owner: string, repo: string, branch: string): Promise<TreeEntry[]> {
    const response = await fetch(
      `${this.API_BASE}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      { headers: this.headers() }
    );

    if (response.status === 409) {
      throw new Error("This repository is empty.");
    }
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error("GitHub rate limit reached. Please try again in a few minutes.");
      }
      throw new Error("Repository not found or it's private.");
    }

    const data = await response.json();
    return (data.tree as TreeEntry[]).filter((entry) => entry.type === "blob");
  }

  private static async getRawFile(owner: string, repo: string, branch: string, path: string): Promise<string> {
    try {
      const encodedPath = path.split("/").map(encodeURIComponent).join("/");
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${encodedPath}`
      );
      if (!response.ok) return "";
      return await response.text();
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error);
      return "";
    }
  }

  private static isIgnored(path: string): boolean {
    const parts = path.split("/");
    const name = parts[parts.length - 1];
    if (parts.slice(0, -1).some((dir) => IGNORED_DIRS.has(dir))) return true;
    if (LOCKFILES.has(name)) return true;
    if (/\.min\.(js|css)$/i.test(name)) return true;
    return BINARY_EXT.test(name);
  }

  /**
   * Rank source files: shallow entry points and core folders first, at most
   * two per folder so the picks cover different parts of the codebase
   */
  private static pickSourceFiles(files: TreeEntry[], count: number): TreeEntry[] {
    const score = (file: TreeEntry) => {
      const parts = file.path.split("/");
      const name = parts[parts.length - 1];
      let s = parts.length * 2;
      if (parts.length <= 2 && ENTRY_NAME.test(name)) s -= 4;
      if (parts.slice(0, -1).some((dir) => CORE_DIR.test(dir))) s -= 2;
      if (/(api|routes?|services?|handlers?|controllers?|core)\//i.test(file.path)) s -= 2;
      s -= Math.min(3, (file.size ?? 0) / 3000);
      return s;
    };

    const candidates = files
      .filter((f) =>
        CODE_EXT.test(f.path) &&
        (f.size ?? 0) > 300 && (f.size ?? 0) < 60000 &&
        !f.path.split("/").some((part) => part.startsWith(".")) &&
        !NON_CORE_PATH.test(f.path)
      )
      .sort((a, b) => score(a) - score(b));

    const picked: TreeEntry[] = [];
    const perDir = new Map<string, number>();
    for (const file of candidates) {
      const dir = file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : "";
      if ((perDir.get(dir) ?? 0) >= 2) continue;
      perDir.set(dir, (perDir.get(dir) ?? 0) + 1);
      picked.push(file);
      if (picked.length === count) break;
    }
    return picked;
  }

  /**
   * Folder tree up to three levels. Dot-folders are collapsed and large
   * folders are capped, tightening the caps until the tree fits the budget
   */
  private static formatTree(paths: string[], maxChars: number): string {
    interface Node { children: Map<string, Node>; files: number }
    const root: Node = { children: new Map(), files: 0 };

    for (const path of paths) {
      let node = root;
      for (const part of path.split("/")) {
        node.files++;
        if (!node.children.has(part)) node.children.set(part, { children: new Map(), files: 0 });
        node = node.children.get(part)!;
      }
    }

    const render = (caps: number[]) => {
      const lines: string[] = [];
      const walk = (node: Node, depth: number) => {
        const entries = [...node.children.entries()].sort(([a, an], [b, bn]) => {
          const aDir = an.children.size > 0, bDir = bn.children.size > 0;
          return aDir === bDir ? a.localeCompare(b) : aDir ? -1 : 1;
        });
        const cap = depth === 0 ? Infinity : caps[depth - 1];
        entries.slice(0, cap).forEach(([name, child]) => {
          const indent = "  ".repeat(depth);
          if (child.children.size === 0) {
            lines.push(`${indent}${name}`);
            return;
          }
          lines.push(`${indent}${name}/ (${child.files} files)`);
          if (depth < 2 && !name.startsWith(".")) walk(child, depth + 1);
        });
        if (entries.length > cap) {
          lines.push(`${"  ".repeat(depth)}… ${entries.length - cap} more`);
        }
      };
      walk(root, 0);
      return lines.join("\n");
    };

    for (const caps of [[12, 8], [8, 4], [6, 0], [0, 0]]) {
      const tree = render(caps);
      if (tree.length <= maxChars) return `${tree}\n`;
    }
    return `${render([0, 0]).slice(0, maxChars)}\n… (more files not shown)\n`;
  }

  private static collectFacts(allFiles: TreeEntry[], metadata: RepoMetadata): RepoFacts {
    const paths = allFiles.map((f) => f.path);
    const names = paths.map((p) => p.split("/").pop() ?? p);
    return {
      fileCount: allFiles.length,
      hasTests: paths.some((p) => /(^|\/)(tests?|__tests__|spec)\/|\.(test|spec)\.\w+$|_test\.(go|py)$|^test_.*\.py$/i.test(p)),
      hasCI: paths.some((p) => p.startsWith(".github/workflows/") || p === ".gitlab-ci.yml" || p.startsWith(".circleci/")),
      hasLicense: Boolean(metadata.license) || names.some((n) => /^(license|licence|copying)(\.|$)/i.test(n)),
      hasDocker: names.some((n) => /^(dockerfile|docker-compose\.ya?ml|compose\.ya?ml)$/i.test(n)),
      committedEnvFiles: paths.filter((p) => /(^|\/)\.env(\.[\w-]+)?$/.test(p) && !/\.(example|sample|template|dist)$/.test(p)),
    };
  }
}
