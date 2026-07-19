# Placeholders and actions

A placeholder is `{{ ... }}` in a template. The engine parses the contents
into three optional parts separated by `:`:

```
{{ dataSource? : action?, action?, ... : placeholderName? }}
```

- `dataSource` — a field of the call data, or `@all` / `@root` (the full
  data object), or a breadcrumb path with `/` (e.g. `address/city`).
- `actions` — a comma-separated chain. **Actions run right-to-left.**
- `placeholderName` — a string used by `snippets`. The placeholder index
  (order of appearance) is also accepted by `snippets` even when no name
  is given.

## Plain placeholders

```js
'{{ name }}'             // direct binding; renders data.name
'{{ address/city }}'     // breadcrumb path
'{{ @all }}'             // the full data object
'{{ @root }}'            // same as @all
'{{ }}'                  // no data, no action; renders empty
'{{ :name }}'            // no data; output comes from the action chain
'{{ :action : placeName }}'  // named, action-driven, no data source
```

## Data-source resolution rules

1. If the data source contains `/`, treat it as a breadcrumb path unless
   the data has it as a literal key. `info = info['address/city']` is
   tried first; if absent, walk `info.address.city`.
2. `@all` and `@root` resolve to the current data context (not the call
   root). With nested `{{ @all : ... }}` inside a list iteration, the
   `@all` is the current item, not the call.
3. Missing or null intermediate steps resolve to `[]`, not `undefined`.
4. Reserved prefix characters (`>`, `+`, `^`, `[`) at the start of a data
   source name are not interpreted as action prefixes — the parser knows
   the data source is the first `:`-delimited segment, not the prefix.

## Action prefixes

| Prefix | Type | Helper contract | Returns |
| --- | --- | --- | --- |
| _(none)_ | render | function (or string template) | a string that becomes the placeholder output |
| `>name` | data | function | new data for the next action |
| `[]name` | mix | function | a string joining an array |
| `+name` | extended render | function | a string; receives a deep branch of the data |
| `^name` | memory | (none — it's a save) | snapshot current data to `memory[name]` |
| `^^` | overwrite | (none) | replace level data so the next action sees the new value |
| `#` | level step | (none) | advance the data depth by one |
| `raw` | render | (none — flag) | mark the placeholder as opt-out from auto-escape |

> **Don't confuse the prefix character with the helper's name.** A helper
> named `bold` is invoked as `{{ text : bold }}` (render) or
> `{{ text : >bold }}` (data) or `{{ text : []bold }}` (mix). The prefix
> tells the engine what to expect from the return value.

## Right-to-left execution

```js
'{{ x : a, b, c }}'
// runs c(x) first, then b(result), then a(result)
```

Write the chain so the rightmost action is the **first transformation**
on the data. `{{ items : li, ul }}` means "render each `li`, then wrap
them in `ul`" — the wrapping is the leftmost action and runs last.

The data is the **input to the rightmost action**, not the output of
the leftmost. If you write `{{ x : a, b, c }}` thinking "first `a`
transforms `x`, then `b`, then `c`" — flip the order.

## Levels (`#`)

When the data is nested (an array of objects, an object of arrays), `#`
steps the engine **down one level** so the next action sees the
children.

```js
template: '{{ groups : #, li }}'
data: { groups: [ { name: 'a' }, { name: 'b' } ] }
// '#' steps into each group; 'li' renders each group's text
```

The engine validates `#` count against the data depth at build time. A
mismatch logs an error to `console.error`; rendering then runs with
whatever levels are available.

## Mixing with `[]`

When the data resolves to an array and the action chain ends in a
render step, the engine returns an array of rendered strings, one per
item. A `[]name` action joins them.

```js
template: '{{ friends : []join }}'
helpers:  { join: ({ data }) => data.join(', ') }
data:     { friends: ['Ada', 'Grace', 'Hedy'] }
// 'Ada, Grace, Hedy'
```

`[]` with no name is the built-in `join('')`.

## Memory (`^name`)

Save the current data snapshot under `memory[name]`. Other helpers in
the same render can read it via `memory[name]`.

```js
helpers: {
  showName: ({ data, memory }) => memory.user.name + ': ' + data,
}
template: '{{ greeting : ^user, showName }}'
```

Memory is per-render; it doesn't persist across calls.

## Overwrite (`^^`)

Replaces the **level data** for the rest of the placeholder's actions
(not subsequent placeholders). Use when a data helper needs to mutate
the input that the next action sees.

## The `raw` action

When the template description has `escape: true`, data-only placeholders
are auto-escaped. A `raw` action marks the placeholder as trusted — the
output is written verbatim.

```js
'{{ trustedHtml : raw }}'
'{{ x : raw, render }}'      // raw wins; render output is also unescaped
```

`raw` is not a helper — the engine treats it as a marker and removes it
from the action list before execution.

## Reserved-name and reserved-prefix collisions

- A helper named `escape` overrides the built-in `escape` helper. The
  built-in is registered as the first helper so user overrides win.
- A placeholder name with a prefix character (`{{ x : a : >weird }}`) is
  legal — the parser sees `>weird` as the placeholder name, not an
  action. Don't rely on this; pick a name without a leading `>`/`+`/`^`.

## Common mistakes

| Symptom | Likely cause |
| --- | --- |
| `{{ x : a, b, c }}` runs `a` first | Treating the chain as left-to-right |
| Helper returns `[object Object]` | Render helper returning data instead of a string; missing `>` prefix |
| Empty render for `{{ groups : li }}` | The data is an array of objects; need `{{ groups : #, li }}` to step into the items |
| Engine logs `Not enough level markers (#)` | `#` count < data depth; add `#` or reduce nesting |
| Action name `escape` shadows built-in | Renamed user helper shadows the engine's `escape`; rename yours or call `useHelper('escape', val)` explicitly |
| `{{ cond ? }}` is a no-op | The `?` conditional prefix was removed in 3.2.0; use a render helper that returns `''` on false |
| Hidden items still appear in the output | The auto-mix step (`[]` with no name) leaves `null` as the literal empty string `''` but still records the slot. To fully omit items, return `null` from the render helper **and** write an explicit mix helper that filters `null` out — e.g. `coma: ({ data }) => data.filter(x => x != null).map(x => x.text ?? x).join(', ')`. See the "Conditional rendering with string literals" pattern in `test/05-data.test.js`. |
