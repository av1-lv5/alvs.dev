import { h } from "../../h.mjs";
import { theme } from "../../theme.mjs";

// Editorial top rule + big route name (mirrors the notes masthead feel),
// with the visual tucked into a bordered "preview window" card on the
// right rather than bleeding to the edge.
export function buildP5({ route, tagline, rightBuilder }) {
  const rightBox = { width: 420, height: 420 };

  return h(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      backgroundColor: theme.bg,
      fontFamily: "Geist",
      padding: "72px",
    },
    [
      h("div", {
        display: "flex",
        width: "100%",
        height: "3px",
        backgroundColor: theme.accent,
      }),
      h(
        "div",
        {
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "28px",
        },
        [
          h(
            "div",
            { display: "flex", flexDirection: "column", gap: "20px", maxWidth: "480px" },
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
                {
                  display: "flex",
                  fontSize: "62px",
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
            ],
          ),
          h(
            "div",
            {
              display: "flex",
              border: `1px solid ${theme.border}`,
              borderRadius: "16px",
              backgroundColor: theme.bgSoft,
              padding: "20px",
            },
            rightBuilder(rightBox),
          ),
        ],
      ),
    ],
  );
}
