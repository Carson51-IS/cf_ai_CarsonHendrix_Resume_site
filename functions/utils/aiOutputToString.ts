/**
 * Workers AI `run()` often returns `{ response: string }`, but some models/runtimes
 * return structured JSON in `response` (object) instead of a string.
 */
export function aiOutputToString(aiResponse: unknown): string {
  if (aiResponse == null) return '';

  const raw =
    typeof aiResponse === 'object' &&
    aiResponse !== null &&
    'response' in aiResponse &&
    (aiResponse as { response: unknown }).response !== undefined
      ? (aiResponse as { response: unknown }).response
      : aiResponse;

  if (raw == null) return '';
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === 'string' ? x : JSON.stringify(x)))
      .join('');
  }
  if (typeof raw === 'object') return JSON.stringify(raw);
  return String(raw);
}
