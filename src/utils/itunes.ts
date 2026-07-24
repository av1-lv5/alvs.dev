const LOOKUP_URL = "https://itunes.apple.com/lookup";

export interface ItunesPodcast {
  name: string;
  host: string;
  artworkUrl: string;
  feedUrl: string;
  appleUrl: string;
}

export async function getPodcastByItunesId(
  id: number,
): Promise<ItunesPodcast | null> {
  try {
    const res = await fetch(`${LOOKUP_URL}?id=${id}&entity=podcast`);
    if (!res.ok) {
      console.error(`iTunes: podcast ${id} → HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    return {
      name: result.collectionName,
      host: result.artistName,
      artworkUrl: result.artworkUrl600,
      feedUrl: result.feedUrl,
      appleUrl: result.collectionViewUrl,
    };
  } catch (err) {
    console.error(`iTunes: getPodcastByItunesId(${id}) failed:`, err);
    return null;
  }
}
