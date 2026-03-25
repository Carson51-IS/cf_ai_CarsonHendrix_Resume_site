/** Shared handling for Pages Functions responses (local dev vs deployed). */

export async function readJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(await apiFailureMessage(res));
  }
  return res.json() as Promise<T>;
}

async function apiFailureMessage(res: Response): Promise<string> {
  if (res.status === 404) {
    return (
      'API not found. If you use `npm run dev` (Vite only), run `npm run build` and `npm run preview` in a second terminal so Functions listen on port 8788 — Vite proxies /api there. Or open the app at the URL Wrangler prints (often http://127.0.0.1:8788). See README → Workers AI & local development.'
    );
  }

  let detail = res.statusText || 'Request failed';
  try {
    const errBody = (await res.json()) as { error?: string };
    if (errBody?.error) detail = errBody.error;
  } catch {
    /* ignore */
  }

  return `Server error (${res.status}): ${detail}`;
}
