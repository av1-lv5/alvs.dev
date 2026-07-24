import { h, img } from "../../h.mjs";

// A 3-column image wall with each column offset vertically by a different
// amount — a "fake masonry" (satori has no real grid/masonry layout, so
// this is plain flexbox columns with staggered margins). Used for anything
// that's a flat list of cover-art-shaped images (movie posters, book
// covers, project screenshots).
const COLUMN_OFFSETS = [0, 56, 24];

export function buildPosterWall(images, { width, height, columns = 3, gap = 16 }) {
  const colWidth = Math.floor((width - gap * (columns - 1)) / columns);
  const posterHeight = Math.round(colWidth * 1.5);

  // Satori's overflow:hidden doesn't reliably clip a column that's taller
  // than its declared height, so cap rows per column up front instead of
  // relying on clipping (same issue as the chip-cloud builder).
  const maxOffset = Math.max(...COLUMN_OFFSETS.slice(0, columns));
  const rows = Math.max(1, Math.floor((height - maxOffset + gap) / (posterHeight + gap)));

  const cols = Array.from({ length: columns }, (_, colIndex) => {
    const colImages = images.filter((_, i) => i % columns === colIndex).slice(0, rows);

    return h(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        gap: `${gap}px`,
        width: `${colWidth}px`,
        marginTop: `${COLUMN_OFFSETS[colIndex % COLUMN_OFFSETS.length]}px`,
      },
      colImages.map((image) =>
        img(image.dataUri, {
          width: colWidth,
          height: posterHeight,
          style: { display: "flex", borderRadius: "6px" },
        }),
      ),
    );
  });

  return h(
    "div",
    {
      display: "flex",
      gap: `${gap}px`,
      width: `${width}px`,
    },
    cols,
  );
}
