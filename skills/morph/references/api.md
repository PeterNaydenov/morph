# API reference

The engine exposes a single default export with six methods. No constructor, no classes, no instance state outside the storage.

## `morph.build(templateDescription, [asTuple], [buildDependencies])`

Build a render function from a template description. **Call once per template**; the returned function is what you call many times.

```js
const fn = morph.build({
  template: 'Hello, {{ name }}!',
  helpers: { /* ... */ },
  handshake: { name: 'World' },
  escape: false, // optional
});
```

### Parameters

| Name | Type | Default | Purpose |
| --- | --- | --- | --- |
| `templateDescription` | `Template` | required | `{ template, helpers?, handshake?, escape? }` |
| `asTuple` | `boolean` | `false` | If `true`, returns `[success, fn]` so you can detect a broken template. If `false`, returns the render function directly (or an error function that returns a string with the error). |
| `buildDependencies` | `object` | `{}` | Static dependencies baked into the render function. Render-time `dependencies` are merged on top. |

### Returns

- Default: a `RenderFn` (see `references/commands.md`).
- With `asTuple: true`: `[boolean, RenderFn | ErrorFn]`. The boolean is `true` on success.
- If the template is broken (malformed placeholder, wrong action prefix, etc.): a function whose only behaviour is to return the error message as a string.

### Template description shape

```ts
type Template = {
  template: string;                          // required
  helpers?: Record<string, HelperFn | string>; // optional
  handshake?: object;                        // optional demo data
  escape?: boolean;                          // optional, default false
};

type HelperFn = (args: {
  data: any;
  dependencies: object;
  full: any;
  useHelper: (name: string, dataOverride?: any) => any;
  memory: Record<string, any>;
}) => any;
```

> **Parsing note.** HTML comments (`<!-- ... -->`) and runs of multiple whitespace are stripped from `template` before parsing. Don't try to use whitespace or comments to control output formatting.

## `morph.add(location, templateOrFn, [...buildArgs])`

Add a template (or a pre-built render function) to storage. Auto-builds if you pass a description.

```js
morph.add('myTemplate', { template: '...', helpers: {...} });   // string shorthand -> 'default'
morph.add(['myTemplate'], { template: '...', helpers: {...} });
morph.add(['myTemplate', 'hidden'], preBuiltFn);
```

### Parameters

| Name | Type | Default | Purpose |
| --- | --- | --- | --- |
| `location` | `string \| [name: string, storageName?: string]` | required | A string means a template in `'default'` storage. Array form targets a named storage; storage name defaults to `'default'`. |
| `templateOrFn` | `Template \| RenderFn \| null` | required | A description, a pre-built render function, or `null` (no-op with a console warning). |
| `...buildArgs` | any | — | Extra args passed to `build()` if a description was passed. |

### Returns

`void`. On failure (broken template, null input, invalid location type), the function logs to `console.error` / `console.warn` and stores nothing.

### Validation

- Invalid `location` type (not a string or array) → logs `"Argument 'location' must be a string or an array. E.g. 'templateName' or ['templateName', 'storageName']."` and stores nothing.
- Null `templateOrFn` → logs a warning.
- Description fails to build → logs the build error and stores nothing.

## `morph.get(location)`

Retrieve a template from storage.

```js
const fn = morph.get('myTemplate');          // string shorthand -> 'default'
const fn = morph.get(['myTemplate']);
const fn = morph.get(['myTemplate', 'hidden']);
```

### Parameters

| Name | Type | Default | Purpose |
| --- | --- | --- | --- |
| `location` | `string \| [name: string, storageName?: string]` | required | A string means a template in `'default'` storage. Array form targets a named storage; storage name defaults to `'default'`. |

### Returns

- A `RenderFn` if the template exists.
- An **error function** if the storage or template doesn't exist. Calling the error function returns a string with the error. This is intentional — it lets you call the returned function unconditionally and surface the error at render time.
- Error functions carry an `isError: true` property, so callers can detect a miss before rendering. Real templates never have this property.

```js
const fn = morph.get(['missing']);
if (fn.isError)   console.error(fn());   // detect before rendering
const result = fn(); // "Error: Template \"missing\" does not exist in storage \"default\"."
```

## `morph.list([storageNames])`

List the names of all templates in the given storages.

```js
morph.list();              // ['template1', 'template2'] — from default storage
morph.list(['public']);    // ['header', 'footer']    — from named storage
morph.list(['public', 'admin']); // ['header', 'adminLogin', 'adminNav']
```

### Parameters

| Name | Type | Default | Purpose |
| --- | --- | --- | --- |
| `storageNames` | `string[]` | `['default']` | Storage names to scan. Non-existent storages contribute an empty list. |

### Returns

`string[]` — flat array of template names. Order is the insertion order in each storage.

## `morph.clear()`

Reset storage to empty. Deletes every named storage and empties `'default'`.

```js
morph.clear();
```

> No parameters, no return. Use sparingly — this wipes every storage in the process.

## `morph.remove(location)`

Remove one template.

```js
morph.remove('myTemplate');   // string shorthand -> 'default' storage
morph.remove(['myTemplate']);
const err = morph.remove(['nonexistent']); // "Error: Template \"nonexistent\" does not exist in storage \"default\"."
```

### Parameters

| Name | Type | Default | Purpose |
| --- | --- | --- | --- |
| `location` | `string \| [name: string, storageName?: string]` | required | A string means a template in `'default'` storage. Array form targets a named storage; storage name defaults to `'default'`. |

### Returns

`undefined` on success, or a string with the error if the argument type is wrong or the storage/template doesn't exist.

## Storage semantics

- One `'default'` storage always exists.
- Named storages are created on first `add` and persist until `clear` (which deletes them) or process exit.
- The same template name can exist in different storages (`['header', 'public']` and `['header', 'admin']` are independent).
- `add`, `get` and `remove` accept the same `location`: a plain string is shorthand for `'default'` storage, array form is `[name, storageName?]`. Write, read and remove with strings — you are always working with `'default'`.

## Returned render function

The result of `morph.build(...)` (or a stored function retrieved with `get`) is a callable that takes:

```ts
type RenderFn = (
  command?: 'render' | 'debug' | 'snippets' | 'set' | 'curry' | `snippets:${string}`,
  d?: any,
  dependencies?: object,
  ...postprocess: ((result: string, deps: object) => string)[]
) => string | RenderFn | object;
```

The first argument is a **command**. The rest depend on the command — see `references/commands.md`.

## Version-aware calls

- **v3.x**: `fn('render', data)` is the standard render. `fn('render', 'demo')` renders with handshake. `fn()` defaults to `('render', {})`.
- **v2.x (migration)**: `fn(data)`, `fn('demo')`, `fn('placeholders')`. v2 code is not interchangeable with v3 — see `Migration.guide.md`.
