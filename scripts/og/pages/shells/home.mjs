import { h } from "../../h.mjs";
import { theme } from "../../theme.mjs";

const PADDING = 64;

// A refresh of the original sitewide OpenGraphImage.astro design
// (header/main/footer stacked sections) rather than the left-text /
// right-visual split every other page uses — home is the site's own
// identity card, not a "route", so it keeps that older three-row shape.
// Reskinned to match the current design taste: no bordered card, no
// colored "available" pill, single accent color (a dot, not a badge),
// square neutral chips instead of icon pills, colors pulled from theme
// instead of ad hoc hex.
export async function buildHome({ title, description, skillsBuilder }) {
  const innerWidth = 1200 - PADDING * 2;
  const skillsNode = await skillsBuilder({ width: innerWidth, height: 90 });

  return h(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: `${PADDING}px`,
      backgroundColor: theme.bg,
      fontFamily: "Geist",
    },
    [
        h(
          "div",
          { display: "flex", justifyContent: "space-between", alignItems: "center" },
          [
            h(
              "span",
              {
                display: "flex",
                fontFamily: "Geist Mono",
                fontSize: "18px",
                letterSpacing: "1px",
                color: theme.textMuted,
              },
              "alvs.dev",
            ),
            h(
              "div",
              { display: "flex", alignItems: "center", gap: "10px" },
              [
                h("div", {
                  display: "flex",
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  backgroundColor: theme.accent,
                }),
                h(
                  "span",
                  {
                    display: "flex",
                    fontFamily: "Geist Mono",
                    fontSize: "16px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: theme.textMuted,
                  },
                  "Available for work",
                ),
              ],
            ),
          ],
        ),
        h(
          "div",
          { display: "flex", flexDirection: "column", gap: "20px" },
          [
            h(
              "div",
              {
                display: "flex",
                fontSize: "88px",
                fontWeight: 700,
                letterSpacing: "-4px",
                color: theme.text,
              },
              title,
            ),
            h(
              "div",
              {
                display: "flex",
                fontSize: "34px",
                fontWeight: 400,
                lineHeight: 1.4,
                color: theme.textMuted,
                maxWidth: "900px",
              },
              description,
            ),
          ],
        ),
        h(
          "div",
          { display: "flex", flexDirection: "column", gap: "20px" },
          [
            h(
              "span",
              {
                display: "flex",
                fontFamily: "Geist Mono",
                fontSize: "14px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: theme.textLight,
                borderBottom: `1px solid ${theme.border}`,
                paddingBottom: "16px",
                width: `${innerWidth}px`,
              },
              "Toolkit",
            ),
            skillsNode,
          ],
        ),
      ],
  );
}
