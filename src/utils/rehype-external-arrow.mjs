// Replaces a trailing "↗" text glyph on external links with an inline SVG
// (lucide arrow-up-right). Geist has no arrow glyphs, so on Android the text
// character falls back to a mismatched system font — the SVG renders
// identically everywhere.

const ARROW_SVG = {
  type: "element",
  tagName: "svg",
  properties: {
    viewBox: "0 0 24 24",
    width: 14,
    height: 14,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    className: ["ext-arrow"],
  },
  children: [
    {
      type: "element",
      tagName: "path",
      properties: { d: "M7 17 17 7M7 7h10v10" },
      children: [],
    },
  ],
};

export default function rehypeExternalArrow() {
  const walk = (node) => {
    if (!node.children) return;

    for (const child of node.children) {
      if (
        node.tagName === "a" &&
        child.type === "text" &&
        /↗\s*$/.test(child.value)
      ) {
        child.value = child.value.replace(/↗\s*$/, "");
        node.children.push({
          ...ARROW_SVG,
          children: ARROW_SVG.children.map((c) => ({ ...c })),
        });
        break;
      }
    }

    for (const child of node.children) walk(child);
  };

  return (tree) => walk(tree);
}
