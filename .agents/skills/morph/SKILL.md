---
name: morph
description: |
  Help developers use the `@peter.naydenov/morph` text-based template engine
  correctly. Use this skill when the user is building, configuring, or
  debugging `.js` / `.mjs` code that uses `morph.build()`, `morph.add()`,
  `morph.get()`, writing template strings with `{{ }}` placeholders, defining
  helper functions, choosing action prefixes (`>`, `[]`, `+`, `^`, `^^`, `#`),
  using the `render` / `debug` / `snippets` / `set` / `curry` commands, working
  with the built-in `escape` helper, or calling helpers from helpers via
  `useHelper`.

  Load this skill when the user mentions: "morph", "@peter.naydenov/morph",
  "morph.build", "morph.add", "morph.get", "morph placeholders", "morph
  helpers", "morph action chain", "morph useHelper", "morph escape",
  "morph curry", "morph snippets", "morph handshake", or asks to "render a
  template with morph", "decorate template data with morph", "build a
  template engine pipeline".

  Do NOT load this skill for: the `.morph` file format / Vite plugin (that's
  a separate package, `vite-plugin-morph`, with its own skill), or for
  general Handlebars / Mustache / EJS / Pug / Liquid questions. Morph's
  action-chain and prefix system is unique to it; do not transfer concepts
  from other engines without checking.
---

# morph (@peter.naydenov/morph)

`@peter.naydenov/morph` is a small, text-based, **logic-less** template
engine. The template is a string with `{{ }}` placeholders. Data decorates
the template through an **action chain** you write inside the placeholder.
Helpers are plain functions or template strings that the engine calls per
placeholder.

It is **not** a component framework. It does not produce a virtual DOM,
component instances, reactive state, or a render tree. It produces a string.

## Mental model — read this first

There are four moving parts:

1. **Template description** — the object you pass to `morph.build({ template, helpers, handshake, escape? })`. Required: `template`. Optional: `helpers` (functions/templates), `handshake` (demo data), `escape` (HTML-escape data-only placeholders).
2. **Render function** — what `build()` returns. A function `(command, data, dependencies?, ...postprocess?) -> string | newRenderFn`. The first argument is a **command** (`render` default). Default command is `render`, so `fn()` works when the template needs no external data.
3. **Placeholder** — a `{{ ... }}` in the template. Form: `{{ dataSource? : action?, action?, ... : placeholderName? }}`. Data source is optional. Actions run right-to-left. Placeholder name is optional (used by `snippets`).
4. **Action prefix** — single character that tells the engine what kind of helper to call. No prefix = render. `>` = data, `[]` = mix, `+` = extended render, `^` = memory, `^^` = overwrite, `#` = level step.

Helpers receive a destructured context: `{ data, dependencies, full, useHelper, memory }`. The `data` is the current placeholder's value. `useHelper(name, dataOverride?)` lets a helper call another helper.

Full API and option list: see `references/api.md`. Placeholder/action syntax in depth: `references/placeholders-and-actions.md`. Commands: `references/commands.md`. Helper context: `references/helpers.md`. Escaping: `references/escape.md`.

## Procedure — building a single template

