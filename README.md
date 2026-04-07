# timeir — Persian Calendar SPA

A fast, SSR-first Persian calendar and date converter built with SvelteKit 5 and deployed on Cloudflare Pages.

**Features**

- Today's date in all three calendar systems: Solar Hijri (Jalali/Shamsi), Gregorian, and Lunar Hijri
- Interactive monthly calendar grid with multi-date cells and Friday/today highlights
- Three-way date converter (Jalali ↔ Gregorian ↔ Lunar Hijri)
- Persian RTL UI with Vazirmatn font
- Server-Side Rendering (SSR) for SEO via Cloudflare Workers (edge)

---

## Development

```sh
bun install
bun run dev          # starts dev server at http://localhost:5173
bun run check        # svelte-check (types + Svelte diagnostics)
bun run lint         # prettier + eslint
bun run build        # production build → .svelte-kit/cloudflare/
bun run preview      # preview production build locally
```

### Local Cloudflare Workers preview

To preview the app running in the actual Cloudflare Workers runtime (requires `wrangler`):

```sh
bunx wrangler pages dev .svelte-kit/cloudflare
```

---

## Documentation

| Section                                                | Description                               |
| ------------------------------------------------------ | ----------------------------------------- |
| [Product overview](docs/product/overview.md)           | Vision, features, non-goals               |
| [Roadmap](docs/product/roadmap.md)                     | What's done and what's next               |
| [Architecture overview](docs/architecture/overview.md) | System design, request lifecycle          |
| [ADR index](docs/architecture/decisions/README.md)     | All architectural decisions               |
| [Development guide](docs/guides/development.md)        | Local setup, commands, code structure     |
| [Deployment guide](docs/guides/deployment.md)          | CI/CD pipeline, secrets, Cloudflare Pages |

---

## CI/CD

Every push to `main`: lint → typecheck → build → deploy to https://timeir.pages.dev

See the [deployment guide](docs/guides/deployment.md) for secrets setup and troubleshooting.

---

## Tech Stack

| Layer            | Technology                                 |
| ---------------- | ------------------------------------------ |
| Framework        | SvelteKit 5 (Svelte 5 runes mode)          |
| Styling          | Tailwind CSS v4                            |
| Calendar library | `jalaali-js` (Jalali ↔ Gregorian)          |
| Hijri calendar   | Tabular Islamic algorithm (Thursday epoch) |
| Adapter          | `@sveltejs/adapter-cloudflare`             |
| Runtime          | Cloudflare Workers (edge SSR)              |
| Package manager  | Bun                                        |
