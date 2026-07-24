import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const IMAGE_CACHE_DIR = path.resolve(".cache/og-posters");

export async function loadRadarTags() {
  const { radar } = await import(path.join(ROOT, "src/data/radar.ts"));
  return [...radar].sort((a, b) => a.localeCompare(b));
}

export async function fetchImageDataUri(url) {
  await mkdir(IMAGE_CACHE_DIR, { recursive: true });
  const cacheKey = url.split("/").pop().split("?")[0];
  const cachePath = path.join(IMAGE_CACHE_DIR, cacheKey);

  let buffer;
  if (existsSync(cachePath)) {
    buffer = await readFile(cachePath);
  } else {
    buffer = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
    await writeFile(cachePath, buffer);
  }

  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

// Pulls the first N posters (movies + shows) out of the existing
// recommendations data, reusing the TMDB cache already in the repo so no
// API key / network call to TMDB itself is needed for already-seen ids.
export async function loadFeaturedPosters(count = 6) {
  const { recommendations } = await import(path.join(ROOT, "src/data/movies.ts"));
  const cache = JSON.parse(
    await readFile(path.join(ROOT, ".cache/tmdb.json"), "utf-8"),
  );

  const items = recommendations.flatMap((group) => group.items);
  const withPosters = [];

  for (const item of items) {
    const bucket = item.type === "movie" ? cache.movies : cache.shows;
    const entry = bucket[item.tmdbId];
    if (entry?.posterUrl) withPosters.push(entry);
    if (withPosters.length >= count) break;
  }

  return Promise.all(
    withPosters.map(async (entry) => ({
      title: entry.title,
      dataUri: await fetchImageDataUri(entry.posterUrl),
    })),
  );
}

export async function loadBookCovers() {
  const dir = path.join(ROOT, "src/content/books");
  const files = (await readdir(dir)).filter((f) => /\.mdx?$/.test(f));

  const books = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(dir, file), "utf-8");
      return matter(raw).data;
    }),
  );

  return Promise.all(
    books
      .filter((b) => b.cover)
      .map(async (b) => ({
        title: b.title,
        dataUri: await fetchImageDataUri(b.cover),
      })),
  );
}

export async function loadProjectThumbs() {
  const dir = path.join(ROOT, "src/content/projects");
  const files = (await readdir(dir)).filter(
    (f) => /\.mdx?$/.test(f) && !f.startsWith("_"),
  );

  const projects = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(dir, file), "utf-8");
      return matter(raw).data;
    }),
  );

  const withThumbs = [];
  for (const project of projects) {
    if (project.isDraft) continue;
    const thumbPath = path.join(ROOT, "public/assets/img", `${project.id}-thumb.png`);
    if (!existsSync(thumbPath)) continue;
    const buffer = await readFile(thumbPath);
    withThumbs.push({
      title: project.title,
      dataUri: `data:image/png;base64,${buffer.toString("base64")}`,
    });
  }

  return withThumbs;
}

export async function loadSkills() {
  const { skills } = await import(path.join(ROOT, "src/data/skills.ts"));
  return skills;
}
