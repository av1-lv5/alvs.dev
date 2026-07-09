const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const TOP_ARTISTS_ENDPOINT = "https://api.spotify.com/v1/me/top/artists";
const TOP_TRACKS_ENDPOINT = "https://api.spotify.com/v1/me/top/tracks";

export interface SpotifyArtist {
  id: string;
  name: string;
  url: string;
  image: string;
  genres: string[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  url: string;
  image: string;
  artists: string[];
  previewUrl: string | null;
}

async function getAccessToken(): Promise<string> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    import.meta.env;

  const basic = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    throw new Error("SPOTIFY_UNAVAILABLE");
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function getTopArtists(limit = 10): Promise<SpotifyArtist[]> {
  const token = await getAccessToken();

  const url = new URL(TOP_ARTISTS_ENDPOINT);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("time_range", "short_term");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("SPOTIFY_UNAVAILABLE");
  }

  const data = await res.json();

  return data.items.map((artist: any) => ({
    id: artist.id,
    name: artist.name,
    url: artist.external_urls.spotify,
    image: artist.images[0]?.url ?? "",
    genres: artist.genres.slice(0, 2),
  }));
}

export async function getTopTracks(limit = 10): Promise<SpotifyTrack[]> {
  const token = await getAccessToken();

  const url = new URL(TOP_TRACKS_ENDPOINT);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("time_range", "short_term");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("SPOTIFY_UNAVAILABLE");
  }

  const data = await res.json();

  return data.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    url: track.external_urls.spotify,
    image: track.album.images[0]?.url ?? "",
    artists: track.artists.map((a: any) => a.name),
    previewUrl: track.preview_url,
  }));
}
