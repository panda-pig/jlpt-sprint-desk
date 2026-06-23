/// <reference types="vite/client" />

// Side-effect style entry for animal-island-ui (CSS + bundled fonts).
declare module "animal-island-ui/style";

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
