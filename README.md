# 🧠 AI Explains This Repo

Explain any public GitHub repository in plain English. Paste a repo URL, and get a clean, beginner‑friendly summary with key features and intended use.

![Screenshot](preview.png)

## ✨ Features
- **Instant repo summaries**: Paste a GitHub URL → get a concise explanation.
- **Smart sections**: TL;DR, What it does, Key features, Use cases (rendered as markdown).
- **Repo metadata**: Stars, forks, last commit date, and link.
- **Authentication (Clerk)**: Optional sign in/up (modal) and `UserButton` in the header.
- **Polished UI**: Next.js App Router + Tailwind CSS, responsive hero page and chat page.

## 🧩 How it works
1. Client sends the repo URL to `POST /api/explain`.
2. API fetches repo contents from GitHub (root files), builds a trimmed context, and fetches repo metadata.
3. Sends context to Google Gemini to produce a markdown summary with specific sections.
4. UI renders markdown nicely, grouped by section, with repo metadata on top.

> Note: Currently only root-level files are fetched. Large/binary files are not filtered yet. See Roadmap.

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
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Optional: GitHub token for higher rate limits / private repos
# GITHUB_TOKEN=ghp_...
```

## 🚀 Getting started
```bash
pnpm install
pnpm dev
# visit http://localhost:3000
```

### Usage
1. Open the site and paste a GitHub repo URL, e.g. `https://github.com/vercel/next.js`.
2. Click “Explain Repo 🚀”.
3. Read the generated summary. Click the repo title to open it on GitHub.
4. Click “Explain another repo” to reset.

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