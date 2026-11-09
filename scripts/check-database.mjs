import { getDatabase } from "../src/lib/database.mjs";

// Run locally to check credentials and connectivity without modifying data.
// This does not verify the environment of deployed Netlify Functions.
try {
  const sql = getDatabase();
  const rows = await sql`SELECT 1 AS connected`;

  if (rows[0]?.connected !== 1) {
    throw new Error("Unexpected result from database check.");
  }

  console.log("Neon connection successful.");
} catch {
  // Database errors can contain connection details; do not print them.
  console.error(
    "Neon connection failed. Check NEON_DATABASE_URL and database availability.",
  );
  process.exitCode = 1;
}
