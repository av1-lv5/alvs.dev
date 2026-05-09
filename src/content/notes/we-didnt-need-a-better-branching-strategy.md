---
title: "We didn't need a better branching strategy"
tags: ["git"]
publishedAt: "2026-03-09"
draft: false
---

_I didn't follow a textbook workflow. Read everything, and choose the bits that suit._

When I was working solo, git was almost too simple. Branch when I felt like it, push straight to main, deploy. I kept a `staging` branch for the client to poke around, merge to main when everything looked good. No conflicts, no drama.

Working along a dev, changed almost nothing. We naturally picked different areas of the codebase so overlaps were rare. We stopped pushing directly to main and staging became a proper safety net rather than just a client preview link.

Four devs moving fast on the same codebase was where "just coordinate verbally" started cracking.

We looked at the established models. [GitHub Flow &#x2197;](https://docs.github.com/en/get-started/using-github/github-flow) with PRs straight to main had no staging gate, and our manager needed a live URL to test before anything went to production. [Git Flow &#x2197;](https://nvie.com/posts/a-successful-git-branching-model/) with develop and release branches felt too ceremonial for four people who pushes updates daily that needs to get live often. [Trunk-Based Development &#x2197;](https://trunkbaseddevelopment.com/) with feature flags introduced overhead we had no reason to take on. Our features are mostly tiny, refactor things on a whim, fixing bugs on the fly.

So we shaped something from the parts that made sense.

Two long-lived branches, `main` and `staging`. Everything else is short-lived. Feature branches off main, hotfix branches off main. You finish a feature, merge it to staging for the client to test. Once approved, you open a PR from the feature branch directly to main, not from staging. That last part mattered. Staging is shared and can have half-approved things sitting in it. You never want staging to become main.

It worked. For a while.

The problem that crept up was staging drift. Over time staging would accumulate unapproved features from different developers and become a version of the codebase that didn't exist anywhere else. The client would test something in staging that was actually three features layered on top of each other with one of them being unfinished. Testing became unreliable. We'd reset staging every sprint with a force push back to main, which works but is its own kind of friction.

The real issue was that we were using one shared staging environment to do a job it wasn't designed for. We needed isolation per feature, not one shared branch where everything piled up.

After a month of patching around this, we enabled preview deployments. Every feature branch now gets its own live URL automatically. The client tests the feature in isolation, not mixed in with everything else. Staging drift stopped being a problem because staging stopped being the point where everything converged.

That was the actual fix. Not a better branching strategy. Just removing the constraint that forced everything through one shared environment.
