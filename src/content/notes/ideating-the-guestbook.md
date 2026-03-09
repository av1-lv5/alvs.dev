---
title: "I wanted to have a guestbook for this website"
tags: [""]
draft: false
---

_Yes, I wanted to have a guestbook for a site with close to zero visitors_

I didn't open my code editor first. I opened a notes app and started planning. What the flow would look like, what the stack would be, how someone would sign it.

And the first thing that stopped me was auth.

I don't want people to click through a GitHub OAuth or a Google login just to leave a note on my guestbook. That's already too much to ask, that they'd want to hand over permissions to some random portfolio site just to say hi.

So I wanted it to be open. Just a name, a message, submit.

Then I read about why guestbooks don't usually work that way. Spam. The moment you leave the door open, bots walk in. I don't want to open my guestbook one day and find it full of garbage.

I thought about building a filter. Catch certain words, block them. But that felt like a rabbit hole with no clean exit.

Then I thought, okay, what if I approve entries manually before they show up. Someone signs, it sits in a queue, I review it, it goes live. Simple enough.

Except I looked at the math. At the rate this site gets visitors, there would probably be one entry every few months. And I know myself. I would forget to check. I'd remember six months later, someone left a kind note in October, and it's now March sitting unread in a database table I haven't opened since I set it up.

That felt worse than not having a guestbook at all.

I kept going in circles. Every version of it either asked too much from the visitor or created a chore I wouldn't keep up with. The free and open version invites spam. The moderated version invites neglect.

So I closed the notes app and didn't build it.

Maybe someday I'll figure out the right shape for it. But for now the guestbook lives here, in this note, as the thing I thought about but couldn't finish thinking through.
