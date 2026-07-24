#!/usr/bin/env node
// Generates every OG image the site uses — one per note (content
// collection) and one per static page (hand-written list). Run with:
//   pnpm og:generate [slug] [--force]
// (runs under --experimental-strip-types since page generation imports
// src/data/*.ts directly)
import { loadOgFonts } from "./og/fonts.mjs";
import { generateNotes } from "./og/generate-notes.mjs";
import { generatePages } from "./og/generate-pages.mjs";

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlySlug = args.find((arg) => !arg.startsWith("--"));

async function main() {
  const fonts = await loadOgFonts();

  const notes = await generateNotes({ fonts, force, onlySlug });
  const pages = await generatePages({ fonts, force, onlySlug });

  const generated = notes.generated + pages.generated;
  const skipped = notes.skipped + pages.skipped;

  if (onlySlug && generated === 0 && skipped === 0) {
    console.warn(`No note or page found matching slug "${onlySlug}"`);
    process.exitCode = 1;
    return;
  }

  console.log(`\n${generated} generated, ${skipped} skipped (already exist, use --force to regenerate)`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
