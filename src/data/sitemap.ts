export interface SitemapItem {
  href: string;
  label: string;
  description: string;
  /** Alternate names this page should surface for in search. */
  keywords?: string[];
}

export interface SitemapSection {
  title: string;
  items: SitemapItem[];
}

export const sitemapSections: SitemapSection[] = [
  {
    title: "Main",
    items: [
      {
        href: "/",
        label: "Home",
        description: "Start here.",
        keywords: ["start", "landing", "intro"],
      },
      {
        href: "/about/",
        label: "About",
        description: "Who I am, what I care about.",
        keywords: ["bio", "who am i", "me"],
      },
      {
        href: "/now/",
        label: "Now",
        description: "What I'm currently focused on.",
        keywords: ["currently", "today", "updates", "activity"],
      },
      {
        href: "/connect/",
        label: "Connect",
        description: "Ways to reach me.",
        keywords: ["contact", "email", "social", "reach me"],
      },
    ],
  },
  {
    title: "Work",
    items: [
      {
        href: "/hire-me/",
        label: "Resume",
        description: "My experience, past projects, and what I'm looking for.",
        keywords: ["hire me", "cv", "work with me", "job", "recruiter"],
      },
      {
        href: "/projects/",
        label: "Projects",
        description: "Things I've built.",
        keywords: ["portfolio", "builds", "apps", "things i've built"],
      },
      {
        href: "/lab/",
        label: "Lab",
        description: "A personal playground for curiosity-driven builds.",
        keywords: ["playground", "experiments", "toys"],
      },
      {
        href: "/experience/",
        label: "Experience",
        description: "Timeline of my professional journey.",
        keywords: ["career", "work history", "jobs", "timeline"],
      },
    ],
  },
  {
    title: "Writing & Reading",
    items: [
      {
        href: "/notes/",
        label: "Notes",
        description: "A scratchpad, made presentable.",
        keywords: ["blog", "posts", "thoughts", "scratchpad"],
      },
      {
        href: "/books/",
        label: "Books",
        description: "What I've read.",
        keywords: ["reading", "library", "reviews", "what i've read"],
      },
      {
        href: "/echoes/",
        label: "Echoes",
        description: "Lines that feel close.",
        keywords: ["quotes", "favorites", "lines"],
      },
    ],
  },
  {
    title: "Interests",
    items: [
      {
        href: "/music/",
        label: "Music",
        description: "What I've been listening to.",
        keywords: ["songs", "listening", "playlists", "albums"],
      },
      {
        href: "/movies/",
        label: "Movies",
        description: "Movies I recommend to watch.",
        keywords: ["films", "cinema", "watchlist", "recommendations"],
      },
      {
        href: "/podcasts/",
        label: "Podcasts",
        description: "Shows worth the commute, and a queue that keeps growing.",
        keywords: ["shows", "audio", "listen", "commute"],
      },
    ],
  },
  {
    title: "Backstage",
    items: [
      {
        href: "/changelog/",
        label: "Changelog",
        description: "Updates and changes to this site.",
        keywords: ["updates", "site changes", "history", "releases"],
      },
      {
        href: "/uses/",
        label: "Uses",
        description: "My gear, tools, and daily software.",
        keywords: ["gear", "setup", "tools", "equipment", "daily software"],
      },
      {
        href: "/workflow/",
        label: "Workflow journal",
        description: "Dated notes on the tools and setups I have tried.",
        keywords: ["workflow", "journal", "log", "tool history", "experiments"],
      },
      {
        href: "/radar/",
        label: "Radar",
        description: "Every technology I know, want to learn, or am watching.",
        keywords: ["technologies", "tech", "skills", "learning", "watching"],
      },
      {
        href: "/feeds/",
        label: "Feeds",
        description: "RSS feeds I subscribe to.",
        keywords: ["rss", "subscriptions", "blogs"],
      },
      {
        href: "/colophon/",
        label: "Colophon",
        description: "How this site is built.",
        keywords: ["built with", "how this site is built", "tech stack"],
      },
    ],
  },
];
