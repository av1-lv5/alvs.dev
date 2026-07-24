import { h } from "../../h.mjs";
import { theme } from "../../theme.mjs";

const CORNER = 28;
const INSET = 48;

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

// Viewfinder corner marks framing the whole card. Route name + tagline sit
// top-left inside the frame; the visual owns the lower-right two-thirds.
export function buildP3({ route, tagline, rightBuilder }) {
  const inset = `${INSET}px`;
  const rightBox = { width: 620, height: 250 };

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
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: `${INSET + 40}px`,
        },
        [
          h(
            "div",
            { display: "flex", flexDirection: "column", gap: "18px", maxWidth: "560px" },
            [
              h(
                "div",
                {
                  display: "flex",
                  fontSize: "54px",
                  fontWeight: 700,
                  letterSpacing: "-1.5px",
                  color: theme.text,
                },
                route,
              ),
              h(
                "div",
                { display: "flex", fontSize: "20px", lineHeight: 1.5, color: theme.textLight },
                tagline,
              ),
            ],
          ),
          h(
            "div",
            { display: "flex", alignSelf: "flex-end" },
            rightBuilder(rightBox),
          ),
        ],
      ),
    ],
  );
}
