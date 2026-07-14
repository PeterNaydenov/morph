# Contributing to @peter.naydenov/morph

Thanks for taking the time to contribute. The library is small, well-tested, and most contributions fall into one of three categories: bug reports, fixes, and small enhancements.

## Code of conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Filing issues

**Bug reports** and **feature requests** use GitHub issue templates. Pick the one that fits:

- [Bug report](.github/ISSUE_TEMPLATE/bug_report.md) — something is broken or behaves wrong
- [Feature request](.github/ISSUE_TEMPLATE/feature_request.md) — a new idea or improvement

Please fill in the template. Issues without a reproduction (for bugs) or a use case (for features) take longer to triage and may be closed.

**Security issues** are handled separately — see [SECURITY.md](SECURITY.md). Do not file a public issue for a suspected vulnerability.

## Working on a fix or feature

1. **Open an issue first** (or comment on an existing one) so we can agree on the approach before you spend time coding. For small fixes (typos, clear bugs) you can skip this and go straight to step 2.
2. **Fork the repo** and create a feature branch:
   ```bash
   git checkout -b fix/short-description
   # or
   git checkout -b feature/short-description
   ```
3. **Make your change.** Keep it focused — one fix or one feature per PR.
4. **Run the tests** and make sure they pass:
   ```bash
   npm install
   npm test
   ```
   If you change source code under `src/`, add or update tests in `test/`. Coverage should not drop.
5. **Run coverage** at least once to spot any lines you forgot to exercise:
   ```bash
   npm run cover
   ```
6. **Update the changelog.** Add a one-line entry under the current release section in [Changelog.md](Changelog.md) describing the change. The maintainer handles version bumps.
7. **Open a Pull Request** against `main`. Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md) — it asks for the change description, related issue, and a checklist.

## Pull request rules

- One logical change per PR. Refactors + features in the same PR are hard to review.
- Don't bump the version in `package.json` — the maintainer does that.
- Don't edit `dist/` directly — it's generated. Run `npm run build` and commit the result if your change affects the public API or types.
- Keep commits focused. Squash trivial fixups locally before pushing.
- CI must pass (tests on Node 18, 20, 22). The PR template includes a checklist.

## Style and conventions

- **JSDoc on every exported function.** The TypeScript types in `dist/` are generated from JSDoc. If you add a public function, add a JSDoc block.
- **Source style** matches the existing code: 4-space indent, `function ( args )` with spaces, semicolons, single quotes. No formatter is enforced; please match what's around your change.
- **Tests** live in `test/`, named `NN-name.test.{js,mjs}`. Use vitest's `describe` / `it` / `expect` (not mocha or chai).
- **No new runtime dependencies** without discussion. The library is intentionally lean (currently 2 deps, both by the same author).
- **No comments that just restate the code.** Add a comment only when the *why* isn't obvious.

## Release flow

The maintainer handles versioning and npm publishing. PRs land on `main`; releases follow from there. If your PR is accepted, expect a short review cycle and a merge.

## Questions?

Open a discussion on GitHub, or comment on the issue you're working on. There's no Discord / Slack — GitHub is the only channel.
