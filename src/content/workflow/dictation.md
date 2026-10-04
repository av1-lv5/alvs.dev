---
title: "Local dictation for prompting"
tags: ["Dictation", "Handy", "Hex"]
draft: false
publishedAt: "2026-09-23"
---

Initially I tried Wispr Flow and paid for the subscription. It worked beautifully. The output was polished, the experience was smooth, and I understood why people liked it.

I still could not justify keeping it. The price felt difficult to accept.

I do not use dictation for every kind of writing. I do not dictate replies to people, emails, or long-form writing. The place where I write most often is an AI input box.

The ideal setup for me is local transcription with optional polishing if i ever want to dictate for other parts of writing.

I tried [Hex &#x2197;](https://hex.kitlangton.com/) I liked the product but the experience was inconsistent at the time. Sometimes the dictation doesn't trigger. Those small failures matter in a tool that is supposed to disappear into muscle memory.

I eventually moved to [Handy &#x2197;](https://handy.computer/). It is also open source, runs locally, and follows the simple interaction.

I use [Parakeet Unified English 0.6B &#x2197;](https://huggingface.co/nvidia/parakeet-unified-en-0.6b) because I only dictate in English. Multilingual recognition is valuable when you need it, but I do not. For the same local memory budget, I would rather spend the model's capacity on the language and task I actually use: English transcription for the rough thoughts I send to an AI prompt.

One thing I would recommend before settling on a local dictation model is checking Activity Monitor while doing the work you normally do. Do not test it in an empty session and assume the result will represent your day.

Choose the model that leaves enough headroom for the rest of your computer. Local does not automatically mean lightweight, and a model that works well in isolation may not work well alongside your editor, dev server, music, and agent sessions.

I also prefer not to see the words appear while I am speaking. My dictation is usually a rough stream of thoughts, and watching the transcript form makes me start editing before I have finished thinking.

I would rather speak, trust the process for a moment, and receive the finished text at the end. Since I am prompting an AI anyway, I do not need to watch every word land in real time. I want to keep talking until the thought is complete, then let the model make sense of it.
