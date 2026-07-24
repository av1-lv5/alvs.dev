import { h } from "../../h.mjs";
import { theme } from "../../theme.mjs";

// Terminal prompt on top, big "/route" as command output on the left,
// visual content boxed on the right at a smaller, secondary scale.
export function buildP2({ route, tagline, rightBuilder }) {
  const rightBox = { width: 420, height: 380 };

  return h(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      backgroundColor: theme.bg,
      fontFamily: "Geist Mono",
      padding: "72px",
    },
    [
      h(
        "div",
        { display: "flex", fontSize: "20px", color: theme.textLight },
        "alvs@web ~ %",
      ),
      h(
        "div",
        {
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
        },
        [
          h(
            "div",
            { display: "flex", flexDirection: "column", gap: "20px", maxWidth: "520px" },
            [
              h(
                "div",
                { display: "flex", alignItems: "center", gap: "16px" },
                [
                  h(
                    "span",
                    { display: "flex", fontSize: "48px", color: theme.accent },
                    ">",
                  ),
                  h(
                    "span",
                    {
                      display: "flex",
                      fontSize: "48px",
                      fontWeight: 500,
                      color: theme.text,
                    },
                    route,
                  ),
                ],
              ),
              h(
                "div",
                { display: "flex", fontSize: "19px", lineHeight: 1.6, color: theme.textMuted },
                tagline,
              ),
            ],
          ),
          h(
            "div",
            {
              display: "flex",
              border: `1px solid ${theme.border}`,
              borderRadius: "12px",
              padding: "16px",
            },
            rightBuilder(rightBox),
          ),
        ],
      ),
    ],
  );
}
