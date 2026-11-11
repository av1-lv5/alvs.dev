---
title: "Nothing About Web Push Fails Loudly"
tags: ["pwa", "web-push", "orbit"]
description: "The silent failures I ran into while adding push notifications to Orbit, from subscriptions that hang to notifications that never arrive."
publishedAt: "2026-05-12"
draft: false
---

_For [Orbit](/projects/orbit) I figured web push was three steps: subscribe, save, send. The steps were easy. Every one of their failure modes was silent._

For [Orbit](/projects/orbit), whole app's accuracy depends on consistent logging. Reminders aren't just a nice touch. I thought integrating push notifications wouldn't take much, just follow the docs, save the subscription, fire a notification. Done. Right? Noo..

### The silent hang

Most [browsers support Web Push API &#x2197;](https://caniuse.com/push-api). My primary browser [Helium &#x2197;](https://helium.computer/) and [LibreWolf &#x2197;](https://librewolf.net/) do too, technically. Except they strip out the push relay. Helium guts Google's FCM, LibreWolf disables Mozilla's autopush by default it's not a shocker, I chose them because they do. But while debugging the issue it never struck to me that when you call `pushManager.subscribe()` on privacy-hardened browsers, you do not get an error that the push relay is absent. Infact, you get nothing. The promise just... waits. No rejection, no timeout, just your user staring at a loading state that will never resolve.

The fix is to race it against a timeout:

```ts
const subscription = await Promise.race([
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: env.VAPID_PUBLIC_KEY,
  }),
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("PUSH_SERVICE_UNAVAILABLE")), 7000),
  ),
]);
```

Not elegant. But it is the only way I found to catch a hung subscribe.

But I remember Slack and WhatsApp Web do send notifications in these hardened browsers. But found out they only do when there is an open tab.

But the whole point of Orbit's reminders is to reach people who have not opened the app yet that day. But what are the odds of having your budgeting app open during the set time.

So had to improve UX for ones who has web push unavailable. Then thought of introducing in-app banner. No push server needed, no notification permission to accept either, just a quiet nudge the moment they open the app. Not a fix by any way but surely an addition.

### The architecture mistakes I could've included

My first instinct was a Next.js API route, that is where everything else lives habitual thinking. The pg_cron job in Supabase would call it, it would fetch subscriptions, send the pushes. Simple enough until I have seen what I actually built: Supabase cron calls Next.js, Next.js calls Supabase for subscriptions, Next.js calls the push endpoint. Three hops to do something that could happen in one place. Moving the logic into an Edge Function collapses all of it. Nothing leaves Supabase until the push goes out.

The other problem was double sends. pg_cron does not promise exactly-once delivery. If the Edge Function is slow or had a cold start, two invocations can overlap and the same user gets notified twice. The fix is a `claimed_for_date` column on the subscriptions table. Instead of selecting subscriptions and marking them sent in two steps, you do it in one atomic `UPDATE ... RETURNING`. Whoever updates the row first claims it. The second invocation finds nothing and exits.

### Dead subscriptions

Two things quietly kill a stored subscription.

The user revokes notification permission in browser settings. That subscription record is now sitting in your database pointing at an endpoint the browser will never use again. On next load, a `useEffect` checks the current subscription state, if permission is denied and no active subscription exists, the record gets deleted. Nothing lingers.

The browser updates and rotates the push endpoint. This one is nastier because there is no error when you push to a stale endpoint. The service worker receives a `pushsubscriptionchange` event and forwards it to the page via `postMessage`. The client removes the old endpoint and syncs the new one. Most tutorials skip this entirely.

---

The plumbing is not the complicated part. What costs time is that none of the edge cases tell you they exist. Browsers hang without erroring. Endpoints go stale without failing loudly. Cron jobs double-fire without warning. You find each one by running into it.
