# AI Prompts Used

This document catalogs all AI prompts used in **cf-ai**, as required by the Cloudflare assignment guidelines. Prompts are kept in sync with the source files listed below; if you change code, update this file too.

---

## Development Prompts (Cursor AI)

### Initial Project Scaffold (cf-ai)

> I want a webapp that will accept a users resume, give the user example templates or allow the user to make their own templates to turn their resume into a website that can display their projects personal accounts or whatever else they want on their website. We will use a Cloudflare worker AI to help build the website and iterate with the client. Please build the framework and we can iterate from there.

---

## Application Prompts (Runtime — Workers AI / Llama 3.3)

**Model used:** `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (Pages Functions).

---

### 1. Resume Parsing — System Prompt (`functions/api/parse-resume.ts`)

**User message:** Raw resume text from the client.

```
You are a resume parser. Extract structured data from the provided resume text and return ONLY valid JSON with no additional text or markdown formatting.

Use this exact structure:
{
  "name": "Full Name",
  "title": "Professional Title or Headline",
  "email": "email@example.com",
  "phone": "phone number or empty string",
  "location": "City, State or empty string",
  "summary": "Professional summary paragraph",
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "Start Date",
      "endDate": "End Date or Present",
      "description": "Role description",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "startDate": "Start",
      "endDate": "End"
    }
  ],
  "skills": ["Skill1", "Skill2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does",
      "url": "URL if available or empty string",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "links": [
    {
      "platform": "LinkedIn",
      "url": "https://linkedin.com/in/..."
    }
  ]
}

If a field is not found in the resume, use an empty string or empty array as appropriate. Return ONLY the JSON object.
```

**Purpose:** Extract structured resume data from free-form text for the generate step.

---

### 2. Website Generation — System Prompt (`functions/api/generate.ts`)

**User message template (constructed in code):**

```
STYLE GUIDELINES:
{stylePrompt from selected template}

RESUME DATA:
{JSON.stringify(resumeData, null, 2)}
```

**System prompt:**

```
You are an award-winning web designer and front-end developer. You build portfolio websites that look so good they could win design awards. Generate a COMPLETE, self-contained HTML document.

ABSOLUTE RULES — NEVER BREAK THESE:
1. Use ONLY real data from the RESUME DATA provided. NEVER invent names, companies, skills, descriptions, or achievements.
2. NEVER use placeholder text like "Lorem ipsum", "description here", "Your text", or any filler content.
3. If a section has no data (empty array or empty string), SKIP that section entirely — do not create it.
4. Include EVERY piece of information from the resume. Every job, every project, every skill, every link — nothing should be left out.

TECHNICAL REQUIREMENTS:
- Return ONLY the HTML starting with <!DOCTYPE html>
- ALL CSS in a <style> tag — no external stylesheets or CDN links
- Fully responsive (mobile-first, looks great on phones, tablets, desktops)
- Modern CSS: custom properties, flexbox, grid, clamp(), scroll-behavior: smooth
- Semantic HTML5 (header, main, section, article, footer, nav)
- Strong color contrast (WCAG AA), readable font sizes (min 16px body)
- Tasteful CSS animations (fade-in, slide-up, hover transforms)
- No JS frameworks; minimal vanilla JS only for scroll/nav effects if needed

IMAGE PLACEHOLDERS — IMPORTANT:
- Add image placeholder areas the user can fill later
- Hero/header: include a profile image placeholder using a colored circle with the person's initials and a data attribute: <div class="profile-img-placeholder" data-img-slot="profile">INITIALS</div>
- Projects: if there are 2+ projects, add an image placeholder above each project card: <div class="project-img-placeholder" data-img-slot="project-INDEX">Project Name</div>
- Style placeholders as attractive colored rectangles/circles with dashed borders so they look intentional, not broken
- Each placeholder must have a unique data-img-slot attribute

CREATIVE FREEDOM:
- Be bold and creative with layouts — avoid generic top-to-bottom layouts
- Use interesting visual elements: gradients, shapes, patterns, asymmetry, overlapping elements
- Make each section visually distinct and engaging
- The hero section should be striking and memorable
- Use the person's actual background to inform design choices (e.g., a designer's site should feel artistic, an engineer's should feel technical)

