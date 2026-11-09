import { neon } from "@neondatabase/serverless";

// Only import this module from server-side code; the URL contains credentials.
export function getDatabase() {
  const url = process.env.NEON_DATABASE_URL;

  if (!url) {
    throw new Error("NEON_DATABASE_URL is not configured.");
  }

  return neon(url);
}
