import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import rehypeExternalLinks from "rehype-external-links";
import rehypeExternalArrow from "./src/utils/rehype-external-arrow.mjs";

import icon from "astro-icon";

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  prefetch: {
    defaultStrategy: "hover",
  },
  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: "_blank",
            rel: ["noopener", "noreferrer"],
          },
        ],
        rehypeExternalArrow,
      ],
    }),

    shikiConfig: {
      themes: {
        light: "catppuccin-latte",
        dark: "houston",
      },
    },
  },
  integrations: [icon(), mdx(), react()],
  site: "https://alvs.dev",
  vite: {
    build: {
      // lightningcss (Vite 8's default CSS minifier) drops the unprefixed
      // backdrop-filter declaration, keeping only -webkit-backdrop-filter:
      // https://github.com/parcel-bundler/lightningcss/issues/537
      cssMinify: "esbuild",
    },
  },
});
