export interface UseItem {
  name: string;
  description: string;
  link?: string;
}

export interface UseCategory {
  title: string;
  items: UseItem[];
}

export const uses: UseCategory[] = [
  {
    title: "Hardware",
    items: [
      {
        name: "MacBook Air (M1, 2020)",
        description:
          "My only machine. Still incredibly fast and portable for everything I do.",
        link: "https://www.apple.com/macbook-air/",
      },
    ],
  },
  {
    title: "Development",
    items: [
      {
        name: "Antigravity",
        description: "My primary code editor, for now.",
        link: "https://antigravity.google",
      },
      {
        name: "Claude Code",
        description:
          "My AI pair partner for when I want to move fast and solve complex problems.",
        link: "https://claude.ai/",
      },
      {
        name: "Ghostty",
        description: "Smooth, fast, and stays out of the way.",
        link: "https://ghostty.org/",
      },
      {
        name: "Arc",
        description: "My main browser, helps keep my tabs organized.",
        link: "https://arc.net/",
      },
    ],
  },
  {
    title: "Productivity & Notes",
    items: [
      {
        name: "Obsidian",
        description:
          "Where all my long-form thoughts, learning notes, and project ideas live.",
        link: "https://obsidian.md/",
      },
      {
        name: "Anytype",
        description:
          "A local-first personal database for tracking contacts, companies, and freelance clients.",
        link: "https://anytype.io/",
      },
      {
        name: "Todoist",
        description:
          "A simple way to keep track of tasks and make sure nothing falls through the cracks.",
        link: "https://todoist.com/",
      },
      {
        name: "Raindrop.io",
        description:
          "How I manage the endless stream of interesting links I find every day.",
        link: "https://raindrop.io/",
      },
      {
        name: "Raycast",
        description:
          "The command center for my Mac. I use it for quick actions without moving away from my focus.",
        link: "https://www.raycast.com/",
      },
      {
        name: "AntennaPod",
        description:
          "The feature rich podcast manager for Android. Simple, no tracking, no algorithms.",
        link: "https://antennapod.org/",
      },
      {
        name: "Elk.zone",
        description: "A nimble web client for Mastodon.",
        link: "https://elk.zone/",
      },
      {
        name: "Thunderbird",
        description:
          "The 'old reliable' for email. It's open-source and just works.",
        link: "https://www.thunderbird.net/",
      },
    ],
  },
  {
    title: "Security & Utilities",
    items: [
      {
        name: "KeePass (XC & DX)",
        description:
          "Local-first password management using KeePassXC on desktop and KeePassDX on mobile.",
        link: "https://keepassxc.org/",
      },
      {
        name: "Syncthing",
        description: "For continuous file synchronization between my devices.",
        link: "https://syncthing.net/",
      },
      {
        name: "Droid-ify",
        description:
          "A fast, Material F-Droid client for Android to manage open-source apps.",
        link: "https://github.com/Droid-ify/Droid-ify",
      },
      {
        name: "Ente Photos",
        description:
          "Feature-rich, end-to-end encrypted photo storage. Open-source and fully private.",
        link: "https://ente.io/",
      },
      {
        name: "Crypt.ee",
        description: "Private, encrypted storage for photos and documents.",
        link: "https://crypt.ee/",
      },
    ],
  },
];
