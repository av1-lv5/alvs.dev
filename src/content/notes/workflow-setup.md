---
title: "My workflow setup"
tags: ["workflow"]
publishedAt: "2026-08-31"
draft: false
updatedAt: "September 2026"
---

_A running note on the tools and arrangements that have stuck. Not a recommendation. Just what currently works for me._

## Current setup

At the moment, most of my work happens in OpenChamber, with Zed and Ghostty alongside it. OpenChamber and the OpenCode TUI are the two interfaces I use for agent work.

- **OpenChamber:** My main workspace for OpenCode. Its integrated browser handles frontend work, and I can inspect files, review code and changes, and make commits without leaving it.
- **Zed:** My primary code editor.
- **Ghostty:** Development servers run here, and I open the OpenCode TUI here when I want a terminal-first session. I do not keep a separate persistent TUI instance for every project.
- **Obsidian:** A separate OpenCode instance runs in a persistent Ghostty tab with my vault as its working folder. Its Quick Terminal instance is my fast lane for capture.
- **Dictation:** [Handy &#x2197;](https://handy.computer/) with the local [Parakeet TDT 110M &#x2197;](https://catalog.ngc.nvidia.com/orgs/nvidia/nemo/models/parakeet-tdt_ctc-110m/-) model, unloaded immediately after use.

## Workflow log

<details class="note-disclosure">
<summary>September 2026</summary>

#### OpenChamber is now the main workspace

I moved the main agent loop into OpenChamber. Its integrated browser means frontend work, file review, code review, and making commits can all happen in the same place. Zed remains my primary code editor alongside it, while Ghostty continues to handle development servers and terminal-first work.

The OpenCode TUI is available when I want a terminal-first session. I start it from Ghostty rather than keeping one instance per project. The separate Obsidian OpenCode instance is the intentional persistent exception and continues to run in its own Ghostty quick terminal.

#### The quick terminal capture loop

Ghostty's Quick Terminal gave the Obsidian OpenCode session a faster front door. I press <code>Cmd + `</code>, speak, and the agent sends the thought to Todoist, the right note, or a journal entry. I wrote about it here: [Just blabber, and it lands where it should](/notes/just-blabber-and-it-lands).

#### One main OpenCode instance is enough now

OpenCode v2 changed my main setup. Session switching existed before, but now projects and sessions are together in one interface. I no longer start a separate instance for every project. The Obsidian and Quick Terminal instances stay separate because capture benefits from its own context.

#### OpenChamber replaced the Codex desktop app

I used to reach for the Codex desktop app for frontend work and codebase refactors. I have switched to OpenChamber instead. It wraps OpenCode in a desktop application, so I can keep the same agent workflow while getting the richer interface that suits this kind of work better.

The OpenCode TUI remains the other half of the setup. I use either OpenChamber or the TUI now; Codex is no longer part of my day-to-day workflow.

</details>

<details class="note-disclosure">
<summary>August 2026</summary>

#### Ghostty is the workspace

Ghostty is where I keep the projects and coding agents. The main project stays in the first tab, so `Cmd+1` takes me straight to it. Other projects can have their own tabs, but they no longer need separate OpenCode instances.

If a product has separate codebases, such as a frontend and a backend, those can have separate tabs too. The tab is about the codebase, not necessarily the whole product.

Two tabs are usually always present: one for the Obsidian OpenCode session and one for development servers. The Obsidian session uses a lower model for quick thoughts, note edits, and end-of-day review.

The dev-server tab is arranged in rows, one row per project. The rightmost split runs the server; the other is for tests, scripts, or whatever else I need. Some projects get a third split for a separate frontend or backend process.

Development servers produce a lot of output I rarely need to watch. Keeping them in smaller splits gives them space without letting them take over. When something goes wrong, I resize the split and inspect it.

At night, I review the Obsidian notes: what I finished, what I was thinking about, and what comes next.

#### Zed stays as one window

Zed is still where most of my coding happens. I keep one window and switch projects inside it instead of opening a window for each codebase.

Zed is fast enough that this feels natural and keeps the setup uncluttered. Its AI works well, including OpenCode through ACP, but I prefer OpenCode in its own Ghostty tab. The larger terminal is better for agent work and leaves the editor available for code.

#### Dictation and the browser

I used [Hex &#x2197;](https://hex.kitlangton.com/) for dictation for a while. Its local [Parakeet model &#x2197;](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2) worked, but the [Parakeet TDT 0.6B &#x2197;](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2) used roughly 2.5 to 3 GB of memory. That felt excessive on an 8 GB MacBook.

I switched to [Handy &#x2197;](https://handy.computer/). After trying [Moonshine Base &#x2197;](https://huggingface.co/moonshine-ai/moonshine-base), [Moonshine Tiny &#x2197;](https://huggingface.co/moonshine-ai/moonshine-tiny), and [Canary-180M-Flash &#x2197;](https://huggingface.co/nvidia/canary-180m-flash), I settled on [Parakeet TDT 110M &#x2197;](https://catalog.ngc.nvidia.com/orgs/nvidia/nemo/models/parakeet-tdt_ctc-110m/-). It is small, works well most of the time, and Handy unloads it immediately after use. The misses are usually software names or other proper nouns.

When I am doing frontend work, Helium is usually the only other window I need. The browser, Zed, and Ghostty cover most of the loop.

The common thread is fewer windows, with a clear place for each project and kind of work.

</details>

<p>Future entries will record only meaningful changes. The current setup above will be updated when necessary, while this log will preserve what changed and why.</p>
