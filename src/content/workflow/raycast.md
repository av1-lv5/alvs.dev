---
title: "Raycast as my command layer"
tags: ["Raycast"]
draft: false
publishedAt: "2026-09-23"
---

If there is one tool I would recommend to anyone trying to improve their productivity, it would be Raycast. Not because it makes every action dramatically faster, but because it reduces the context switching that quietly breaks focus throughout the day.

Raycast is the command layer I keep between myself and the rest of my Mac. I use it for the small things I do often enough to want a shortcut, but not often enough to justify opening a dedicated app. At first, the benefit is easy to underestimate: why build a shortcut for one small action? After a while, though, the commands become muscle memory. I stop leaving the task I am working on just to do the small thing around it.

That is the real benefit for me. It is not only about saving time or being snappier. It saves mind space. My attention stays with the task instead of being spent deciding which app to open, where something is saved, or how to repeat an action I have already done many times.

## Snippets for things I should not have to remember

I keep the information people regularly ask me for as Raycast snippets: my address, GitHub and LinkedIn links, my resume, and similar details. Instead of keeping those strings in my head or typing them from memory, I only need to remember a short trigger. For example, `!ADDRS` expands into my address wherever I am typing.

The same idea works especially well for repeated replies. When I was posting regularly about my products, I kept templates for the responses I was writing over and over. A snippet gives me the full, considered reply without making me compose it again every time.

The useful part is not the typing speed. It is moving the remembering out of my head.

## Screenshots straight into the agent

When I am working on a UI, I often need to show an agent both what I want the interface to look like and what it currently looks like. I use macOS's native screenshot tool for the capture: `⌘ ⇧ 5` lets me select an area or capture a whole window.

Raycast's **Paste Latest Screenshot** command completes the workflow. I have mapped it to `⌥ V`, so the latest capture can be pasted into whichever agentic tool I am using without saving a file, finding it, or leaving the current app. When I need more than one image, Raycast's screenshot history gives me the recent captures to choose from.

That makes visual feedback feel like part of the conversation instead of a separate file-management task.

## Extensions for the things around the work

I use Raycast's Homebrew extension rather than opening a terminal for every package search or routine Homebrew action. I usually work in a terminal, but I do not want to run installs, updates, or upgrades thoughtlessly; Raycast gives me a quick interface when I do need to interact with Homebrew.

I also use extensions for applications that I do not want to bring to the foreground. Spotify is a good example: play, pause, volume, and track changes are all available from Raycast. These are not development workflows, but they remove a context switch from the middle of one.

## Search files without hunting for them

Raycast's file search is useful when a file lives outside the project I am currently working in. If I need to mention or upload a particular file from another project, say, into a browser-based AI tool, I can search for it and send it straight into the current input instead of opening Finder and navigating there manually.

## Clipboard history and sequential paste

I keep clipboard history for one day. That is long enough to recover something I copied recently without turning the clipboard into a permanent archive.

Sequential paste is useful when I have several pieces of information to enter in order. I can copy them one after another and then paste them sequentially, rather than repeating the copy-paste cycle for every item. It is a small feature, but it makes structured input much less tedious.

## Quicklinks as a personal launchpad

Quicklinks are my lightweight layer of bookmarks. I have links for YouTube, my portfolio sites, frequently used applications, local folders such as Downloads, and places where I regularly search or write, including GitHub, Markdown, and document files.

I keep web apps there so I can open them in whichever browser I am using at the time. I do not use a bookmark-sync tool for this kind of thing because I switch browsers often; Raycast keeps the links available independently of the browser.

These are not meant to replace my main bookmarks. Raindrop is where I keep things I want to save properly. Quicklinks are for the pages and files I open constantly, the small set of destinations that should always be one command away.

Raycast has become valuable to me less as one big productivity system and more as a collection of tiny exits from friction: expand the thing I already know, paste the screenshot I just took, find the file I need, control the music, or open the page I use every day. Once those paths are set up, I do not have to think about the setup anymore.
