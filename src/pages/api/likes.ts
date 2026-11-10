import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { sql } from "@/lib/neon";
import { isVisitorId } from "@/lib/likes";
import { MAX_LIKES } from "@/constants/likes";

export const prerender = false;

const MAX_BODY_BYTES = 1024;

export const POST: APIRoute = async ({ request, url }) => {
  // Reject cross-origin form submissions as well as oversized requests.
  if (
    request.headers.get("origin") !== url.origin ||
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return new Response(null, { status: 403 });
  }

  try {
    const reader = request.body?.getReader();
    const decoder = new TextDecoder();
    let text = "";
    let bytes = 0;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BODY_BYTES) {
          void reader.cancel().catch(() => {});
          return new Response(null, { status: 413 });
        }
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
    }
    const body = JSON.parse(text);
    const { type, id, visitorId, count, revision } = body ?? {};
    if (
      (type !== "notes" && type !== "projects" && type !== "labs") ||
      typeof id !== "string" ||
      id.length < 1 ||
      id.length > 200 ||
      !isVisitorId(visitorId) ||
      !Number.isInteger(count) ||
      count < 0 ||
      count > MAX_LIKES ||
      !Number.isInteger(revision) ||
      revision < 1 ||
      revision > 2147483647
    ) {
      return new Response(null, { status: 400 });
    }

    const entries =
      type === "notes"
        ? await getCollection("notes", ({ data }) => !data.draft)
        : type === "projects"
          ? await getCollection("projects", ({ data }) => !data.isDraft)
          : await getCollection("lab", ({ data }) => !data.isDraft);
    if (!entries.some((entry) => entry.id === id)) {
      return new Response(null, { status: 404 });
    }

    // The database function atomically enforces the daily new-row limit and
    // preserves revisions for idempotent retries and resets.
    const rows = await sql`SELECT * FROM save_content_like(
      ${type}, ${id}, ${visitorId}::uuid, ${count}::smallint, ${revision}::integer
    )`;
    if (rows.length === 0) {
      return Response.json(
        { error: "daily_limit" },
        { status: 429, headers: { "Cache-Control": "no-store" } },
      );
    }
    return Response.json(
      { count: rows[0].like_count, revision: rows[0].revision },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof SyntaxError)
      return new Response(null, { status: 400 });
    console.error(
      "Unable to update like",
      error instanceof Error ? error.name : "Unknown error",
    );
    return new Response(null, { status: 503 });
  }
};
