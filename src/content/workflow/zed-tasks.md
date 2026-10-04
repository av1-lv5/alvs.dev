---
title: "Zed tasks"
tags: ["Zed"]
draft: false
publishedAt: "2026-09-23"
---

I added this task to my global `~/.config/zed/tasks.json` using Zed's `zed: open tasks` action. It appears in the Git Graph commit menu under **Custom Commands**:

```json
{
  "label": "Undo selected local commit",
  "command": "if [ \"$(git rev-parse HEAD)\" != \"$ZED_GIT_SHA\" ]; then echo 'Refusing: selected commit is not the latest commit'; exit 1; fi; git reset --soft HEAD~1",
  "tags": ["git-command"],
  "reveal": "never",
  "hide": "on_success"
}
```

- `git-command` adds the task to a commit's context menu.
- `$ZED_GIT_SHA` identifies the commit I right-clicked; the guard prevents resetting an older commit.
- `git reset --soft HEAD~1` removes the latest local commit while keeping its changes staged.
- `reveal: never` keeps the terminal from opening on success; `hide: on_success` leaves it visible when the task fails.

This is for unpushed commits. Afterward, I can unstage incorrect files, make more changes, and commit again.
