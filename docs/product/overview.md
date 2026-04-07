# Product Overview

## What is timeir?

**timeir** is a lightweight, edge-rendered Persian calendar app. It shows today's
date simultaneously in three calendar systems, and lets users convert any date
between them.

## Who is it for?

Iranians and Persian-speakers who live or work across calendar systems — switching
between Shamsi dates for everyday life, Gregorian for international communication,
and Hijri for Islamic occasions.

## Goals

| Goal                   | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Correct by default** | The date shown should always match the user's local date, not the server's timezone |
| **Fast**               | Sub-100ms TTFB via Cloudflare edge SSR; no heavy JS bundles                         |
| **Offline-capable**    | Pure calendar math, no external API calls for date data                             |
| **SEO-friendly**       | Today's Jalali date in `<title>` and `<meta>` for discoverability                   |
| **Accessible**         | RTL layout, appropriate `lang` and `dir` attributes                                 |

## Core features

### Today view

- Three-card banner: Jalali (primary), Gregorian, Hijri
- Day name in Persian
- Updates server-side using visitor's IP timezone (Cloudflare `cf.timezone`)

### Calendar grid

- Full monthly Jalali calendar — 6×7 cells, week starts Saturday
- Each cell shows Jalali day (large), Gregorian + Hijri days (small)
- Previous/next month and year navigation
- Click month title to return to today

### Date converter

- Three-way picker: change any calendar, the other two update instantly
- Handles month-length edge cases (Hijri, Gregorian leap years, Jalali)
- Year ranges: Jalali 1300–1450 / Gregorian 1921–2071 / Hijri 1338–1488

## Non-goals

- No calendar management / events / reminders
- No authentication
- No backend storage
- No native mobile app (PWA is acceptable in future)
