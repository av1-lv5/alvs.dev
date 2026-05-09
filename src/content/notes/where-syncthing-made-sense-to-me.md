---
title: "Where Syncthing made sense to me"
tags: ["syncthing", "tools"]
publishedAt: "2026-03-29"
draft: false
---

Like most people, I use cloud storage providers. They make it easy to log in from any device and pull up my files whenever I need them. If I want those files available locally, their sync apps do the job, and if I am on a borrowed device, the web interface is always there. That convenience is hard to beat.

But I believe that not everything needs to live in the cloud. I carry my phone everywhere, and the files I actually need regular access to fit comfortably into local storage. For me, the cloud is more of an archive than a workspace. It is where I keep things I do not need often or things that are not particularly private.

The default assumption today is that syncing between devices requires a cloud provider in the middle. I wanted the convenience of sync without making the cloud the primary home for my files.

The alternative would be to go all in on self-hosted storage, like running a NAS or setting up Nextcloud. That gives maximum control, but it comes with maintenance and technical overhead that I do not need right now.

This is where Syncthing fits in. I use it to keep my essential, private files synced between my phone and laptop without touching the cloud at all. It runs quietly in the background and makes sure those files are always up to date on both devices. If I have something private but not essential, I still use cloud providers, but with end-to-end encryption like [ente &#x2197;](https://ente.io) for media and [proton drive &#x2197;](https://proton.me/drive) or local encryption tools like [Cryptomator &#x2197;](https://cryptomator.org/).

So my storage is split naturally: archives and bulk live in the cloud, while the important and private things stay local and move between my devices with Syncthing. It is not the perfect setup for everyone, but it strikes the balance I want between convenience, privacy, and control.
