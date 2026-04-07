---
status: accepted
date: 2026-04-07
supersedes: initial-client-side-timezone-override
---

# 0003 — Use `cf.timezone` for server-side timezone detection

## Context and Problem Statement

The app's SSR load function calls `getToday()` on the Cloudflare Worker.
Workers run in UTC, so `new Date()` returns UTC time.

Iranian users near midnight (UTC+3:30) would see the wrong Jalali date:
e.g. at 23:30 Tehran time, the Worker returns yesterday's date because UTC is still 20:00.

The original solution was a client-side `$effect` that re-ran `getToday()` after hydration
using the browser's local timezone. This caused a visible flash on initial load and
made SSR date meaningless for SEO.

## Decision Drivers

- No flash of wrong date on initial render
- `<title>` should show the correct date for the visitor, not UTC
- Must work without JavaScript (SSR-only render should already be correct)
- Cloudflare-specific is acceptable — this app is Cloudflare-only by design

## Considered Options

**A — Client-side override (original approach)**

```ts
$effect(() => {
	today = getToday();
}); // re-run after hydration
```

Works but causes a flash if server date ≠ client date. SSR title is wrong for off-UTC users.

**B — Server uses UTC only**
Simpler, but wrong for users in UTC±3 to UTC±12 near midnight.

**C — Cloudflare `cf.timezone` (chosen)**
Cloudflare attaches the visitor's IANA timezone string to every request via IP geolocation.
Available as `platform.cf.timezone` in SvelteKit's `load()` event.

## Decision Outcome

**Chosen: Option C — read `platform.cf.timezone` in `+page.server.ts`**, pass to `getToday(tz)`.

```ts
// +page.server.ts
export function load({ platform }) {
	const tz = platform?.cf?.timezone; // e.g. "Asia/Tehran"
	return { today: getToday(tz) };
}
```

`getToday(tz)` uses `Intl.DateTimeFormat` to extract local date parts:

```ts
const parts = new Intl.DateTimeFormat('en-US', {
	timeZone: tz,
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	weekday: 'long'
}).formatToParts(new Date());
```

### Consequences

**Positive:**

- SSR renders the correct date for the visitor's timezone — no flash, no client override
- `<title>` contains the right Jalali date for SEO
- Client-side `$effect` and `untrack` complexity removed from `+page.svelte`
- Falls back gracefully to UTC when `cf.timezone` is undefined (local dev, non-Cloudflare)

**Negative:**

- Ties the correct-date behaviour to Cloudflare's IP geolocation accuracy
- `platform.cf.timezone` is `undefined` in `vite dev` — local dev shows UTC date
  (acceptable; developers can use `wrangler pages dev` for full fidelity)
- Requires `interface Platform { cf?: { timezone?: string } }` in `src/app.d.ts`
