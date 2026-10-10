export type MediaType = "movie" | "tv";

export interface RecommendationItem {
  tmdbId: number;
  type: MediaType;
  note?: string;
}

// TMDB IDs at https://www.themoviedb.org/
export const recommendations: RecommendationItem[] = [
  { tmdbId: 313101, type: "tv" }, // Musafir Cafe
  { tmdbId: 1443961, type: "movie" }, // Rao Bahadur
  { tmdbId: 61889, type: "tv" }, // Daredevil
  { tmdbId: 1007757, type: "movie" }, // Swapped
  { tmdbId: 1189518, type: "movie" }, // Vaarzha
  { tmdbId: 1022789, type: "movie" }, // Inside out 2
  { tmdbId: 687163, type: "movie" }, // Project hail mary
  { tmdbId: 1136423, type: "movie" }, // Meiyazhagan
  { tmdbId: 37165, type: "movie" }, // The truman show
  { tmdbId: 1136867, type: "movie" }, // Materialists
  { tmdbId: 786345, type: "movie" }, // Viduthalai
  { tmdbId: 122906, type: "movie" }, // About time
  { tmdbId: 80752, type: "tv" }, // See
  { tmdbId: 701387, type: "movie" }, // Bugonia
  { tmdbId: 752, type: "movie" }, // v for vendetta
  { tmdbId: 250658, type: "movie" }, // The internet's own boy: The story of Aaron Swartz
  { tmdbId: 589964, type: "movie" }, // Karuppudurai
  { tmdbId: 95396, type: "tv" }, // severance
  { tmdbId: 1062722, type: "movie" }, // frankenstein
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
