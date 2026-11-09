/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SPOTIFY_CLIENT_ID: string;
  readonly SPOTIFY_CLIENT_SECRET: string;
  readonly SPOTIFY_REFRESH_TOKEN: string;
  readonly TMDB_API_KEY: string;
  readonly NEON_DATABASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
