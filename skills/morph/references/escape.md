# HTML escaping

Morph renders strings to text — it does not parse, sanitise, or
otherwise interpret the values it places into the output. **User-supplied
data lands verbatim in the output unless you opt in to escape.** This is
the single biggest source of bugs and security issues when shipping a
template that touches user input.

The engine gives you three escape modes, all composable.

## 1. The built-in `escape` helper

Always available, no declaration needed. Escapes `& < > " '`:

```js
const fn = morph.build({
  template: '<p>{{ comment : escape }}</p>',
});
fn('render', { comment: '<script>steal()</script>' });
// '<p>&lt;script&gt;steal()&lt;/script&gt;</p>'
```

Use it in any action chain:

```js
'{{ items : escape, li }}'  // escape each item, then render with 'li'
```

Or from inside a custom helper via `useHelper`:

```js
helpers: {
  show: ({ data, useHelper }) => useHelper('escape', data),
}
```

### Overriding the built-in

Defining your own helper named `escape` replaces the built-in. To call
the built-in anyway, use `useHelper('escape', value)` — but `useHelper`
will resolve your override first. If you need the engine's `escape` for
sure, don't define your own with the same name.

## 2. The `escape: true` template option

Auto-escape every **data-only** placeholder in the template. Placeholders
with actions are not auto-escaped — helpers are your code, often
producing markup on purpose.

```js
const fn = morph.build({
  template: '<p>{{ comment }}</p>',
  escape: true,
});
fn('render', { comment: '<img src=x onerror=alert(1)>' });
// '<p>&lt;img src=x onerror=alert(1)&gt;</p>'
```

### Opting out with `raw`

Mark a single placeholder as trusted:

```js
template: '<div class="user">{{ name }}</div><div class="bio">{{ bio : raw }}</div>'
```

`{{ x : raw }}` writes `x` verbatim. `{{ x : raw, render }}` is the
same — `raw` removes itself from the action list before the rest
executes.

The `raw` action is a flag, not a helper. Defining a helper named `raw`
will **not** be picked up by the engine.

### `raw` only applies to top-level data-only placeholders

The marker is set during template parse (`_readTemplate.js`) on the
placeholder object, and read during `processPlaceholders.js` in the
`place()` function. Both paths run for **placeholders parsed from a
template string** — the ones morph sees when you call `morph.build()`.

It does **not** apply inside a function helper. If you write a function
helper that builds a string with `{{ body : raw }}` in it, the
placeholder goes through `_renderHolder.js`, which treats the entire
text between `{{` and `}}` as a field name. `data["body : raw"]` is
not what you want, and the placeholder is left literal in the output.

To preserve the `raw` semantic inside a function helper, simply don't
call `useHelper('escape', value)` on the trusted data. Helper output
is trusted by default; skipping the escape call is the equivalent of
the `raw` action.

To use `raw` in a way that actually runs, route the placeholder
through a **sub-template** built with `morph.build({..., escape: true})`
and called via `useHelper` from the outer helper. `useHelper` detects
the `__isMorphTemplate` marker on the function and routes the call
through the full engine, where `: raw` and action chains are honoured.

## 3. Escape inside a helper

When a helper interpolates a user value into its return, escape at the
interpolation point:

```js
helpers: {
  commentBlock: ({ data, useHelper }) =>
    `<div class="comment">${useHelper('escape', data.text)}</div>`,
}
```

Helper output is trusted by default — the engine does not re-escape
what a helper returns. If your helper composes untrusted values,
escape them at composition time.

## The security boundary

```
+-----------------+   data-only placeholder    +-----------------+
| untrusted input | ------------------------> |  output (HTML)  |
+-----------------+   escape: true applies     +-----------------+

+-----------------+   helper output            +-----------------+
| helper returns  | ------------------------> |  output (HTML)  |
+-----------------+   NOT auto-escaped         +-----------------+
```

- **Data-only placeholders**: auto-escaped if `escape: true`; otherwise raw. The engine assumes the template author is the only one writing the placeholder and that the value comes from data, not from the template.
- **Helper output**: trusted. The engine assumes the helper author is responsible for escape at the points where untrusted data enters the helper.
- **`useHelper('escape', value)`**: a way to call the escape helper from inside a helper, regardless of whether `escape: true` is set.

## The `escape` flag survives `set` and `curry`

A render function produced by `fn('set', {...})` keeps the original
`escape` setting. So does a render function produced by `fn('curry', data)`.
You don't need to re-pass `escape: true` on every transformation.

## Demo data is escape-safe by default

`fn('render', 'demo')` renders with the **handshake** — your own data.
Treat the handshake as code, not as user input. If the handshake
contains HTML, the output will contain that HTML.

## Common mistakes

| Symptom | Likely cause |
| --- | --- |
| User-provided `<script>` reaches the DOM | `escape: true` not set, and the placeholder has no action or uses `raw` |
| Helper output shows `&lt;` literally | The helper double-escaped — you used the built-in `escape` on a string that was already escaped, or the helper is wrapping another helper that already escaped |
| `escape: true` is ignored | The placeholder has actions (e.g. `{{ x : myHelper }}`) — actions are not auto-escaped, escape inside the helper |
| `raw` is not effective | The placeholder has an action chain that runs before `raw` and escapes — `raw` only opts out of auto-escape, not explicit `: escape` actions |
| `{{ x : raw }}` shows `{{ x : raw }}` literally | Engine version < 3.2.0 — `raw` was added later. Check the README's "Reserved prefix" notes. |
| Migrating code that uses `escape: true` and the user's helper named `escape` | The user's helper wins (built-in is registered first, user overrides win). Rename the helper or call `useHelper('escape', val)` to call the built-in. |

## Quick checklist for a template that touches user data

1. Set `escape: true` in the description.
2. Mark every placeholder that intentionally emits raw HTML with `: raw`.
3. For each helper that interpolates a user value, escape at that
   interpolation point with `useHelper('escape', val)`.
4. Test with a malicious value (e.g. `<img src=x onerror=alert(1)>`) and
   confirm the output is escaped, not parsed.
5. Re-test after every `set` or `curry` — derived templates keep the
   `escape` setting but the helper list can change.
