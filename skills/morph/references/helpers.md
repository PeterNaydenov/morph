# Helpers

Helpers are the functions and template strings the engine calls to
decorate data inside a placeholder. They are declared in the
`templateDescription.helpers` object — **not in the template string**.

## Two kinds

| Kind | Declared as | Called when | What it returns |
| --- | --- | --- | --- |
| **Helper function** | `function name({ ... }) { ... }` | A placeholder with an action that resolves to this name | Whatever the contract for the action type requires (string for render, data for data, etc.) |
| **Helper template** | `const name = \`...\`;` (a string) | A placeholder with an action that resolves to this name and the action is **not** prefixed | A render-only shortcut. The engine parses the string the same way as a top-level template and applies the action. |

```js
helpers: {
  // Function
  formatName: ({ data }) => data.name.toUpperCase(),

  // String template
  listItem: `<li>{{ text }}</li>`,
}
```

## Helper context (named arguments)

The engine calls helpers with a **single destructured object**. Available
keys:

| Key | Type | When it's set |
| --- | --- | --- |
| `data` | `any` | The current data value (post-action, or raw for the rightmost action) |
| `dependencies` | `object` | Build-time + render-time dependencies merged |
| `full` | `any` | The full data context (same as `data` for the deepest level, the entire object for shallower) |
| `useHelper` | function | `(name: string, dataOverride?: any) => any` — call another helper |
| `memory` | `object` | Per-render memory snapshots (`^name` actions write here) |

```js
helpers: {
  show: ({ data, dependencies, full, useHelper, memory }) => {
    // data is the placeholder's value
    // dependencies is the merged deps object
    // full is the original data (or nearest container)
    // useHelper lets you call another helper
    // memory is the per-render snapshot map
  },
}
```

> **Migration note (v1 → v2).** Helpers used to take positional
> arguments (`helper(data, dependencies, memory)`). v2 switched to named
> destructured args. v3 keeps the named-args form.

## `useHelper(name, dataOverride?)`

A helper can call another helper via the `useHelper` function. The
`useHelper` factory is built per render and per data slice, so it
captures the current data context.

```js
helpers: {
  format: ({ data }) => `[${data}]`,
  process: ({ data, useHelper }) => useHelper('format'),
  customProcess: ({ data, useHelper }) => useHelper('format', 'Override'),
}
```

`useHelper` handles both helper **functions** and helper **templates**.
For a template helper, it builds the result by running the template
string through the current render context (with the override data).

### Detecting a `build()` output

`useHelper` distinguishes a `build()` render function from a user helper
by a `__isMorphTemplate` marker on the function (added in 3.4.2 to fix
a heuristic that misidentified 2-arg user helpers). Don't depend on
function arity or any other signal.

### Recursive calls

A helper can call itself through `useHelper` as long as the data
eventually reaches a base case:

```js
helpers: {
  factorial: ({ data, useHelper }) => {
    if (data <= 1) return '1';
    return useHelper('factorial', data - 1) + ' * ' + data;
  },
}
```

The engine doesn't track recursion depth — a runaway helper will
stack-overflow the way any JavaScript recursion would.

### Missing helper

If `useHelper('missing')` is called and the helper isn't registered, the
result is the literal string `( Error: Helper 'missing' is not available )`.
It surfaces in the rendered output as a visible error — easier to debug
than a silent `undefined`.

## `dependencies`

Two layers:

1. **Build-time** — passed to `morph.build(description, asTuple, buildDependencies)`. Static for the life of the render function.
2. **Render-time** — passed as the third arg of the render call: `fn('render', data, dependencies)`. Merged on top of build-time for that call only.

The engine calls helpers with the merged dependencies object. Use
`dependencies` for things the template needs that aren't data: a logger,
an i18n function, a feature flag, a URL builder.

```js
const t = (key) => ({ en: { hello: 'Hello' }, bg: { hello: 'Здравей' } }[key] || key);
const fn = morph.build({
  template: '{{ key : >translate }}',
  helpers: { translate: ({ data, dependencies }) => dependencies.t(data) },
});
fn('render', { key: 'hello' }, { t }); // 'Hello'
fn('render', { key: 'hello' }, { t: (k) => 'Здравей' }); // 'Здравей'
```

> Don't write to `dependencies`. It is shared across calls; mutations
> leak between renders.

## `memory`

The `^name` action snapshots the current data into `memory[name]`. Any
helper in the same render can read it.

```js
helpers: {
  withUser: ({ data, memory }) => {
    return data + ' / user=' + memory.user.name;
  },
}
template: '{{ greeting : ^user, withUser }}'
```

Memory is per-render — it's discarded when the render call completes.
Use it to thread data through a chain without re-deriving.

## Helper as a function vs as a string template

A string template helper is a shorthand for "render this template with
the current data and prepend it to the placeholder output". It's
useful for one-line wrappers:

```js
helpers: {
  bold: '<b>{{ text }}</b>',
}
template: '{{ message : bold }}'
// '<b>Hello</b>' (assuming data.message = { text: 'Hello' })
```

Function helpers are required when:

- The helper needs to do work (regex, computation, control flow).
- The action is a non-render prefix (`>name`, `[]name`, `+name`).
- The helper needs to call other helpers via `useHelper`.

## Common mistakes

| Symptom | Likely cause |
| --- | --- |
| `useHelper` returns `( Error: Helper 'x' is not available )` | Helper not in `helpers` (typo, scope, or not declared) |
| Helper sees `data` as the entire data object | The placeholder didn't specify a data source; use `{{ @all : helper }}` or the engine gives you the current context |
| `dependencies` is empty | You forgot to pass the third arg to `fn('render', data, deps)`. Build-time deps are passed to `build()`, not the render call. |
| `memory` is `{}` | No `^name` action in the chain, or the action ran on a different data slice |
| Recursive helper loops forever | Base case never reached; debug with `console.log` in the helper |
| Helper runs in a different scope than expected | Helper name collides with another (e.g. your `escape` shadowing the built-in) — use `useHelper('escape', val)` to call the built-in explicitly |
