# cf_ai_resume_site

**ResumeForge AI** — An AI-powered web application that transforms your resume into a stunning portfolio website, built entirely on the Cloudflare platform.

## Overview

ResumeForge AI lets users paste or upload their resume, choose a design template, and then use a conversational AI assistant to generate and iteratively customize a personal portfolio website. The AI parses the resume into structured data, generates a complete HTML/CSS website, and allows real-time refinement through natural language chat.

## Architecture & Cloudflare Components

| Component | Cloudflare Service | Purpose |
|---|---|---|
| **LLM** | Workers AI (Llama 3.3 70B) | Resume parsing, website generation, iterative customization |
| **Workflow / Coordination** | Pages Functions (Workers) | API endpoints for parse, generate, and chat workflows |
| **User Input** | Pages (React SPA) | Chat interface for AI interaction, resume upload |
| **Memory / State** | KV | Session data, parsed resumes, generated HTML, chat history |

### How It Works

1. **Upload** — User pastes or uploads their resume text
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
git clone https://github.com/YOUR_USERNAME/cf_ai_resume_site.git
cd cf_ai_resume_site
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

## Running Locally

### Frontend only (no AI)

```bash
npm run dev
```

This starts the Vite dev server at `http://localhost:5173`. API calls will fail without the Cloudflare backend, but you can develop and style the UI.

### Full stack with Workers AI

```bash
npm run build
npm run preview -- --remote
```

The `--remote` flag is required to use Workers AI bindings during local development. This runs the full Pages application with Functions at `http://localhost:8788`.

## Deploying to Cloudflare

```bash
npm run build
npm run deploy
```

This builds the React frontend and deploys everything (static assets + API functions) to Cloudflare Pages.

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
│   ├── App.tsx
│   └── main.tsx
├── functions/              # Cloudflare Pages Functions (API)
│   └── api/
│       ├── parse-resume.ts # POST /api/parse-resume
│       ├── generate.ts     # POST /api/generate
│       └── chat.ts         # POST /api/chat
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
- **Backend:** Cloudflare Pages Functions (Workers runtime)
- **AI:** Cloudflare Workers AI — Llama 3.3 70B Instruct
- **Storage:** Cloudflare KV (session state, chat history)
- **Icons:** Lucide React

## License

MIT
