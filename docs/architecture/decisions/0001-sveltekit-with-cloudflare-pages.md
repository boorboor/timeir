---
status: accepted
date: 2025-01-01
---

# 0001 — SvelteKit + Cloudflare Pages as the full stack

## Context and Problem Statement

timeir needs to:

- Render the correct date in the visitor's local timezone without client-side flash
- Load fast globally (target audience: Iranian diaspora worldwide)
- Stay cheap to run (personal/hobby project — ideally free tier)
- Support SSR for SEO (today's Jalali date in `<title>`)

## Decision Drivers

- SSR is required for timezone-correct initial render and SEO
- Edge deployment (globally close to users) is preferred over a single-region server
- TypeScript is the target language for all logic
- Minimal operational overhead (no self-managed servers)

## Considered Options

1. **SvelteKit + Cloudflare Pages/Workers** — edge SSR, free tier, zero cold starts with Workers
2. **Next.js + Vercel** — mature ecosystem, but heavier bundle, Node.js runtime only on edge
3. **Nuxt + Cloudflare** — Vue-based, less familiar; adapter quality historically behind SvelteKit's
4. **Static site (no SSR)** — eliminates SSR benefits; date shown on initial paint would be UTC

## Decision Outcome

**Chosen: SvelteKit + Cloudflare Pages** with `@sveltejs/adapter-cloudflare`.

- Cloudflare Workers runs on the V8 isolate model — true edge with no cold starts
- SvelteKit's Cloudflare adapter is first-class and actively maintained
- Free tier covers the expected traffic comfortably
- Svelte 5 runes provide fine-grained reactivity without a virtual DOM

### Consequences

**Positive:**

- Sub-100ms TTFB from any region
- Full SSR for SEO without managing a Node.js server
- Access to Cloudflare-native request metadata (`cf.timezone`, `cf.country`, etc.)

**Negative:**

- Cloudflare Workers environment has constraints: no `fs`, limited Node built-ins
  (mitigated by `nodejs_compat` flag in `wrangler.toml`)
- Wrangler tooling for local dev adds a layer vs plain `vite dev`
