# Commands

The first argument of a render function is a **command**. Available
commands: `render` (default), `debug`, `snippets`, `set`, `curry`. Any
other value returns an error string.

## `render` (default)

Render the template with the given data.

```js
fn('render', data, dependencies?, ...postprocess?);
fn(data); // same as fn('render', data) when no command is needed
fn();     // same as fn('render', {})  — works for templates that need no external data
```

### Parameters

| Name | Type | Purpose |
| --- | --- | --- |
| `data` | object \| string | Real data, **or** the string `'demo'` to render with the template's `handshake`. |
| `dependencies` | object | Per-call dependencies, merged on top of the build-time dependencies. |
| `...postprocess` | function | Zero or more `(result, dependencies) => string`. Each receives the previous result. Useful for global post-processing (compression, normalization). |

### Returns

A string with the rendered output.

### Render-with-handshake

`fn('render', 'demo')` is the **v3.x** way to render with the template's
handshake data. Pre-3.x it was `fn('demo')`; that still works in some
shims but the canonical form is now command-first.

## `debug`

Inspect the template's internals. The second argument is an **instruction**,
not data.

| Instruction | Returns |
| --- | --- |
| `'raw'` | The original template string (with comments and whitespace stripped) |
| `'demo'` | Renders the template with handshake data (returns the same as `fn('render', 'demo')` would) |
| `'handshake'` | The handshake object (so you can inspect default values) |
| `'placeholders'` | A string of placeholder names separated by commas (in source order). Indexes (0-based) are also accepted by `snippets` even when names are missing. |
| `'count'` | The number of unresolved placeholders in the current render (post-render) |

```js
fn('debug', 'raw');         // 'Hello, {{ name }}!'
fn('debug', 'demo');        // 'Hello, World!' (using handshake)
fn('debug', 'handshake');   // { name: 'World' }
fn('debug', 'placeholders'); // 'name,greeting'
fn('debug', 'count');       // 0
```

> `'demo'` as a debug instruction is special: it continues by rendering
> the handshake data and returning the result. Other string instructions
> return raw values.

## `snippets`

Render only selected placeholders instead of the whole template. Useful
for partial updates in a UI without re-rendering the entire DOM.

```js
fn('snippets', data);                      // all placeholders, joined by '<~>'
fn('snippets:theName', data);              // just 'theName'
fn('snippets:theName,tagList', data);      // two named placeholders
fn('snippets:2,3', data);                  // indexes 2 and 3 (0-based)
```

Returns a string with the selected placeholder results joined by
`<~>`. With one placeholder, no delimiter is inserted.

The render still uses the template's data, helpers, and dependencies.
`snippets` is not a separate render — it's a filtered view of the same
one.

## `set`

Modify the template in place and return a **new** render function with
the changes applied. The original render function is unchanged.

```js
const modified = fn('set', {
  helpers:    { format: ({ data }) => data.toUpperCase() },
  handshake:  { name: 'Alice' },
  placeholders: { 0: '{{greeting}}' },  // replace placeholder at index 0
});
modified('render', { greeting: 'Hi' });  // 'HI'
```

### Set options

| Key | Type | Purpose |
| --- | --- | --- |
| `helpers` | object | Replace or merge helpers. New keys win; existing helpers not in the object stay. |
| `handshake` | object | Replace the handshake entirely. |
| `placeholders` | object | Map from placeholder index (or name) to a new placeholder string. Lets you swap `{{ name }}` for `{{ nickname }}` without rewriting the template. |

The `escape` flag of the original description is preserved across `set`
calls.

## `curry`

Partial render: render what you can with the provided data, then return
a new render function whose template is the partially-rendered result.

```js
const step1 = fn('curry', { name: 'Alice' });
// step1 is a new render function whose template is the result of
// rendering fn with { name: 'Alice' } — except placeholders with
// no matching data are left as `{{ ... }}` in the new template.
step1('render', { place: 'Mars' });
// 'Hello Alice! Welcome to Mars.'
```

### Why use `curry`

- **Progressive data arrival**: fill in the template as data comes in.
- **Pre-fill with safe defaults** before exposing the template to
  untrusted input.

### Security note

`curry` is **injection-safe by design.** Placeholder tags inside
data values render as literal text — the user cannot inject a new
`{{ ... }}` into the curried template. The engine runs the curried
template through a `neutralize` step before returning it.

```js
const step1 = fn('curry', { name: '{{ role }}' });  // user-controlled value
step1('render', { role: 'admin' });
// 'Hello {{ role }}, role: admin' — the injected tags stay as text
```

## Error cases

- Unknown command → returns `"Error: Wrong command \"<x>\". Available commands: render, debug, snippets, set, curry."`
- Bad second argument type for the chosen command → behaviour depends on the command (`'render'` will deep-copy; `'debug'` will treat the string as an instruction; non-objects other than the documented strings are passed through).

## Default command

`fn()` defaults to `('render', {})`. Use it for templates that need no
external data:

```js
const fn = morph.build({ template: 'Hello, world!' });
fn(); // 'Hello, world!'
```
