#!/usr/bin/env node
// Testing-only: renders /radar and /movies through every page-shell
// variant into og-preview/p1/, og-preview/p2/, etc. Run with:
//   node --experimental-strip-types scripts/generate-og-page-variants.mjs
// (needs --experimental-strip-types because it imports src/data/*.ts directly)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";
import { loadOgFonts } from "./og/fonts.mjs";
import { loadRadarTags, loadFeaturedPosters } from "./og/pages/data.mjs";
import { buildChipCloud } from "./og/pages/right/chip-cloud.mjs";
import { buildPosterWall } from "./og/pages/right/poster-wall.mjs";
import { buildP1 } from "./og/pages/shells/p1-split.mjs";
import { buildP2 } from "./og/pages/shells/p2-terminal.mjs";
import { buildP3 } from "./og/pages/shells/p3-framed.mjs";
import { buildP4 } from "./og/pages/shells/p4-bleed.mjs";
import { buildP5 } from "./og/pages/shells/p5-window.mjs";

const ROOT = process.cwd();
const PREVIEW_DIR = path.join(ROOT, "og-preview");

const SHELLS = {
  p1: buildP1,
  p2: buildP2,
  p3: buildP3,
  p4: buildP4,
  p5: buildP5,
};

async function main() {
  const fonts = await loadOgFonts();
  const tags = await loadRadarTags();
  const posters = await loadFeaturedPosters(6);

  const pages = [
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
  ];

  for (const [shellName, build] of Object.entries(SHELLS)) {
    const outDir = path.join(PREVIEW_DIR, shellName);
    await mkdir(outDir, { recursive: true });

    for (const page of pages) {
      const tree = build(page);
      const svg = await satori(tree, { width: 1200, height: 630, fonts });
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      const outPath = path.join(outDir, `${page.slug}.png`);
      await writeFile(outPath, png);
      console.log(`${shellName}/${page.slug}.png`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
