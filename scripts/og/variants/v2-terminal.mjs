import { h } from "../h.mjs";
import { theme } from "../theme.mjs";

// Terminal aesthetic: everything in mono, a fake prompt line, the title
// rendered as "output" with an accent caret, and a blinking-cursor block
// as the only flourish. No window chrome / traffic-light dots — those
// would add extra colors that "pop".

const TITLE_FONT_SIZE = 52;
const CARET_FONT_SIZE = 56;
// Geist Mono's advance width, as a fraction of font-size — used to
// hand-wrap the title ourselves (see wrapMonospace below).
const CHAR_WIDTH_RATIO = 0.6;
const CONTAINER_WIDTH = 1040; // 1200 canvas minus 80px padding each side
const CARET_GAP = 20;

// Satori lays out wrapped text as its own flex item, so a cursor block
// placed *after* a wrapping text node sits at the end of the first line,
// not the last one — it can't participate in the text's own line breaks.
// Wrapping the title ourselves (reliable here since it's a monospace font,
// so every character has the same advance width) lets us render the last
// line and the cursor as siblings in one row, guaranteeing the cursor
// trails the actual last word instead of the first line.
function wrapMonospace(text, maxWidthPx, fontSize) {
  const maxChars = Math.max(1, Math.floor(maxWidthPx / (fontSize * CHAR_WIDTH_RATIO)));
  const words = text.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function buildV2({ title, tag, date }) {
  const prompt = "alvs@web ~/notes %";
  const caretWidth = CARET_FONT_SIZE * CHAR_WIDTH_RATIO;
  const textMaxWidth = CONTAINER_WIDTH - caretWidth - CARET_GAP;
  const lines = wrapMonospace(title, textMaxWidth, TITLE_FONT_SIZE);
  const lastLineIndex = lines.length - 1;

  const titleLineStyle = {
    display: "flex",
    fontSize: `${TITLE_FONT_SIZE}px`,
    fontWeight: 500,
    lineHeight: 1.35,
    color: theme.text,
    letterSpacing: "-1px",
  };

  return h(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: theme.bg,
      fontFamily: "Geist Mono",
      padding: "80px",
    },
    [
      h(
        "div",
        { display: "flex", fontSize: "22px", color: theme.textLight },
        prompt,
      ),
      h(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          maxWidth: "1040px",
        },
        [
          h("div", { display: "flex", alignItems: "flex-start", gap: "20px" }, [
            h(
              "span",
              {
                display: "flex",
                fontSize: `${CARET_FONT_SIZE}px`,
                fontWeight: 500,
                color: theme.accent,
              },
              ">",
            ),
            h(
              "div",
              { display: "flex", flexDirection: "column" },
              lines.map((line, i) =>
                i === lastLineIndex
                  ? h(
                      "div",
                      { display: "flex", alignItems: "center", gap: "12px" },
                      [
                        h("span", titleLineStyle, line),
                        h("span", {
                          display: "flex",
                          width: "26px",
                          height: "52px",
                          backgroundColor: theme.accent,
                        }),
                      ],
                    )
                  : h("div", titleLineStyle, line),
              ),
            ),
          ]),
        ],
      ),
      h(
        "div",
        { display: "flex", justifyContent: "space-between", fontSize: "20px" },
        [
          h(
            "span",
            { display: "flex", color: theme.textMuted },
            tag ? `--tag ${tag}` : "",
          ),
          h(
            "span",
            { display: "flex", color: theme.textMuted },
            date ? `--published ${date}` : "",
          ),
        ],
      ),
    ],
  );
}
