---
status: accepted
date: 2026-04-07
---

# 0004 — Rotating OAuth tokens for Cloudflare Pages CD

## Context and Problem Statement

The Cloudflare Pages project was created via `wrangler pages deploy` (direct upload),
which means `Git Provider: No` — no GitHub webhook was registered and pushes to `main`
never triggered a Cloudflare deployment.

To fix CD, we need credentials that GitHub Actions can use to call `wrangler pages deploy`.
The canonical solution is a `CLOUDFLARE_API_TOKEN` (a static Cloudflare API token with
"Cloudflare Pages: Edit" permission stored as a GitHub secret).

## Decision Drivers

- CD must trigger automatically on every push to `main` without manual steps
- Credentials must be storable as GitHub Actions secrets
- Prefer zero manual browser steps if possible

## Considered Options

**A — Cloudflare API token (canonical)**
Create a static API token at `dash.cloudflare.com/profile/api-tokens` with "Pages: Edit"
scope. Store as `CLOUDFLARE_API_TOKEN` in GitHub secrets.

Blocker: Cloudflare's API (`POST /user/tokens`) requires `user:tokens:write` scope —
not included in wrangler's OAuth scopes. Cannot be created programmatically.

**B — Cloudflare Pages native GitHub integration**
Connect the CF Pages project to GitHub via the Cloudflare dashboard (OAuth between CF and GH).
Blocker: requires browser-based OAuth authorization and the project was already created
without it.

**C — Rotating OAuth token (chosen)**
Cloudflare's OAuth flow issues short-lived (1h) access tokens + a rotating refresh token.
Each CI deploy:

1. Exchanges the stored refresh token for a new access token + new refresh token
2. Writes the new token pair to `~/.config/.wrangler/config/default.toml` on the runner
3. Wrangler reads this config file (same as local dev auth) — no `CLOUDFLARE_API_TOKEN` needed
4. Updates the `CLOUDFLARE_REFRESH_TOKEN` GitHub secret for the next run

## Decision Outcome

**Chosen: Option C** — pragmatic given the inability to create API tokens programmatically.

GitHub secrets required:

- `CLOUDFLARE_REFRESH_TOKEN` — rotated after each deploy
- `GH_PAT` — GitHub token with `repo` scope, used by CI to update the secret

Implemented in `.github/workflows/ci.yml`:

```yaml
- name: Deploy to Cloudflare Pages
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: |
    RESPONSE=$(curl -s -X POST "https://dash.cloudflare.com/oauth2/token" \
      -d "grant_type=refresh_token&refresh_token=${CLOUDFLARE_REFRESH_TOKEN}&client_id=54d11594-84e4-41aa-b438-e81b8fa78ee7")
    ACCESS_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
    NEW_REFRESH=$(echo "$RESPONSE"  | python3 -c "import sys,json; print(json.load(sys.stdin)['refresh_token'])")
    mkdir -p ~/.config/.wrangler/config
    printf 'oauth_token = "%s"\nrefresh_token = "%s"\n' "$ACCESS_TOKEN" "$NEW_REFRESH" \
      > ~/.config/.wrangler/config/default.toml
    echo "$NEW_REFRESH" | gh secret set CLOUDFLARE_REFRESH_TOKEN --repo ${{ github.repository }}
    bunx wrangler pages deploy .svelte-kit/cloudflare --project-name timeir --branch main
```

### Consequences

**Positive:**

- Fully automated — no manual steps after initial secret setup
- No long-lived static credentials stored

**Negative:**

- If two `main` deploys run concurrently, the second will fail (both try to use the same
  refresh token; first one invalidates it). Acceptable: `main` deploys are rare and sequential.
- If a deploy fails after the token refresh but before the secret update, the secret
  contains an already-used (invalid) refresh token. Recovery: manually re-run the workflow
  or create a new API token via the dashboard.
- Long-term: if the Cloudflare OAuth session is revoked (e.g. password change), the whole
  chain must be re-bootstrapped.

### Future migration path

When convenient, replace this approach with a proper Cloudflare API token:

1. Create token at `dash.cloudflare.com/profile/api-tokens` (Pages: Edit)
2. `gh secret set CLOUDFLARE_API_TOKEN --repo boorboor/timeir`
3. Simplify the deploy step to: `CLOUDFLARE_API_TOKEN=${{ secrets.CLOUDFLARE_API_TOKEN }} wrangler pages deploy ...`
4. Delete `CLOUDFLARE_REFRESH_TOKEN` and `GH_PAT` secrets
