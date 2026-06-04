# api2ai MCP demos

Demo workspace: `.api2ai` → `generated/tools/*`, [`.cursor/mcp.json`](./.cursor/mcp.json).

## Quick start

1. **`npm run init`** — kills stale demo processes, creates `.env.local` once, install, generate, compile, starts **shopping-api**, **todo-api**, **oauth-idp**, HTTP MCP hosts (**todo-api**, **spaceflight-news**), **shopping-api** OAuth MCP host.
2. Set **`TMDB_ACCESS_TOKEN`** / **`GITHUB_TOKEN`** in `.env.local` if needed.
3. Open this folder in Cursor; enable servers in **mcp.json**, reload MCP.

## MCP servers (one transport per API)

| Server                            | Transport                                                     |
| --------------------------------- | ------------------------------------------------------------- |
| `todo-api-http-stateless`         | HTTP + API key (`headers.x-api-token` → upstream `x-api-key`) |
| `github-stdio`                    | stdio                                                         |
| `shopping-api-oauth`              | OAuth HTTP (Cursor sign-in)                                   |
| `open-meteo-stdio`                | stdio                                                         |
| `open-meteo-geocoding-stdio`      | stdio                                                         |
| `spaceflight-news-http-stateless` | HTTP                                                          |
| `tmdb-stdio`                      | stdio                                                         |

## Local APIs

| API                       | Port | Script              |
| ------------------------- | ---- | ------------------- |
| shopping-api (JWT orders) | 3847 | `demo:shopping-api` |
| todo-api (x-api-key)      | 3852 | `demo:todo-api`     |
| OAuth IDP                 | 3860 | `demo:oauth-idp`    |

Re-run init safely: **`npm run init`** (does not overwrite `.env.local`). Stop all: **`npm run demo:kill-all`**.

## DSL highlights

- [`shopping-api.api2ai`](./shopping-api.api2ai) — Bearer JWT, **checked** `listCustomerOrders` ([`src/auth/listCustomerOrders.ts`](./src/auth/listCustomerOrders.ts)).
- [`todo.api2ai`](./todo.api2ai) — API key, `listCategories` / `listTodos` / `getTodo`.

After DSL or core2ai codegen changes: `generate:all`, `build:generated`, reload MCP. If codegen changed in **core2ai**: build core2ai + api2ai extension embed before `generate:all`.

## Tests

```bash
npm test
```

---

#Col3:23
