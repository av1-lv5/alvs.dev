---
id: "personal-site"
title: "alvs.dev"
description: "A minimalist digital garden and portfolio."
tags: ["astro"]
repoId: "personal-site-archive"
isDraft: false
featured: false
---

### The Philosophy

The site uses a classless stylesheet as a foundation to ensure semantic HTML looks good by default, layered with custom scoped styles only when specific structural patterns are needed.

### Design Decisions: The Classless Journey

The decision to start with a **classless stylesheet** was about reducing the mental overhead of styling basic elements (like headings, lists, and links). It forces a focus on semantic HTML and content hierarchy.

My journey into this approach began with discovering **Simple.css**, not as a heavy framework, but as an introduction to the concept that a pure stylesheet can create a functional, readable site with zero classes.

However, I don't use it exclusively. While the classless base handles the "look" of individual elements, I utilize **Astro's scoped styles** to build intentional layout structures, without polluting a global stylesheet.

### Why Astro?

I started as a pure HTML, CSS, and JS developer. Eventually I started looking at static site generators like Hugo, Eleventy, Gatsby, Jekyll. Too many options, and I never finished anything real with any of them. Just tutorials.

My vision for the site was still forming, and I didn't want to commit to a stack. So I stayed skeptical.

Then I heard about Astro. No framework lock-in. The syntax read like HTML. I tried porting my own site over to get hands-on and god, did I love it.

### The Evolution (Archives)

1. **The Hardcoded Start**: A single-page HTML monolith.
2. **The Gulp Era (2022)**: Using Pug templating and Gulp for source management.
3. **The Classless Introduction**: Discovering pure stylesheets (Simple.css) and adopting a minimal-first mindset.
4. **The Custom Standard (2025)**: Developing the current hybrid approach of classless base styles combined with custom scoped structures.

### Future Roadmap

A lot of ideas, some will change along the way:

- Longer, more substantial notes
- More HTML, CSS, and JS experiments in the lab
- Webmentions
- A guestbook
- A gallery for random pictures I take

This site is going to be a real digital garden of my own by the time I reach old age, for sure.
