---
title: "Learning what I'll never write"
tags: ["learning", "ai", "engineering"]
description: "I stopped hand-coding most things, and somehow ended up reading the internals more than ever. I think I know why, but I'm not sure it's working."
publishedAt: "2026-11-21"
draft: false
---

_A lot of my day is describing features and reviewing what comes back. Meanwhile I'm watching deep dives on things I'll probably never implement._

I don't write most of the code anymore. I describe the feature, argue about the architecture, plan the edges, and let the agents do the implementation. It's a strange place to be, and stranger still that I spend my waiting time watching tutorials about things I already use.

It isn't nostalgia for writing code, and it isn't fear about being replaced. The part of this work I actually liked was never the typing. It was finding out how the things I use every day really work.

### The eye

Before I learnt to build for the web, I only had a user's view of software.

I saw a search bar. Now I see focus management, and I know that `ctrl+k` will probably open it before I try, because most apps implement it the same standard way. I looked at mobile apps with no idea what they were made with. Now I can usually tell a Flutter app from a native one. If a site showed an image with no download button, I used to screenshot it. Now I open the network tab and take the file itself.

None of those apps changed. What changed is my ability to read them.

The example that stuck with me is security. Plenty of people think leaving a laptop unlocked for ten minutes is fine, because they think the worst case is someone snooping through their tabs. It isn't. Someone can lift the session out of that browser and sign into the account from another machine without ever knowing the password. That's not snooping, that's taking the identity, and it takes less time than a coffee refill. I only understood that after learning how cookies, tokens, and server-side sessions fit together. It will never appear in my project work, and it's some of the most useful knowledge I have.

### Patterns are the point

I use Supabase. Understanding Postgres is better, and not because I plan to migrate. Supabase is a product and its list of capabilities. Postgres is the model underneath it: why indexes help and when they become the problem, how transactions and isolation levels behave, why a query that looks fine takes four seconds, when a rule belongs in the database instead of the application.

The tool gives you one way. The principle gives you a vocabulary of alternatives.

That's what pulls you off the standard answer. If I've seen enough patterns, I can approach a problem in a way that isn't the default, and notice when the problem itself was framed wrong. That second one matters more than a bad implementation, because a bad implementation you can fix, and a misunderstood problem you'll fix three times.

I don't think this can be outsourced. An agent will give me a conventional implementation using patterns it has seen, but if I only have its frame, I have nothing to check it against. I won't know when it's making a wrong move, and I won't know when it's making an unusually good one. Convenience erodes that ability quietly, without ever announcing it.

### The part I'm not sure about

Does any of this actually make me better at reviewing what agents produce, or does it only feel that way?

I can't point at a case yet where knowing the internals caught a decision I would otherwise have accepted. Until I can, I'm treating this as an open question rather than a conclusion. It's possible I'm reading about databases because it feels like progress, and the reviews would go just as well without it.

I'm not trying to know how everything works. That's not a realistic goal for anyone. I'm trying to look at almost any system, get curious about its internals, find the principle underneath, see where the trade-offs point, and build a mental model I can argue with. Some of that makes me faster. Some of it makes my decisions better. The part I care about most is the part that changes how I see things, and that one doesn't come with a metric attached.
