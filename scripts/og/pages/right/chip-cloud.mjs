import { h } from "../../h.mjs";
import { theme } from "../../theme.mjs";

// A wrapped cluster of bordered text chips — used for anything that's
// fundamentally a flat list of names (radar tags, tools, feeds, skills).
// `radius: 999` matches /radar's actual pill-shaped .cloud li (reproducing
// real page content, exempt from the "no pills" rule); `radius: 8` (the
// default) matches the square-cornered .card/.skill style everything else
// on the site actually uses.
//
// Satori's overflow:hidden doesn't reliably clip a wrapping flex container
// to a fixed height, so instead of clipping we estimate how many chips will
// actually fit the box and only render that many.
const AVG_CHIP_WIDTH = 150;
const ROW_HEIGHT = 62;

export function fitChipCount(items, { width, height }) {
  const cols = Math.max(1, Math.floor(width / AVG_CHIP_WIDTH));
  const rows = Math.max(1, Math.floor(height / ROW_HEIGHT));
  return Math.min(items.length, cols * rows);
}

export function buildChipCloud(items, { width, height }, { radius = 8 } = {}) {
  const fitted = items.slice(0, fitChipCount(items, { width, height }));

  return h(
    "div",
    {
      display: "flex",
      flexWrap: "wrap",
      alignContent: "flex-start",
      gap: "12px",
      width: `${width}px`,
    },
    fitted.map((item) =>
      h(
        "div",
        {
          display: "flex",
          fontFamily: "Geist Mono",
          fontSize: "19px",
          color: theme.textMuted,
          border: `1px solid ${theme.border}`,
          borderRadius: `${radius}px`,
          padding: "10px 20px",
        },
        item,
      ),
    ),
  );
}
