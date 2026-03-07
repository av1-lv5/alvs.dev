---
title: "Analog digits"
description: "A live clock where every digit is drawn using tiny analog clock hands"
date: 2026-03-07
source: "https://www.youtube.com/watch?v=VUSCH7nQGIM"
sourceType: "youtube"
component: AnalogDigits
isDraft: false
---

Each digit of the current time is drawn as a 4×6 grid of mini clocks. The two hands on each cell rotate to form corners, edges, or straights, mapping to the box-drawing characters that make up the digit shape.

The digit patterns are stored as flat arrays of 24 box-drawing characters (`┌ ┐ └ ┘ - |`), and each character maps to a pair of rotation angles for the two hands. Every second, the angles update and CSS transitions do the rest.