/**
 * KV is optional for core UX (parse/generate/chat return data without it).
 * Fails open when the namespace is missing or put throws (e.g. misconfigured binding).
 */
export async function kvPutSafe(
  kv: KVNamespace | undefined,
  key: string,
  value: string,
  options?: KVNamespacePutOptions,
): Promise<void> {
  if (!kv) {
    console.warn('[kv] RESUME_KV binding missing; skip put');
    return;
  }
  try {
    await kv.put(key, value, options);
  } catch (e) {
    console.warn(
      '[kv] put failed (check namespace IDs in wrangler.toml / dashboard):',
      e instanceof Error ? e.message : e,
    );
  }
}
