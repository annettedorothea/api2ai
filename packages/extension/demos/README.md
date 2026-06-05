# api2ai MCP demos

Demo workspace: `.api2ai` → `generated/tools/*`, [`.cursor/mcp.json`](./.cursor/mcp.json).

## Quick start

1. **`npm run init`** — kills stale demo processes, creates `.env.local` once, install, generate, compile, starts **bookings-api**, **todo-api**, **oauth-idp**, HTTP MCP hosts (**todo-api**, **spaceflight-news**), **bookings-api** OAuth MCP host.
2. Set **`TMDB_ACCESS_TOKEN`** / **`GITHUB_TOKEN`** in `.env.local` if needed.
3. Open this folder in Cursor as workspace root.
4. **Cursor → Settings → MCP** (or **Features → MCP Servers**): enable only the servers you need from [`.cursor/mcp.json`](./.cursor/mcp.json). Disabled servers do not start a host process.
5. After changing **`.env.local`**, env vars in **`mcp.json`**, or host launch scripts: **restart the affected MCP server** in Cursor (toggle off/on or **Reload MCP**). Stdio hosts read env on each tool call, but a changed token in `.env.local` is only picked up after restart.

Re-run init safely: **`npm run init`** (does not overwrite `.env.local`). Stop all: **`npm run demo:kill-all`**.

## Demos: DSL → MCP server → transport → auth mode

One row per demo API. **MCP server** = entry name in [`.cursor/mcp.json`](./.cursor/mcp.json). **Host validation** = `--credential-validation` / `--oauth-token-validation` on the MCP host (see [Where configured](#where-host-validation-is-set)).

| DSL / tools module                                                                            | MCP server (`mcp.json`)           | Transport      | Host auth mode      | Notes                                                                                                                                   |
| --------------------------------------------------------------------------------------------- | --------------------------------- | -------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [`todo.api2ai`](./todo.api2ai) → `todo-tools`                                                 | `todo-api-http-stateless`         | HTTP stateless | **static**          | Client header `x-api-token`; host checks `TODO_API_KEY`. Host started by `init` / [`mcp-http-demos.mjs`](./scripts/mcp-http-demos.mjs). |
| [`github.api2ai`](./github.api2ai) → `github-tools`                                           | `github-stdio`                    | stdio          | **opaque**          | PAT in `.env.local`; GitHub API validates.                                                                                              |
| [`bookings-api.api2ai`](./bookings-api.api2ai) → `bookings-api-tools`                         | `bookings-api-oauth`              | OAuth HTTP     | **hs256** (default) | Cursor OAuth login; `BOOKINGS_API_JWT_SECRET` in `.env.local`. Host via [`mcp-oauth-demos.mjs`](./scripts/mcp-oauth-demos.mjs).         |
| [`open-meteo.api2ai`](./open-meteo.api2ai) → `open-meteo-tools`                               | `open-meteo-stdio`                | stdio          | —                   | No `auth` in DSL; no validation flag.                                                                                                   |
| [`open-meteo-geocoding.api2ai`](./open-meteo-geocoding.api2ai) → `open-meteo-geocoding-tools` | `open-meteo-geocoding-stdio`      | stdio          | —                   | Public tools only.                                                                                                                      |
| [`spaceflight-news.api2ai`](./spaceflight-news.api2ai) → `spaceflight-news-tools`             | `spaceflight-news-http-stateless` | HTTP stateless | —                   | No auth; host via launch script.                                                                                                        |
| [`tmdb.api2ai`](./tmdb.api2ai) → `tmdb-tools`                                                 | `tmdb-stdio`                      | stdio          | **opaque**          | PAT in `.env.local`; TMDB API validates.                                                                                                |

**Auth modes (host):** `static` (fixed key) · `hs256` (JWT HMAC) · `opaque` (presence only; upstream API validates) · `oidc` (OAuth HTTP + JWKS only).

### Where host validation is set

| Transport      | Config location                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| stdio          | [`mcp.json`](./.cursor/mcp.json) → `args` (`--credential-validation`, …)                                       |
| HTTP stateless | [`scripts/mcp-http-demos.mjs`](./scripts/mcp-http-demos.mjs) + `.env.local`                                    |
| OAuth HTTP     | [`scripts/mcp-oauth-demos.mjs`](./scripts/mcp-oauth-demos.mjs); default **hs256** (no extra `.env.local` keys) |

**bookings-api optional overrides** (not needed for Cursor MCP): `OAUTH_TOKEN_VALIDATION` (`oidc` \| `opaque`); `OAUTH_ISSUER` with `oidc` (defaults to `BOOKINGS_API_OAUTH_IDP_URL`).

## Local APIs & ports

| API / process             | Port | Script                           |
| ------------------------- | ---- | -------------------------------- |
| bookings-api (JWT)        | 3847 | `demo:bookings-api`              |
| todo-api (x-api-key)      | 3852 | `demo:todo-api`                  |
| OAuth IDP                 | 3860 | `demo:oauth-idp`                 |
| spaceflight-news HTTP MCP | 3849 | `demo:mcp-http:spaceflight-news` |
| todo-api HTTP MCP         | 3853 | started by `init`                |
| bookings-api OAuth MCP    | 3870 | started by `init`                |

## DSL highlights

- [`bookings-api.api2ai`](./bookings-api.api2ai) — **`listVacationRentals`**, **`listBookings`** checked ([`src/auth/listBookings.ts`](./src/auth/listBookings.ts)).
- [`todo.api2ai`](./todo.api2ai) — API key; `listCategories` / `listTodos` / `getTodo`.

After DSL or core2ai codegen changes: `generate:all`, `build:generated`, reload MCP. If codegen changed in **core2ai**: build core2ai + api2ai extension embed before `generate:all`.

## Tests

```bash
npm test
```

---

#Col3:23
