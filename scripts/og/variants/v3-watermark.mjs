import { h } from "../h.mjs";
import { theme } from "../theme.mjs";

// Abstract typographic watermark: one oversized, very low-opacity pilcrow
// bleeding off the edge. It's still just text (neutral color, single
// occurrence) — not a repeating pattern/texture — so it stays inside the
// "no blobs/grids/dots" rule while giving the card some depth.
export function buildV3({ title, tag, date }) {
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
          right: "40px",
          top: "-80px",
          fontSize: "760px",
          fontWeight: 700,
          color: theme.text,
          opacity: 0.05,
        },
        "/",
      ),
      h(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "80px",
        },
        [
          h(
            "div",
            { display: "flex", alignItems: "center", gap: "14px" },
            [
              h("div", {
                display: "flex",
                width: "10px",
                height: "10px",
                borderRadius: "999px",
                backgroundColor: theme.accent,
              }),
              h(
                "span",
                {
                  display: "flex",
                  fontFamily: "Geist Mono",
                  fontSize: "18px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: theme.textMuted,
                },
                "alvs.dev / notes",
              ),
            ],
          ),
          h(
            "div",
            {
              display: "flex",
              fontSize: "68px",
              fontWeight: 600,
              lineHeight: 1.18,
              letterSpacing: "-2px",
              color: theme.text,
              maxWidth: "980px",
            },
            title,
          ),
          h(
            "div",
            {
              display: "flex",
              alignItems: "center",
              gap: "20px",
              fontFamily: "Geist Mono",
              fontSize: "20px",
            },
            [
              tag
                ? h("span", { display: "flex", color: theme.textLight }, tag)
                : null,
              tag && date
                ? h("div", {
                    display: "flex",
                    width: "1px",
                    height: "16px",
                    backgroundColor: theme.border,
                  })
                : null,
              date
                ? h("span", { display: "flex", color: theme.textLight }, date)
                : null,
            ].filter(Boolean),
          ),
        ],
      ),
    ],
  );
}
