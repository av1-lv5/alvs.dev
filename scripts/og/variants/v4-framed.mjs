import { h } from "../h.mjs";
import { theme } from "../theme.mjs";

const CORNER = 28;

function cornerMark({ top, bottom, left, right }) {
  const border = `2px solid ${theme.textLight}`;
  const position = {
    ...(top !== undefined ? { top } : {}),
    ...(bottom !== undefined ? { bottom } : {}),
    ...(left !== undefined ? { left } : {}),
    ...(right !== undefined ? { right } : {}),
  };
  const borders = {
    ...(top !== undefined ? { borderTop: border } : {}),
    ...(bottom !== undefined ? { borderBottom: border } : {}),
    ...(left !== undefined ? { borderLeft: border } : {}),
    ...(right !== undefined ? { borderRight: border } : {}),
  };

  return h("div", {
    display: "flex",
    position: "absolute",
    ...position,
    width: `${CORNER}px`,
    height: `${CORNER}px`,
    ...borders,
  });
}

// Viewfinder / crop-mark frame: four small L-shaped corner marks instead of
// a full border, centered composition inside. Reads as deliberately
// "designed" without any pattern fill or extra color.
export function buildV4({ title, tag, date }) {
  const inset = "56px";

  return h(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      position: "relative",
      backgroundColor: theme.bg,
      fontFamily: "Geist",
    },
    [
      cornerMark({ top: inset, left: inset }),
      cornerMark({ top: inset, right: inset }),
      cornerMark({ bottom: inset, left: inset }),
      cornerMark({ bottom: inset, right: inset }),
      h(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: "32px",
          padding: "0 200px",
        },
        [
          h("div", {
            display: "flex",
            width: "14px",
            height: "14px",
            backgroundColor: theme.accent,
          }),
          h(
            "div",
            {
              display: "flex",
              textAlign: "center",
              justifyContent: "center",
              fontSize: "56px",
              fontWeight: 600,
              lineHeight: 1.25,
              letterSpacing: "-1.5px",
              color: theme.text,
            },
            title,
          ),
          h(
            "div",
            {
              display: "flex",
              fontFamily: "Geist Mono",
              fontSize: "18px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: theme.textMuted,
              gap: "14px",
            },
            [
              "alvs.dev",
              tag ? `· ${tag}` : null,
              date ? `· ${date}` : null,
            ]
              .filter(Boolean)
              .join("  "),
          ),
        ],
      ),
    ],
  );
}
