export interface PodcastItem {
  itunesId: number;
  description: string;
  spotify: string;
  website?: string;
  youtube?: string;
}

// iTunes ID: https://itunes.apple.com/lookup?id=<itunesId>
export const podcasts: PodcastItem[] = [
  {
    itunesId: 1474429475,
    description: "Tech and gadget talk from the MKBHD crew.",
    spotify: "https://open.spotify.com/show/6o81QuW22s5m2nfcXWjucc",
    youtube: "https://www.youtube.com/@Waveform",
  }, // Waveform: The MKBHD Podcast
  {
    itunesId: 1253186678,
    description: "Web dev tips from two people who actually ship code.",
    spotify: "https://open.spotify.com/show/4kYCRYJ3yK5DQbP5tbfZby",
    website: "https://syntax.fm/",
    youtube: "https://www.youtube.com/@syntaxfm",
  }, // Syntax
  {
    itunesId: 1296350485,
    description: "True stories from the dark side of the internet.",
    spotify: "https://open.spotify.com/show/4XPl3uEEL9hvqMkoZrzbx5",
    website: "https://darknetdiaries.com/",
    youtube: "https://www.youtube.com/@JackRhysider",
  }, // Darknet Diaries
  {
    itunesId: 1666577596,
    description: "Telugu business talk, unscripted.",
    spotify: "https://open.spotify.com/show/4dGamU5NVgxAgg85iNHVVN",
    website: "https://www.rawtalks.in/",
    youtube: "https://www.youtube.com/@rawtalkswithvk",
  }, // Raw Talks with Vamshi
  {
    itunesId: 1049420219,
    description: "Stories of hacks, scams, and things gone sideways online.",
    spotify: "https://open.spotify.com/show/21zZfOy7VCSIIWlJ64DElv",
    youtube: "https://www.youtube.com/@hackedpodcast",
  }, // Hacked
  {
    itunesId: 1522708820,
    description: "Unfiltered thoughts from the Telugu filmmaker.",
    spotify: "https://open.spotify.com/show/64lpnDBikZbmPvBuezUesz",
    youtube: "https://www.youtube.com/user/purijagannadh",
  }, // Puri Jagannadh
];
