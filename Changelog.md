## Release History



### 3.9.0 (2026-09-05)
- [x] Feature: Added a skill at `skills/git-morph/SKILL.md`;
- [x] Dependency update. @peter.naydenov/walk - v.6.1.0;
- [x] Dev dependencies update. Vitest - v.5.0.0;




### 3.8.0 (2026-08-23)
- [x] Code: Refactoring. Dead code removed and readability improved across all methods. No API changes;
- [x] Code: Dependency object shared accross the methods. Now used by all methods;



### 3.7.0 (2026-08-23)
- [x] Fix: rendering no longer crashes on mistakes. Templates with an unknown helper in a data or mix action now render an error message in place of the placeholder, and the rest of the template renders as usual. Previously such templates threw an exception;
- [x] Fix: data containing functions inside objects or arrays no longer breaks rendering - the placeholder shows an explanatory error message instead. (A plain function as a data value keeps working as before and is called automatically);
- [x] Feature: actions in one placeholder now always pass their result to the next action, so multi-step placeholders work reliably. Some chains that silently crashed before now render correctly;
- [x] Chore: internal cleanup - duplicate function-data handling removed;
- [x] Chore: action behavior documented with verified examples;
- [x] Chore: test coverage improved to ~96%;



### 3.6.0 (2026-08-22)
- [x] Feature: unified string shorthand for the storage API. `add()`, `get()` and `remove()` now accept a plain string as `location` - it addresses a template in the `'default'` storage. `add('myTpl', desc)` ≡ `add(['myTpl'], desc)`, same for `get()` and `remove()`. Write, read and remove with strings always work with `'default'`. Before this release only `remove()` accepted the shorthand (and before 3.4.4 a bare string was silently destructured character-by-character, placing templates in wrong storages);
- [x] Feature: error functions returned by `get()` now carry an `isError: true` marker, so callers can detect a miss before rendering: `const tpl = get('myTpl'); if (tpl.isError) ...`. Real templates never have the property. Existing behavior is unchanged - error functions stay callable and surface the message as render output;
- [x] Feature: command `curry` now supports array data, mirroring `render`: one curried render function per data element. Before, an array produced a broken render function that always failed with "Error: Template is not a string.";
- [x] Fix: strict validation of the `snippets` command. Only exact `'snippets'` (render all) or `'snippets: a, b'` (selection) are valid. Typos like `'snippetsXYZ'` were silently treated as plain `'snippets'`; missing selections (`'snippets:'`), empty names (`'snippets: first,'`) and unknown names/indexes are now reported with descriptive errors instead of producing broken output;
- [x] Types: public signatures updated for the new shapes - `location` is now `string | string[]` across the storage API, and `get()` returns `RenderFn | MorphErrorFn` where `MorphErrorFn = (() => string) & { isError: true }`;
- [x] Docs: README, skill references and JSDoc are up to date with the changes above;



### 3.5.3 (2026-08-20)
- [x] Dependency update. @peter.naydenov/walk 6.0.0;



### 3.5.2 (2026-07-25)
- [x] Dependency update. @peter.naydenov/stack 3.0.1;



### 3.5.1 (2026-07-19)
- [x] Dependency update: @peter.naydenov/walk - v.5.0.7;



### 3.5.0 (2026-07-19)
- [x] Agentic skill was added



### 3.4.6 (2026-07-18)
- [x] Chore: dropped Node 18 from the CI matrix and bumped `engines.node` to `">=20"`. The 3.4.5 release shipped with `">=18"` and a Node 18 CI entry, but vitest 4 / `@vitest/coverage-v8` require Node 20+. CI now tests on Node 20, 22, 24.



