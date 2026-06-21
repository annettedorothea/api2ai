# oauth-idp

Shared mini OAuth 2.1 authorization server for MCP demos **`bookings`** and **`cakes`**.

| Instance       | Port | Runtime env (per process)      | Kill / `.env.example`          | Sign alg | MCP demo               |
| -------------- | ---- | ------------------------------ | ------------------------------ | -------- | ---------------------- |
| oauth-idp      | 3860 | `BOOKINGS_OAUTH_IDP_PORT`      | `BOOKINGS_OAUTH_IDP_PORT`      | HS256    | `cakes` (opaque)       |
| oauth-idp-oidc | 3861 | `BOOKINGS_OAUTH_IDP_PORT=3861` | `BOOKINGS_OAUTH_IDP_OIDC_PORT` | RS256    | `bookings` (oidc only) |

Same `server.mjs` — oidc instance sets `OAUTH_IDP_SIGN_ALG=RS256`. MCP hosts use `BOOKINGS_OAUTH_IDP_URL` (:3860) and `BOOKINGS_OAUTH_IDP_OIDC_URL` (:3861).

```bash
npm run start
```

JWT helpers re-use [`bookings/jwt.mjs`](../bookings/jwt.mjs) (HS256 + RS256 verify for upstream APIs).
