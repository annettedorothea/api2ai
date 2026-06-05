# oauth-idp

Shared mini OAuth 2.1 authorization server for MCP demos **`bookings-oauth`** and **`cakes`**.

| Instance              | Port | Runtime env (per process)      | Kill / `.env.example`          | Sign alg | MCP demo                     |
| --------------------- | ---- | ------------------------------ | ------------------------------ | -------- | ---------------------------- |
| `demo:oauth-idp`      | 3860 | `BOOKINGS_OAUTH_IDP_PORT`      | `BOOKINGS_OAUTH_IDP_PORT`      | HS256    | `cakes` (opaque)             |
| `demo:oauth-idp-oidc` | 3861 | `BOOKINGS_OAUTH_IDP_PORT=3861` | `BOOKINGS_OAUTH_IDP_OIDC_PORT` | RS256    | `bookings-oauth` (oidc only) |

Same `server.mjs` — oidc instance sets `OAUTH_IDP_SIGN_ALG=RS256`. MCP hosts use `BOOKINGS_OAUTH_IDP_URL` (:3860) and `BOOKINGS_OAUTH_IDP_OIDC_URL` (:3861).

```bash
npm run demo:oauth-idp
npm run demo:oauth-idp-oidc
```

JWT helpers re-use [`bookings-api/jwt.mjs`](../bookings-api/jwt.mjs) (HS256 + RS256 verify for upstream APIs).
