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

## CI/CD

### CI (GitHub Actions)

Every push and pull request runs `.github/workflows/ci.yml`:

- `bun run lint` — Prettier + ESLint
- `bun run check` — svelte-check (TypeScript + Svelte)
- `bun run build` — production build with `adapter-cloudflare`

### CD (Cloudflare Pages)

Deployment is handled by **Cloudflare Pages' native GitHub integration** — no GitHub Actions secrets required.

**One-time setup:**

1. Push this repo to GitHub
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Create a project** → **Connect to Git**
3. Select your GitHub repo and configure:
   - **Branch:** `main`
   - **Build command:** `bun run build`
   - **Build output directory:** `.svelte-kit/cloudflare`
4. Save — Cloudflare will auto-deploy on every push to `main` and create preview URLs for every PR branch

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
