---
status: accepted
date: 2025-01-01
---

# 0002 — Use jalaali-js for Jalali↔Gregorian conversion

## Context and Problem Statement

The app needs accurate Jalali (Solar Hijri / Shamsi) ↔ Gregorian conversion.
This is non-trivial: the Jalali leap year algorithm uses astronomical observations
and requires the Borkowski algorithm to be correct past ~2025.

## Decision Drivers

- Correctness is more important than bundle size
- Hijri conversion will be custom anyway (no good library exists for tabular Islamic)
- The library must work in Cloudflare Workers (no Node.js-specific APIs)

## Considered Options

1. **jalaali-js** — widely used, well-tested, covers Borkowski algorithm, pure JS
2. **Custom implementation** — full control, but high risk of edge-case bugs in leap year logic
3. **moment-jalaali** — wraps moment.js; moment is deprecated and enormous
4. **date-fns-jalali** — newer, but less battle-tested and adds unnecessary date-fns dependency

## Decision Outcome

**Chosen: jalaali-js** as the sole runtime dependency.

The library is small (~4KB), zero-dependency, and has been in production use by
many Iranian web projects since 2014. Its test coverage of leap years is extensive.

**Hijri conversion is custom** (in `src/lib/calendar.ts`) using the tabular Islamic
algorithm via Julian Day Numbers. No library adequately covers this; the custom
implementation is short and well-understood.

### Consequences

**Positive:**
- One small, auditable dependency
- Leap year correctness up to 2090+ (Borkowski algorithm)
- Julian Day approach makes Gregorian↔Hijri chain cleanly composable

**Negative:**
- jalaali-js has no TypeScript types — a local `jalaali.d.ts` declaration file
  was added to `src/lib/` to satisfy the type checker
