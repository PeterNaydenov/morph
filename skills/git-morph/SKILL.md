---
name: git-morph
description: |
  Help developers use `@peter.naydenov/morph` (the `morph` template engine,
  v3.x.x): build a render function with `morph.build(templateDescription)`,
  render with `renderFn('render', data)`, store templates in a built-in
  storage with `morph.add` / `morph.get` / `morph.remove` / `morph.list` /
  `morph.clear`, and use helpers + actions for data decoration. Use when a
  developer asks for a logic-less text template engine (HTML/CSS/config/code),
  `{{ placeholder }}` syntax with action chains, partial rendering
  (`'snippets'`), `curry` for partial data pre-fill, or `escape: true` for
  safe HTML interpolation. Do NOT use for: DOM diffing / virtual DOM (this
  engine outputs strings — pair it with a DOM library), JSX-style files
  (use the companion `vite-plugin-morph` for `.morph` files), reactive
  view libraries (use `@peter.naydenov/signals` or `data-pool` to drive the
  re-render), or fixing bugs in the engine itself.
---

# git-morph helper

A text-based template engine. Templates are plain strings with
`{{ placeholder }}` syntax. Placeholders can carry an action chain
(`{{ name : act2, act1 }}`) that runs from right to left, decorating the
data with helper functions before it lands in the output. Helpers can be
either template fragments or JS functions, and helpers can call other
helpers via the `useHelper` argument (since v3.3.0).

Source of truth:
- `src/main.js` — top-level public API: `build`, `get`, `add`, `list`, `clear`, `remove`; the location-argument contract for the storage methods
- `src/methods/build.js` — `build()` factory; the `COMMANDS` list (`'render'`, `'debug'`, `'snippets'`, `'set'`, `'curry'`); the `__isMorphTemplate` marker on success
- `src/methods/render.js`, `processPlaceholders.js`, `executeActions.js`, `actionData.js`, `actionRender.js`, `actionMix.js`, `actionSave.js`, `actionExtendedRender.js` — the action system
- `src/methods/_defineType.js` — how a value's "data type" is determined
- `src/methods/_escape.js` — built-in `escape` helper, `escape: true` template option, `raw` opt-out action, `curry` injection safety
- `test/` — executable examples for every pattern below
- `README.md` — narrative docs, action prefix legend, command list, escape rules

## Procedure

1. **Map the developer's intent to the right shape of `morph` call**:
   - "I want a small template engine" / "I have a string with `{{name}}` in it" → `morph.build({ template, helpers?, handshake?, escape? })`, then `renderFn('render', data)` (or `renderFn('render', 'demo')` to use handshake)
   - "Reuse a template across renders" / "Store the template once" → `morph.add(name, templateDescription)` once, then `morph.get(name)('render', data)` anywhere
   - "List / clear / remove templates from the storage" → `morph.list([storageNames?])`, `morph.clear()`, `morph.remove(location)`
   - "Render only some placeholders" → use `'snippets'` command: `renderFn('snippets: a, b', data)` returns selected placeholders joined by `'<~>'`
   - "Pre-fill part of the data and pass the rest later" → use `'curry'`: `const curried = renderFn('curry', { name: 'Alice' })`, then `curried('render', { place: 'Mars' })`
   - "Modify helpers/handshake on an existing render function" → use `'set'`: `renderFn('set', { helpers, handshake, placeholders })`
   - "Get the count of unresolved placeholders" / "Get the original template string" → use `'debug'`: `renderFn('debug', 'count')` or `renderFn('debug', 'raw')`
   - "Safely render user-provided data into HTML" → pass `escape: true` in the template description; data-only placeholders get HTML-escaped

2. **Generate code that follows the real API contract**:
   - ESM import: `import morph from '@peter.naydenov/morph'` (CJS: `require('@peter.naydenov/morph')`)
   - The default export is the **engine API object** — `morph.build`, `morph.get`, `morph.add`, `morph.list`, `morph.clear`, `morph.remove`. There is no factory call; it's a singleton.
   - `morph.build(tpl)` where `tpl = { template, helpers?, handshake?, escape? }`. The `template` field is required; the rest are optional.
   - The result of `build` is a **render function** with the signature `renderFn(command?, data?, dependencies?, ...postprocess)`. The first arg is the command name; the second is data (or a debug instruction when the command is `'debug'`).
   - Default command is `'render'`. `renderFn()` (no args) renders with empty data, which usually isn't what you want.
   - `morph.add(location, tplfn)` — `location` is a string shorthand for default storage, or `[name, storageName?]`. The `tplfn` is either a pre-built render function (passes through) or a template description object (gets built first).
   - `morph.get(location)` — same `location` contract. Returns the render function. On miss, returns a callable error function with `isError: true` — check it BEFORE rendering.
   - `morph.remove(location)` — same `location` contract. Returns `undefined` on success, an error string on miss.
   - **Action syntax: `{{ dataSource : act2, act1 : placeholderName? }}`.** Actions run right-to-left. `act1` runs first, its result feeds `act2`. The placeholder name (after the second `:`) is for snippet selection.

