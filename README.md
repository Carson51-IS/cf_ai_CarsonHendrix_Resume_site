# cf-ai

**cf-ai** — An AI-powered web application that transforms your resume into a stunning portfolio website, built entirely on the Cloudflare platform.

## Overview

cf-ai lets users paste or upload their resume, choose a design template, and then use a conversational AI assistant to generate and iteratively customize a personal portfolio website. The AI parses the resume into structured data, generates a complete HTML/CSS website, and allows real-time refinement through natural language chat.

## Architecture & Cloudflare Components

| Component | Cloudflare Service | Purpose |
|---|---|---|
| **LLM** | Workers AI (Llama 3.3 70B) | Resume parsing, website generation, iterative customization |
| **Workflow / Coordination** | Pages Functions (Workers) | API endpoints for parse, generate, and chat workflows |
| **User Input** | Pages (React SPA) | Chat interface for AI interaction, resume upload |
| **Memory / State** | KV | Session data, parsed resumes, generated HTML, chat history |

### How It Works

1. **Upload** — User pastes or uploads a resume (PDF, Word, OpenDocument, RTF, HTML, Markdown, or plain text)
2. **Parse** — Workers AI (Llama 3.3) extracts structured data (name, experience, skills, projects, etc.)
3. **Generate** — User picks a template style; AI generates a complete, self-contained HTML portfolio
4. **Customize** — User chats with the AI to iteratively modify colors, layout, content, and more
5. **Export** — Download the final HTML file or open it in a new tab

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler`)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/cf-ai.git
cd cf-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Authenticate with Cloudflare

```bash
wrangler login
```

### 4. Create a KV namespace

```bash
wrangler kv:namespace create RESUME_KV
wrangler kv:namespace create RESUME_KV --preview
```

Copy the IDs from the output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RESUME_KV"
id = "<your-kv-namespace-id>"
preview_id = "<your-preview-kv-namespace-id>"
```

## Resume file formats

Text is extracted **in the browser** before anything is sent to Workers AI.

| Format | Extension | Notes |
|--------|-----------|--------|
| PDF | `.pdf` | Uses PDF.js |
| Word (modern) | `.docx` | Uses Mammoth |
| Legacy Word | `.doc` | **Not supported** in the browser — save as `.docx` or export PDF |
| OpenDocument | `.odt` | Text from `content.xml` |
| Rich Text | `.rtf` | Best-effort plain-text extraction |
| Web | `.html`, `.htm` | Raw text read |
| Plain / notes | `.txt`, `.md`, `.markdown`, `.csv`, `.json` | As-is |

Scanned PDFs (image-only) usually yield little or no text unless OCR’d elsewhere.

## Running Locally

### Frontend only (no Pages Functions)

```bash
npm run dev
```

Vite serves the UI at `http://localhost:5173`. **`/api/*` is proxied to `http://127.0.0.1:8788`**, so you still need Wrangler running there or those calls return connection errors / 404-style failures.

### Full stack + Workers AI (recommended)

Use **two terminals**:

**Terminal 1** — build once, then run Pages + Functions (Workers AI uses your Cloudflare account):

```bash
npm run build
npm run preview
```

`npm run preview` runs `wrangler pages dev ./dist --ai=AI`, which exposes the `AI` binding to your Functions. Open the URL Wrangler prints (often `http://127.0.0.1:8788`).

**Terminal 2** (optional, for hot reload on the React UI):

```bash
npm run dev
```

Then use `http://localhost:5173` — API requests are proxied to port **8788**.

