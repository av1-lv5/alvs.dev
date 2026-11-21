// Human-readable tech name → iconify simple-icons name.
// Names are normalized to lowercase alphanumerics before lookup, so
// "Next.js", "next.js" and "nextjs" all resolve to the same icon.
// Find icons at https://icon-sets.iconify.design/simple-icons/

const stackIcons: Record<string, string> = {
  // frameworks & languages
  next: "simple-icons:nextdotjs",
  nextjs: "simple-icons:nextdotjs",
  react: "simple-icons:react",
  reactjs: "simple-icons:react",
  preact: "simple-icons:preact",
  astro: "simple-icons:astro",
  typescript: "simple-icons:typescript",
  ts: "simple-icons:typescript",
  javascript: "simple-icons:javascript",
  js: "simple-icons:javascript",
  html: "simple-icons:html5",
  html5: "simple-icons:html5",
  css: "simple-icons:css3",
  css3: "simple-icons:css3",
  markdown: "simple-icons:markdown",

  // ui & styling
  tailwind: "simple-icons:tailwindcss",
  tailwindcss: "simple-icons:tailwindcss",
  shadcn: "simple-icons:shadcnui",
  shadcnui: "simple-icons:shadcnui",
  motion: "simple-icons:framer",
  framer: "simple-icons:framer",
  framermotion: "simple-icons:framer",

  // services
  supabase: "simple-icons:supabase",
  sanity: "simple-icons:sanity",
  clerk: "simple-icons:clerk",
  posthog: "simple-icons:posthog",

  // tooling & infrastructure
  vite: "simple-icons:vite",
  vercel: "simple-icons:vercel",
  netlify: "simple-icons:netlify",
  postgres: "simple-icons:postgresql",
  postgresql: "simple-icons:postgresql",
  git: "simple-icons:git",
  bash: "simple-icons:gnubash",
  biome: "simple-icons:biome",
};

export const getStackIcon = (name: string): string | undefined =>
  stackIcons[name.toLowerCase().replace(/[^a-z0-9]/g, "")];