3. **Apply the action and prefix rules**:
   - **No prefix** = render function. Returns a string that replaces the placeholder.
   - **`>` prefix** = data function. Returns data to be consumed by the next action.
   - **`[]` prefix** = mixing function. Merges array results into a single value (anonymous `[]` is `resultList.join('')`).
   - **`+` prefix** = extended render. Receives a deep branch of the requested data (e.g. `+join` gets the whole `data.list` as a sub-tree).
   - **`^` prefix** = memory action. Snapshots the data; helpers can read it back via the `memory` arg as `memory[name]`.
   - **`^^` prefix** = overwrite action. The current data becomes available to ALL placeholders, not just this one. Use sparingly.
   - **Anonymous mixing (`[]`)** is the built-in `join('')`. Useful for collapsing lists: `{{ list : li, [] }}` renders each list item with `li`, then joins them.
   - **Data-source tokens**: `name` reads the `name` field; `@all` passes the whole data object; the placeholder can have NO data-source (`{{ :someAction }}`) when the action produces the value from scratch.

4. **Apply the helper function contract**:
   - Helpers can be template strings (treated as mini-templates — see `li: '<li>{{text}}</li>'`) or JS functions.
   - Function helpers receive a single args object: `{ data, dependencies, full, useHelper, memory }`. **Always destructure** — do not rely on positional args.
   - `useHelper(name, dataOverride?)` lets a helper call another helper. The `dataOverride` is optional; if omitted, the caller's current data is used.
   - The built-in `escape` helper is always available unless the developer defines a helper with that name (user wins). It escapes `& < > " '`.
   - Built-in action `raw` opts a single data-only placeholder out of `escape: true` — use for trusted HTML.
   - **Curry is injection-safe.** Data values rendered via `curry` cannot inject new placeholders; `{{ role }}` in user data renders as literal text.

5. **Apply the order-of-execution rules**:
   - Helpers are resolved by name at render time. An unknown helper name produces a "missing helper" error (returned as a string in the output), not a thrown exception.
   - The `escape: true` option escapes data-only placeholders. Placeholders with actions are NOT auto-escaped — helpers are your code and often produce markup on purpose. Escape inside them when they interpolate user data.
   - `set` and `curry` return NEW render functions; the original is unchanged (the engine is functional/immutable by design).
   - `snippets` command joins selected placeholder results with `'<~>'`. The first form is the names; the second is the indexes (0-based order of appearance).
   - `'snippets'` alone (no colon) returns ALL placeholders. `'snippets: a, b'` selects by name. `'snippets: 0, 2'` selects by index. Anything else starting with `'snippets'` (e.g. typo) returns a clear error.

6. **Surface only the relevant gotcha proactively** — pick at most one from the list below that applies to the current example, and only if the user is unlikely to know it:
   - **Actions run right-to-left.** `{{ name : act2, act1 }}` means `act1` runs FIRST, its result feeds `act2`. The first action after the data source is the rightmost. The leftmost action is the last to run. This trips up developers coming from left-to-right pipeline conventions.
   - **Helpers must destructure the args object.** A helper `getReady: (data) => ...` looks like a normal function but receives a single args object — `data` is the args bag, not the data field. Always write `({ data, useHelper, memory }) => ...`.
   - **`morph.get()` returns a callable error function on miss**, not `undefined`. Check `if (tpl.isError)` before rendering; the error function is itself callable (it returns the error message) but `tpl.isError` is the marker.
   - **`escape: true` only escapes data-only placeholders.** If a placeholder has any action, the action's output is NOT auto-escaped. Add `: escape` to the action chain or use the `escape` helper inside a custom helper.
   - **`raw` action opts a single placeholder out of `escape: true`.** Mark trusted HTML: `{{ trustedHtml : raw }}`.
   - **The `__isMorphTemplate` marker** is set on the result of `build()` so `useHelper` can detect a built render function. Do not delete it.
   - **Commands are case-sensitive.** `'Render'` is wrong; it's `'render'`. `COMMANDS` in `build.js` is the canonical list.

