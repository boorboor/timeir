# Architecture Overview

## System diagram

```
Browser
  │
  ▼
Cloudflare Edge (Workers)
  │   • Runs SvelteKit SSR load()
  │   • Reads cf.timezone from request (IP geolocation)
  │   • Computes today's date in visitor's local timezone
  │   • Renders full HTML + inlines data
  ▼
HTML response with hydration payload
  │
  ▼
Client (SvelteKit hydration)
  │   • Svelte 5 runes take over reactivity
  │   • No further date API calls needed
  ▼
Interactive SPA
```

## Request lifecycle

1. User hits `https://timeir.pages.dev`
2. Cloudflare routes the request to the nearest Workers edge node
3. `+page.server.ts` `load()` runs:
   - reads `platform.cf.timezone` (e.g. `"Asia/Tehran"`)
   - calls `getToday(tz)` which uses `Intl.DateTimeFormat` to get date parts in that timezone
   - returns `{ today: TodayData }`
4. SvelteKit renders the full HTML with today's Jalali date in `<title>`
5. Browser receives complete HTML — no layout shift, correct date for the visitor's region
6. Svelte 5 hydrates; `today` is a `$derived(data.today)` — no client override needed

## Calendar math

All conversion logic lives in `src/lib/calendar.ts` — pure TypeScript, no DOM, no side effects.

```
Jalali ←──────────────────────────── Gregorian
              jalaali-js library
                                           │
                               gregorianToJD() / jdToGregorian()
                                           │
                                      Julian Day (JD)
                                           │
                               jdToHijri() / hijriToJD()
                                           │
                                         Hijri
```

**Why Julian Day?** It's a universal integer representation of any calendar date,
making two-step conversions (Jalali → Gregorian → JD → Hijri) straightforward and
numerically stable.

## Component hierarchy

```
+page.svelte
├── TodayBanner      (today: TodayData)
├── [tab: Calendar]
│   └── CalendarGrid (today: TodayData)
└── [tab: Converter]
    └── DateConverter (today: TodayData)
```

All components are passed `today` as a prop from the SSR load function.
No component fetches its own data.

## Key design constraints

| Constraint | Why |
|------------|-----|
| No client-side `fetch` for date data | Calendar math is deterministic — run it locally |
| Server computes date in visitor's timezone | Avoids wrong date for users near midnight in non-UTC zones |
| Week starts Saturday | Iranian convention (شنبه is the first day of the week) |
| 6×7 = 42 calendar cells always | Simplifies grid rendering — no variable-length rows |
| RTL by default | All text is Persian/Arabic; layout respects `dir="rtl"` |
