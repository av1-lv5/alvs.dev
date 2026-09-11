---
title: "Workflow log"
tags: ["workflow"]
publishedAt: "2026-08-31"
draft: false
updatedAt: "September 2026"
---

_A record of the workflows I have tried and kept. This is not a prescription or a claim that this is the right way to work. It is just a log of what made sense to me at a particular point in time._

## Current setup

At the moment, my setup is deliberately small: one Ghostty window, one Zed window, and, when I am doing frontend work, one Helium window.

- **Ghostty:** My terminal workspace. The first tab is the main project and is available with `Cmd+1`. Other projects and separate codebases get their own tabs.
- **OpenCode:** My main coding agent, kept in project-specific Ghostty tabs.
- **Codex:** The desktop app has become a serious part of my coding workflow, especially for frontend work and codebase refactors.
- **Obsidian:** An OpenCode instance runs in its own persistent Ghostty tab with my Obsidian vault as its working folder. It uses a lower model for capturing thoughts, lightweight note changes, and end-of-day review. The quick terminal version of it is my fast lane for capture.
- **Development servers:** A second persistent Ghostty tab, arranged in project rows with terminal splits.
- **Zed:** My code editor. I use one window and switch projects inside it instead of opening a window for every codebase.
- **Dictation:** Handy with the local Parakeet TDT 110M model, unloaded immediately after use.
- **Browser:** Helium when I am working on frontend interfaces.

## Workflow log

### September 2026

#### The quick terminal capture loop

The persistent Obsidian OpenCode tab got a faster sibling. Ghostty's quick terminal now slides down with OpenCode running inside it, vault as the working folder and the Todoist MCP connected. I pop it open, talk, and the agent routes the thought: tasks go straight into Todoist, note updates land in the right note, and journaling happens by just talking. I wrote a full note about it: [Just blabber, and it lands where it should](/notes/just-blabber-and-it-lands).

#### Codex became a place to stay for the whole loop

I used the Codex desktop app occasionally before, but recently it has become one of the main places I work. The workflow feels unusually natural: I can annotate the interface, annotate the code, inspect the file manager, review a diff, and keep moving through the same task without constantly switching into an IDE.

This is especially good for frontend work. I can look at a UI, explain what needs to change, make the change, and review the result in the same flow. The annotations make it easy to be precise about both visual details and the code behind them. The file manager is good enough that navigating a project does not feel like a compromise, and the diff view is clear enough to make reviewing changes comfortable.

It has also changed how I approach refactoring. For many tasks, I am staying inside Codex from the first inspection through editing, refactoring, UI review, and final diff review. I am not opening an IDE for most of that work anymore. I used to feel that way about another desktop coding app, but found it clunky and laggy. Codex feels much more polished and responsive, so it has earned a permanent place alongside OpenCode in the setup.

### August 2026

#### Ghostty is the workspace

Ghostty is where I keep the projects and the coding agents. Each project gets its own tab, usually named after the project followed by `| OpenCode`. The main project I am working on stays in the first tab, so `Cmd+1` takes me straight to it. Other projects I am working on in parallel get their own tabs.

If a product has separate codebases, such as a frontend and a backend, those can have separate tabs too. The tab is about the codebase I need to work in, not necessarily the product as a whole.

Two tabs are usually always present. One has an OpenCode instance opened with my Obsidian vault as its working folder. The other is for development servers. The Obsidian OpenCode session uses a lower model and is intentionally lightweight. I use it to quickly speak out ideas, capture things that come to mind, and make small changes to my notes rather than turning every thought into a proper writing session.

The dev-server tab is arranged in rows, one row per project. Each row usually has two splits. The rightmost split runs the development server, while the other is available for tests, scripts, or whatever else that project needs. Sometimes I add a third split, for example when a project has separate frontend and backend processes.

Development servers produce a lot of output that I rarely need to watch. Keeping them in a smaller split gives them enough space to be useful without giving them more space than they deserve. When something goes wrong, I can resize the split and inspect it immediately.

At night, I review the Obsidian notes to see what work was completed, what I had been thinking about during the day, and what I want to do next.

#### Zed stays as one window

Zed is where most of my actual coding happens. I keep only one Zed window open instead of opening a separate window for every project. When I need to check another codebase, inspect backend changes while working on a frontend, or make a manual edit somewhere else, I switch the project in that same window.

Zed is fast enough that this does not create much friction. Keeping one window also makes the setup feel less cluttered. I have tried using Zed's AI as my main coding agent, including Zed AI and OpenCode through ACP, and it works well. But I prefer keeping OpenCode in its own Ghostty tab. The larger terminal space is better when an agent is reading through a codebase, and it keeps the editor available for the code itself.

#### Dictation and the browser

I used Hex for dictation for a while, with its local Parakeet model. It was useful, but it could be buggy and its model choices were not flexible enough for an 8 GB MacBook. The Parakeet TDT 0.6B model it suggested used roughly 2.5 to 3 GB of memory, which felt excessive for dictation.

I switched to Handy, which now feels much more polished than when I first tried it. It lets me choose smaller models, and I settled on Parakeet TDT 110M after trying Moonshine Base, Moonshine Tiny, and Canary-180M-Flash. Canary was small at around 200 MB but did not work well for me. Handy also lets me unload the model immediately after use, instead of keeping it loaded for the default five minutes, so I only pay the memory cost while dictating. The 110M model is good most of the time; the misses are usually software names or other proper nouns.

When I am doing frontend work, Helium is usually the only other window I need. The browser, Zed, and Ghostty cover most of the loop: seeing the result, changing the code, and working with the agent or the development server.

The common thread is keeping the number of windows small while still giving each project and each kind of work a clear place to live.

Future entries will record only meaningful changes. The current setup above will be updated when necessary, while this log will preserve what changed and why.
