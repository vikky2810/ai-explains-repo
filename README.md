# 🧠 AI Explains This Repo

**Professional GitHub repository analysis platform** that provides deep insights into code quality, security, performance, and architecture. Unlike static analyzers, it doesn't just flag issues—it explains architecture, highlights risks, and gives developers actionable insights in plain English.

![Screenshot](preview.png)

## ✨ Enhanced Features

### 🔍 **Code Quality Analysis**
- **Complexity Metrics**: Detect cyclomatic & cognitive complexity with AI-powered explanations
- **Maintainability Index**: Generate maintainability scores plus plain-language improvement suggestions
- **Best Practices**: Check ESLint/coding standards and explain violations in context
- **Code Smells**: Flag anti-patterns, technical debt, and provide suggested refactoring approaches
- **Documentation Coverage**: Assess README + inline docs; highlight missing areas

### 🛡️ **Security Analysis**
- **Vulnerability Scanning**: Detect known CVEs and explain their real-world impact
- **Dependency Security**: Flag outdated or risky packages and suggest safer alternatives
- **Secrets Detection**: Identify exposed API keys, passwords, and tokens with mitigation guidance
- **Security Patterns**: Review authentication & authorization logic with AI-driven examples
- **OWASP Compliance**: Map findings to OWASP Top 10 with clear developer-friendly guidance

### ⚡ **Performance Analysis**
- **Bundle Size Analysis**: Detect oversized JavaScript bundles and suggest code splitting
- **Dependency Analysis**: Highlight heavy or unused packages with AI suggestions for alternatives
- **Performance Bottlenecks**: Identify slow DB queries or inefficient algorithms
- **Resource Usage**: Spot memory leaks or CPU-intensive functions with sample fixes
- **Optimization Suggestions**: AI-generated performance tuning tips tailored to your codebase

### 🏗️ **Architecture Analysis**
- **Project Structure**: Review directory and module organization with clarity explanations
- **Design Patterns**: Identify architectural patterns and highlight misapplications
- **Dependency Graph**: Visualize internal/external dependencies and flag circular dependencies
- **Coupling Analysis**: Detect high coupling/low cohesion with decoupling strategies
- **Technology Stack**: Assess frameworks and libraries with modernization recommendations

## 🧩 How it works
1. **Enter Repository URL**: Paste any public GitHub repository URL into the analyzer
2. **AI Analysis**: Our AI scans code quality, security, performance, and architecture, generating plain-language explanations
3. **Get Insights**: Receive detailed reports with actionable recommendations to improve your repository

> **Mission**: "Make complex repositories clear, secure, and maintainable through AI-powered explanations."

## 🗂️ Project structure
```
app/
  api/explain/route.ts   # API route → GitHub fetch + Gemini summary
  components/
    home.tsx             # Hero page with CTA and Clerk auth buttons
    chat.tsx             # Chat-style page to enter URL and view summary
  chat/page.tsx          # Signed-in experience using same summary UI
  layout.tsx             # Root layout with Clerk provider
  page.tsx               # Entry → toggles Home/Chat
public/                  # SVG assets
```

## 🔐 Environment variables
Create `.env.local` in the project root:
```
# Database (Required for user registration and authentication)
DATABASE_URL=postgresql://username:password@hostname:port/database

# NextAuth (Required for authentication)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional - for Google sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Service (Optional - for repository analysis)
GEMINI_API_KEY=your_gemini_api_key

# Optional: GitHub token for higher rate limits / private repos
# GITHUB_TOKEN=ghp_...
```

## 🚀 Getting started

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up environment variables
Create `.env.local` file with the required variables (see Environment variables section above).

### 3. Set up database
The application uses PostgreSQL. You can use:
- **Neon** (recommended): Sign up at [neon.tech](https://neon.tech) and get your connection string
- **Local PostgreSQL**: Install PostgreSQL locally and create a database
- **Other providers**: Any PostgreSQL-compatible database

### 4. Initialize database tables
```bash
# Run the database initialization script
pnpm tsx scripts/init-db.ts
```

### 5. Start the development server
```bash
pnpm dev
# visit http://localhost:3000
```

### Usage
1. Open the site and paste a GitHub repo URL, e.g. `https://github.com/vercel/next.js`.
2. Click "Analyze Repository 🚀".
3. Review the comprehensive analysis covering code quality, security, performance, and architecture.
4. Click "Analyze another repository" to start a new analysis.

## 🧱 Tech stack
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS
- Clerk (authentication)
- Google Gemini API
- react-markdown

## ⚠️ Limitations (current behavior)
- Only root-level files are fetched from GitHub (no recursive traversal yet).
- No streaming; summaries appear after the full response.
- No caching or rate limiting yet.
- Markdown rendering is sanitized (no raw HTML) but links open in a new tab.

## 🗺️ Roadmap
- Recursive GitHub traversal with size caps and binary filtering.
- Map–reduce summarization for faster/cheaper responses.
- Streaming responses to the UI.
- Caching and simple rate limiting.
- Optional history for signed-in users.

## 🧪 Development notes
- The API handles missing commits and private/empty repos gracefully (omits last commit date).
- Ensure Clerk keys and Gemini key are set; restart dev server after changes.

---

Built for clarity and speed. PRs and suggestions welcome!