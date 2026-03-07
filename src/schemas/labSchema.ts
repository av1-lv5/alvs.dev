import { z } from "astro:content";

export default {
  title: z.string(),
  description: z.string().optional(),
  date: z.date(),
  source: z.string().url().optional(),
  sourceType: z.enum(["youtube", "blog", "codepen", "other"]).optional(),
  component: z.string(),
  isDraft: z.boolean(),
};
