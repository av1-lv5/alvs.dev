#!/usr/bin/env node
// Testing-only: renders a few representative notes through every OG
// variant into og-preview/v2/, og-preview/v3/, etc. so they can be
// compared side by side. v2 is what's actually used in production
// (see generate-og-images.mjs); v3/v4 are kept only as design references.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import satori from "satori";
import sharp from "sharp";
import { loadOgFonts } from "./og/fonts.mjs";
import { normalizeNoteData } from "./og/data.mjs";
import { buildV2 } from "./og/variants/v2-terminal.mjs";
import { buildV3 } from "./og/variants/v3-watermark.mjs";
import { buildV4 } from "./og/variants/v4-framed.mjs";

const ROOT = process.cwd();
const NOTES_DIR = path.join(ROOT, "src/content/notes");
const PREVIEW_DIR = path.join(ROOT, "og-preview");

const VARIANTS = {
  v2: buildV2,
  v3: buildV3,
  v4: buildV4,
};

// A spread of title lengths and tag presence, to stress-test each layout.
const SAMPLE_SLUGS = [
  "push-notifications-on-web", // long title, has tag
  "we-didnt-need-a-better-branching-strategy", // medium title, short tag
  "how-i-fell-into-web-dev", // short-ish title, no tag
];

async function loadNote(slug) {
  const raw = await readFile(path.join(NOTES_DIR, `${slug}.md`), "utf-8");
  const { data } = matter(raw);
  return normalizeNoteData({
    title: data.title,
    tags: data.tags,
    publishedAt: data.publishedAt,
  });
}

async function main() {
  const fonts = await loadOgFonts();
  const notes = await Promise.all(
    SAMPLE_SLUGS.map(async (slug) => [slug, await loadNote(slug)]),
  );

  for (const [variantName, build] of Object.entries(VARIANTS)) {
    const outDir = path.join(PREVIEW_DIR, variantName);
    await mkdir(outDir, { recursive: true });

    for (const [slug, note] of notes) {
      const tree = build(note);
      const svg = await satori(tree, { width: 1200, height: 630, fonts });
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      const outPath = path.join(outDir, `${slug}.png`);
      await writeFile(outPath, png);
      console.log(`${variantName}/${slug}.png`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
