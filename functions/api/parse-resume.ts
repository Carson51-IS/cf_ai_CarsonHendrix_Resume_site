interface Env {
  AI: Ai;
  RESUME_KV: KVNamespace;
}

const SYSTEM_PROMPT = `You are a resume parser. Extract structured data from the provided resume text and return ONLY valid JSON with no additional text or markdown formatting.

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

If a field is not found in the resume, use an empty string or empty array as appropriate. Return ONLY the JSON object.`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as {
      resumeText: string;
      sessionId: string;
    };

    if (!body.resumeText?.trim()) {
      return Response.json({ error: 'Resume text is required' }, { status: 400 });
    }

    const aiResponse = await context.env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: body.resumeText },
        ],
        max_tokens: 2048,
      },
    );

    const content = aiResponse.response ?? '';

    // Extract JSON from the response — handle markdown fences or raw JSON
    let jsonStr = content;
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1];
    } else {
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) jsonStr = braceMatch[0];
    }

    const resumeData = JSON.parse(jsonStr);

    // Persist to KV for later steps
    await context.env.RESUME_KV.put(
      `session:${body.sessionId}:resume`,
      JSON.stringify(resumeData),
      { expirationTtl: 86400 },
    );

    return Response.json({ resumeData });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json(
      { error: `Failed to parse resume: ${message}` },
      { status: 500 },
    );
  }
};
