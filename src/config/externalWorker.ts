/**
 * Optional standalone Worker that accepts { input: string } and returns { html: string }.
 * Set VITE_USE_PAGES_GENERATE_ONLY=true to skip the Worker and use only Pages Functions.
 * Set VITE_CF_AI_WORKER_URL to override the default URL.
 */
const DEFAULT_WORKER_URL = 'https://cf-ai.weasol51.workers.dev';

export function getExternalGenerateWorkerUrl(): string | null {
  if (import.meta.env.VITE_USE_PAGES_GENERATE_ONLY === 'true') {
    return null;
  }
  const fromEnv = (import.meta.env.VITE_CF_AI_WORKER_URL as string | undefined)
    ?.trim();
  if (fromEnv === '') return null;
  return fromEnv || DEFAULT_WORKER_URL;
}
