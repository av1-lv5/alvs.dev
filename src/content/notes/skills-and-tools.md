---
title: "Skills I've picked in my journey as Developer"
tags: [""]
draft: false
---

_A detailed and exhaustive list of skills I have and tools I use, told as a journey that began back in 2021_

### The basics

I wanted to be a frontend web developer, so HTML, CSS, and JavaScript were non-negotiable starting points. Git came along early too, though for a long time it was just commits to main with no real branching strategy. That changed later.

The early days involved some interesting detours. I wanted reusable HTML components before I understood what frameworks were, so I landed on Pug as a templating language and Gulp as a task runner, with BrowserSync for local dev. It worked, and I learned more from that setup than I expected.

I switched to PNPM for package management because my MacBook is the base variant and storage is genuinely an issue. Disk efficiency matters when you have fifteen projects installed.

Prettier and ESLint were extensions in VS Code from the start. Their configs were never touched.

### Graduating to web apps

When I started building things with more moving parts, TypeScript and React became necessary. I badly wanted to learn Svelte instead since it was the exciting new thing at the time, but React had more professional opportunities, so that settled it.

Vite was the build tool choice because it works across frameworks. If I ever switched to Svelte, the tool wouldn't change. I never touched Create React App.

I tried SCSS and CSS-in-JS but the effort-to-benefit ratio never convinced me. Tailwind clicked immediately and the DX improvement was obvious from the first day.

### Urge to showcase talent

Building apps is one thing, shipping them is another. Netlify was home for most projects and still feels that way. Vercel came later for some.

Meta-frameworks made sense once I started doing marketing sites, since SPAs aren't great for that. Next.js was the practical choice. Then I tried Astro because its core ideas, framework agnostic, static first, matched how I wanted to work. This site is built with Astro. There's no going back.

Radix UI led me to Shadcn, which then introduced me to React Hook Form, Zod, and Recharts in quick succession. One library opened the door to the next.

The one that genuinely surprised me was React Query. When I implemented infinite scroll pagination with it and saw how much code just disappeared, I became a fan of Tanner Linsley's work. Still am.

### Towards full-stack with service integrations

Sanity was my first real headless CMS experience and I loved it. For databases, I chose Supabase over Firebase because it's Postgres-based and the absence of vendor lock-in matters to me. Clerk became the default for user management, mostly because of its generous free tier.

### My time at a startup

This phase was dense. We handled a lot of user-submitted images through Cloudinary, built internal tooling on Cloudflare R2, and I learned Razorpay standard checkout for payments because it gives you the best visibility into dropouts and failures over something like button implementation. Typesense was already in the codebase for search, so I had to get familiar with it fast.

Analytics was split across Mixpanel, Google Analytics, and Clarity. Playing with that data was genuinely fun, more than I expected.

Most of my work at the startup revolved around an interactive map, so Mapbox and the Google Maps JS API became very familiar territory. That work opened up the world of GIS: KML, KMZ, GeoJSON, the differences between vector and raster tiles. Things I didn't know existed before that job.

_All of this was shaped by a manager who researched and picked great tools. It made a real difference._

### Filling the gaps

Postman served for a long time, and I mean actually using it: collections, environment variables, documentation, not just firing off requests. 

React Email was a revelation when I discovered that HTML emails are not the HTML you write for the web. The email client compatibility issues are a different kind of pain. Haven't shipped it in production yet but the DX is excellent. Resend from the same team solved my email related basics.

Motion (formerly Framer Motion) for animations. I thought about learning GSAP but Framer was the simpler on-ramp.

I was interested in Bash scripting but never got very good at it. With AI I now prompt for scripts when I need them and it works well enough for the automation tasks I actually run into.

### And this is where I am now

Payload CMS with MongoDB for code-first CMS work. PostHog for product analytics, I can't do it justice in a line, just look it up. Biome with Ultracite to replace ESLint and Prettier. Bruno replacing Postman.

### The workshop

Antigravity is my primary editor, with occasional switches back to Cursor. I've tried Zed, and Kiro. None of them grew on me, but I might revisit them later.

Using Claude Code for a long time. Codex is starting to look interesting.

Figma for design and wireframing, Excalidraw when I need something faster, Mermaid when I'm thinking through logic in a dev context.

On the OS side: efficient on both Mac and Linux. My Linux distro journey went Ubuntu (GNOME) -> Linux Mint (Cinnamon) -> Garuda (Dr460nized) -> Fedora (GNOME).
