import { neon } from "@neondatabase/serverless";
import { NEON_DATABASE_URL } from "astro:env/server";

export const sql = neon(NEON_DATABASE_URL);
