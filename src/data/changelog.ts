export type MonthEntry = {
  title?: string;
  content: string;
};

export type Changelog = {
  [year: number]: {
    [month: number]: MonthEntry;
  };
};

export const changelog: Changelog = {
  2026: {
    2: {
      title: "The productive one",
      content:
        "Easily the busiest month since the redesign. There's now a canvas runner game living in the footer (yes, that's a real thing you can play). The experience section got collapsible points so it's less of a wall of text. GoatCounter analytics and Open Graph metadata went in, which means the site now shows up nicely when shared. A GitHub commit graph made the cut too. Font switched to Geist, which feels much sharper. Also quietly squashed a handful of mobile layout bugs that had been bothering me.",
    },
    1: {
      title: "Torn it down and rebuilt it",
      content:
        "January was a full reset. The old stylesheet got scrapped in favor of a new minimal one with a proper typographic scale. The projects page was rebuilt from scratch with a cleaner layout and no filter gimmicks. The header now has an interactive animated cube in place of the old static logo, which sounds unnecessary but is oddly satisfying. Dark/light mode support went in, along with a theme toggle for both desktop and mobile. Renamed Contact to Connect because that's a more honest name for it.",
    },
  },
  2025: {
    12: {
      title: "Reading list and docs",
      content:
        "Added a Books page, a simple reading log of what I've actually been getting through, not a curated aesthetic shelf. Also cleaned up the Audiophile project documentation, which had been sitting in a rough state for too long.",
    },
    7: {
      title: "Skills update",
      content:
        "Updated the skills and tools section to better reflect what I actually use day-to-day rather than what sounds impressive. Small change, but a more honest one.",
    },
  },
  2024: {
    3: {
      title: "Upkeep",
      content:
        "A quiet month. A few small things got adjusted behind the scenes, nothing you'd notice unless you were looking for it, but the kind of upkeep that keeps things from quietly falling apart.",
    },
    1: {
      title: "Astro 4",
      content:
        "Migrated the site from Astro 2.5 to 4.1. Completely invisible from the outside, but a meaningful upgrade under the hood. Took the opportunity to clear out some build issues that had been lingering since the initial setup.",
    },
  },
  2023: {
    10: {
      title: "Early days",
      content:
        "The beginning. Updated the skills list, adjusted a few project schemas, and fixed a nav highlight bug that only appeared in Chromium-based browsers. The usual early site housekeeping, nothing exciting, just making sure the foundations were solid.",
    },
  },
};
