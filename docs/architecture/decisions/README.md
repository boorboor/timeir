# Architecture Decision Records

This directory records significant technical decisions made on the timeir project.
Each file captures the context, options considered, and rationale at the time of the decision.

Format: [MADR](https://adr.github.io/madr/) (Markdown Architectural Decision Records)

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](./0001-sveltekit-with-cloudflare-pages.md) | SvelteKit + Cloudflare Pages as the full stack | Accepted |
| [0002](./0002-jalaali-js-for-persian-calendar.md) | Use jalaali-js for Jalali↔Gregorian conversion | Accepted |
| [0003](./0003-cloudflare-native-timezone-detection.md) | Use `cf.timezone` for server-side timezone detection | Accepted |
| [0004](./0004-rotating-oauth-tokens-for-ci-cd.md) | Rotating OAuth tokens for Cloudflare Pages CD | Accepted |

## Statuses

- **Accepted** — decision is in effect
- **Superseded** — replaced by a later ADR (links to successor)
- **Deprecated** — no longer applicable
