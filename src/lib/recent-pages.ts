import type { SitePage } from "@utils/pageSearch";

export const RECENT_PAGES_KEY = "portfolio-recent-pages";
/** How many recents the search UIs show, current page excluded. */
const MAX_RECENT_PAGES = 5;
/** One extra slot so the current page never crowds out a displayed one. */
const STORED_LIMIT = MAX_RECENT_PAGES + 1;

/** Drops a trailing slash so "/about/" → "/about". */
export function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * Reads stored paths. Private mode, blocked storage and corrupt JSON all
 * mean "no recents"; search must never break over this.
 */
function readStoredPaths(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_PAGES_KEY);
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

function writeStoredPaths(paths: string[]) {
  try {
    localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(paths));
  } catch {
    /* Unavailable storage only costs the write. */
  }
}

/**
 * Records a visit to `path` when it matches a known search page. Only
 * stored paths can resolve to a title later, so unknown paths never go in.
 */
export function recordPageVisit(path: string, known: SitePage[]): void {
  const canonical = known.find(
    (page) => normalizePath(page.path) === normalizePath(path),
  );
  if (!canonical) return;

  const key = normalizePath(path);
  const others = readStoredPaths().filter(
    (stored) => normalizePath(stored) !== key,
  );
  writeStoredPaths([canonical.path, ...others].slice(0, STORED_LIMIT));
}

/** Recent pages for display, most recent first. */
export function readRecentPages(
  known: SitePage[],
  currentPath: string,
): SitePage[] {
  const byPath = new Map(known.map((page) => [normalizePath(page.path), page]));
  const current = normalizePath(currentPath);
  const seen = new Set<string>();
  const pages: SitePage[] = [];

  for (const stored of readStoredPaths()) {
    const key = normalizePath(stored);
    if (key === current || seen.has(key)) continue;
    const page = byPath.get(key);
    if (!page) continue;
    seen.add(key);
    pages.push(page);
    if (pages.length === MAX_RECENT_PAGES) break;
  }

  return pages;
}

/** Records the current page once per load, for both dock and palette. */
export function trackCurrentPage(known: SitePage[]): void {
  const root = document.documentElement;
  if (root.dataset.recentTracked === "true") return;
  root.dataset.recentTracked = "true";
  recordPageVisit(window.location.pathname, known);
}
