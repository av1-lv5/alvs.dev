import { sitemapSections } from "@data/sitemap";

export type SitePage = {
  title: string;
  path: string;
  description: string;
  category: string;
  keywords: string[];
};

/** A highlighted character range within a title (end exclusive). */
export type MatchRange = { start: number; end: number };

export type RankedPage = SitePage & {
  score: number;
  /** Title ranges that matched the query, for highlighting. */
  titleMatches: MatchRange[];
};

export type HighlightablePage = SitePage & {
  titleMatches?: MatchRange[];
};

/**
 * Flattens the sitemap into the page list the search UIs consume. Shared
 * by MobileDock and CommandPalette so they always search the same set.
 * Server-side only (called from component frontmatter); the client
 * scripts receive the result as a JSON island.
 */
export function getSitePages(): SitePage[] {
  return sitemapSections.flatMap((section) =>
    section.items.map((item) => ({
      title: item.label,
      path: item.href,
      description: item.description,
      category: section.title,
      keywords: item.keywords ?? [],
    })),
  );
}

/** Groups pages by category, preserving first-seen order. */
export function groupByCategory(items: SitePage[]): Map<string, SitePage[]> {
  const groups = new Map<string, SitePage[]>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  return groups;
}

/**
 * Appends `text`, wrapping the given ranges in <mark> nodes. Ranges are
 * expected sorted and non-overlapping (rankPages guarantees that). Uses
 * text nodes throughout, never innerHTML.
 */
function appendHighlighted(
  parent: HTMLElement,
  text: string,
  ranges: MatchRange[],
  className: string,
) {
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) parent.append(text.slice(cursor, range.start));
    const mark = document.createElement("mark");
    mark.className = className;
    mark.textContent = text.slice(range.start, range.end);
    parent.append(mark);
    cursor = range.end;
  }
  if (cursor < text.length) parent.append(text.slice(cursor));
}

/**
 * Builds a result <a> with title/description spans, prefixed by the
 * caller's CSS namespace ("dock" or "cmdk"). Matched title ranges render
 * as <mark> elements. Uses textContent (never innerHTML) so page copy
 * can't inject nodes. DOM helper — client only.
 */
export function createResultLink(
  entry: HighlightablePage,
  prefix: string,
): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = entry.path;
  link.className = `${prefix}-result-link`;

  const title = document.createElement("span");
  title.className = `${prefix}-result-title`;
  appendHighlighted(
    title,
    entry.title,
    entry.titleMatches ?? [],
    `${prefix}-result-match`,
  );

  const desc = document.createElement("span");
  desc.className = `${prefix}-result-desc`;
  desc.textContent = entry.description;

  link.append(title, desc);

  return link;
}

function normalize(value: string) {
  return value.toLowerCase();
}

/**
 * Ordered-subsequence fuzzy match: every character of `query` must appear
 * in `text` in order (not necessarily contiguous). Returns null if the
 * full subsequence isn't found. Tighter, earlier matches score higher;
 * the matched indices come back so the title can highlight them.
 */
function fuzzyMatch(
  text: string,
  query: string,
): { score: number; indices: number[] } | null {
  let cursor = 0;
  let firstMatch = -1;
  let lastMatch = -1;
  const indices: number[] = [];

  for (const char of query) {
    const found = text.indexOf(char, cursor);
    if (found === -1) return null;
    if (firstMatch === -1) firstMatch = found;
    lastMatch = found;
    indices.push(found);
    cursor = found + 1;
  }

  const span = lastMatch - firstMatch + 1;
  const density = query.length / span; // 1 = fully contiguous match
  return { score: 40 * density - Math.min(firstMatch, 20) * 0.5, indices };
}

/**
 * Floor for fuzzy (non-substring) matches. Character order alone is a weak
 * signal, so a match must also begin a word and stay tight: that keeps real
 * dropped-letter typos ("pdcst" → Podcasts) and drops characters scattered
 * across a long title or keyword. Descriptions never reach here — they only
 * match at word starts — and neither do tokens shorter than
 * `MIN_APPROX_LENGTH`.
 */
const MIN_FUZZY_SCORE = 15;

/** Collapses ascending character indices into contiguous ranges. */
function mergeRanges(indices: number[]): MatchRange[] {
  const ranges: MatchRange[] = [];
  for (const index of indices) {
    const last = ranges[ranges.length - 1];
    if (last && index === last.end) last.end = index + 1;
    else ranges.push({ start: index, end: index + 1 });
  }
  return ranges;
}

type FieldMatch = { score: number; ranges: MatchRange[] };

/** Character ranges of the alphanumeric words in `text`. */
function wordRanges(text: string): MatchRange[] {
  const ranges: MatchRange[] = [];
  for (const match of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    const start = match.index ?? 0;
    ranges.push({ start, end: start + match[0].length });
  }
  return ranges;
}

/** Sorts ranges and merges the ones that overlap or touch. */
function unionRanges(ranges: MatchRange[]): MatchRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: MatchRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

/** Whether `index` starts a word (0 or just past a non-alphanumeric). */
function atWordStart(text: string, index: number): boolean {
  return index === 0 || !/[\p{L}\p{N}]/u.test(text[index - 1]);
}

