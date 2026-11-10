import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { TMDB_API_KEY } from "astro:env/server";

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const CACHE_FILE = resolve(process.cwd(), ".cache/tmdb.json");

export interface TMDBMovie {
  mediaType: "movie";
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  year: number;
  /** Full release date, "YYYY-MM-DD" ("" when unknown). */
  releaseDate: string;
  rating: number;
  genres: string[];
  tmdbUrl: string;
}

export interface TMDBShow {
  mediaType: "tv";
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  year: number;
  /** First air date, "YYYY-MM-DD" ("" when unknown). */
  releaseDate: string;
  rating: number;
  genres: string[];
  tmdbUrl: string;
}

export type TMDBMedia = TMDBMovie | TMDBShow;

export interface TMDBPerson {
  id: number;
  name: string;
  profileUrl: string;
  department: string;
  tmdbUrl: string;
}

interface CacheData {
  movies: Record<string, TMDBMovie>;
  shows: Record<string, TMDBShow>;
  persons: Record<string, TMDBPerson>;
}

let _cache: CacheData | null = null;
let _dirty = false;

function getCache(): CacheData {
  if (!_cache) {
    if (existsSync(CACHE_FILE)) {
      try {
        _cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as CacheData;
      } catch {
        _cache = { movies: {}, shows: {}, persons: {} };
      }
    } else {
      _cache = { movies: {}, shows: {}, persons: {} };
    }
  }
  return _cache;
}

export function flushCache(): void {
  if (!_dirty || !_cache) return;
  let existing: CacheData = { movies: {}, shows: {}, persons: {} };
  if (existsSync(CACHE_FILE)) {
    try {
      existing = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as CacheData;
    } catch {
      /* ignore corrupt file */
    }
  }
  const merged: CacheData = {
    movies: { ...existing.movies, ..._cache.movies },
    shows: { ...existing.shows, ..._cache.shows },
    persons: { ...existing.persons, ..._cache.persons },
  };
  mkdirSync(resolve(process.cwd(), ".cache"), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(merged, null, 2));
  _dirty = false;
  console.log("TMDB: cache saved to .cache/tmdb.json");
}

function authHeader() {
  const key = TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set in your .env file.");
  return { Authorization: `Bearer ${key}` };
}

export async function getMovieById(id: number): Promise<TMDBMovie | null> {
  const cache = getCache();
  if (cache.movies[id]) {
    console.log(`TMDB: movie ${id} → cache hit`);
    return cache.movies[id];
  }

  try {
    const res = await fetch(`${BASE_URL}/movie/${id}`, {
      headers: authHeader(),
    });
    if (!res.ok) {
      console.error(`TMDB: movie ${id} → HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const movie: TMDBMovie = {
      mediaType: "movie",
      id: data.id,
      title: data.title,
      overview: data.overview,
      posterUrl: data.poster_path ? `${IMG_BASE}${data.poster_path}` : "",
      year: data.release_date ? parseInt(data.release_date.slice(0, 4)) : 0,
      releaseDate: data.release_date ?? "",
      rating: Math.round(data.vote_average * 10) / 10,
      genres:
        data.genres?.slice(0, 3).map((g: { name: string }) => g.name) ?? [],
      tmdbUrl: `https://www.themoviedb.org/movie/${data.id}`,
    };
    cache.movies[id] = movie;
    _dirty = true;
    return movie;
  } catch (err) {
    console.error(`TMDB: getMovieById(${id}) failed:`, err);
    return null;
  }
}

export async function getShowById(id: number): Promise<TMDBShow | null> {
  const cache = getCache();
  if (cache.shows[id]) {
    console.log(`TMDB: show ${id} → cache hit`);
    return cache.shows[id];
  }

  try {
    const res = await fetch(`${BASE_URL}/tv/${id}`, {
      headers: authHeader(),
    });
    if (!res.ok) {
      console.error(`TMDB: show ${id} → HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const show: TMDBShow = {
      mediaType: "tv",
      id: data.id,
      title: data.name,
      overview: data.overview,
      posterUrl: data.poster_path ? `${IMG_BASE}${data.poster_path}` : "",
      year: data.first_air_date ? parseInt(data.first_air_date.slice(0, 4)) : 0,
      releaseDate: data.first_air_date ?? "",
      rating: Math.round(data.vote_average * 10) / 10,
      genres:
        data.genres?.slice(0, 3).map((g: { name: string }) => g.name) ?? [],
      tmdbUrl: `https://www.themoviedb.org/tv/${data.id}`,
    };
    cache.shows[id] = show;
    _dirty = true;
    return show;
  } catch (err) {
    console.error(`TMDB: getShowById(${id}) failed:`, err);
    return null;
  }
}

export async function getPersonById(id: number): Promise<TMDBPerson | null> {
  const cache = getCache();
  if (cache.persons[id]) {
    console.log(`TMDB: person ${id} → cache hit`);
    return cache.persons[id];
  }

  try {
    const res = await fetch(`${BASE_URL}/person/${id}`, {
      headers: authHeader(),
    });
    if (!res.ok) {
      console.error(`TMDB: person ${id} → HTTP ${res.status}`);
      return null;
    }
    const person = await res.json();

    const tmdbPerson: TMDBPerson = {
      id: person.id,
      name: person.name,
      profileUrl: person.profile_path
        ? `${IMG_BASE}${person.profile_path}`
        : "",
      department: person.known_for_department ?? "",
      tmdbUrl: `https://www.themoviedb.org/person/${person.id}`,
    };
    cache.persons[id] = tmdbPerson;
    _dirty = true;
    return tmdbPerson;
  } catch (err) {
    console.error(`TMDB: getPersonById(${id}) failed:`, err);
    return null;
  }
}
