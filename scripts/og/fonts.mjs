import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.resolve(".cache/og-fonts");

// Google Fonts serves .woff2 to modern user agents, but Satori can only parse
// .ttf/.otf/.woff. Requesting with an old Safari UA makes the css2 endpoint
// fall back to .woff, which Satori (via opentype.js) reads fine.
const OLD_SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2";

async function fetchGoogleFontWoff(family, weight) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
    { headers: { "User-Agent": OLD_SAFARI_UA } },
  ).then((res) => res.text());

  const [, url] = css.match(/url\(([^)]+)\)/) ?? [];
  if (!url) {
    throw new Error(`Could not resolve a font file URL for ${family} ${weight}`);
  }

  const buffer = await fetch(url).then((res) => res.arrayBuffer());
  return Buffer.from(buffer);
}

async function loadFont(family, weight) {
  await mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${family.replace(/\s+/g, "-")}-${weight}.woff`);

  if (existsSync(cachePath)) {
    return readFile(cachePath);
  }

  const data = await fetchGoogleFontWoff(family, weight);
  await writeFile(cachePath, data);
  return data;
}

// The site's --sans/--mono are Geist Variable / Geist Mono Variable
// (see src/styles/minimal.css). Both ship on Google Fonts as static weights,
// so we pull those directly instead of trying to feed Satori a variable font.
export async function loadOgFonts() {
  const [sansRegular, sansMedium, sansSemibold, sansBold, monoRegular, monoMedium] =
    await Promise.all([
      loadFont("Geist", 400),
      loadFont("Geist", 500),
      loadFont("Geist", 600),
      loadFont("Geist", 700),
      loadFont("Geist Mono", 400),
      loadFont("Geist Mono", 500),
    ]);

  return [
    { name: "Geist", data: sansRegular, weight: 400, style: "normal" },
    { name: "Geist", data: sansMedium, weight: 500, style: "normal" },
    { name: "Geist", data: sansSemibold, weight: 600, style: "normal" },
    { name: "Geist", data: sansBold, weight: 700, style: "normal" },
    { name: "Geist Mono", data: monoRegular, weight: 400, style: "normal" },
    { name: "Geist Mono", data: monoMedium, weight: 500, style: "normal" },
  ];
}
