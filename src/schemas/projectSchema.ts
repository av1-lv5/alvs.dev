import { z } from "astro/zod";

export default {
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z
    .array(
      z.enum([
        "typescript",
        "javascript",
        "react",
        "preact",
        "astro",
        "next",
        "supabase",
        "html",
        "css",
      ]),
    )
    .max(4),
  repoId: z.string().optional(),
  liveAt: z.string().optional(),
  year: z.number(),
  isDraft: z.boolean(),
  featured: z.boolean().optional(),
};
