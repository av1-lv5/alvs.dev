import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import projectSchema from "@schemas/projectSchema";
import noteSchema from "@schemas/noteSchema";
import bookSchema from "@schemas/bookSchema";
import labSchema from "@schemas/labSchema";

const projectsCollection = defineCollection({
  loader: glob({ pattern: ["**/*.{md,mdx}", "!**/_*"], base: "./src/content/projects" }),
  schema: z.object(projectSchema),
});

const notesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: z.object(noteSchema),
});

const booksCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/books" }),
  schema: z.object(bookSchema),
});

const labCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/lab" }),
  schema: z.object(labSchema),
});

export const collections = {
  projects: projectsCollection,
  notes: notesCollection,
  books: booksCollection,
  lab: labCollection,
};