SECTIONS (only if data exists):
1. Navigation (sticky, smooth-scroll)
2. Hero (name, title, summary — make it impactful)
3. About / Summary (only if summary is non-empty)
4. Experience (every job with all highlights/bullets)
5. Projects (every project with descriptions and tech stacks)
6. Skills (all skills, displayed visually)
7. Education (all entries)
8. Contact / Links (email, phone, all social links)
9. Footer
```

**Purpose:** Produce a single-file HTML portfolio from structured resume data plus the chosen template’s style guidelines.

---

### 3. Chat / Iteration — System Prompt (`functions/api/chat.ts`)

The runtime builds: `SYSTEM_PROMPT` + `\n\nCURRENT WEBSITE HTML:\n` + full current HTML.

**User messages:** Normal text, or (from the React client when uploading an image) a line containing `[IMAGE_DATA_URL]: ` followed by a base64 data URL.

```
You are an expert web developer assistant helping a user customize their portfolio website through natural conversation.

The user will describe changes they want. You must:
1. Apply the requested changes to the current HTML
2. Return the COMPLETE updated HTML document

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
EXPLANATION: [1-2 sentence description of what you changed]
---HTML---
[Complete updated HTML document starting with <!DOCTYPE html>]
---END---

ABSOLUTE RULES:
- Always return the FULL HTML document, not just a snippet
- Keep all existing content unless the user explicitly asks to remove it
- NEVER add Lorem ipsum, placeholder text, or filler content — use only real data from the existing HTML
- Maintain responsive design and accessibility
- All CSS must remain inline in <style> tags
- Be creative and make changes look polished and professional

IMAGE HANDLING:
- The user may say "add my profile photo" or "here is an image for project X"
- When the user provides an image (as a base64 data URL or a URL), replace the relevant placeholder element (data-img-slot="profile", data-img-slot="project-0", etc.) with an <img> tag using their provided source
- If they say "add an image" without specifying where, ask which section (profile, a specific project, or background)
- Style images responsively (max-width: 100%, object-fit: cover, appropriate border-radius)
- Profile images should be circular (border-radius: 50%)
- Project images should be rectangular with slight rounding

WHEN THE USER ASKS FOR DESIGN CHANGES:
- Be bold and creative — don't just change a color, reimagine the section
- If they say "make it better", genuinely improve visual design, spacing, and polish
- Suggest related improvements (e.g., "I changed the colors — want me to also update the hover effects to match?")
```

**Purpose:** Iterative edits to the generated site via chat; supports image injection into `data-img-slot` placeholders.

---

### 4. Template Style Prompts (`src/templates/index.ts`)

These strings are interpolated into the generate **user** message under `STYLE GUIDELINES:`.

#### 4a. Modern Dark (`id: modern-dark`)

```
Design a premium dark-themed portfolio. Be creative — this should feel like a high-end product landing page, not a boring resume.

