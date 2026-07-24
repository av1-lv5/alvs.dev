import { h } from "../../h.mjs";
import { theme } from "../../theme.mjs";

const LEFT_WIDTH = 400;
const RIGHT_PADDING = 56;

// Even split: narrow left text column, thin accent divider, wide right
// visual zone.
export function buildP1({ route, tagline, rightBuilder }) {
  const rightBox = { width: 1200 - LEFT_WIDTH - 2 - RIGHT_PADDING * 2, height: 630 - RIGHT_PADDING * 2 };

  return h(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      backgroundColor: theme.bg,
      fontFamily: "Geist",
    },
    [
      h(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: `${LEFT_WIDTH}px`,
          padding: "72px 0 72px 72px",
        },
        [
          h(
            "span",
            {
              display: "flex",
              fontFamily: "Geist Mono",
              fontSize: "18px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: theme.textMuted,
            },
            "alvs.dev",
          ),
          h(
            "div",
            { display: "flex", flexDirection: "column", gap: "20px" },
            [
              h(
                "div",
                {
                  display: "flex",
                  fontSize: "56px",
                  fontWeight: 700,
                  letterSpacing: "-2px",
                  color: theme.text,
                },
                route,
              ),
              h(
                "div",
                {
                  display: "flex",
                  fontSize: "21px",
                  lineHeight: 1.5,
                  color: theme.textLight,
                },
                tagline,
              ),
            ],
          ),
          h("div", { display: "flex", width: "40px", height: "3px", backgroundColor: theme.accent }),
        ],
      ),
      h("div", {
        display: "flex",
        width: "2px",
        backgroundColor: theme.border,
        margin: "72px 0",
      }),
      h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          flex: 1,
          padding: `${RIGHT_PADDING}px`,
        },
        rightBuilder(rightBox),
      ),
    ],
  );
}
