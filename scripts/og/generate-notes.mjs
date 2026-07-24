import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import satori from "satori";
import sharp from "sharp";
import { normalizeNoteData } from "./data.mjs";
import { buildV2 } from "./variants/v2-terminal.mjs";

const ROOT = process.cwd();
const NOTES_DIR = path.join(ROOT, "src/content/notes");
const OUTPUT_DIR = path.join(ROOT, "public/assets/img/og/notes");

export async function generateNotes({ fonts, force, onlySlug }) {
  const entries = await readdir(NOTES_DIR);
  const files = entries.filter((f) => /\.mdx?$/.test(f));

  await mkdir(OUTPUT_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, "");
    if (onlySlug && slug !== onlySlug) continue;

    const outPath = path.join(OUTPUT_DIR, `${slug}.png`);
    if (existsSync(outPath) && !force) {
      skipped++;
      continue;
    }

    const raw = await readFile(path.join(NOTES_DIR, file), "utf-8");
    const { data } = matter(raw);

    const tree = buildV2(
      normalizeNoteData({
        title: data.title,
        tags: data.tags,
        publishedAt: data.publishedAt,
      }),
    );

    const svg = await satori(tree, { width: 1200, height: 630, fonts });
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    await writeFile(outPath, png);

    console.log(`generated public/assets/img/og/notes/${slug}.png`);
    generated++;
  }

  return { generated, skipped };
}
