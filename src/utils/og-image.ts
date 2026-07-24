import { existsSync } from "node:fs";

// Looks up a locally-generated OG image (see scripts/generate-og-images.mjs
// and scripts/generate-og-pages.mjs) at build time. Returns undefined when
// one hasn't been generated yet, letting the caller fall back to the
// site-wide default image.
export function getGeneratedOgImage(
  kind: "notes" | "pages",
  slug: string,
): string | undefined {
  const diskPath = `public/assets/img/og/${kind}/${slug}.png`;
  return existsSync(diskPath) ? `/assets/img/og/${kind}/${slug}.png` : undefined;
}
