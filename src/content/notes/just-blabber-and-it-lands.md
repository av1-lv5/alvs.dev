---
title: "Just blabber, and it lands where it should"
tags: ["workflow"]
draft: false
publishedAt: "2026-09-09"
---

_The quick terminal capture loop: how thoughts go from my mouth to the right place in a few seconds._

## Why

Ideas do not arrive at convenient times or in finished sentences. The old flow for capturing one was to remember it, switch to the right window, find the right note, and then decide how to phrase and structure it. Each step was small, but together they were enough to make a thought disappear.

I already had an OpenCode instance running against my Obsidian vault in a persistent Ghostty tab. That reduced some of the friction, but I still had to switch tabs and mentally change context before I could start.

## The loop

Now I press <code>Cmd + `</code>, and Ghostty's quick terminal slides down over the window I am using. OpenCode is already running inside it, with the Obsidian vault as its working folder and the Todoist MCP connected. Handy transcribes what I say locally with the Parakeet TDT 110M model, then OpenCode handles the result.

That result can become different kinds of work:

- **Tasks:** I describe something I need to do, and it ends up in the appropriate Todoist project and section.
- **Picking up work:** I ask for the next task, and OpenCode finds it with its existing context.
- **Notes:** I describe a thought that belongs in an existing note, and the agent edits it in place.
- **Journaling:** I talk through the day, and the agent turns it into a structured entry in the vault.

## Choosing the dictation model

I started with Hex and its local Parakeet model. Hex could be buggy, and it did not give me much choice over smaller models. Its best suggestion was Parakeet TDT 0.6B, which used roughly 1.5 to 2 GB of memory. That is too much for dictation on an 8 GB MacBook. Apple's native dictation was not good enough either, so I started looking at other apps and models.

I had heard about Handy for a while. It did not feel polished enough when I tried it previously, but it has improved considerably. It offers smaller models, so I tried Moonshine Base, Moonshine Tiny, and Canary-180M-Flash. Canary is only around 200 MB, but it did not work well for me. That might be related to my Indian accent, though it consistently struggled more than the other options.

I settled on Parakeet TDT 110M. It is small enough to keep the memory cost reasonable and works well most of the time. It occasionally misses a word, usually a software name or another proper noun, but that is a limitation I can live with.

Handy can unload the model immediately after each use. The default is five minutes, but I changed it to immediate unloading so the model only occupies memory while I am dictating. I am still not sure whether loading it for every capture is worth the tradeoff, but the memory savings matter on an 8 GB machine.

## AGENTS.md does the remembering

The part that makes this work without explanation every time is an `AGENTS.md` file at the root of the vault. When OpenCode starts in that folder, it reads the file and inherits the context.

The file describes what the vault is for, where task-shaped thoughts should go in Todoist, and how notes should be written. It also defines the metadata, folders, tags, and linking conventions. OpenCode does not need to infer those rules from each new dictation; it can follow the ones already written down.

## What changed

The unit of effort for a capture went from opening the right place and phrasing the thought properly to simply saying the sentence. The system handles the destination, structure, and follow-up, while I stay with the idea long enough to get it out.
