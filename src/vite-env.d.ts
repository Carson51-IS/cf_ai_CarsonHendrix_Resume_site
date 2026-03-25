/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CF_AI_WORKER_URL?: string;
  readonly VITE_USE_PAGES_GENERATE_ONLY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