**KV during local dev:** If `wrangler.toml` still has placeholder KV IDs, either [create real namespaces](https://developers.cloudflare.com/kv/get-started/) and paste the IDs, or run with remote bindings:

```bash
npm run build
npm run preview:remote
```

`preview:remote` uses `--remote` so production (or preview) bindings from the dashboard are used instead of local placeholders.

## Workers AI: is it working?

Workers AI runs **only** inside **Pages Functions** (`functions/api/*`), not inside Vite alone. Use this checklist:

1. **Binding name** — Code expects `context.env.AI`. In `wrangler.toml` you should have:
   ```toml
   [ai]
   binding = "AI"
   ```
   In the Cloudflare dashboard (**Workers & Pages** → your project → **Settings** → **Bindings**), if you add Workers AI manually, the variable name must be **`AI`** (same as in code).

2. **KV (recommended)** — Replace `PLACEHOLDER_KV_ID` / `PLACEHOLDER_PREVIEW_KV_ID` in `wrangler.toml` with IDs from:
   ```bash
   wrangler kv:namespace create RESUME_KV
   wrangler kv:namespace create RESUME_KV --preview
   ```
   Session writes use `kvPutSafe`: if KV is missing or misconfigured, **parse / generate / chat still return 200**; you will see `[kv]` warnings in logs and lose server-side session persistence until KV is fixed.

3. **Account access** — Workers AI must be available on your Cloudflare account (see [Workers AI docs](https://developers.cloudflare.com/workers-ai/)). Local `wrangler pages dev` still calls Cloudflare’s network for inference (usage may apply).

4. **Test a Function directly** — After `npm run build` and `npm run preview`, from another shell use **`curl.exe`** (Windows) or bash `curl`. On PowerShell:
   ```powershell
   Invoke-RestMethod -Uri 'http://127.0.0.1:8788/api/parse-resume' -Method Post -ContentType 'application/json' -Body '{"resumeText":"Jane Doe\nEngineer\njane@example.com","sessionId":"test-1"}'
   ```
   You should get JSON with a `resumeData` object. If you see `500` and an error about `AI` or bindings, Wrangler is not attaching Workers AI correctly.

5. **External generate Worker** — Default `https://cf-ai.weasol51.workers.dev` (`POST` JSON `{"input":"..."}` → `{ "html": "..." }`). Override with `VITE_CF_AI_WORKER_URL`. CORS is enabled for browser use. Set `VITE_USE_PAGES_GENERATE_ONLY=true` to use only `/api/generate`.

6. **Deployed Pages** — After `npm run deploy`, open your `*.pages.dev` site and try the same flow. If production fails but local works, add **Workers AI** and **KV** bindings under the Pages project in the dashboard and **redeploy**.

Official references: [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/).

## Deploying to Cloudflare

```bash
npm run build
npm run deploy
```

This builds the React frontend and deploys static assets plus `functions/` to Cloudflare Pages. Bindings in `wrangler.toml` (`[ai]`, `[[kv_namespaces]]`) are applied when you deploy with Wrangler from this directory.

If the project was created only in the dashboard, open **Settings → Bindings** and ensure **Workers AI** (`AI`) and **KV** (`RESUME_KV`) match `wrangler.toml`, then trigger a new deployment.

## Project Structure

```
├── src/                    # React frontend (Vite)
│   ├── components/         # UI components
│   │   ├── Header.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── ResumeUpload.tsx
│   │   ├── TemplateGallery.tsx
│   │   ├── ChatInterface.tsx
│   │   └── PreviewPanel.tsx
│   ├── context/            # React context (app state)
│   ├── templates/          # Template style definitions
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Client text extraction + API helpers
│   ├── App.tsx
│   └── main.tsx
├── functions/              # Cloudflare Pages Functions (API)
│   ├── api/
│   │   ├── parse-resume.ts # POST /api/parse-resume
│   │   ├── generate.ts     # POST /api/generate
│   │   └── chat.ts         # POST /api/chat
│   └── utils/              # aiOutputToString, kvPutSafe
├── wrangler.toml           # Cloudflare configuration
├── PROMPTS.md              # AI prompts used in development
└── README.md
```

## API Endpoints

### `POST /api/parse-resume`
Parses raw resume text into structured JSON using Llama 3.3.

**Body:** `{ resumeText: string, sessionId: string }`
**Response:** `{ resumeData: ResumeData }`

### `POST /api/generate`
Generates a complete HTML portfolio website from resume data and a template style.

**Body:** `{ resumeData: object, templateId: string, stylePrompt: string, sessionId: string }`
**Response:** `{ html: string }`

### `POST /api/chat`
Accepts a natural language instruction and returns an updated HTML document.

**Body:** `{ message: string, currentHtml: string, chatHistory: array, sessionId: string }`
**Response:** `{ explanation: string, html: string }`

## Template Styles

| Template | Description |
|---|---|
| **Modern Dark** | Sleek dark theme with gradient accents and animations |
| **Clean Minimal** | Light, whitespace-heavy with elegant typography |
| **Bold Creative** | Vibrant colors, dynamic layouts, personality-focused |
| **Developer Terminal** | Monospace, terminal-inspired, hacker aesthetic |

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Document parsing (client):** PDF.js, Mammoth (DOCX), JSZip (ODT), RTF stripping
- **Backend:** Cloudflare Pages Functions (Workers runtime)
- **AI:** Cloudflare Workers AI — Llama 3.3 70B Instruct
- **Storage:** Cloudflare KV (session state, chat history)
- **Icons:** Lucide React

## License

MIT
