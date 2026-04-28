---
id: orbit
title: Orbit
description: "A daily budgeting app built around one number: how much you can safely spend today."
tags: ["next", "typescript", "supabase"]
repoId: ""
liveAt: "orbitbudget.com"
isDraft: false
featured: true
---

![Project preview](/assets/img/orbit-thumb.png)

### The Problem

Most budgeting apps are concentrated on where money is going, after you've already spent. You don't see impact of overspending until its too late.

And the overhead of organisation hell categories, tags, custom fields.

Orbit solves a simpler, more urgent problem:

**"How much can I safely spend today and know the impact of overspending instantly?"**

### The solution

Orbit is a daily budgeting app built around one number: your **safe-to-spend today** amount.

Set a monthly budget (or custom duration), log expenses as you spend, and Orbit recalculates your available amount in real time - for today and for every remaining day in the cycle.

- **Underspend today?** The extra is redistributed across the remaining days.
- **Overspend today?** Tomorrow’s allowance adjusts automatically.
- **Stay on streak.** The app tracks your on-budget days and success rate - a quiet motivator.
- **Daily reminders.** Set a time to be nudged if you haven't logged anything yet that day.
- **Export your data.** Every expense and budget cycle, exportable as JSON or CSV.
- **No categories. No bank sync. No charts.** Just minimal, fast, low-friction budgeting.

The goal is not financial analytics. It's staying within your limits with minimal effort.

### Engineering

Building Orbit was a deep dive into **product reasoning** and pushing the web platform to its limits.

- **Logic over CRUD** The core of the app isn't just saving and retrieving data, it's the calculation that 
handles overspending, carries totals forward, and adjusts for varying budget cycles.
- **Offline-first** The app is fully functional without a network connection. Expenses can be created, edited, and budgets managed entirely offline. All writes go into an IndexedDB queue and sync to the server the moment connectivity returns.
- **PWA** installable on any mobile device, opens from desktop, and ships a single codebase. The next step is distributing it on the Google Play Store using the process called [Trusted Web Activity (TWA)](https://developers.google.com/codelabs/pwa-in-play#0)
- **Push notifications via GCM** Daily reminders use Google Cloud Messaging. If no expense has been logged by the user's set time, a push notification fires.
- **Custom Auth flows**: Instead of using Clerk's pre-built UIs, I implemented custom auth flows using their SDK, not just to have full control over the user experience and branding, but also to understand auth flows.
- **Product-led Development** Designed the product, UX, database structure, and user flows end-to-end from concept to production.

### Technical sheet

- Built with Next.js, Typescript and Tailwind css
- Shadcn UI and Motion
- Auth handled by clerk, and managed postgres by supabase
- Deployed on Vercel

### Future Roadmap

- Collaborative budgets
- Goals
- [Adding PWA to google play](https://developers.google.com/codelabs/pwa-in-play#0)