7. **If the request is for DOM-level reactivity** (auto re-render on state change), `morph` is a pure template engine — it does not watch state. Pair it with `@peter.naydenov/signals` or `@peter.naydenov/data-pool` for the reactive layer.

8. **If the request is for `.morph` files** (HTML + CSS + JS in one file), `morph` is the engine; `vite-plugin-morph` is the file compiler. The plugin produces ES modules that import this engine.

## Output contract

- One focused code snippet, ESM by default (CJS if asked)
- One line of context explaining which command/option is used and why
- A pointer to the relevant source/test section if the developer wants to dig deeper
- Surface at most one relevant gotcha proactively, only if it applies to the example
- Never include a helper written as a positional function (e.g. `(data) => data.name`) — they always receive an args object
- Never include an action chain with left-to-right assumed order — it's right-to-left

## Failure handling

- The developer's use case is genuinely ambiguous (e.g., "I need templates") → start with the `morph.build` + `renderFn('render', data)` pair; mention `morph.add`/`morph.get` for the storage pattern
- Developer reports a bug or unexpected behavior in `morph` itself → do NOT try to fix from this skill; route to the project source or maintainer
- Developer wants a feature `morph` doesn't have (loops with index, async helpers, conditionals) → actions + helpers are the answer; say so plainly, don't invent an API
- Helper name typo → the engine returns a "missing helper" string at the placeholder position (not a thrown error). If the user is debugging output and sees raw helper names in the rendered string, that's the symptom.

## Examples

**"Render `Hello {{name}}!` with a known data object"**

```js
import morph from '@peter.naydenov/morph'

const greet = morph.build({
  template: 'Hello, {{name}}!',
  handshake: { name: 'World' },  // demo data
})

greet('render', { name: 'Peter' })   // 'Hello, Peter!'
greet('render', 'demo')             // 'Hello, World!'   (uses handshake)
```

`morph.build` takes a description object (`{ template, helpers?, handshake?, escape? }`) and returns a render function. The render function's first arg is the command (`'render'` is the default — you can omit it). The second arg is the data; passing the literal string `'demo'` switches to the handshake. See `build` in `src/methods/build.js` and the "Basic Usage" example in the README.

**"Render a list of items, each as a link"**

```js
import morph from '@peter.naydenov/morph'

const links = morph.build({
  template: `{{ items : li, [] }}`,
  helpers: {
    li: `<li><a href="{{href}}">{{text}}</a></li>`,
  },
  handshake: {
    items: [
      { text: 'Home',  href: '/' },
      { text: 'About', href: '/about' },
    ],
  },
})

links('render', {
  items: [
    { text: 'Docs',  href: '/docs' },
    { text: 'GitHub', href: 'https://github.com' },
  ],
})
// -> '<li><a href="/docs">Docs</a></li><li><a href="https://github.com">GitHub</a></li>'
```

Action chain `items : li, []` reads from right to left: `li` runs first on each item, then `[]` (anonymous mixing) joins the array of `li` outputs into one string. `li` is a template-string helper — the engine treats it as a mini-template. See `actionMix.js` for the `[]` builtin and the "Actions" section in the README.

**"Safely render user-supplied data into HTML"**

```js
import morph from '@peter.naydenov/morph'

const comment = morph.build({
  template: `<p>{{ comment }}</p>`,
  escape: true,
})

comment('render', { comment: '<script>steal()</script>' })
// -> '<p>&lt;script&gt;steal()&lt;/script&gt;</p>'
```

`escape: true` makes the engine HTML-escape data-only placeholders. Placeholders with actions are NOT auto-escaped — add `: escape` to the action chain or escape inside your custom helper. The built-in `escape` helper can be called from other helpers via `useHelper('escape', value)`. To opt a single data-only placeholder out, use the `raw` action: `{{ trustedHtml : raw }}`. See `_escape.js` and the "HTML Escaping" section in the README.

**"Reuse a template across the app via storage"**

```js
import morph from '@peter.naydenov/morph'

morph.add('greet', { template: 'Hello, {{name}}!', handshake: { name: 'World' } })

const tpl = morph.get('greet')
if (!tpl.isError) tpl('render', { name: 'Peter' })   // 'Hello, Peter!'

morph.list()           // ['greet']
morph.remove('greet')
morph.clear()          // drops every storage except the empty 'default' bucket
```

`add` accepts either a description object (gets built) or a pre-built render function (used as-is). `get` returns a callable error function on miss — check `isError` BEFORE rendering. The location argument is a string shorthand for the `'default'` storage, or `[name, storageName?]` for a named storage. See the storage helpers in `src/main.js`.
