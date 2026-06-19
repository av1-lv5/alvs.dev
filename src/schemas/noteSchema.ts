import { z } from "astro/zod";

export default {
  title: z.string(),
  tags: z.array(z.string()),
  description: z.string().optional(),
  draft: z.boolean(),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
};
