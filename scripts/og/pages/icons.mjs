import { createRequire } from "node:module";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const simpleIcons = require("@iconify-json/simple-icons/icons.json");

const RASTER_SIZE = 64;

// Renders an @iconify-json/simple-icons glyph to a PNG data URI Satori's
// <img> can use. Icon bodies ship with `fill="currentColor"`, which doesn't
// resolve outside a real CSS cascade, so it's swapped for a literal color
// up front — kept neutral (not the brand's real color) to stay within the
// "only one accent color pops" rule.
//
// Satori embeds <img> sources as a nested SVG <image href="..."> element,
// but the rasterizer (sharp/librsvg) doesn't support SVG-in-SVG references
// — only raster formats work there. So the icon is rasterized to PNG here
// first, rather than handing satori the raw SVG.
export async function getSkillIconDataUri(iconId, color) {
  const name = iconId.split(":")[1];
  const icon = simpleIcons.icons[name];
  if (!icon) return null;

  const width = icon.width ?? simpleIcons.width;
  const height = icon.height ?? simpleIcons.height;
  const body = icon.body.replaceAll("currentColor", color);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`;

  const png = await sharp(Buffer.from(svg))
    .resize(RASTER_SIZE, RASTER_SIZE)
    .png()
    .toBuffer();

  return `data:image/png;base64,${png.toString("base64")}`;
}
