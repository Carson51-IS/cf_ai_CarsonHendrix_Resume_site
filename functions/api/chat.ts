import { aiOutputToString } from '../utils/aiOutputToString';
import { kvPutSafe } from '../utils/kvPutSafe';

interface Env {
  AI: Ai;
  RESUME_KV: KVNamespace;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are an expert web developer assistant helping a user customize their portfolio website through natural conversation.

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
- Suggest related improvements (e.g., "I changed the colors — want me to also update the hover effects to match?")`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as {
      message: string;
      currentHtml: string;
      chatHistory: ChatMessage[];
      sessionId: string;
    };

    if (!body.message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build conversation context — include the current HTML in the system prompt
    // but keep chat history concise to stay within context limits
    const systemWithHtml = `${SYSTEM_PROMPT}\n\nCURRENT WEBSITE HTML:\n${body.currentHtml}`;

    // Only send the last few exchanges to avoid hitting token limits
    const recentHistory = (body.chatHistory || []).slice(-6);

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemWithHtml },
      ...recentHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: body.message },
    ];

    const aiResponse = await context.env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages,
        max_tokens: 8192,
      },
    );

    const content = aiOutputToString(aiResponse);

    let explanation = '';
    let html = body.currentHtml;

    if (content.includes('---HTML---')) {
      const parts = content.split('---HTML---');
      explanation = parts[0].replace('EXPLANATION:', '').trim();
      const htmlPart = parts[1].split('---END---')[0].trim();

      // Strip markdown fences if present
      const fenceMatch = htmlPart.match(/```(?:html)?\s*([\s\S]*?)```/);
      html = fenceMatch ? fenceMatch[1].trim() : htmlPart;
    } else {
      // Fallback: try to extract HTML directly
      const htmlMatch = content.match(/<!DOCTYPE html[\s\S]*/i);
      if (htmlMatch) {
        html = htmlMatch[0];
        explanation = "I've updated your website with the requested changes.";
      } else {
        // AI responded conversationally without HTML changes
        explanation = content;
      }
    }

    // Persist updated state
    const updatedHistory: ChatMessage[] = [
      ...(body.chatHistory || []),
      { role: 'user', content: body.message },
      { role: 'assistant', content: explanation },
    ];

    await Promise.all([
      kvPutSafe(
        context.env.RESUME_KV,
        `session:${body.sessionId}:chat`,
        JSON.stringify(updatedHistory),
        { expirationTtl: 86400 },
      ),
      html !== body.currentHtml
        ? kvPutSafe(
            context.env.RESUME_KV,
            `session:${body.sessionId}:html`,
            html,
            { expirationTtl: 86400 },
          )
        : Promise.resolve(),
    ]);

    return Response.json({ explanation, html });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json(
      { error: `Chat failed: ${message}` },
      { status: 500 },
    );
  }
};
