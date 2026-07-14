# Security Policy

## Supported versions

The latest published version on npm receives security updates. Older versions are best-effort — please upgrade before reporting.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ Yes             |
| Older   | ⚠️ Best effort     |

## Reporting a vulnerability

**Do not file a public GitHub issue for suspected security issues.**

Report privately by email to the maintainer:

**peter.naydenov@gmail.com**

Please include:

- A short description of the issue
- Steps to reproduce, or a minimal code snippet
- The version of `@peter.naydenov/morph` you are using
- The Node.js version and runtime (browser / Deno / Bun / etc.)

You should hear back within a few days. If you don't, feel free to nudge — GitHub issues for the *existence* of a security report (without details) are fine.

## What to expect

- **Acknowledgement** within ~3 business days.
- **A fix or a timeline** within ~14 days for confirmed issues. Complex issues may take longer; you'll get a status update.
- **A CVE** if the issue warrants one. The maintainer will coordinate disclosure timing with you.
- **Credit** in the release notes (or anonymous, if you prefer).

## Scope

Things that are in scope:

- Template injection in `curry` / `set` / `escape` paths (the engine renders user-controlled data into output)
- Prototype pollution through template data
- ReDoS via pathological template strings
- Vulnerabilities in the dependencies `@peter.naydenov/walk` and `@peter.naydenov/stack` (report upstream if they don't get a response)
- Anything that breaks the engine's input/output isolation

Things that are **not** in scope:

- The runtime's own template language being a security risk for *intentionally untrusted* templates. Don't render untrusted template sources — the engine is plain string substitution, not a sandbox.
- The Vite plugin (`vite-plugin-morph`) or the VSCode extension. Those have their own repos and disclosure paths.
