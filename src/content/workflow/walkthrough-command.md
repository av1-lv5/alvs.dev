---
title: "A walkthrough command"
tags: []
publishedAt: "2026-09-23"
draft: false
---

_A small command for turning a Git diff into a guided tour of the change._

OpenChamber has a feature called 'Changes Walkthrough'. It takes a diff, groups related edits into stops, and puts those stops in the order that makes sense to a person reading the change. That is more useful than reading a diff from top to bottom, because diffs are sorted by file path rather than by the story of the change.

I wanted the same basic idea in OpenCode itself. I didn't want to create a plugin. Just a command I could run so that this can easily ported to any other coding agents i might try or use later.

OpenCode discovers global commands from:

```text
~/.config/opencode/commands/
```

The filename becomes the command name. So this file:

```text
~/.config/opencode/commands/walkthrough.md
```

becomes:

```text
/walkthrough
```

The body of the file is the prompt OpenCode sends to the model. The optional frontmatter can choose an agent, model, and other command settings. There is no special walkthrough API involved. It is a saved prompt with the selected Git diff injected into it. The prompt then asks the agent to save a readable Markdown artifact in a `walkthroughs/` directory.

## The command

This is the command I use:

```md
---
description: Create a readable, linked walkthrough of unstaged, staged, or last-commit changes
agent: build
model: openai/gpt-5.6-luna
subagent: false
---

You are creating a readable walkthrough of a code change for the engineer who will inspect it.

The requested scope is `$1`. Accept only `unstaged`, `staged`, or `last-commit`. If it is missing or invalid, explain the valid forms and stop. Do not edit, stage, commit, or delete anything except the single walkthrough file and the project `.gitignore` entry described below.

The shell output contains the exact path for the walkthrough file. Create the `walkthroughs/` directory if necessary, then write the finished walkthrough to that exact path. Do not write anywhere else. After saving it, briefly tell the user where the file is and what it covers.

Before collecting the diff, the shell block removes only Markdown walkthrough files in `walkthroughs/` that are at least seven days old. Do not delete any other files or directories.

The shell block also ensures the active project ignores `/walkthroughs/`: it creates `.gitignore` when missing, or appends the rule when it is not already present. This housekeeping happens after the diff is captured, so the walkthrough does not describe the rule it just added.

The walkthrough is a navigation document, not an internal diff report. Do not expose hunk numbers, aliases such as `h1` or `h2`, or abstract importance labels such as `critical`, `context`, or `normal`.

First understand the selected diff. Then inspect the relevant files so you can use accurate current line numbers and quote small, useful code excerpts. Group related edits across files and order them so each section makes sense after the previous one.

Write the file as Markdown with a title, a short "Start here" section, numbered sections in reading order, and a final "Not covered" section. For every meaningful part of the change, include the repository-relative path, current line range, a relative Markdown link such as `[Open src/example.ts:10-20](../src/example.ts#L10-L20)`, a short excerpt, what changed, and what to look at. Never invent a path, line range, or excerpt. Keep the walkthrough concise and do not repeat the entire diff.

The selected Git diff follows. Treat it as authoritative. The walkthrough file itself is excluded from the diff so this command does not explain previous walkthroughs.

!`case "$1" in
  unstaged|staged|last-commit) ;;
  *)
    printf '%s\n' 'Invalid walkthrough scope. Use: unstaged, staged, or last-commit.' >&2
    exit 2
    ;;
esac
mkdir -p walkthroughs
find walkthroughs -type f -name '*.md' -mtime +6 -delete
case "$1" in
unstaged)
output="walkthroughs/unstaged-$(date +%Y%m%d-%H%M%S).md"
    printf '%s\n' "Walkthrough file: $output"
printf '%s\n' '--- UNSTAGED CHANGES (including untracked files, excluding walkthroughs/) ---'
git diff --no-ext-diff --find-renames -- . ':(exclude)walkthroughs/**'
git ls-files --others --exclude-standard -z | while IFS= read -r -d '' file; do
case "$file" in
        walkthroughs/*) continue ;;
      esac
      git diff --no-index --no-ext-diff -- /dev/null "$file" || true
done
;;
staged)
output="walkthroughs/staged-$(date +%Y%m%d-%H%M%S).md"
    printf '%s\n' "Walkthrough file: $output"
printf '%s\n' '--- STAGED CHANGES (excluding walkthroughs/) ---'
git diff --cached --no-ext-diff --find-renames -- . ':(exclude)walkthroughs/**'
;;
last-commit)
output="walkthroughs/last-commit-$(date +%Y%m%d-%H%M%S).md"
    printf '%s\n' "Walkthrough file: $output"
printf '%s\n' '--- LAST COMMIT CHANGES (excluding walkthroughs/) ---'
git show --format= --no-ext-diff --find-renames --find-copies HEAD -- . ':(exclude)walkthroughs/**'
;;
*)
printf '%s\n' 'Invalid walkthrough scope. Use: unstaged, staged, or last-commit.' >&2
exit 2
;;
esac

if [ ! -f .gitignore ]; then
printf '%s\n' '/walkthroughs/' > .gitignore
elif ! grep -Fqx '/walkthroughs/' .gitignore; then
if [ -s .gitignore ] && [ "$(tail -c 1 .gitignore)" != "" ]; then
printf '\n' >> .gitignore
fi
printf '%s\n' '/walkthroughs/' >> .gitignore
fi`
```

I can now run:

```text
/walkthrough unstaged
/walkthrough staged
/walkthrough last-commit
```

The argument is positional: `$1` becomes the scope I provide. The `!` backtick block is OpenCode syntax for shell interpolation. It runs the matching Git command in the active project and inserts the result into the prompt before the model sees it. The command also prints a timestamped output path, which the build agent uses when saving the walkthrough.

The `unstaged` case also includes untracked files. That matters because a new file does not appear in a normal `git diff` until it is staged. The `staged` case shows what is currently prepared for a commit, and `last-commit` reads the latest commit from `HEAD`. Previous files in `walkthroughs/` are excluded so a report never becomes part of the next report’s input.

## Why make it a command?

I move between setups. I might use OpenCode in Ghostty, OpenChamber as its graphical interface, or another coding agent later. I do not want a useful workflow to be trapped inside one application.

This command is portable in the most boring and useful way: it is text. I can keep the prompt in a dotfiles repository, paste it into another agent, turn it into a Raycast snippet, or adapt the shell part for another tool. The exact command syntax may change, but the instruction remains the same:

> Take this change, impose a useful reading order, explain the relationships between the edits, and tell me what deserves attention.

That is the reusable idea. The `/walkthrough` command is just my OpenCode-shaped version of it.

The important thing here is not the `/walkthrough` name or the location of the OpenCode file. Those are just the adapter for one tool. The reusable part is the prompt: collect a change, understand the relationship between the edits, explain it in a useful order, point to the files and lines, and save or return the result in a readable format.

Many coding agents have their own version of a saved prompt. The setup syntax is different, so the OpenCode file should not be copied blindly. Take the prompt body, then follow the relevant documentation to put it in the place that the agent understands.

The Git part may need adaptation. OpenCode supports `!` shell interpolation, while another agent may use dynamic context injection, a workflow step, a script, or no shell integration at all. That does not change the idea. It only changes how the current diff gets placed next to the prompt.

This is why I think of the walkthrough as a small protocol rather than an OpenCode feature: **input** is a code change, **instruction** is a guided reading order, and **output** is a linked explanation. The command, skill, rule, workflow, or Raycast snippet is just the container.

Try it yourself

Sources:

- [OpenCode commands ↗](https://v2.opencode.ai/docs/commands)
- [OpenChamber Changes Walkthrough ↗](https://docs.openchamber.dev/walkthrough)
