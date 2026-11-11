---
title: '"Installable Everywhere" Means Three Different Things'
tags: ["pwa", "ios", "android", "orbit"]
description: "What building an install button for Orbit taught me about PWAs on Android, iOS, and other browsers."
publishedAt: "2026-08-07"
draft: false
---

_On [Orbit](/projects/orbit)'s page I wrote that it's "installable everywhere." One tidy phrase for what turned out to be three install flows sharing nothing but a button._

I built Orbit as a PWA so a single codebase could land on a phone's home screen without an App Store or a Play Store review in the way. "Install" felt like one feature I'd tick off with one button. Then I went to write the button, and it turned into a four-way branch:

```ts
export type InstallState = "native" | "ios" | "installed" | "fallback";

export function detectInstallState(
  promptEvent: BeforeInstallPromptEvent | null,
): InstallState {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (isStandalone) return "installed";
  if (promptEvent) return "native";
  if (IOS_RE.test(navigator.userAgent)) return "ios";
  return "fallback";
}
```

One of those four is "already installed." The other three are three genuinely different install mechanisms wearing the same "Install Orbit" label, and I had to render a different UI for each. Here's why the button couldn't stay a button.

### `native`: the only case where I actually have an API

On Chrome (Android and desktop) the browser fires a `beforeinstallprompt` event. That's the whole reason a real install button can exist. I catch it, call `preventDefault()` to stop the browser's own banner, and stash it so I can show my prompt at a moment that makes sense instead of on page load:

```ts
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  _event = e as BeforeInstallPromptEvent;
  notify();
});
```

Later, my card's Install button just does `await promptEvent.prompt()`. On Chrome-Android this triggers a WebAPK: the browser asks Google Play Services to mint and sign an actual `.apk`, and installs it silently. The result is a first-class citizen, clean icon with no browser badge, an entry in the app drawer and app switcher, its own page in Android Settings with its own storage and notification controls, and in-scope links that open in the app. It's also the version that later lets me wrap Orbit in a [Trusted Web Activity](https://developers.google.com/codelabs/pwa-in-play#0) for the Play Store. This is the one that behaves like the word "install" implies.

The catch I missed at first: `beforeinstallprompt` isn't Chrome's alone. It's a Chromium event, so Edge, Opera, Brave, and Samsung Internet fire it too. That means `if (promptEvent) return "native"` catches all of them, not just Chrome. The event firing and a WebAPK actually getting minted are two separate facts, and the gap between them is the whole next section.

### `ios`: no event, so the "button" is a screenshot with instructions

On iOS there is no `beforeinstallprompt`. There's no event to catch and no `prompt()` to call, so `promptEvent` is always null and my detection falls through to the `ios` branch. My "install flow" there is a modal that hardcodes the gesture:

```ts
const IOS_STEPS = [
  {
    n: 1,
    text: "Tap the Share button (↑) at the bottom of your Safari toolbar",
  },
  { n: 2, text: 'Scroll down and select "Add to Home Screen"' },
  { n: 3, text: 'Tap "Add" in the top-right corner' },
];
```

That's the whole "API": telling the user where to tap. And on iOS the browser they picked doesn't matter. Chrome, Edge, Firefox, Brave all use WebKit under the hood (Apple's rule 2.5.6, in force since 2008). They're not literally Safari, but the engine is, so each is a different toolbar over the same renderer. The EU's DMA technically opened this in 2024 and no one has shipped another engine since; Japan ordered it dropped by end of 2025; everywhere else it's still WebKit or nothing. So my iOS instructions say "Safari" and mean all of them.

What that flow produces isn't the Android app either. It's a Web Clip: backed by Safari rather than a packaged application. Since iOS 16.4 these got a lot more capable (web push, badging, standalone display), so "old bookmark" undersells them, but the distinction that matters holds: there's no packaged app underneath, just a plist pointing at a URL that Safari renders. Consequences I hit:

- Open Orbit from an in-app browser (a link inside Instagram or a DM) and "Add to Home Screen" isn't even in the menu.
- Push only works after the Web Clip is added, never from a tab, with no background wake. That's the whole reason [push notifications](/notes/push-notifications-on-web) turned into its own note.
- macOS Safari doesn't do installability at all, so "everywhere" quietly excludes the Mac.

### `fallback` and the minting-server line the code can't see

The `fallback` branch only fires when there's no `promptEvent` and it isn't iOS. On Android that's really just Firefox: it never fires `beforeinstallprompt`, so there's no event to catch and no prompt to offer, and all I can do is point at its menu.

```ts
isAndroid
  ? 'Open Chrome\'s menu (⋮) and select "Add to Home Screen" or "Install app".'
  : 'Look for the install icon in the address bar, or open the browser menu and select "Install Orbit".';
```

I first wrote Edge, Opera, and Brave into this branch too. That was wrong. They're Chromium, they fire the event, so they hit the `native` branch above, my real prompt shows, and it works. What they lack is a minting server, so what lands on the home screen is a shortcut rather than a WebAPK: it opens without browser chrome, but there's no packaged app underneath, no entry of its own in Settings, no independent app identity. Same prompt as Chrome, lesser result, and my code can't tell them apart because it reads the event, not the install.

Samsung Internet is the same story with a twist: it runs its own minting server, but only mints on Samsung devices and falls back to a shortcut on a Pixel.

So the real line isn't "Chrome vs everyone" and it isn't "event vs no event," it's who runs a trusted minting server. Chrome uses Google's, everywhere. Samsung Internet uses its own, Samsung-only. Everyone else hands you a shortcut whether or not an event fired. The exact same Install button, on the same phone, gives one person a WebAPK and the next a bookmark, decided purely by their browser, and my prompt looks equally sure of itself either way.

### So "installable everywhere" means

A WebAPK that behaves like a native app on Chrome-Android. A home-screen shortcut, badge or not, on every other Android browser, even the ones that fired a prompt. A Web Clip on iOS the user has to find by accident, tied to an engine they can't change. Three mechanisms, one word, and a `detectInstallState` function whose whole job is to figure out which of the three a given user is about to get.

I'm not rewriting the line on Orbit's page. It's accurate. I just know now it's carrying three jobs, and the single word hides how differently each one behaves.
