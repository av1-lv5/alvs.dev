/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/*
 * Plain TypeScript cannot see inside `.astro` files; only Astro's own language
 * server (used by `astro check` and `astro build`) resolves them. Without this
 * ambient module, an editor's TypeScript server flags every `.astro` import in
 * a `.ts` file as "cannot find module". Props are typed at the component, so
 * `.ts` files only need the default export.
 */
declare module "*.astro" {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}
