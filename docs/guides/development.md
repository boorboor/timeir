# Development Guide

## Prerequisites

| Tool     | Version  | Install                                     |
| -------- | -------- | ------------------------------------------- |
| Bun      | ≥ 1.1    | `curl -fsSL https://bun.sh/install \| bash` |
| Node.js  | ≥ 20     | Only needed if not using Bun                |
| Wrangler | included | `bunx wrangler` — no global install needed  |

## Local development

```bash
git clone https://github.com/boorboor/timeir
cd timeir
bun install

# Start Vite dev server (fast HMR, no Cloudflare platform APIs)
bun dev

# Start Wrangler dev server (full Cloudflare Workers environment)
# Use this to test cf.timezone, KV, etc.
bunx wrangler pages dev
```

The Vite dev server (`bun dev`) is faster for UI work. The Wrangler server is needed
when testing anything that touches `platform.cf.*` — in Vite dev, `platform` is undefined
so `getToday()` falls back to UTC.

## Code structure

```
src/
├── routes/
│   ├── +page.server.ts   # SSR load — reads cf.timezone, computes today
│   ├── +page.svelte      # Root page component
│   └── +layout.svelte    # Global layout (CSS, fonts)
└── lib/
    ├── calendar.ts        # All date math — edit this for calendar logic changes
    ├── persian.ts         # Month/day names and digit formatting
    └── components/        # UI components (TodayBanner, CalendarGrid, DateConverter)
```

## Running checks

```bash
bun run lint      # Prettier + ESLint
bun run check     # svelte-check (TS + Svelte diagnostics)
bun run build     # Production build
bun run test      # Vitest unit tests
bun run test:e2e  # Playwright E2E tests (requires `bun run build` first)
```

All four must pass before opening a PR.

## Adding a new calendar system

1. Add conversion functions to `src/lib/calendar.ts` (follow the Julian Day pattern)
2. Add month names / display helpers to `src/lib/persian.ts`
3. Add the new date field to `TodayData` in `calendar.ts`
4. Update `TodayBanner.svelte` and `DateConverter.svelte` to show the new system

## TypeScript notes

- `jalaali-js` has no official types — declarations are in `src/lib/jalaali.d.ts`
- Cloudflare platform types are declared in `src/app.d.ts`
- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) are used throughout —
  avoid the old `let` + `$:` reactivity style
