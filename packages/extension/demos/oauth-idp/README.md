# oauth-idp

Shared mini OAuth 2.1 authorization server for MCP demos **`bookings`** and **`cakes`**.

| Instance       | Port | Runtime env (per process)      | Kill / `.env.example`          | Sign alg | MCP demo               |
| -------------- | ---- | ------------------------------ | ------------------------------ | -------- | ---------------------- |
| oauth-idp      | 3860 | `BOOKINGS_OAUTH_IDP_PORT`      | `BOOKINGS_OAUTH_IDP_PORT`      | HS256    | `cakes` (opaque)       |
| oauth-idp-oidc | 3861 | `BOOKINGS_OAUTH_IDP_PORT=3861` | `BOOKINGS_OAUTH_IDP_OIDC_PORT` | RS256    | `bookings` (oidc only) |

Same `server.mjs` — oidc instance sets `OAUTH_IDP_SIGN_ALG=RS256`. MCP hosts use `BOOKINGS_OAUTH_IDP_URL` (:3860) and `BOOKINGS_OAUTH_IDP_OIDC_URL` (:3861).

### Redirect URIs

One env var in `.env.local` (both IdP instances read it):

**`OAUTH_IDP_REDIRECT_URIS`** — comma-separated list:

- **Exact URI** — e.g. `cursor://anysphere.cursor-mcp/oauth/callback`
- **Prefix rule** — entry ends with `*` (matches any redirect that starts with the prefix before `*`)

Default when unset: Cursor callback only.

**Open WebUI** uses per-server callbacks like `http://localhost:3000/oauth/clients/mcp:<id>/callback`. Example:

```bash
OAUTH_IDP_REDIRECT_URIS=cursor://anysphere.cursor-mcp/oauth/callback,http://localhost:3000/oauth/clients/mcp:*
```

Restart demos after editing (`npm run demo:kill-all && npm run start`).

**Open WebUI (native on host):** use `127.0.0.1` for MCP and OAuth Server URLs. Redirect prefix example:

```bash
OAUTH_IDP_REDIRECT_URIS=cursor://anysphere.cursor-mcp/oauth/callback,http://localhost:3000/oauth/clients/mcp:*
```

```bash
npm run start
```

JWT helpers re-use [`bookings/jwt.mjs`](../bookings/jwt.mjs) (HS256 + RS256 verify for upstream APIs).
