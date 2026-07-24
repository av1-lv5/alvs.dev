function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizeNoteData({ title, tags = [], publishedAt }) {
  const cleanTags = (tags ?? []).filter(Boolean);
  return {
    title,
    tag: cleanTags[0] ?? null,
    date: formatDate(publishedAt),
  };
}