### 3.4.5 (2026-07-14)
- [x] Docs: fixed typos throughout the README;
- [x] Docs: fixed GitHub badge URLs to use the canonical `PeterNaydenov/morph` casing (lowercase `peterNaydenov` worked but redirected);
- [x] Docs: made the License section in the README a link to `LICENSE`. Added a "Contributing" and "Security" section that link to the new files;
- [x] Docs: added industry-standard contributor files. `CONTRIBUTING.md` (workflow, PR rules, style, scope of releases), `SECURITY.md` (private disclosure process, scope), `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1), `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`, `.github/ISSUE_TEMPLATE/config.yml` (disables blank issues, points security and questions elsewhere), and `.github/PULL_REQUEST_TEMPLATE.md`. None of these are shipped to npm (added to `.npmignore`).



### 3.4.4 (2026-07-14)
- [x] Fix: `add()` silently accepted a string instead of an array for the `location` argument, and the destructuring of the string placed the template at a wrong name/storage (e.g. `add('myTemplate', ...)` stored the template as `'m'` in storage `'y'`). Now mirrors `get()`: logs an error and stores nothing;
- [x] Fix: `get()`'s error message for a non-array `location` hardcoded "is a string" even for objects, numbers, or any other non-array input. Now it says "must be an array" regardless of the actual type;
- [x] Chore: migrated test framework from mocha + chai + c8 to vitest. The `test` and `cover` scripts in `package.json` now call `vitest run` and `vitest run --coverage` respectively. All 12 test files were converted mechanically: `import { expect } from 'chai'` → `import { describe, it, expect } from 'vitest'`; `.to.be.equal` → `.toBe`; `.to.be.deep.equal` → `.toEqual`; `.to.have.length` → `.toHaveLength`; `.to.have.property` → `.toHaveProperty`; `.to.be.a('...')` → `.toBeTypeOf('...')`. Added `vitest.config.js`; removed `.mocharc.json`. Coverage numbers are reported by vitest's V8 provider (slightly different branch counting from c8);
- [x] Chore: removed the `overrides` block from `package.json`. The overrides (`diff`, `serialize-javascript`, `yargs`) were patching known vulnerabilities in mocha/chai/c8 transitive deps. With the migration to vitest, `diff` and `yargs` are no longer in the tree; `serialize-javascript` stays (via `@rollup/plugin-terser`) but already resolves to the patched version. `npm audit` reports 0 vulnerabilities;
- [x] Docs: tightened the public TypeScript types in JSDoc. `build()`'s return type is now `RenderFn | tupleResult` instead of `Function | tupleResult` (added a new `RenderFn` typedef matching the actual `(command, d, dependencies, ...postprocess)` signature). `add()`'s `tplfn` parameter is now `Template | RenderFn | null` instead of `object | Function | null`. `get()`'s return is now `RenderFn | (() => string)`. `buildDependencies` is now `Record<string, any>` instead of `object`. All these were already correct in the sense that the runtime behaviour was consistent with the JSDoc — the changes are pure DX improvements for TypeScript users.



### 3.4.3 (2026-07-13)
- [x] Types updates;
- [x] Chore: removed unused `esm` devDependency. The project is `"type": "module"` so the `esm` package (which lets CJS files use `import` syntax) was never used;
- [x] Chore: `.mocharc.json` had a bogus `globals` field (that's an ESLint/JSHint field, not a Mocha one). Replaced with a real Mocha `spec` field;
- [x] Chore: renamed `test/04-commands.js` and `test/06-deps-injection.js` to use the `.test.js` infix, matching the rest of the suite. The files still ran before (mocha's default `*.{js,cjs,mjs}` glob catches them) but the missing infix made them easy to skip with a stricter pattern like `mocha 'test/**/*.test.js'`;
- [x] Chore: stopped tracking the stale `dist/src/` duplicate. `tsc` was generating the same `.d.ts` files in two places (`dist/main.d.ts` and `dist/src/main.d.ts`). The duplicate folder is now in `.gitignore`; the canonical types at `dist/main.d.ts` and `dist/methods/*.d.ts` remain.



### 3.4.2 (2026-07-13)
- [x] Fix: `useHelper` was misidentifying 2+ arg user helpers as a `build()` output (heuristic was `length >= 2`). Such helpers were called with the wrong arguments and produced silent wrong output. Latent since 3.3.0. A `__isMorphTemplate` marker on the `build()` output replaces the arity check;
- [x] Fix: data-only placeholders with `{ text: 0 }` or `{ text: false }` were silently dropped. Switched to a `!= null` check to match the action-chain and string-helper paths;
- [x] Chore: rewrote `.npmignore`. Published tarball went from 202 files / 3.6 MB to 49 files / 59 KB. No longer ships `test/`, `coverage/`, `.opencode/`, `.specify/`, `graphify-out/`, `AGENTS.md`, `simple.js`, `build.architecture.png`, or build tooling;
- [x] Chore: added `engines.node: ">=18"` to `package.json`. The engine uses `structuredClone` (Node 17+);
- [x] Docs: removed the stale `Conditional render` rows (the `?` action prefix) from the README. The prefix was deprecated in 3.2.0 and is no longer recognised by the engine;
- [x] Docs: removed the `.morph file extension` section from the README. That feature lives in the separate `vite-plugin-morph` package. Replaced with a `Companion tools` pointer;
- [x] CI: added GitHub Actions workflow at `.github/workflows/ci.yml`. Tests run on Node 18, 20, 22 on every push to `main` and every pull request;



### 3.4.1 (2026-07-12)
- [x] Upgrade typescript to v.7.0.2;
- [x] Dependency update: @peter.naydenov/walk - v.5.0.6;



### 3.4.0 (2026-07-12)
- [x] New: Built-in helper 'escape'. Available in every template without declaring it. Escapes HTML special characters. A user helper with the same name takes precedence;
- [x] New: Template description option 'escape'. HTML-escapes the output of data-only placeholders. Single placeholders can opt out with action 'raw'. The option survives commands 'set' and 'curry';
- [x] Fix: Command 'curry' was re-reading rendered data as template syntax. Data values can not inject placeholders anymore - placeholder tags in data render as literal text;
- [x] Fix: Parse error was not reported when the broken placeholder comes after a valid one. The error text was leaking into the render result and the text between the placeholders was lost;
- [x] Fix: Crash when a breadcrumb path meets 'null' in the middle. The placeholder stays untouched now, like with a missing key;
- [x] Fix: Crash when a data element is 'null';
- [x] Fix: Crash on command 'set' with a placeholder name or index that does not exist. Returns an error message now;
- [x] Fix: Anonymous mix action was rendering 'null' as text when the first element of the array is null;
- [x] Refactoring: Dead code removed and readability improved across all methods. No API changes;



### 3.3.2 (2026-03-24)
- [x] Dev deps update. TypeScript - v.6.0.2;
- [x] Update types according typescript v.6.0.2;



### 3.3.0 (2025-12-13)
- [x] Use other helper from inside of helper functionsHelper functions attribute - useHelper;



### 3.2.0 (2025-12-01)
- [x] Conditional actions are depricated. ( starting with `?` ). Too unconsistant with other actions. It's can be solved with normal helper functions by providing a list of possible templates. It's something that is possible even now;
- [x] Templates can have empty placeholders - just {{ }};
- [x] Extend templates. Generate new templates from the template function by add/change helpers, provide alternative handshake data. Command 'set' will do this for you. Result is a new function(template), ready to receive data; 
- [x] Building templates - will not have 'fail' response, with reason templates has missing helpers. Now command 'set' can provide helpers latter, so will create the template function without warning. On rendering with missing helper - will return an error as a render result;
- [x] New debug instruction: 'helpers' to return a string of helper names separated by commas;
- [x] New debug instruction: 'count' to return number of unresolved placeholders;
- [x] New command: 'curry' for partial rendering, returning a new render function with rendered output as template;
- [x] Updated JSDoc and TypeScript declarations for new commands.



### 3.1.5 (2025-11-14)
- [x] Types improvements;



### 3.1.4 (2025-10-13)
- [x] Dependencies update. Dev deps update. @peter.naydenov/walk - v.5.0.2;



### 3.1.3 (2025-08-19)
- [x] Some minor fixes and cleanups;



### 3.1.2 (2025-08-19)
- [x] Fix: Argument 'full' contains wrong data;



### 3.1.1 (2025-08-19)
- [x] Fix: Build was not updated;
- [ ] Bug: Argument 'full' contains wrong data;



### 3.1.0 (2025-08-19)
- [x] Helper named argument 'full'. Gives access to full template data. Use it create mixed conditions among many different parameters, not only the iteration data;
- [ ] Bug: Build was not updated;
- [ ] Bug: Argument 'full' contains wrong data;


### 3.0.1 ( 2025-06-14)
- [x] Fix: Bad full render after call of snippets;



### 3.0.0 ( 2025-06-12)
- [x] Render selected snippets;
- [x] Commands and instructions terms;
- [x] Bug: Bad full render after call of snippets;



### 2.2.0 ( 2025-06-06)
- [x] New: Source property can contains a symbol '/';



### 2.1.3 ( 2025-04-12 )
- [x] Fix: Wrong set of arguments for helper functions when data is a primitive value;



### 2.1.2 ( 2025-04-12 )
- [x] Fix: Helper templates should ignore value 'null' and 'undefined';
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;


### 2.1.1 ( 2025-04-11 )
- [x] Fix: Value '0' is not rendered in helper templates;
- [ ] Bug: Helper templates should ignore value 'null' and 'undefined';
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;


### 2.1.0 (2025-04-01)
- [x] Feature: Access a deep property as a breadcrumbs;
- [ ] Bug: Value '0' is not rendered in helper templates;
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;



### 2.0.1 (2025-03-25)
- [x] Fix: Deep data render index;
- [ ] Bug: Value '0' is not rendered in helper templates;
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;



### 2.0.0 (2025-03-25)
- [x] Memory action intoduced - memory is available in data functions;
- [x] Change in arguments format for helper functions;
- [x] Overwrite action introduced - when change in data should be available for all placeholders;
- [ ] Bug: Fix: Deep data render index;
- [ ] Bug: Value '0' is not rendered in helper templates;
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;


### 1.2.3 (2025-03-17)
- [x] Refactoring: Extended render;



### 1.2.2 (2025-03-17)
- [x] Improvment: Optimized code to improve performance;



### 1.2.1 (2025-03-16)
- [x]Enhanced Error Handling in setupActions.js: Improved the error message to provide more context about the missing level markers, making it easier to debug;
- [x] Added TypeScript Type Definitions: Created a types directory with an index.d.ts file containing TypeScript definitions for the library, and added the "types" field to package.json for better TypeScript support;



### 1.2.0 (2025-03-14)
- [x] Fix: Deeply nested data;
- [x] Improvement: Error message if actions do not have deepness of the data (very difficult to debug);



### 1.1.3 (2025-01-23)
- [x] Improve: Error messages when using method "add" with template -> null;



### 1.1.2 ( 2025-01-20 )
- [x] Improve: Error messages when using method "set" with string;



### 1.1.0 ( 2025-01-19 )
- [x] Ignore html comment sections in templates;



### 1.0.3 (2025-01-10)
- [x] Fix: Action should receive dependencies when data is a function;



### 1.0.2 (2025-01-09)
- [x] Fix: Render nested components;
- [x] Refactoring: Placeholder with actions when data is a function;
- [ ] Bug: Action should receive dependencies when data is a function;



### 1.0.1 (2025-01-08)
- [x] Fix: Render functions are not receiving dependencies;
- [ ] Bug: Render nested components;



### 1.0.0 (2024-12-28)
- [x] Change of addressing templates and stores;
- [ ] Bug: Render functions are not receiving dependencies;
- [ ] Bug: Render nested components;



### 0.0.4 (2017-12-24)
- [x] Dependency update. @peter.naydenov/walk 5.0.1;



### 0.0.3 (2017-12-02)
- [x] Fix: Breaks on missing helper;



### 0.0.2 (2017-11-30)
- [x] Fix: Storage is not working;
- [ ] Bug: Breaks on missing helper;



### 0.0.1 (2017-11-30)
 - [x] Initial code;
 - [x] Test package;
 - [x] Documentation;
 - [ ] Bug: Storage is not working;
 - [ ] Bug: Breaks on missing helper;