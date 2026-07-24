import { h } from "../../h.mjs";
import { theme } from "../../theme.mjs";

// Default right-side treatment for pages with no natural image/list content
// to visualize — same giant low-opacity glyph trick as the notes v3
// watermark variant. Pure typographic abstraction, no data, so it can't
// collide with the left-side text the way dense chip/log content could.
export function buildSlashMark({ width, height }) {
  return h(
    "div",
    {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: `${width}px`,
      height: `${height}px`,
    },
    h(
      "div",
      {
        display: "flex",
        fontSize: "760px",
        fontWeight: 700,
        color: theme.text,
        opacity: 0.05,
      },
      "/",
    ),
  );
}
