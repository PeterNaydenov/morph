---
name: Bug report
about: Something is broken or behaves wrong
title: ''
labels: bug
assignees: ''
---

## Describe the bug

A clear and concise description of what the bug is.

## To reproduce

Minimal code snippet that triggers the bug. Drop the smallest possible example — ideally 5–15 lines.

```js
// Your code here
import morph from '@peter.naydenov/morph'

const fn = morph.build({ ... })
const result = fn('render', { ... })
// result: "something wrong"
// expected: "something right"
```

## Expected behaviour

What you expected to happen.

## Actual behaviour

What actually happens. If the engine returned a string instead of throwing, paste the literal string.

## Environment

- **@peter.naydenov/morph version:** (run `npm ls @peter.naydenov/morph`)
- **Node.js version:** (run `node --version`)
- **Runtime:** Node / browser / Deno / Bun
- **OS:** macOS / Linux / Windows
- **Bundler / framework** (if any): Vite / Webpack / Next / none

## Additional context

Anything else that might help — link to a related issue, a screenshot of the wrong output, etc.
