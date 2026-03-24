interface Env {
  AI: Ai;
  RESUME_KV: KVNamespace;
}

const SYSTEM_PROMPT = `You are an expert web developer specializing in beautiful portfolio websites. Generate a COMPLETE, self-contained HTML document based on the resume data and style guidelines provided.

CRITICAL REQUIREMENTS:
- Return ONLY the HTML document starting with <!DOCTYPE html>
- ALL CSS must be in a <style> tag in the <head> — no external stylesheets
- The page MUST be fully responsive (mobile-first)
- Use modern CSS: custom properties, flexbox, grid, clamp(), smooth scroll
- Include semantic HTML5 elements (header, main, section, article, footer)
- Ensure strong color contrast and accessibility
- Add tasteful CSS animations (fade-in, slide-up on sections)
- Do NOT use any JavaScript frameworks or external dependencies
- Minimal vanilla JS is acceptable for scroll effects

SECTIONS TO INCLUDE (based on available data):
1. Navigation bar (sticky, with smooth-scroll links)
2. Hero / Header (name, title, summary)
3. About / Summary
4. Experience (jobs with highlights)
5. Projects (with tech badges)
6. Skills (visual representation — bars, chips, or grid)
7. Education
8. Contact / Links (email, social links)
9. Footer

Make the website look STUNNING and PROFESSIONAL. This should look like a real developer portfolio.`;

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

    let html = aiResponse.response ?? '';

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

    // Persist generated HTML and template choice
    await Promise.all([
      context.env.RESUME_KV.put(
        `session:${body.sessionId}:html`,
        html,
        { expirationTtl: 86400 },
      ),
      context.env.RESUME_KV.put(
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
