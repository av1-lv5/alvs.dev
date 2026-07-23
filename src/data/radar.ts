/**
 * A flat, unranked list of technologies that have crossed my radar — things
 * I know, things I want to learn, things I'm just keeping an eye on. No
 * status, no categories, just names. Append wherever; the page sorts it.
 */
export const radar: string[] = [
  "Astro",
  "Base UI",
  "Bash",
  "Better Auth",
  "Biome",
  "Bruno",
  "Bun",
  "Claude Code",
  "Clerk",
  "Cloudflare D1",
  "Cloudflare KV",
  "Cloudflare R2",
  "Cloudflare Workers",
  "CodeRabbit",
  "Convex",
  "Curl",
  "Drizzle",
  "Ghostty",
  "Google Maps JS API",
  "GoatCounter",
  "Gulp",
  "Hermes",
  "HTMX",
  "Lemon Squeezy",
  "Mapbox",
  "Mixpanel",
  "Motion",
  "Mux",
  "n8n",
  "Neon",
  "Netlify",
  "Next.js",
  "ngrok",
  "nvm",
  "OpenCode",
  "Paddle",
  "Pandoc",
  "Partytown",
  "Payload CMS",
  "Pi Agent",
  "Playwright",
  "PlanetScale",
  "pnpm",
  "PostHog",
  "Postman",
  "PyTorch",
  "Radix UI",
  "Razorpay",
  "React",
  "React Aria",
  "React Native",
  "React Query",
  "Remote workflows",
  "Rolldown",
  "Sanity",
  "Segment Anything Model",
  "Serwist",
  "shadcn/ui",
  "Supabase",
  "Svelte",
  "Tailscale",
  "Tailwind CSS",
  "TanStack Router",
  "TanStack Start",
  "Tesseract.js",
  "Transformers.js",
  "tRPC",
  "Typesense",
  "Vercel",
  "Vite",
  "Vitest",
  "Zed",
  "Zero Sync",
  "Zod",
  "Zustand",
  "SvelteKit",
  "SolidJS",
  "Docker",
  "React Hook Form",
  "ffmpeg",
  "Remotion",
  "Mintlify",
  "Expo",
  "Warp",
  "zoxide",
  "Whisper",
  "Nx",
  "Puppeteer",
  "React Email",
  "Resend",
  "Polar",
  "RevenueCat",
  "Sentry",
  "Turso",
  "Hono",
  "Nanostores",
  "Codex",
  "Podman",
  "Cursor",
  "MongoDB",
  "fzf",
  "starship",
  "ripgrep",
  "bat",
  "Fumadocs",
  "Cloudinary",
  "TanStack Form",
];

/**
 * Catches near-duplicates ("Next.js" vs "next js") that a plain Set check
 * would miss, since casing/spacing/punctuation drift is the likely way this
 * list grows a duplicate. Throws at import time so dev/build fails loudly
 * instead of silently accumulating dupes.
 */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const seen = new Map<string, string>();
for (const item of radar) {
  const key = normalize(item);
  const existing = seen.get(key);
  if (existing) {
    throw new Error(
      `radar.ts: "${item}" duplicates "${existing}" (normalize to "${key}")`,
    );
  }
  seen.set(key, item);
}
