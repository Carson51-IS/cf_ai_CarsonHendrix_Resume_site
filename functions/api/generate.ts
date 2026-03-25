import { aiOutputToString } from '../utils/aiOutputToString';
import { kvPutSafe } from '../utils/kvPutSafe';

interface Env {
  AI: Ai;
  RESUME_KV: KVNamespace;
}

const SYSTEM_PROMPT = `You are an award-winning web designer and front-end developer. You build portfolio websites that look so good they could win design awards. Generate a COMPLETE, self-contained HTML document.

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
9. Footer`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as {
      resumeData: Record<string, unknown>;
      templateId: string;
      stylePrompt: string;
      sessionId: string;
    };

    if (!body.resumeData) {
      return Response.json({ error: 'Resume data is required' }, { status: 400 });
    }

    const userPrompt = `STYLE GUIDELINES:\n${body.stylePrompt}\n\nRESUME DATA:\n${JSON.stringify(body.resumeData, null, 2)}`;

    const aiResponse = await context.env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8192,
      },
    );

    let html = aiOutputToString(aiResponse);

    // Strip markdown fences if the model wrapped the HTML
    const fenceMatch = html.match(/```(?:html)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      html = fenceMatch[1].trim();
    }

    // Ensure we got something that looks like HTML
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      return Response.json(
        { error: 'AI did not return valid HTML. Please try again.' },
        { status: 500 },
      );
    }

    await Promise.all([
      kvPutSafe(
        context.env.RESUME_KV,
        `session:${body.sessionId}:html`,
        html,
        { expirationTtl: 86400 },
      ),
      kvPutSafe(
        context.env.RESUME_KV,
        `session:${body.sessionId}:template`,
        body.templateId,
        { expirationTtl: 86400 },
      ),
    ]);

    return Response.json({ html });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json(
      { error: `Failed to generate website: ${message}` },
      { status: 500 },
    );
  }
};
