import { h, img } from "../../h.mjs";
import { theme } from "../../theme.mjs";
import { getSkillIconDataUri } from "../icons.mjs";

const AVG_CHIP_WIDTH = 190;
const ROW_HEIGHT = 68;

// Same "fit instead of clip" approach as chip-cloud/poster-wall — Satori's
// overflow:hidden doesn't reliably clip a wrapping row to a fixed height.
function fitChipCount(items, { width, height }) {
  const cols = Math.max(1, Math.floor(width / AVG_CHIP_WIDTH));
  const rows = Math.max(1, Math.floor(height / ROW_HEIGHT));
  return Math.min(items.length, cols * rows);
}

// Toolkit row for the home page: icon + name chips, one specific reuse of
// the original OpenGraphImage.astro idea. Icons render in a flat neutral
// color (not their real brand colors) to stay within the single-accent
// rule — this is the one spot in the system that needs real icon glyphs,
// so it gets its own builder instead of going through chip-cloud.
export async function buildSkillChips(skills, { width, height }) {
  const fitted = skills.slice(0, fitChipCount(skills, { width, height }));

  const chips = await Promise.all(
    fitted.map(async (skill) => {
      const iconUri = await getSkillIconDataUri(skill.icon, theme.textMuted);

      return h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "19px",
          fontWeight: 500,
          color: theme.textMuted,
          border: `1px solid ${theme.border}`,
          borderRadius: "8px",
          backgroundColor: theme.bgSoft,
          padding: "10px 20px",
        },
        [
          iconUri &&
            img(iconUri, { width: 20, height: 20, style: { display: "flex" } }),
          h("span", { display: "flex" }, skill.name),
        ].filter(Boolean),
      );
    }),
  );

  return h(
    "div",
    {
      display: "flex",
      flexWrap: "wrap",
      alignContent: "flex-start",
      gap: "12px",
      width: `${width}px`,
    },
    chips,
  );
}
