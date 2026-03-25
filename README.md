# cf-ai

**cf-ai** — An AI-powered web application that transforms your resume into a stunning portfolio website, built entirely on the Cloudflare platform.

## Overview

cf-ai lets users paste or upload their resume, choose a design template, and then use a conversational AI assistant to generate and iteratively customize a personal portfolio website. The AI parses the resume into structured data, generates a complete HTML/CSS website, and allows real-time refinement through natural language chat.

## Potential upgrades and caveats

As of right now the app is fully functioning however the integrated AI isnt the best at making the website look good on the first try. Im sure that with a slightly more powerful AI it could be a little bit better. However, after iterating with the AI a bit the end website can look pretty nice.

An upgrade that I would have loved to add is a way to be able to buy a domain for the website so that the website that I made can give the user a full website instead of just the base design. I felt adding that feature was out of the scope for this project.

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

- [Node.js](https://nodejs.org/) v18+ (includes `npm`)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works; Workers AI must be available on the account you use)
- **Optional:** [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed globally (`npm install -g wrangler`). After `npm install`, project scripts use the **local** Wrangler in `node_modules`, so a global install is not required.

## Giving this to someone else (employers, graders, teammates)

**Easiest option — hosted demo:** If the app is already deployed to Cloudflare Pages, share the **`*.pages.dev` URL** (or custom domain). Reviewers can try the full app in a browser with no install and no Cloudflare login.

**If they need to run it locally:**

1. **`wrangler login` is per person.** It opens Cloudflare’s browser sign-in. Whoever runs it uses **their own** Cloudflare account (or creates one). They are **not** logging in with the author’s password, and nothing in the repo should contain anyone’s Cloudflare password.
2. **KV namespace IDs in `wrangler.toml` belong to a specific Cloudflare account.** IDs checked into the repo work only for that account. Anyone else should create **their own** KV namespaces (see [Setup → Create a KV namespace](#4-create-a-kv-namespace)) and paste **their** `id` and `preview_id` into `wrangler.toml`, or run `npm run preview:remote` after they have deployed and configured bindings in the dashboard (see **KV during local dev** under [Running Locally](#running-locally)).
3. **Workers AI** runs through Cloudflare; local `wrangler pages dev` still uses the **logged-in account** for AI (usage limits / billing may apply on that account).

## Setup

### 1. Get the code

**Git:**

```bash
git clone https://github.com/YOUR_USERNAME/cf-ai.git
cd cf-ai
```

**Or** unzip/copy the project folder and open a terminal **inside** that folder (the directory that contains `package.json` and `wrangler.toml`).

### 2. Install dependencies

```bash
npm install
```

Always run this **before** `npm run build` or `npm run dev`. If you skip it, you may see **`vite` is not recognized** (or similar) because devDependencies are missing.

### 3. Authenticate with Cloudflare

```bash
npx wrangler login
```

Use the account that should own KV and Workers AI for this machine. (Global `wrangler login` also works if you installed Wrangler globally.)

### 4. Create a KV namespace

```bash
npx wrangler kv namespace create RESUME_KV
npx wrangler kv namespace create RESUME_KV --preview
```

> **Older Wrangler (v3.x):** if `kv namespace` is not found, try `npx wrangler kv:namespace create RESUME_KV` (and the same with `--preview`). Prefer `npx wrangler` from this repo so the CLI matches `package.json`.

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

**Command order:** `npm install` → (optional) `npx wrangler login` and KV IDs in `wrangler.toml` → `npm run build` → `npm run preview`. The preview server serves the **`dist`** folder from the build; if the build failed, `dist` may be missing and the app URL will **404**.

**Windows PowerShell:** On older PowerShell (5.x), chaining with `&&` can fail. Run each command on its own line, or use `;` instead of `&&` (e.g. `npm install; npm run build`).

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

2. **KV (recommended)** — Replace placeholder or another-account KV IDs in `wrangler.toml` with IDs from:
   ```bash
   npx wrangler kv namespace create RESUME_KV
   npx wrangler kv namespace create RESUME_KV --preview
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

**Sharing a live build:** After the first successful deploy, you can put the production **`*.pages.dev`** link in your README, résumé, or portfolio so others can evaluate the app without cloning the repo.

## Troubleshooting

| Symptom | Likely cause | What to do |
|--------|----------------|------------|
| `'vite' is not recognized` (Windows) or similar | Dependencies not installed | From the project root (folder with `package.json`), run `npm install`, then `npm run build` again. |
| `GET / 404` on `http://127.0.0.1:8788` | No successful build, or empty `dist/` | Fix the build error, then run `npm run build` before `npm run preview`. |
| API errors while using `localhost:5173` only | Vite proxies `/api` to port **8788** | Start `npm run preview` in another terminal so the Pages Functions server is listening on 8788. |
| KV / session weirdness for a new machine | `wrangler.toml` still has another account’s namespace IDs | Create new namespaces with `npx wrangler kv namespace create ...`, update `wrangler.toml`, or use `npm run preview:remote` after dashboard bindings exist. |
| `wrangler` command not found | No global install | Use `npx wrangler` (after `npm install`) or run `npm run preview` / `npm run deploy`, which invoke Wrangler via npm scripts. |

## Optional environment variables (Vite)

Add a `.env` or `.env.local` file next to `package.json` if you need to override client-side defaults. Only names starting with `VITE_` are exposed to the browser. Restart `npm run dev` after you change these (rebuild for production).

| Variable | Values | Purpose |
|----------|--------|---------|
| `VITE_CF_AI_WORKER_URL` | URL string | Overrides the default external HTML-generation Worker URL (see **Workers AI** checklist item 5). |
| `VITE_USE_PAGES_GENERATE_ONLY` | `true` | Use **only** `POST /api/generate` on Pages Functions; do not call the external Worker. |

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
