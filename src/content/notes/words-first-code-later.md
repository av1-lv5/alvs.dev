---
title: "Why I Keep Product Decisions in Markdown"
tags: ["process", "writing", "ai"]
publishedAt: "2026-08-03"
draft: false
---

_A small folder of notes next to the code, mostly because I got tired of forgetting why I had made decisions._

Next to the code for Orbit, my budgeting app, there is a folder of Markdown files. It contains decisions, feature proposals, a competitor teardown, an audit tracker, and a few documents that are mostly me arguing with myself. It is not a framework or a particularly original process. It is just where I write things down before I build them.

I did not plan the folder. It grew after I kept making a decision on a Tuesday, forgetting the reasoning by the next month, and spending an evening reconsidering the same question. I build Orbit alone, so there is no teammate I can ask, "Why did we do it this way?" The notes are a rough substitute for that conversation. Writing the answer down once is cheaper than repeatedly reconstructing it.

The folder became more useful once I started building with an AI in the loop. A vague request usually produced vague work. The notes gave me somewhere to work out the actual request before turning it into a prompt. They also gave the model more useful context than a list of isolated instructions: not just what I wanted, but why some obvious alternatives were off the table.

## Decisions worth remembering

The most useful file is `decisions.md`, a running log of decisions that took real thought. Each entry has four parts:

- **Decision**: what I chose
- **Context**: the situation that forced it
- **Rejected**: the alternatives, and why not
- **Status**: Active, Superseded, or Revisit-if

The `Rejected` section is the part I use most. Writing down what I chose is easy. What I forget is what I considered and why the tempting alternative did not win.

One example is the question of whether users should be able to add more money to a budget after overspending. It is an obvious feature, and many budgeting apps have a top-up button. Orbit does not. The decision entry says that if the number can be increased whenever it becomes uncomfortable, it stops functioning as a constraint. It becomes a number adjusted to make the current month feel better.

That entry has stopped me from reopening the same debate several times. If I eventually change the decision, I will mark the old entry `Superseded` and link to the new one instead of deleting it. The old reasoning is still useful, even when it is no longer current.

## Before the code

Features usually pass through three increasingly specific forms.

**An idea.** `ideas.md` contains loose sketches in plain English. For example: “If a user wants to buy something next month, show how much they need to save today.” There are no schemas or components yet. Most ideas stop here, which is useful. It is cheaper to abandon a sentence than a half-built feature.

**A proposal.** An idea that survives gets a document in `features/proposed`. This is where I work through its boundaries. For example, I decided that a goal in Orbit is funded by redirected underspending, not by a deposit and not by an income stream. The distinction sounds small, but a top-up balance would turn the feature into part of a savings account. That is a different product.

**A task.** Once the product questions are settled, the work becomes a file in `tasks/`. If I am still deciding what the feature should do, it is not a task yet. Task files are temporary scaffolding and can be deleted when the work is finished. The proposal and decision log hold the parts that are worth keeping.

The point is not to make every change ceremonial. It is to catch unresolved product questions before they become implementation details.

## Other notes

I also keep a codebase improvement tracker. It records audit findings, their severity, affected files, status, and an acceptance criterion. “Fix the RLS policy” is easy to leave unfinished. “Two-user tests reject cross-user inserts for expenses and limit history” gives me something I can verify.

`WONT FIX` is a real status too. If I knowingly accept a risk, I record why, so the next audit does not rediscover the same decision.

There are also a few files describing how I want an AI assistant to work with me. Pair mode asks for small changes and surfaced assumptions. Teach mode means I want an explanation or guidance instead of a completed solution. These are not sophisticated instructions, but naming the mode is quicker than restating the preference every time.

The competitor notes serve a similar purpose. Writing down how another budgeting app handles a feature often makes Orbit's difference clearer. One competitor rolls an unspent budget into the next day, so spending less today gives you more tomorrow. Orbit redistributes the remaining balance across the days left in the cycle. I want the daily number to stay relatively stable, and I understood that choice better once I had described the alternative precisely.

## Why keep doing it?

The benefit is modest but consistent.

Writing exposes the parts of an idea that are still vague. A sentence like “add goals” can survive in my head for weeks. Writing down what a goal can contain, how it is funded, and what it must not become forces the open questions into view.

The notes also make delegation easier. An AI assistant can implement a clear decision, but it cannot reliably infer the product boundary I have not worked out. A proposal gives it context without pretending that context is a substitute for judgment.

Most importantly, the notes preserve decisions that would otherwise disappear. When I ask “why did we not just do X?”, I can usually find the answer instead of starting the argument again.

That is all the system is: a folder of Markdown that grew because writing things down kept being useful. It does not make the code better by itself. It gives the code a better chance of matching a decision I have actually thought through.
