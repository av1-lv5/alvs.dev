import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";
import { loadRadarTags, loadFeaturedPosters, loadBookCovers, loadSkills } from "./pages/data.mjs";
import { buildChipCloud } from "./pages/right/chip-cloud.mjs";
import { buildPosterWall } from "./pages/right/poster-wall.mjs";
import { buildSlashMark } from "./pages/right/slash-mark.mjs";
import { buildSkillChips } from "./pages/right/skill-chips.mjs";
import { buildP4 } from "./pages/shells/p4-bleed.mjs";
import { buildHome } from "./pages/shells/home.mjs";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "public/assets/img/og/pages");

// Pages with real content to visualize on the right (poster wall / tag
// cloud). Everything else falls back to the plain slash-mark treatment
// below — see the "skip for now" note in project memory before adding more.
async function buildContentPages() {
  const [tags, posters, books, skills] = await Promise.all([
    loadRadarTags(),
    loadFeaturedPosters(6),
    loadBookCovers(),
    loadSkills(),
  ]);

  return [
    {
      slug: "home",
      render: buildHome,
      title: "Avinash",
      description: "I'm a Frontend Engineer based in India, who builds for the web.",
      skillsBuilder: (box) => buildSkillChips(skills, box),
    },
    {
      slug: "radar",
      route: "/radar",
      tagline: "Technologies I know, want to learn, or am just keeping an eye on.",
      rightBuilder: (box) => buildChipCloud(tags, box, { radius: 999 }),
    },
    {
      slug: "movies",
      route: "/movies",
      tagline: "Films and shows I've been watching, and a running watchlist.",
      rightBuilder: (box) => buildPosterWall(posters, box),
    },
    {
      slug: "books",
      route: "/books",
      tagline: "Reading that stuck.",
      rightBuilder: (box) => buildPosterWall(books, box),
      // Book covers run much brighter than movie posters (white pages,
      // light backgrounds) — extra flat dimming keeps it visually
      // consistent with /movies rather than blowing out next to it.
      dim: 0.4,
    },
  ];
}

// Plain slash-mark pages: no per-page data pulled, just the shared abstract
// watermark on the right (see scripts/og/pages/right/slash-mark.mjs).
const SLASH_MARK_PAGES = [
  {
    slug: "projects",
    route: "/projects",
    tagline: "Products, experiments, implementations.",
  },
  {
    slug: "uses",
    route: "/uses",
    tagline: "The tools, hardware, and software I use daily.",
  },
  {
    slug: "feeds",
    route: "/feeds",
    tagline: "Follow the pulse. Public activity feeds.",
  },
  {
    slug: "hire-me",
    route: "/hire-me",
    tagline: "Frontend developer available for freelance, contract, or full-time work.",
  },
  {
    slug: "lab",
    route: "/lab",
    tagline: "Small experiments and curiosity-driven builds.",
  },
  {
    slug: "changelog",
    route: "/changelog",
    tagline: "Monthly updates to this site: what changed, what was added, what was removed.",
  },
  {
    slug: "now",
    route: "/now",
    tagline: "What I'm focused on at this point in my life.",
  },
  {
    slug: "about",
    route: "/about",
    tagline: "More context. Fewer buzzwords.",
  },
  {
    slug: "music",
    route: "/music",
    tagline: "My top artists and tracks on Spotify.",
  },
].map((page) => ({ ...page, rightBuilder: buildSlashMark }));

async function buildPages() {
  const contentPages = await buildContentPages();
  return [...contentPages, ...SLASH_MARK_PAGES];
}

// Static one-off pages (not a content collection) — this needs to run under
// `node --experimental-strip-types` since buildContentPages() imports
// src/data/*.ts directly.
export async function generatePages({ fonts, force, onlySlug }) {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const pages = await buildPages();

  let generated = 0;
  let skipped = 0;

  for (const page of pages) {
    if (onlySlug && page.slug !== onlySlug) continue;

    const outPath = path.join(OUTPUT_DIR, `${page.slug}.png`);
    if (existsSync(outPath) && !force) {
      skipped++;
      continue;
    }

    const tree = await (page.render ?? buildP4)(page);
    const svg = await satori(tree, { width: 1200, height: 630, fonts });
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    await writeFile(outPath, png);

    console.log(`generated public/assets/img/og/pages/${page.slug}.png`);
    generated++;
  }

  return { generated, skipped };
}
