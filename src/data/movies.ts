export type MediaType = "movie" | "tv";

export interface RecommendationItem {
  tmdbId: number;
  type: MediaType;
  note?: string;
}

export interface MonthGroup {
  /** e.g. "2026-02" */
  monthId: string;
  /** Human-readable label shown in the tab, e.g. "February 2026" */
  label: string;
  items: RecommendationItem[];
}

// TMDB IDs at https://www.themoviedb.org/
export const recommendations: MonthGroup[] = [
  {
    monthId: "2026-04",
    label: "April 2026",
    items: [
      { tmdbId: 980477, type: "movie" }, // ne zha 2
      { tmdbId: 1136423, type: "movie" }, // Meiyazhagan
      { tmdbId: 1473354, type: "movie" }, // Sarvam maya
      { tmdbId: 84105, type: "tv" }, // Mirzapur
    ],
  },
  {
    monthId: "2026-03",
    label: "March 2026",
    items: [
      { tmdbId: 37165, type: "movie" }, // The truman show
      { tmdbId: 1136867, type: "movie" }, // Materialists
      { tmdbId: 786345, type: "movie" }, // Viduthalai
      { tmdbId: 1368166, type: "movie" }, // The housemaid
    ],
  },
  {
    monthId: "2026-02",
    label: "February 2026",
    items: [
      { tmdbId: 122906, type: "movie" }, // About time
      { tmdbId: 80752, type: "tv" }, // See
      { tmdbId: 701387, type: "movie" }, // Bugonia
      { tmdbId: 752, type: "movie" }, // v for vendetta
    ],
  },
  {
    monthId: "2026-01",
    label: "January 2026",
    items: [
      { tmdbId: 250658, type: "movie" }, // The internet's own boy: The story of Aaron Swartz
      { tmdbId: 589964, type: "movie" }, // Karuppudurai
      { tmdbId: 95396, type: "tv" }, // severance
      { tmdbId: 1062722, type: "movie" }, // frankenstein
    ],
  },
];

export const watchlist: { tmdbId: number; type: MediaType }[] = [
  { tmdbId: 976121, type: "movie" }, // Romancham
  { tmdbId: 1317288, type: "movie" }, // Marty supreme
  { tmdbId: 1272837, type: "movie" }, // The bone temple
  { tmdbId: 1411, type: "tv" }, // Person of interest
  { tmdbId: 1582770, type: "movie" }, // Dhurandhar: The Revenge
];

export const favoriteActors: number[] = [
  85034, // Ranbir Kapoor
  1115225, // dulquer-salmaan
  119891, // Puri Jagannadh
  108215, // Allu Arjun
  1473119, // Sai Pallavi
  1072750, // Fahadh Faasil
  90633, // Gal Gadot
  1123766, //Vijay Sethupathi
  123066, // Karthi
  10859, // Ryan Reynolds
];