/** Range of the first word in `text` that starts with `token`, or null. */
function wordStartingWith(text: string, token: string): MatchRange | null {
  for (const word of wordRanges(text)) {
    if (text.slice(word.start, word.end).startsWith(token)) return word;
  }
  return null;
}

/**
 * Optimal string alignment distance: an insertion, deletion, substitution,
 * or swap of two adjacent characters each costs one step.
 */
function editDistance(a: string, b: string): number {
  const grid: number[][] = [];
  for (let row = 0; row <= a.length; row++) {
    grid[row] = [];
    for (let column = 0; column <= b.length; column++) {
      grid[row][column] =
        row === 0 ? column : column === 0 ? row : Number.POSITIVE_INFINITY;
    }
  }

  for (let row = 1; row <= a.length; row++) {
    for (let column = 1; column <= b.length; column++) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      grid[row][column] = Math.min(
        grid[row - 1][column] + 1,
        grid[row][column - 1] + 1,
        grid[row - 1][column - 1] + cost,
      );
      // A transposition is one typo, not two substitutions.
      if (
        row > 1 &&
        column > 1 &&
        a[row - 1] === b[column - 2] &&
        a[row - 2] === b[column - 1]
      ) {
        grid[row][column] = Math.min(
          grid[row][column],
          grid[row - 2][column - 2] + 1,
        );
      }
    }
  }

  return grid[a.length][b.length];
}

/**
 * Range of the first word in `text` within one edit of `token`. Prefixes of
 * a longer word are compared too, so a slip plus a plural still counts as
 * one ("podcsat" → "podcasts").
 */
function nearWord(text: string, token: string): MatchRange | null {
  for (const word of wordRanges(text)) {
    // Requiring the same first letter keeps a word's tail from standing in
    // for a different word ("lear" for "gear").
    if (text[word.start] !== token[0]) continue;
    const length = word.end - word.start;
    const cuts = new Set([
      length,
      Math.min(length, token.length),
      Math.min(length, token.length + 1),
    ]);
    for (const cut of cuts) {
      if (editDistance(text.slice(word.start, word.start + cut), token) <= 1) {
        return word;
      }
    }
  }
  return null;
}

/** A whole-word typo beats a subsequence but loses to a substring hit. */
const TYPO_SCORE = 60;

/** Tokens this short only match word edges; mid-word hits are noise. */
const SHORT_TOKEN_MAX = 2;

/**
 * Approximate matches (typos and subsequences) need this many characters.
 * With three or fewer, an ordered subsequence inside one word is too weak to
 * tell from noise — "rss" would reach Changelog through "releases".
 */
const MIN_APPROX_LENGTH = 4;

/**
 * Matches one field value against one query token. `wordStartsOnly` is for
 * descriptions, where mid-word and fuzzy hits are noise rather than signal;
 * tokens of one or two characters use it everywhere.
 */
function matchField(
  text: string,
  token: string,
  wordStartsOnly = false,
): FieldMatch | null {
  const t = normalize(text);
  const q = normalize(token);
  if (!q) return null;

  // Lowercasing keeps indices aligned for every string this site
  // searches. If it ever doesn't, drop the ranges rather than mis-mark.
  const aligned = t.length === text.length;
  const matched = (start: number, end: number): MatchRange[] =>
    aligned ? [{ start, end }] : [];

  if (t === q) return { score: 100, ranges: matched(0, text.length) };

  if (wordStartsOnly || token.length <= SHORT_TOKEN_MAX) {
    const word = wordStartingWith(t, q);
    if (word === null) return null;
    // A whole word beats a prefix of a longer one, so "me" prefers
    // "hire me" over "memory".
    const wholeWord = word.end - word.start === q.length;
    return {
      score: (wholeWord ? 90 : 80) - Math.min(word.start, 20) * 0.5,
      ranges: matched(word.start, word.start + q.length),
    };
  }

  if (t.startsWith(q)) return { score: 90, ranges: matched(0, q.length) };

  const idx = t.indexOf(q);
  if (idx !== -1) {
    // Word-start bonus: "me" at the front of a word ("Hire Me") is a
    // much stronger signal than the same substring buried mid-word.
    return {
      score: (atWordStart(t, idx) ? 85 : 80) - Math.min(idx, 20),
      ranges: matched(idx, idx + q.length),
    };
  }

  if (q.length < MIN_APPROX_LENGTH) return null;

  const typo = nearWord(t, q);
  if (typo) {
    return { score: TYPO_SCORE, ranges: matched(typo.start, typo.end) };
  }

  const fuzzy = fuzzyMatch(t, q);
  if (fuzzy === null || fuzzy.score < MIN_FUZZY_SCORE) return null;
  // A subsequence only reads as a mistyped word when it starts one;
  // otherwise "tech" also picks up the t-e-c-h in "site changes".
  if (!atWordStart(t, fuzzy.indices[0])) return null;
  return {
    score: fuzzy.score,
    ranges: aligned ? mergeRanges(fuzzy.indices) : [],
  };
}

