---
title: "One Zod Schema Can't Do Three Jobs"
tags: ["zod", "typescript", "forms"]
description: "Why I separate what a form sends, what the application needs, and what the database stores."
publishedAt: "2026-07-12"
draft: false
---

_A schema that validates the form, defines the logic, and matches the database all at once ends up doing none of them well._

Say you have a "remind me" checkbox on a form.

### Start: just a Form Schema

An HTML checkbox doesn't send `true`/`false`. If it's unchecked, the field is missing entirely from the form data. If it's checked, it sends the string `on`. So the schema has to accept what the browser actually gives you:

```ts
z.object({
  reminderEnabled: z.string().optional(),
});
```

This validates fine. But now every place downstream that reads `reminderEnabled` has to know that `undefined` means off, `"on"` means on, and anything else shouldn't happen. That logic, `value === "on"`, starts getting copy-pasted into components, API handlers, wherever the value is used. There's no single place that says what "enabled" really means.

### Problem: the Form Schema isn't a trustworthy type

The Form Schema was never meant to describe truth, it was meant to accept whatever the browser sends. Without another schema to convert into, `reminderEnabled` stays a loosely-typed string everywhere, forever. Your business logic ends up reasoning about form artifacts (`"on"`, `undefined`) instead of the actual concept, enabled or not.

### Solution: add a Domain Schema

Define what "reminder enabled" actually is once it's no longer raw form input, a real boolean, nothing else:

```ts
z.object({
  enabled: z.boolean(),
});
```

Now anything built on top of this schema, React components, API logic, the database write, can trust `enabled` is always `true` or `false`. No more `undefined`, no more `"on"`.

### Problem: nothing connects the two schemas

Great, but the Form Schema produces `{ reminderEnabled: "on" | undefined }` and the Domain Schema expects `{ enabled: boolean }`. The field even has a different name. Nothing converts one into the other, so either the Domain Schema never actually gets used, or someone quietly bolts a `.transform()` onto one of the schemas, which drags the conversion logic back into the validation layer and couples the two schemas together again.

### Solution: add a Mapper

A plain function whose only job is translating Form data into Domain data:

```ts
function toDomain(form: { reminderEnabled?: string }) {
  return {
    enabled: form.reminderEnabled === "on",
  };
}
```

Nothing clever, just an explicit, boring conversion. The Form Schema stays forgiving, the Domain Schema stays strict, and this function is the only place that knows how to get from one to the other.

For a checkbox, that's the whole story. Two schemas, one mapper. Adding a third schema here would be validating the same boolean three times for no reason.

### When two schemas aren't enough

The checkbox works because Domain and the database agree: a boolean is a boolean. That agreement doesn't hold everywhere.

Take a date field. The form gives you a string, `"2026-07-12"`, straight out of `<input type="date">`. Domain wants a real `Date` (or whatever date type you've standardized on), because business logic needs to do `isBefore`, `addDays`, compare against "today," and none of that is sane to do on a string. The database, though, serializes dates as ISO strings again over JSON. So the shape goes string → Date → string, and the string on each end isn't even the same string, one is whatever the date input gives you, the other is whatever your DB driver serializes. That's three distinct shapes, which means three schemas and two mappers, Form → Domain and Domain → Persistence. Skip the second mapper and you'll find a `Date` object getting handed straight to a `JSON.stringify` somewhere and quietly becoming someone else's bug.

Preferences are the mirror image. UI toggle is a boolean, Domain is a boolean too, they agree, so there's no Form → Domain mapper needed there. But the database stores a handful of these preferences packed into a single integer as bit flags, because someone decided ten boolean columns wasn't worth it. So the seam isn't between Form and Domain at all, it's entirely on the Domain → Persistence side, and it isn't even one field mapping to one field. It's N domain booleans collapsing into one column, and one column expanding back into N booleans on read.

### The actual rule

It was never "always use three schemas." Most apps don't start with all of these, and you shouldn't reach for Form, Domain, Persistence, and a mapper by default. Add each boundary only when the shapes genuinely diverge, and collapse them where they don't. A checkbox needs Form → Domain because the browser's serialization is nonsense. A date needs all three because the string the form sends, the type your logic needs, and the string your database expects are three genuinely different things. Preferences need Domain → Persistence but not Form → Domain, because the mismatch lives entirely on the storage side.

The mapper is doing the real work in all of these. The schemas just mark the two ends it's translating between. If you can't say out loud where a field's shape actually changes, you don't need a seam there yet.
