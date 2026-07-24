import { h } from "../../h.mjs";
import { theme } from "../../theme.mjs";

// Full-bleed visual on the right two-thirds of the card with a gradient
// scrim fading back to the background color so the route name/tagline
// stay legible sitting directly on top of it.
//
// `dim` (0–1) adds a flat darkening overlay on top of the right content
// only — some source images (e.g. book covers) run much brighter than
// others (movie posters), and the directional scrim alone doesn't even
// that out since it only fades in from the left edge.
export function buildP4({ route, tagline, rightBuilder, dim = 0 }) {
  const rightBox = { width: 900, height: 630 };

  return h(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      position: "relative",
      backgroundColor: theme.bg,
      fontFamily: "Geist",
      overflow: "hidden",
    },
    [
      h(
        "div",
        {
          display: "flex",
          position: "absolute",
          right: "0px",
          top: "0px",
          padding: "40px",
        },
        rightBuilder(rightBox),
      ),
      dim > 0 &&
        h("div", {
          display: "flex",
          position: "absolute",
          right: "0px",
          top: "0px",
          width: "900px",
          height: "630px",
          backgroundColor: `hsla(220, 15%, 4%, ${dim})`,
        }),
      h("div", {
        display: "flex",
        position: "absolute",
        left: "0px",
        top: "0px",
        width: "1200px",
        height: "630px",
        backgroundImage: `linear-gradient(to right, ${theme.bg} 34%, rgba(6,7,9,0) 76%)`,
      }),
      h(
        "span",
        {
          display: "flex",
          position: "absolute",
          left: "72px",
          top: "56px",
          fontFamily: "Geist Mono",
          fontSize: "18px",
          letterSpacing: "1px",
          color: theme.textMuted,
        },
        "alvs.dev",
      ),
      h(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "absolute",
          left: "72px",
          top: "0px",
          width: "520px",
          height: "630px",
          gap: "20px",
        },
        [
          h(
            "div",
            {
              display: "flex",
              fontSize: "58px",
              fontWeight: 700,
              letterSpacing: "-2px",
              color: theme.text,
            },
            route,
          ),
          h(
            "div",
            { display: "flex", fontSize: "21px", lineHeight: 1.5, color: theme.textLight },
            tagline,
          ),
          h("div", { display: "flex", width: "40px", height: "3px", backgroundColor: theme.accent }),
        ],
      ),
    ].filter(Boolean),
  );
}