/** Strength assigned when every token of the query lands in the same value. */
const ALL_TOKENS_SCORE = 92;

/**
 * Matches a whole field value against every token, or null unless each one
 * matches. Tokens may appear in any order, but a phrase in written order
 * scores higher.
 */
function matchAllTokens(
  text: string,
  tokens: string[],
  wordStartsOnly = false,
): FieldMatch | null {
  if (tokens.length === 1) return matchField(text, tokens[0], wordStartsOnly);

  const phrase = matchField(text, tokens.join(" "), wordStartsOnly);

  const ranges: MatchRange[] = [];
  for (const token of tokens) {
    const match = matchField(text, token, wordStartsOnly);
    if (!match) return phrase;
    ranges.push(...match.ranges);
  }

  return {
    score: Math.max(ALL_TOKENS_SCORE, phrase?.score ?? 0),
    ranges: unionRanges(ranges),
  };
}

/**
 * Best match across a page's alternate names, or null if none match. A
 * keyword covers a multi-word query only when it carries every token.
 */
function matchKeywords(
  keywords: string[],
  tokens: string[],
): FieldMatch | null {
  let best: FieldMatch | null = null;
  for (const keyword of keywords) {
    const match = matchAllTokens(keyword, tokens);
    if (match && (best === null || match.score > best.score)) best = match;
  }
  return best;
}

/** Score at or above this takes a field's strong tier. */
const STRONG_SCORE = 90;

/** Places a field match in its tier: title > keywords > description. */
function tieredScore(
  field: "title" | "keyword" | "description",
  score: number,
): number {
  if (field === "description") return 500 + score;
  if (field === "title") return (score >= STRONG_SCORE ? 1200 : 1000) + score;
  return (score >= STRONG_SCORE ? 1100 : 850) + score;
}

/** Best single-field score for one token, used when tokens split across fields. */
function bestFieldScore(page: SitePage, token: string): number | null {
  let best: number | null = null;
  const offer = (score: number) => {
    if (best === null || score > best) best = score;
  };

  const title = matchField(page.title, token);
  if (title) offer(tieredScore("title", title.score));

  for (const keyword of page.keywords) {
    const match = matchField(keyword, token);
    if (match) offer(tieredScore("keyword", match.score));
  }

  const description = matchField(page.description, token, true);
  if (description) offer(tieredScore("description", description.score));

  return best;
}

/**
 * Score for a query whose tokens land in different fields of the page. The
 * weakest token sets it: every token has to match, so the least convincing
 * one is what the page is really worth.
 */
function scatteredScore(page: SitePage, tokens: string[]): number | null {
  let weakest = Number.POSITIVE_INFINITY;
  for (const token of tokens) {
    const score = bestFieldScore(page, token);
    if (score === null) return null;
    weakest = Math.min(weakest, score);
  }
  return weakest;
}

/**
 * Ranks pages against a query, token by token. Tier layout:
 *   1200+ exact/prefix title · 1100+ exact/prefix keyword ·
 *   1000+ weaker title · 850+ weaker keyword · 500+ description
 * Tiers are spaced further apart than any within-field score, so a weak
 * title match still beats a strong description match — but an exact
 * keyword hit outranks a buried mid-word title substring.
 * A match covering every token in one value ("work history" → the
 * Experience page's keyword) outranks the same tokens spread across
 * fields, and a phrase in written order outranks tokens in any order.
 * Descriptions only match at word starts, and tokens of one or two
 * characters only match the start of a title or keyword word, so "now"
 * can't surface "k-now" and "me" can't surface "Home".
 * Title matches come back as ranges so the renderer can highlight them.
 * Returns [] for an empty query (caller should fall back to the
 * default grouped/browse view).
 */
export function rankPages(pages: SitePage[], query: string): RankedPage[] {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];

  const shortQuery = tokens.length === 1 && tokens[0].length <= SHORT_TOKEN_MAX;

  const results: RankedPage[] = [];

  for (const page of pages) {
    const titleMatch = matchAllTokens(page.title, tokens);
    const keywordMatch = matchKeywords(page.keywords, tokens);
    const descriptionMatch = shortQuery
      ? null
      : matchAllTokens(page.description, tokens, true);

    const candidates: number[] = [];
    if (titleMatch) candidates.push(tieredScore("title", titleMatch.score));
    if (keywordMatch) {
      candidates.push(tieredScore("keyword", keywordMatch.score));
    }
    if (descriptionMatch) {
      candidates.push(tieredScore("description", descriptionMatch.score));
    }

    let score: number | null = null;
    if (candidates.length) {
      score = Math.max(...candidates);
    } else if (tokens.length > 1) {
      score = scatteredScore(page, tokens);
    }

    if (score !== null) {
      results.push({ ...page, score, titleMatches: titleMatch?.ranges ?? [] });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Serializes the page list for a JSON data island. Escapes `<` so page
 * copy containing "</script>" can't terminate the script tag early.
 */
export function serializePageData(pages: SitePage[]): string {
  return JSON.stringify(pages).replace(/</g, "\\u003c");
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}
