/**
 * Not /uses: what I'd tell someone else to install, whether or not I use it.
 * A MacSet only exists where the apps genuinely replace one another.
 */
export type MacAppPrice =
  "free" | "open-source" | "freemium" | "one-time" | "subscription";

export interface MacApp {
  name: string;
  url: string;
  /** Optional explicit icon, for sites the favicon service does not index. */
  icon?: string;
  /** Light-on-transparent artwork; inverted on light surfaces. */
  ink?: "light";
  /** One line. What it is, and the trade if there is one. */
  why: string;
  price: MacAppPrice;
}

/** Apps that do the same job. The first one is the pick. */
export interface MacSet {
  label: string;
  apps: MacApp[];
}

export type MacEntry = MacApp | MacSet;

export const macList: MacEntry[] = [
  {
    label: "Browsers",
    apps: [
      {
        name: "Helium",
        url: "https://helium.computer/",
        price: "free",
        why: "Chromium minus the noise, with Chromium's appetite for RAM.",
      },
      {
        name: "Ardia",
        url: "https://ardia.dev/",
        price: "open-source",
        why: "Arc's sidebar and Dia's polish, on real Chromium.",
      },
      {
        name: "Search",
        url: "https://searchbrowser.app/",
        price: "open-source",
        why: "The engine already in macOS, in a 10 MB window.",
      },
      {
        name: "Zen",
        url: "https://zen-browser.app/",
        price: "open-source",
        why: "Firefox with a calmer, vertical-tab interface.",
      },
      {
        name: "Firefox",
        url: "https://www.firefox.com/",
        price: "open-source",
        why: "The safe Gecko default. Nothing to learn.",
      },
      {
        name: "Tor Browser",
        url: "https://www.torproject.org/download/",
        price: "free",
        why: "For the days the reason is real. Slow by design.",
      },
    ],
  },
  {
    label: "Launchers",
    apps: [
      {
        name: "Raycast",
        url: "https://www.raycast.com/",
        price: "freemium",
        why: "Apps, files, clipboard, snippets, extensions. The free tier is enough.",
      },
      {
        name: "Tinycast",
        url: "https://tinycast.dev/",
        icon: "https://tinycast.dev/favicon.svg",
        price: "open-source",
        why: "Native launcher under 100 MB of RAM. No account, no telemetry.",
      },
    ],
  },
  {
    label: "Terminals",
    apps: [
      {
        name: "Ghostty",
        url: "https://ghostty.org/",
        price: "open-source",
        why: "Native, fast, and usable without a config file.",
      },
      {
        name: "Rex",
        url: "https://superlogical.com/",
        ink: "light",
        price: "free",
        why: "A multiplexer built around persistent sessions. Still in beta.",
      },
    ],
  },
  {
    name: "Homebrew",
    url: "https://brew.sh/",
    price: "open-source",
    why: "Install this first. Everything else is a command away.",
  },
  {
    name: "zoxide",
    url: "https://github.com/ajeetdsouza/zoxide",
    price: "open-source",
    why: "A cd that learns where you actually go.",
  },
  {
    name: "fzf",
    url: "https://github.com/junegunn/fzf",
    price: "open-source",
    why: "Fuzzy-find history, files, branches. Rewards muscle memory.",
  },
  {
    name: "starship",
    url: "https://starship.rs/",
    price: "open-source",
    why: "A prompt that shows what you need, without dotfile archaeology.",
  },
  {
    name: "lazygit",
    url: "https://github.com/jesseduffield/lazygit",
    price: "open-source",
    why: "Git made visible: staging, rebasing, history.",
  },
  {
    name: "OpenCode",
    url: "https://opencode.ai/",
    price: "open-source",
    why: "My coding agent. Open, model-agnostic, terminal-first.",
  },
  {
    name: "Zed",
    url: "https://zed.dev/",
    ink: "light",
    price: "open-source",
    why: "A fast native editor where AI feels built in.",
  },
  {
    name: "T3 Code",
    url: "https://t3.codes/",
    price: "free",
    why: "The desktop workspace I keep landing on. Young, expect churn.",
  },
  {
    name: "OpenChamber",
    url: "https://openchamber.dev/",
    price: "open-source",
    why: "A control room for watching and reviewing several agents.",
  },
  {
    name: "Herdr App",
    url: "https://herdr.dev/",
    price: "free",
    why: "Agent windows you shape by asking. Opinionated workflow.",
  },
  {
    name: "Syncthing",
    url: "https://syncthing.net/",
    price: "open-source",
    why: "Peer-to-peer file sync. No cloud in the middle.",
  },
  {
    name: "LocalSend",
    url: "https://localsend.org/",
    price: "open-source",
    why: "AirDrop that works with every device you own.",
  },
  {
    name: "OpenMTP",
    url: "https://openmtp.ganeshrvel.com/",
    price: "open-source",
    why: "Android file transfer that doesn't make you give up.",
  },
  {
    name: "Keka",
    url: "https://www.keka.io/",
    price: "free",
    why: "The archiver macOS should have shipped.",
  },
  {
    name: "Obsidian",
    url: "https://obsidian.md/",
    price: "free",
    why: "Markdown notes you own, with as much structure as you want.",
  },
  {
    name: "NetNewsWire",
    url: "https://netnewswire.com/",
    price: "open-source",
    why: "Feeds you chose, in order, with no algorithm.",
  },
  {
    name: "Raindrop.io",
    url: "https://raindrop.io/",
    price: "freemium",
    why: "Where links go instead of forty open tabs.",
  },
  {
    name: "IINA",
    url: "https://iina.io/",
    price: "open-source",
    why: "Plays everything, remembers where you stopped.",
  },
  {
    name: "Cap",
    url: "https://cap.so/",
    price: "open-source",
    why: "Screen recording that produces a link, not a 400 MB file.",
  },
  {
    name: "Transmission",
    url: "https://transmissionbt.com/",
    price: "open-source",
    why: "Small, quiet, and it has never asked me to install anything else.",
  },
  {
    name: "Torrential",
    url: "https://github.com/nexxeln/torrential",
    price: "open-source",
    why: "Find and download torrents without leaving the terminal.",
  },
  {
    label: "Dictation",
    apps: [
      {
        name: "Handy",
        url: "https://handy.computer/",
        icon: "https://handy.computer/favicon.png",
        ink: "light",
        price: "open-source",
        why: "Hold a key, talk, release. Offline.",
      },
      {
        name: "Hex",
        url: "https://anoma.ly/hex/",
        icon: "/assets/img/apps/hex.png",
        price: "open-source",
        why: "Local dictation with custom vocabulary and voice commands.",
      },
    ],
  },
  {
    name: "Mole",
    url: "https://github.com/tw93/Mole",
    price: "open-source",
    why: "Clean caches, uninstall leftovers, and see what is eating your disk.",
  },
  {
    name: "Amphetamine",
    url: "https://apps.apple.com/us/app/amphetamine/id937984704",
    price: "free",
    why: "Keeps the Mac awake while something finishes.",
  },
  {
    name: "KeePassXC",
    url: "https://keepassxc.org/",
    price: "open-source",
    why: "One encrypted password database that you own.",
  },
  {
    name: "Tailscale",
    url: "https://tailscale.com/",
    price: "freemium",
    why: "A private network between your machines in two minutes.",
  },
];
