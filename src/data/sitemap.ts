export interface SitemapItem {
  href: string;
  label: string;
  description: string;
}

export interface SitemapSection {
  title: string;
  items: SitemapItem[];
}

export const sitemapSections: SitemapSection[] = [
  {
    title: "Main",
    items: [
      { href: "/", label: "Home", description: "Start here." },
      {
        href: "/about/",
        label: "About",
        description: "Who I am, what I care about.",
      },
      {
        href: "/now/",
        label: "Now",
        description: "What I'm currently focused on.",
      },
      {
        href: "/connect/",
        label: "Connect",
        description: "Ways to reach me.",
      },
    ],
  },
  {
    title: "Work",
    items: [
      {
        href: "/hire-me/",
        label: "Resume",
        description:
          "My experience, past projects, and what I'm looking for.",
      },
      {
        href: "/projects/",
        label: "Projects",
        description: "Things I've built.",
      },
      {
        href: "/lab/",
        label: "Lab",
        description: "A personal playground for curiosity-driven builds.",
      },
      {
        href: "/experience/",
        label: "Experience",
        description: "Timeline of my professional journey.",
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
      },
      { href: "/books/", label: "Books", description: "What I've read." },
      {
        href: "/echoes/",
        label: "Echoes",
        description: "Lines that feel close.",
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
      },
      {
        href: "/movies/",
        label: "Movies",
        description: "Movies I recommend to watch.",
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
      },
      {
        href: "/uses/",
        label: "Uses",
        description: "My gear, tools, and daily software.",
      },
      {
        href: "/feeds/",
        label: "Feeds",
        description: "RSS feeds I subscribe to.",
      },
      {
        href: "/colophon/",
        label: "Colophon",
        description: "How this site is built.",
      },
    ],
  },
];
