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

> **Chain composition (verified behavior):** actions compose right-to-left.
> Each action receives the previous action's result, even when that result
> is a plain value rather than a list — `{{ v : wrap, wrap }}` with
> `wrap: ({ data }) => \`<${data}>\`` renders `<x>` as `<<x>>`. Safe idioms:
> - a single render helper: `{{ v : bold }}`
> - render helpers with one final mix: `{{ persons : []coma, web }}`
> - data transformation feeding a render: see the memory pair below
>
> Historically, chains where a middle action collapsed the level data to
> a plain value crashed (`TypeError: levelData.forEach`). Since 3.6.x the
> engine wraps such values back into the level array and keeps composing.

## Verified worked examples

Every example below is executed in `test/12-actions.test.js` — treat
these as ground truth, not illustrations.

### Render action (bare name)

```js
template: '[{{ v : show }}]'
helpers:  { show: ({ data }) => '«' + data + '»' }
data:     { v: 'x' }
// → '[«x»]'
```

Missing render helper → an error string is placed as the value, no
throw: `( Error: Helper 'ghost' is not available )`

### `>` data action

| Input data | Helper `({ data }) => data * 2` | Output |
| --- | --- | --- |
| `5` | receives `5` | `[10]` |
| `'a'` | receives `'a'` | `[NaN]` — helper must handle types itself |
| `[1,2]` | called **per item**: `1`, then `2` | `[24]` (results concatenated) |
| `null` | never called | raw placeholder survives |

Missing `>` helper → an error string is placed as the value:
`( Error: Helper 'ghost' is not available )`

### `+` extendedRender

Post-processes every item of a list that lives inside an object:

```js
template: '{{ list : +shout }}'
helpers:  { shout: ({ data }) => String(data).toUpperCase() }
data:     { list: ['a', 'b'] }
// → 'A,B'   (helper called once per item)
```

- With a **bare array** as root render data (`fn('render', ['a','b'])`)
  the placeholder stays raw — extendedRender targets object-held lists.
- Missing `+` helper → **silently ignored**, rendering continues.

### `[]` anonymous mix

Joins array data into one string (uses each item's `text` property when
present):

```js
template: '[{{ v : [] }}]'
data:     { v: ['a','b'] }        // → '[ab]'
data:     { v: [{text:'x'},{text:'y'}] }   // → '[xy]'
```

For object data it publishes rendered `text` values upward by breadcrumb
keys — see the "Conditional rendering with string literals" idiom in
`test/05-data.test.js`.

### `[]name` named mix

The helper receives the data and produces the merged value. An
array-returning helper has its result spread back and joined:

```js
template: '{{ list : []pick }}'
helpers:  { pick: ({ data }) => data.slice(0, 2) }
data:     { list: [7, 8, 9] }
// → '78'
```

Missing `[]helper` → an error string is placed as the value:
`( Error: Helper 'ghost' is not available )`

### Memory pair `^save` / `^^` overwrite

```js
template: '{{ a : ^saved }}|{{ b : >useSaved : ^^ }}'
helpers:  { useSaved: ({ data, memory }) => data + '-' + memory.saved }
data:     { a: 'X', b: 'Y' }
// → 'X|Y-X'
```

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

## Failure behavior (what happens when things go wrong)

The engine treats **errors as values**: a failed placeholder renders an
error string while the rest of the template still renders. Nothing in
the action pipeline throws.

| Situation | Behavior | Throws? |
| --- | --- | --- |
| Missing helper of **any** kind (render, `>`, `[]name`) | Error string placed as value: `( Error: Helper 'ghost' is not available )` | no |
| Missing **`+`** helper | silently ignored; rendering continues | no |
| Data source resolves to `null`/missing | placeholder left **raw** in output (`{{ x : >f }}`) | no |
| Helper returns `null` in a render chain | item becomes `''` (empty slot) — filter explicitly to omit | no |
| Middle action collapses level data to a scalar | engine wraps it back; chain keeps composing right-to-left | no |
| A **function inside an object/array** of render data | error string placed as value (data can not be copied for safe rendering) | no |
| A bare **function** as data value | resolved by the engine *before* actions run — helpers never see the function itself | no |
| Broken template syntax (unclosed tags, etc.) | build fails; error string returned from the render fn | no |

**Testing advice for agents:** when asserting action semantics for the
first time, run the behavior in a scratch script before writing the
expectation. Several behaviors (raw-placeholder survival, per-item
calls, single resolution of function data) are surprising on first
contact.
