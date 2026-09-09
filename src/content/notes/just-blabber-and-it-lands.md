---
title: "Just blabber, and it lands where it should"
tags: ["workflow"]
draft: false
publishedAt: "2026-09-09"
---

_The quick terminal capture loop: how thoughts go from my mouth to the right place in a few seconds, without me deciding where that place is._

## Why

Ideas don't arrive at convenient times, and they don't arrive in finished sentences. The old flow for capturing one looked like this: think of something, remember to write it down, switch to the right window, find the right note, then decide on the wording and the structure. Every step is small. Together they are enough to kill the thought before it lands anywhere.

I already had an OpenCode instance running against my Obsidian vault in a persistent Ghostty tab. It helped, but it still meant switching tabs, finding the right window, and mentally switching gears. The capture friction was lower, not gone.

## The loop

Now I press `Cmd+\``, and Ghostty's quick terminal slides down over whatever I am doing. OpenCode is already running inside it, with the Obsidian vault as its working folder and the Todoist MCP connected. I just talk. Hex with the local Parakeet model turns the talking into text, and from there the agent takes over.

What I actually use it for:

- **Adding tasks.** Something I need to do crosses my mind, I say it, it ends up in the right Todoist list. I don't pick the project or the section; the agent does.
- **Picking up work.** Instead of opening Todoist and scanning, I ask for the next task and it pulls the right one with its context.
- **Updating notes.** A thought belongs in an existing note, I say it, the agent edits the note on the spot.
- **Journaling.** End of the day, or mid-day, I just talk. The agent structures it, writes it into the vault, and I never see the blank-page problem.

The common thread: I stopped deciding where things go. The agent knows the vault, knows the lists, and routes the thought. I only blabber, and it lands where it should.

## What it runs on

- **Ghostty's quick terminal**, toggled with `Cmd+\``, sliding over the current window. It is fast enough that opening it feels cheaper than keeping the thought in my head.
- **OpenCode** inside it, pointed at the Obsidian vault, using a lower model. This is capture work, not code generation, so the model doesn't need to be the biggest one I have.
- **Todoist MCP**, which is what lets the same conversation reach my task lists instead of only the vault.

## Nothing new was installed

This is the part I like most about it. I did not install a new tool, write a plugin, or script anything together. Every piece here was already in the setup: Ghostty was already my terminal and its quick terminal shipped with it, OpenCode was already running against the vault, and the Todoist MCP was already connected. All I did was arrange them into a flow where the loop closes, and notice that the friction was gone.

## AGENTS.md does the remembering

The reason this works with zero explanation per session is a single `AGENTS.md` file at the root of the vault. OpenCode suggests it, and most agentic tools do the same: when a session starts in a folder, the agent reads that file first and inherits its context.

So the file carries the purpose of the whole setup. It says what this folder is for, that anything task-shaped I blabber should go to Todoist through the MCP, into the respective project and the respective section. It does not need me to mention any of that each time; a new session opens, reads the file, and already knows.

It also carries everything about the notes themselves: how a note is structured, the writing style, which folder it belongs in, what tags apply, what the frontmatter metadata looks like, and how a note links back to other notes. When I talk about an Obsidian vault note, the agent does not guess. It follows the conventions already written down.

That is the quiet trick of this whole loop. The intelligence is not in the moment of capture; it is in the standing instructions. I set them up once, and every blabber after that just lands.

## What changed

The unit of effort for a capture went from "open the right place, phrase it properly" to "say the sentence". That sounds tiny, but it is the difference between thoughts that get captured and thoughts that evaporate. I don't fiddle with wording or note structure anymore, because by the time I would have started fiddling, the thing is already written down.
