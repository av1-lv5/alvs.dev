---
title: "I still write 'function'"
tags: ["javascript", "opinion"]
publishedAt: "2026-06-03"
draft: false
---

Every JavaScript codebase I open lately looks the same. Arrow functions, top to bottom, wall to wall. Not just for callbacks, not just for one-liners, for everything. Utility functions, handlers, module exports, sometimes even constructors. It has become the default, and I don't think it should be.

I use arrow functions. But deliberately, not reflexively.

## The syntax argument does not hold up

The popular case for arrow functions is that they are shorter. And they are, if you are comparing `x => x * 2` to a full function declaration. But most functions in a codebase are not one-liners, and once you are writing a block body, the brevity disappears:

```js
const handleSubmit = async (event) => {
  event.preventDefault();
  // ten lines of code
};

async function handleSubmit(event) {
  event.preventDefault();
  // ten lines of code
}
```

The second one is strictly easier to read. `function` is a clear signal: here is a named, callable thing. `const` followed by an arrow makes your eye parse more before landing on what this thing actually does. That extra parsing cost is small, but it compounds across an entire file. When every function is a `const`, every function requires the same effort to distinguish from a variable holding a string or an object.

Named function declarations also read naturally out loud: "submit handles an event." Arrow functions assigned to `const` are fine, but they're a variable that happens to hold a function, not a function declaration. These are not the same thing conceptually, even if they behave similarly in most cases.

## Where arrow functions genuinely help: `this`

Arrow functions do not have their own `this`. They inherit it from the surrounding lexical scope. That is the real reason they were introduced, and it is a legitimate one.

Before arrow functions, callbacks inside class methods were a constant source of bugs:

```js
function Timer() {
  this.seconds = 0;
  setInterval(function () {
    this.seconds++; // `this` is undefined or window, not the Timer instance
  }, 1000);
}
```

Arrow functions fixed this cleanly:

```js
function Timer() {
  this.seconds = 0;
  setInterval(() => {
    this.seconds++; // `this` is the Timer instance
  }, 1000);
}
```

That is the case where an arrow function is not just convenient but correct. Using a regular function there would require `.bind(this)` or a `const self = this` hack. Arrow functions are the right tool for callbacks that need to close over the outer `this`.

But most code does not live inside a class. Most utility functions, pure transformations, route handlers, they do not care about `this` at all. Using an arrow function "to avoid `this` problems" in code that has no `this` problems solves nothing.

## Hoisting

Function declarations are hoisted. You can call a function before it appears in the file:

```js
greet("Avinash"); // works

function greet(name) {
  console.log(`Hello, ${name}`);
}
```

Arrow functions assigned to `const` are not. The variable exists in a temporal dead zone until the line where it is assigned:

```js
greet("Avinash"); // ReferenceError

const greet = (name) => {
  console.log(`Hello, ${name}`);
};
```

This shapes how you organize a file. With function declarations, you can put the main logic at the top and the helpers below, which is often how code is easiest to read, putting the high-level picture first. With arrow functions everywhere, you are forced into bottom-up order: helpers before callers.

## Stack traces and debugging

When something throws, the call stack is what you have. Named function declarations show up by name in that stack. Anonymous arrow functions do not, or they appear as `anonymous`, which tells you nothing.

Engines are smart enough to infer the name of an arrow function assigned directly to a `const`:

```js
const doThing = () => {}; // name: "doThing"
```

But inline arrow functions passed to higher-order functions lose that:

```js
const playlist = songs
  .filter((s) => s.duration < 240)
  .map((s) => normalize(s))
  .reduce((acc, s) => ({ ...acc, [s.id]: s }), {});
```

If something throws inside that chain, the stack trace is a list of `anonymous`. Whereas if you name those functions, even informally, the trace becomes readable. Arrow functions encourage inlining in ways that quietly erode debuggability.

## The right default

Arrow functions are genuinely useful. Inline callbacks in array methods, closures that need to capture `this`, short expressions passed to higher-order functions, these are cases where the arrow syntax is clean, appropriate, and idiomatic.

```js
const activeUsers = users.filter((u) => u.active);
const names = activeUsers.map((u) => u.name);
```

That is good code. It reads like a sentence. The callback has no name because it does not need one.

But a module-level function that formats a date? A request handler in an Express route? A recursive function? These are named, standalone things. They deserve `function`. Not because `const` is wrong, but because `function` is more expressive, hoisted, fully capable, and easier to scan.

My default is `function`. I reach for `=>` when I have a reason: a short inline callback, a closure that needs the outer `this`, a one-liner where the implicit return makes the code clearer. Everywhere else, `function` is not the old way, it is the right way.
