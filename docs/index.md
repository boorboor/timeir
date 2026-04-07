# timeir — Documentation

A Persian (Shamsi) calendar app with three-system date display and conversion,
deployed on Cloudflare Pages edge infrastructure.

## Contents

| Section                                      | Description                              |
| -------------------------------------------- | ---------------------------------------- |
| [Product](./product/overview.md)             | Vision, goals, features                  |
| [Roadmap](./product/roadmap.md)              | Planned and in-progress work             |
| [Architecture](./architecture/overview.md)   | System design, data flow, tech decisions |
| [ADRs](./architecture/decisions/README.md)   | Architecture Decision Records            |
| [Development Guide](./guides/development.md) | Local setup, dev workflow                |
| [Deployment Guide](./guides/deployment.md)   | CI/CD pipeline, Cloudflare Pages         |

---

## Reference: Codebase explanation

---

## Tech Stack

| Layer           | Technology                                                       |
| --------------- | ---------------------------------------------------------------- |
| Framework       | SvelteKit 5 (Svelte 5 **runes mode** — reactive primitives)      |
| Styling         | Tailwind CSS v4 + scoped `<style>` per component                 |
| Calendar math   | `jalaali-js` (Jalali ↔ Gregorian) + custom Julian Day algorithms |
| Adapter         | `@sveltejs/adapter-cloudflare` → Cloudflare Workers (edge SSR)   |
| Package manager | Bun                                                              |
| Testing         | Vitest (unit) + Playwright (e2e)                                 |
| CI              | GitHub Actions (lint + typecheck + build on every push/PR)       |
| CD              | Cloudflare Pages native GitHub integration                       |

---

## Directory Structure

```
timeir/
├── src/
│   ├── app.html              # Root HTML shell
│   ├── app.d.ts              # SvelteKit ambient types
│   ├── routes/
│   │   ├── +layout.svelte    # Global layout: imports CSS + favicon
│   │   ├── layout.css        # Global CSS variables (colors, fonts, RTL)
│   │   ├── +page.server.ts   # SSR load(): computes today's date on the server
│   │   ├── +page.svelte      # Root page: header, tab nav (Calendar / Converter), footer
│   │   └── demo/             # Demo/playground page (for component development)
│   └── lib/
│       ├── calendar.ts       # Core calendar math (pure TypeScript)
│       ├── persian.ts        # Persian text utilities (month names, digit conversion)
│       ├── index.ts          # $lib barrel (currently empty)
│       ├── jalaali.d.ts      # Type declarations for jalaali-js
│       ├── assets/
│       │   └── favicon.svg
│       ├── components/
│       │   ├── TodayBanner.svelte   # 3-card strip: Jalali, Gregorian, Hijri today
│       │   ├── CalendarGrid.svelte  # Interactive monthly calendar grid
│       │   └── DateConverter.svelte # 3-way date picker/converter
│       └── vitest-examples/  # Example unit test files (Welcome, greet)
├── static/                   # Static assets
├── .github/workflows/ci.yml  # GitHub Actions CI
├── wrangler.toml             # Cloudflare Pages config
├── svelte.config.js          # SvelteKit config (Cloudflare adapter, runes mode forced)
├── vite.config.ts            # Vite config
├── playwright.config.ts      # E2E test config
└── package.json
```

---

## Core Logic — `src/lib/calendar.ts`

This is the heart of the app. Pure TypeScript, no DOM dependencies.

### Data types

- `JalaliDate { jy, jm, jd }` — Solar Hijri (Persian/Shamsi)
- `GregorianDate { gy, gm, gd }` — Western calendar
- `HijriDate { hy, hm, hd }` — Lunar Hijri (Islamic)
- `TodayData` — all three + JS `dayOfWeek`
- `CalendarCell` — one grid cell with all three dates + `isToday` + `isCurrentMonth`

### Conversion chain

```
Jalali ←→ Gregorian   (via jalaali-js library)
Gregorian ←→ Hijri    (via Julian Day Number math — tabular Islamic, Thursday epoch)
```

Julian Day (JD) is the common intermediate format for Hijri ↔ Gregorian:

- `gregorianToJD()` — Gregorian → JD
- `jdToGregorian()` — JD → Gregorian
- `jdToHijri()` — JD → Hijri (tabular Islamic algorithm)
- `hijriToJD()` — Hijri → JD

### Public API

| Function                 | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `getToday()`             | Returns `TodayData` for right now                     |
| `gregorianToJalali()`    | Converts Gregorian → Jalali                           |
| `jalaliToGregorian()`    | Converts Jalali → Gregorian                           |
| `gregorianToHijri()`     | Converts Gregorian → Hijri                            |
| `hijriToGregorian()`     | Converts Hijri → Gregorian                            |
| `jalaliMonthLength()`    | Days in a Jalali month                                |
| `gregorianMonthLength()` | Days in a Gregorian month                             |
| `hijriMonthLength()`     | Days in a Hijri month (odd=30, even=29, leap 12th=30) |
| `isHijriLeapYear()`      | Hijri leap year check                                 |
| `getCalendarGrid()`      | Returns 6×7 `CalendarCell[][]` for a Jalali month     |