1. **Write the template string** as plain text with `{{ }}` placeholders. HTML comments and runs of multiple whitespace are stripped at parse time (don't rely on them to control output).
2. **Identify what the placeholders need.** A placeholder with only a data source (no action) is a direct binding. A placeholder with an action chain needs helpers — list the helpers and decide which prefix each one needs.
3. **Pick each helper's prefix by what it returns, not by what it does:**
   - Returns a string that becomes the placeholder output → **render** (no prefix).
   - Returns transformed data that the next action will process → **data** (`>name`).
   - Joins an array of results into one string → **mix** (`[]name`).
   - Receives a deep branch of the data → **extended render** (`+name`).
   - Snapshots current data for use by other helpers later in the chain → **memory** (`^name`).
   - Replaces the level data so the next action sees the new value → **overwrite** (`^^`).
4. **Define helpers** as object entries in the template description. Each can be a function (with `({ data, dependencies, full, useHelper, memory })`) or a string template that itself uses `{{ }}` placeholders.
5. **Decide the action-chain order.** Actions run **right-to-left** — the rightmost action runs first on the data, its result feeds the next, and so on. `{{ x : a, b, c }}` means `a(b(c(x)))` is **wrong**; it means `c` runs first on `x`, then `b`, then `a`.
6. **Provide a `handshake`** (demo data) if you want the template to be renderable without a real call. Render with `('render', 'demo')`.
7. **Pass `escape: true`** in the description when the template renders user-controlled strings into HTML. Mark exceptions with the `raw` action.
8. **Build the render function once, then call it many times.** Don't rebuild per render.

Why this order: data-only placeholders are simple and easy to get right; action chains are the source of most bugs (wrong prefix, wrong order, missing level step). Listing helpers before writing the template forces the prefix choice.

## Procedure — building a multi-template app

1. **Use the storage for everything that lives in the same process.** `morph.add(['name'], description)` once at module init; `morph.get(['name'])(...)` to render. Don't keep a parallel registry of render functions.
2. **Group related templates into named storages** (`morph.add(['card', 'public'])` vs `morph.add(['card', 'admin'])`) when one app needs the same template name in different scopes. `morph.list(['public', 'admin'])` returns names from both.
3. **Pass `location` as an array.** `morph.add(['myTemplate'])` not `morph.add('myTemplate')`. The string form is a v0.x leftover that v3.4.4 still rejects with a console error and stores nothing.
4. **Inject external services through `dependencies`** at render time, not at build time. The render function takes a second argument: `fn('render', data, { api, store, t })`. Build-time dependencies are reserved for truly static setup.

## Procedure — HTML escaping

1. **Default-off.** The engine does not escape unless you opt in. Don't ship a template that interpolates user data without choosing an escape mode.
2. **Pick one of three levels:**
   - `escape: true` in the description — auto-escapes every data-only placeholder. Mark exceptions with `{{ trusted : raw }}`.
   - `{{ userInput : escape }}` in the template — escapes just that placeholder. Defining your own helper named `escape` overrides the built-in.
   - Inside a helper, call `useHelper('escape', value)` to escape a string before stitching it into your output.
3. **Don't escape helper output** unless the helper itself interpolates user data. Helpers are your code; their return value is trusted by default. Escape inside the helper when you compose untrusted values.
4. **`'render', 'demo'` is escape-safe by default** because the handshake is your own data. The risk is always call-time data.

Full escape behaviour, the `raw` action, and the security boundary: `references/escape.md`.

## Output contract

A complete deliverable is:

- An import: `import morph from '@peter.naydenov/morph'`.
- One or more template descriptions built with `morph.build(...)` or stored via `morph.add(['name'], ...)`.
- A render call with the right command (`render`, `debug`, `snippets`, `set`, `curry`).
- An escape decision for every placeholder that touches user-controlled data.

For multi-template apps, also include:

- The storage layout (which templates go where).
- The handshake for each template (so `'render', 'demo'` is meaningful).
- The dependencies contract — what keys render-time code may pull from `dependencies`.

## Failure handling

- **Template renders the literal `{{ name }}` instead of substituting**: the placeholder parser didn't recognise it. Run `fn('debug', 'placeholders')` to see what the engine actually parsed. Common cause: a stray colon or a placeholder name starting with a reserved prefix character.
- **Action chain has no effect**: the action name is a string but the helper is a function (or vice versa) and the engine silently no-ops. Use the action **prefix** to disambiguate (no prefix for functions-as-render, `>name` for functions-as-data, `[]name` for functions-as-mix, `+name` for functions-as-extended-render).
- **Helper returns `[object Object]` or similar**: the helper's contract is wrong for the action type. Render helpers return a string. Data helpers return data. Mix helpers return a string and expect an array. The prefix tells the engine which contract to enforce.
- **`morph.get(['x'])` returns an error function**: the storage or template doesn't exist. The returned function is callable and returns a human-readable error string — call it to read the error.
- **`useHelper('name')` returns `( Error: Helper 'name' is not available )`**: the helper isn't in the description's `helpers` object, or the `useHelper` factory was built before the helper was added.
- **`fn('render', 'demo')` does nothing useful**: the description has no `handshake`. Either add one or pass real data instead of `'demo'`.
- **Curry returns a broken template**: user-controlled values reached the curried render. The engine neutralises `{{ }}` in data during curry, so the result should be safe — but the curried template must still go through a normal `render` to substitute the rest.
- **Migration from v2.x → v3.x**: the render function's first arg is now a command, not data. `myTemplate('demo')` becomes `myTemplate('render', 'demo')`. The second arg becomes data; debug instructions are now under `fn('debug', instruction)`. See `Migration.guide.md` in the repo.
- **Skipping items in a list with `null` doesn't fully omit them**: the auto-mix step (`[]` with no name) joins with `''` so `null` becomes the literal string `""`, but the engine still records the null in the data slice. To fully filter drafts / hidden items, write an explicit mix helper that calls `.filter(x => x != null)` on the joined results. The `test/05-data.test.js` "Conditional rendering with string literals" pattern is the canonical example.

## Anti-patterns — things AI agents do wrong with this engine

- **Treating morph like a component framework.** No `Component`, no `setup`, no `state`, no `lifecycle`. It's a string-in, string-out engine. Wrap it in a component framework if you need one; don't pretend morph is one.
- **Confusing action-chain order.** `{{ x : a, b, c }}` runs `c` first, then `b`, then `a`. Right-to-left. Writing it as a left-to-right pipeline is the #1 AI bug.
- **Wrong prefix for the helper's contract.** A data helper (returns transformed data) without the `>` prefix is treated as a render helper. The engine then tries to coerce its non-string return into the template, and you get garbage.
- **Using `{{ ? cond }}` for conditional render.** The `?` prefix was deprecated in 3.2.0 and is no longer recognised. Use a render helper that returns an empty string when the condition is false, or split into two placeholders.
- **`morph.add('name', tpl)` instead of `morph.add(['name'], tpl)`.** The string form is a v0.x leftover; v3.4.4 logs an error and stores nothing. Always use the array form.
- **`fn('demo')` instead of `fn('render', 'demo')`.** v2.x command. v3.x requires the command as the first argument. Demo data is a string passed as the second arg to `render`.
- **Forgetting HTML escape.** Morph does not escape by default. If the template renders user input, set `escape: true` or add `: escape` to each placeholder.
- **Injecting helpers through the template string.** Helpers are declared in the description's `helpers` object — not in the template. Writing a function in the template is parsed as text.
- **Helpers with positional parameters.** Migration from 1.x → 2.x switched to named destructured args. The engine calls helpers as `helper({ data, dependencies, full, useHelper, memory })`, not `helper(data)`.
- **Rebuilding the template per render.** `morph.build()` is meant to be called once. The render function it returns is cheap to call repeatedly.
- **Storing rendered output in the description's `handshake`.** Handshake is the *input* to the render function, not its output. Use it to define demo data.
- **Mutating data the engine passed in.** The engine deep-copies the call data (`walk({ data: d })` in `processPlaceholders.js`) before rendering, so mutating the call-site data is harmless. Mutating `dependencies` is a different story — it's shared across calls; don't write to it.

## Examples

**Example 1 — A template with helpers and an action chain**

```js
import morph from '@peter.naydenov/morph'

const profile = morph.build({
  template: `
    <h1>{{ name : titleCase }}</h1>
    <ul>{{ skills : join : skillList }}</ul>
  `,
  helpers: {
    titleCase: ({ data }) =>
      data.replace(/\b\w/g, c => c.toUpperCase()),
    join: ({ data }) => data.join(', '),
  },
  handshake: {
    name: 'ada lovelace',
    skills: ['math', 'engines', 'logic'],
  },
})

profile('render', 'demo')
// "  <h1>Ada Lovelace</h1>\n    <ul>math, engines, logic</ul>\n"
```

**Example 2 — HTML escape with `escape: true` and one trusted exception**

```js
const comment = morph.build({
  template: `<div class="user">{{ name }}</div><div class="body">{{ body : raw }}</div>`,
  escape: true,
  handshake: { name: '<script>steal()</script>', body: '<i>safe html</i>' },
})

comment('render', 'demo')
// "<div class=\"user\">&lt;script&gt;steal()&lt;/script&gt;</div><div class=\"body\"><i>safe html</i></div>"
```

**Example 3 — Storage with named storage buckets**

```js
import morph from '@peter.naydenov/morph'

morph.add(['header', 'public'], { template: 'Hello, {{ name }}!', handshake: { name: 'world' } })
morph.add(['header', 'admin'],  { template: 'Admin: {{ name }}',   handshake: { name: 'root' } })

morph.get(['header', 'public'])('render', 'demo') // "Hello, world!"
morph.get(['header', 'admin']) ('render', 'demo') // "Admin: root"
```

## References

- `references/api.md` — `morph.build`, `morph.add`, `morph.get`, `morph.list`, `morph.clear`, `morph.remove`
- `references/placeholders-and-actions.md` — placeholder syntax, data sources, action prefixes, right-to-left order, level markers
- `references/commands.md` — `render`, `debug`, `snippets`, `set`, `curry`
- `references/helpers.md` — helper signature, `useHelper`, `dependencies`, `memory`
- `references/escape.md` — three escape modes, `raw` action, security boundary

## External docs (for the model, not the user)

- `README.md` in this repo — feature tour and basic examples
- `Migration.guide.md` in this repo — v0→v1, v1→v2, v2→v3 breaking changes
- `Changelog.md` in this repo — release history
- `test/` in this repo — runnable examples of every feature
- Companion tool (separate package): `vite-plugin-morph` for the `.morph` file format
