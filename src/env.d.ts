/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user?: import('@supabase/supabase-js').User;
    profile?: {
      id: string;
      email: string | null;
      full_name: string | null;
      role: string;
      avatar_url: string | null;
      created_at: string;
      updated_at: string;
    };
  }
}
