export function h(type, style = {}, children) {
  return { type, props: { style, children } };
}

// satori's <img> needs src/width/height as direct props, not nested
// under style, so it gets its own constructor instead of h().
export function img(src, { width, height, style = {} }) {
  return { type: "img", props: { src, width, height, style } };
}