### Calendar grid

- 6 rows × 7 columns (always 42 cells)
- **Week starts Saturday** (Iranian convention): Sat→col 0, Sun→col 1, …, Fri→col 6
- Cells outside current month are filled from previous/next month with `isCurrentMonth: false`
- Each cell carries all three calendar date representations

---

## Persian Text — `src/lib/persian.ts`

| Export                     | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `JALALI_MONTHS`            | 12 Persian month names (فروردین … اسفند)         |
| `HIJRI_MONTHS`             | 12 Arabic month names (محرم … ذیالحجه)           |
| `GREGORIAN_MONTHS_FA`      | 12 Gregorian months in Persian (ژانویه … دسامبر) |
| `GREGORIAN_MONTHS_EN`      | 12 Gregorian months in English                   |
| `WEEK_DAYS_SHORT`          | Sat→Fri single-letter headers (ش ی د س چ پ ج)    |
| `WEEK_DAYS_FULL`           | Full day names (شنبه … جمعه)                     |
| `toPersian(n)`             | Converts ASCII digits → Eastern Arabic (۰–۹)     |
| `getDayNamePersian(jsDow)` | JS `Date.getDay()` → Persian day name            |
| `formatJalali()`           | e.g. `۱۴ فروردین ۱۴۰۴`                           |
| `formatGregorian()`        | e.g. `3 April 2026`                              |
| `formatHijri()`            | e.g. `۵ رمضان ۱۴۴۷`                              |

---

## Components

### `TodayBanner.svelte`

Displays today's date as a 3-card responsive strip:

- **Primary card** (colored background): Jalali date + day name
- **Secondary cards** (bordered): Gregorian + Hijri dates
- Responsive: stacks on mobile, 3-column on ≥640px

### `CalendarGrid.svelte`

Interactive monthly calendar:

- Month/year navigation (← prev month, → next month, «/» prev/next year)
- Clicking the month title returns to today
- Each cell shows Jalali day (large), Gregorian day (small), Hijri day (small)
- Today highlighted with a filled circle
- Fridays highlighted in a distinct color
- Out-of-month days dimmed
- Smart `userNavigated` flag: if user hasn't navigated, follows SSR→client timezone correction

### `DateConverter.svelte`

Three-way date picker (dropdown selects for year/month/day in each system):

- Changing any calendar immediately updates the other two
- Day dropdowns auto-update max when month/year changes (prevents invalid dates like Feb 30)
- Year ranges: Jalali 1300–1450, Gregorian 1921–2071, Hijri 1338–1488
- "Reset to today" button

---

## Routing & SSR

### `+page.server.ts`

```ts
export function load() {
	return { today: getToday() }; // runs on the edge (Cloudflare Worker)
}
```

Today's date is computed **server-side** for correct SEO (page `<title>` includes the Jalali date). On mount, the client re-computes using local timezone to correct any timezone mismatch.

### SSR → Client hydration pattern (in `+page.svelte` and `CalendarGrid`)

```ts
let today = $state(untrack(() => data.today)); // init from SSR without reactivity
$effect(() => {
	today = getToday();
}); // then sync to client timezone
```

`untrack()` prevents the initial SSR value from creating a reactive dependency.

---

## CI/CD

### CI (`.github/workflows/ci.yml`)

Runs on every push/PR to any branch:

1. `bun run lint` — Prettier + ESLint
2. `bun run check` — svelte-check (TypeScript + Svelte diagnostics)
3. `bun run build` — production build with adapter-cloudflare

### CD (Cloudflare Pages)

- Cloudflare Pages auto-deploys `main` → production
- Every PR branch gets a preview URL automatically
- No secrets needed in GitHub Actions

---

## Configuration Files

| File                   | Purpose                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `svelte.config.js`     | Uses `adapter-cloudflare`; forces Svelte 5 runes mode for all non-node_modules files |
| `wrangler.toml`        | Cloudflare config: name, compat date, nodejs_compat flag, build output dir           |
| `vite.config.ts`       | Vite + Tailwind CSS v4 plugin                                                        |
| `tsconfig.json`        | TypeScript config (extends SvelteKit's)                                              |
| `.env.example`         | No env vars currently required                                                       |
| `.npmrc`               | Bun registry config                                                                  |
| `.prettierrc`          | Prettier config (includes svelte + tailwindcss plugins)                              |
| `eslint.config.js`     | ESLint flat config (TS + Svelte rules)                                               |
| `playwright.config.ts` | E2E test config                                                                      |
