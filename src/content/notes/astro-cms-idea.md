---
title: "An astro cms that doesn't exist yet"
tags: [""]
draft: false
---

I wanted to do few content updates recently, my now page, update watchlist, update feeds. Just a couple lines. Ended up opening VS Code, editing the files, writing a commit message, pushing, and publishing.

That got me thinking.

I looked at headless cms options. Notion, Sanity, the usual. They all solve the problem but they also introduce an account, an API key, a third party I now depend on forever. Feels like a lot of surface area for what is basically a personal blog.

Turso caught my attention because the data actually lives close to the project. But then I realized there's no editing UI. You'd be writing SQL to change what you're currently reading. That's not better, that's just a different kind of bad.

So I started wondering what the obvious thing in the middle would look like.

An Astro integration. You install it, point it at your content collections or Astro DB schema, and it reads the schema and generates an admin UI automatically. Lives at /admin or wherever you configure it. No separate server, no external service, just a route inside your own project.

Astro DB already uses libsql under the hood so Turso fits naturally as the backend. Most of the plumbing is already there.

The schema does the heavy lifting. A collection with a title and markdown body field gives you a text input and a markdown editor. A table with a number and an enum gives you the right form controls. No configuration beyond pointing at the schema.

In dev it just works. In production you'd put it behind basic auth or disable it entirely for static builds and trigger a rebuild when you want fresh content.

I don't know why this doesn't exist. Maybe TypeScript schema introspection is messier than it looks. Maybe auth makes the scope balloon. Maybe nobody has needed it badly enough to build it, or maybe the Astro ecosystem is just young.

Or maybe the honest answer is that for a personal site, editing a file is still the right call and I'm overcomplicating it.

Still. Feels like a gap.
