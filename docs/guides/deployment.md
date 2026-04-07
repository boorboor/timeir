# Deployment Guide

## How deploys work

Pushes to `main` trigger the GitHub Actions pipeline (`.github/workflows/ci.yml`):

```
push to main
    → lint + typecheck + build (all branches)
    → wrangler pages deploy     (main only)
        → live at https://timeir.pages.dev
```

The deploy step authenticates with Cloudflare via a **rotating OAuth token** approach.
See [ADR 0004](../architecture/decisions/0004-rotating-oauth-tokens-for-ci-cd.md) for rationale.

## Required GitHub secrets

| Secret                    | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `CLOUDFLARE_REFRESH_TOKEN` | Cloudflare OAuth refresh token — rotated each deploy |
| `GH_PAT`                  | GitHub personal access token (repo scope) — used by CI to rotate the above |

These were set during initial setup. They persist automatically — the CI rotates
`CLOUDFLARE_REFRESH_TOKEN` after each successful deploy.

## If a deploy fails mid-rotation

Symptom: next deploy fails with `400 invalid_grant` from Cloudflare.

The refresh token was consumed but the GitHub secret wasn't updated.

**Recovery:**
1. Go to `dash.cloudflare.com/profile/api-tokens`
2. Create a new token with "Cloudflare Pages: Edit" permission
3. `gh secret set CLOUDFLARE_API_TOKEN --repo boorboor/timeir`
4. Update the deploy step in `ci.yml` to use `CLOUDFLARE_API_TOKEN` instead of the OAuth approach
   (see [ADR 0004 future migration path](../architecture/decisions/0004-rotating-oauth-tokens-for-ci-cd.md))

## Manual deploy

```bash
cd timeir
bun run build
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name timeir --branch main
```

Requires a working local Wrangler auth session (`bunx wrangler login` if needed).

## Cloudflare Pages project

- **Project name**: `timeir`
- **Account ID**: `f87f149339cdd503007acdd676d42950`
- **Production URL**: https://timeir.pages.dev
- **Git provider**: None (deploys via `wrangler pages deploy` in CI)

## Environments

| Branch  | URL                          | Notes                    |
| ------- | ---------------------------- | ------------------------ |
| `main`  | https://timeir.pages.dev     | Production               |
| any PR  | Not auto-deployed            | Run locally with `bun dev` |

## Local wrangler auth

If `bunx wrangler` commands fail with auth errors locally:

```bash
bunx wrangler login
```

This opens a browser OAuth flow and writes fresh tokens to
`~/Library/Preferences/.wrangler/config/default.toml` (macOS).
