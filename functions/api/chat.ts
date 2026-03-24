interface Env {
  AI: Ai;
  RESUME_KV: KVNamespace;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are an expert web developer assistant helping a user customize their portfolio website through conversation.

The user will describe changes they want. You must:
1. Apply the requested changes to the current HTML
2. Return the COMPLETE updated HTML document

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
EXPLANATION: [1-2 sentence description of what you changed]
---HTML---
[Complete updated HTML document starting with <!DOCTYPE html>]
---END---

RULES:
- Always return the FULL HTML document, not just a snippet
- Keep all existing content unless the user explicitly asks to remove it
- Maintain responsive design and accessibility
- All CSS must remain inline in <style> tags
- Preserve the overall structure unless asked to change it
- Be creative and make the changes look polished`;

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

    const content = aiResponse.response ?? '';

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
      context.env.RESUME_KV.put(
        `session:${body.sessionId}:chat`,
        JSON.stringify(updatedHistory),
        { expirationTtl: 86400 },
      ),
      html !== body.currentHtml
        ? context.env.RESUME_KV.put(
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
