/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase: van en .env.local (local) y en las variables de entorno de Vercel.
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
