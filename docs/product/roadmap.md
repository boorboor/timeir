# Roadmap

## Done

- [x] Three-system today display (Jalali, Gregorian, Hijri)
- [x] Interactive monthly Jalali calendar grid
- [x] Three-way date converter
- [x] Edge SSR on Cloudflare Workers with `adapter-cloudflare`
- [x] Server-side timezone detection via `cf.timezone` (visitor IP geolocation)
- [x] CI: lint + typecheck + build on every push/PR
- [x] CD: automated deploy to Cloudflare Pages on `main` push

## Near-term

- [ ] Holidays overlay on calendar grid (Iranian national holidays, Islamic occasions)
- [ ] PWA manifest + service worker for offline use
- [ ] Share a specific date via URL (`/date/1404-01-14`)
- [ ] Keyboard navigation in calendar grid

## Later

- [ ] Year view
- [ ] Week number display (هفته)
- [ ] Dark mode toggle (currently follows system preference via CSS)
- [ ] Date difference calculator ("X days between two dates")
- [ ] Localization for other Persian-speaking regions (Dari, Pashto)

## Decisions deferred

- Storing user preferences (no auth, use localStorage if needed)
- Native mobile app (web app is sufficient for now)
