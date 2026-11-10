import { defineConfig, envField } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import rehypeExternalLinks from "rehype-external-links";
import rehypeExternalArrow from "./src/utils/rehype-external-arrow.mjs";

import icon from "astro-icon";

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  // https://docs.astro.build/en/reference/configuration-reference/#env
  // https://docs.astro.build/en/guides/environment-variables/#limitations
  env: {
    schema: {
      NEON_DATABASE_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      SPOTIFY_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      SPOTIFY_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      SPOTIFY_REFRESH_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      TMDB_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },

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

  adapter: netlify(),
});