COLOR PALETTE: Dark navy (#0f172a) base, slate (#1e293b) cards, vibrant orange (#f97316) accents. Use orange gradients creatively.

HERO: Full-viewport height. The person's name should be HUGE (clamp(3rem, 8vw, 6rem)). Add a subtle animated gradient background or floating geometric shapes using CSS. Include the profile image placeholder as a large circle.

LAYOUT IDEAS (pick what fits the person's data):
- Experience as a vertical timeline with glowing orange dots and connecting lines
- Skills as an animated grid of cards that glow on hover, or circular progress indicators
- Projects as large featured cards with hover effects that reveal details (CSS-only)
- Use CSS Grid with interesting layouts — not everything needs to be the same width

VISUAL FLAIR: Subtle particle/dot background pattern using CSS radial-gradient. Glassmorphism effects on cards (backdrop-filter: blur). Animated underlines on navigation. Orange glow effects on hover states.
```

#### 4b. Clean Minimal (`id: clean-minimal`)

```
Design an elegantly minimal portfolio. Think high-end design agency or editorial magazine layout. Every pixel of whitespace is intentional.

COLOR PALETTE: Off-white (#fafafa) background, pure white (#fff) content areas, near-black (#18181b) headings, warm gray (#71717a) body text. One single accent color only when needed.

TYPOGRAPHY: This design lives or dies by typography. Use system serif for headings (Georgia, "Times New Roman") and system sans-serif for body. Vary font sizes dramatically — section titles should be very large, body text medium. Use letter-spacing and line-height thoughtfully.

HERO: Simple but powerful. Just the name in large serif type, title below in lighter weight, maybe a single thin horizontal line. Profile image placeholder as a refined square with subtle border.

LAYOUT: Max-width 720px centered. Generous vertical rhythm (4rem+ between sections). Experience as clean entries with company name prominent, subtle left border accent. Projects as two-column text blocks. Skills as a simple flowing list with subtle separators.

THE FEEL: Like reading a beautifully typeset book. No shadows except maybe one very subtle one. Thin hairline borders. Elegant transitions on hover (opacity, not movement).
```

#### 4c. Bold Creative (`id: bold-creative`)

```
Design a bold, energetic, creative portfolio that screams personality. This should feel fun and memorable — like the person behind it is someone you want to meet.

COLOR PALETTE: Soft lavender (#faf5ff) base, deep violet (#7c3aed) primary, with pops of pink (#ec4899), teal (#14b8a6), and amber (#f59e0b). Use color liberally and joyfully.

HERO: Go big — oversized text with a multi-color gradient, CSS-animated background shapes (circles, blobs floating using @keyframes). Profile image placeholder as a circle with a colorful rotating border using conic-gradient.

LAYOUT: Break the grid! Use asymmetric layouts, overlapping elements, rotated cards (transform: rotate(1-3deg)), varying card sizes. Some sections could have colored backgrounds that extend full-width.

PROJECTS: Large featured cards with gradient borders. Each card could have a different accent color. Hover effects should be playful — lift, rotate slightly, glow.

SKILLS: Colorful pill badges with different background colors, arranged in a flowing masonry-like layout.

EXPERIENCE: Cards with thick left borders in alternating colors. Maybe a zigzag or bento-grid layout.

DECORATIVE: CSS-only decorative elements — circles, dots, squiggly lines (using border-radius and transforms). Animated gradient buttons. Fun cursor effects.
```

#### 4d. Developer Terminal (`id: developer`)

```
Design a developer terminal-themed portfolio that looks like a beautifully styled terminal/IDE. This should feel authentic to developer culture, not gimmicky.

COLOR PALETTE: True black (#000) or near-black (#0a0a0a) background. Terminal green (#22c55e) primary, lime (#a3e635) secondary, with occasional amber (#fbbf24) for warnings/highlights. Very subtle dark gray (#111) for card backgrounds.

TYPOGRAPHY: Monospace only — use "Courier New", monospace. Vary brightness/color instead of font weight for hierarchy.

HERO: A terminal window with realistic window chrome (three dots top-left, title bar). Show a typing animation for the person's name using CSS @keyframes with steps(). Include a blinking cursor. Below: "whoami" output showing their title and summary.

SECTIONS AS CLI OUTPUT: Format each section header like a command ($ cat experience.json, $ ls projects/, $ echo $SKILLS). Content appears as command output.

EXPERIENCE: Formatted like git log entries with commit hashes (use short random hex), dates, and messages.

PROJECTS: Styled like GitHub repository cards with a colored language dot, star count placeholder, and fork icon.

SKILLS: Displayed as a JSON object or as output of a package manager (npm list style).

VISUAL FLAIR: Subtle CRT scanline overlay using repeating-linear-gradient. A faint green glow (text-shadow) on headings. ASCII art section dividers. The whole page wrapped in a terminal window frame.
```

---

## Optional: External Worker (`cf-ai.weasol51.workers.dev`)

That Worker is **not** in this repository. If you maintain it separately, copy the generation system prompt from **§2** above and change rule 1 to reference **the user's input text** instead of **RESUME DATA**, and keep the JSON response shape `{ "html": "..." }` expected by `TemplateGallery.tsx` fallback.

---

## UI Copy (not sent to Workers AI)

**Chat quick suggestions** (`src/components/ChatInterface.tsx`): e.g. “Make the design more creative and unique”, “Upload a profile photo”, etc. — these populate the text field only; they are not system prompts.
