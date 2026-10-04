---
title: "Opencode"
tags: ["OpenCode"]
description: "My opencode setup"
draft: false
publishedAt: "2026-09-22"
---

OpenCode is my main coding agent. Project and session switching lets me work across codebases without keeping a separate agent process alive for each one.

I keep a few focused workflows close at hand, a `/commit` command reads the staged changes and the last ten commit messages, then suggests two commit messages in the project's style. A [`/walkthrough` command](./walkthrough-command) turns a diff into a guided, linked review. Both are prompts, so I can adapt them for other agents rather than tie the ideas to OpenCode.

I also built a small quota plugin for the Codex and OpenCode Go plans I use, surfaced in OpenCode's sidebar. I keep it intentionally limited to my providers. Todoist MCP is always connected.

OpenCode also powers my [Ghostty Quick Terminal capture workflow](./ghostty-quick-terminal), with a persistent session in my Obsidian vault. I expect OpenCode to remain my main agent, but I prefer workflows that are portable enough to take with me if that changes.
