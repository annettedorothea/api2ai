# api2ai MCP demos

Demo workspace for **api2ai** MCP examples: `.api2ai` files, generated tools, and [`.cursor/mcp.json`](./.cursor/mcp.json). Project repo: [api2ai](https://github.com/annettedorothea/api2ai/blob/main/README.md).

## Quick start

1. **`npm run init`** — creates `.env.local` from `.env.example` if missing, `npm install`, `generate:all`, `build:generated`, mock-api in background.
2. Edit **`.env.local`** for optional API tokens (see [Credentials and env](#credentials-and-env)).
3. Open **this folder** as the Cursor/VS Code workspace. Enable one MCP server per demo (`stdio-api2ai-*` or `http-api2ai-*`) under **Tools & MCP**.
4. After DSL changes, generate/build, or env vars read at MCP startup: **reload** the affected MCP server.

## How it works

- You author **`.api2ai`** (and optional **`openapi/`** specs).
- The **api2ai** extension or CLI generates **`generated/tools/*.ts`** and **`generated/cli/stdio-mcp-server.ts`**.
- **`npm run build:generated`** compiles **`generated/cli/stdio-mcp-server.js`** for MCP.
- [`.cursor/mcp.json`](./.cursor/mcp.json) lists **stdio** (`stdio-mcp-server.js`) and **HTTP** (`url`) entries per demo; enable one transport at a time in Cursor.

## Example DSL

```api2ai
openapi "./openapi/open-meteo.openapi.yaml"

GET "/v1/forecast" {
    toolName: openMeteoForecast
    access: public
    intent: "retrieve hourly weather forecast for coordinates"
    summary: "7 day weather forecast for coordinates"
    example: "Get hourly temperature forecast for Berlin"
}
```

See [`mock-api.api2ai`](./mock-api.api2ai) for `auth`, `checked`, and JWT demos.

## Demo files

| DSL file                      | MCP server (stdio / http)                                                | Prerequisite                                              |
| ----------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| `open-meteo.api2ai`           | `stdio-api2ai-open-meteo` / `http-api2ai-open-meteo`                     | HTTP: `demo:mcp-http:open-meteo`                          |
| `open-meteo-geocoding.api2ai` | `stdio-api2ai-open-meteo-geocoding` / `http-api2ai-open-meteo-geocoding` | HTTP: `demo:mcp-http:open-meteo-geocoding`                |
| `spaceflight-news.api2ai`     | `stdio-api2ai-spaceflight-news` / `http-api2ai-spaceflight-news`         | HTTP: `demo:mcp-http:spaceflight-news`                    |
| `tmdb.api2ai`                 | `stdio-api2ai-tmdb` (stdio only)                                         | `TMDB_ACCESS_TOKEN` in `.env.local`                       |
| `github.api2ai`               | `stdio-api2ai-github` (stdio only)                                       | `GITHUB_TOKEN` in `.env.local`                            |
| `mock-api.api2ai`             | `stdio-api2ai-mock-api` / `http-api2ai-mock-api`                         | mock-api up; see [mock-api HTTP](#mock-api-over-http-jwt) |

## Scripts

| Script               | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `init`               | Env from example, install, generate all, compile, start mock-api (background) |
| `generate:all`       | Regenerate all demo tool modules                                              |
| `generate:*`         | Single API (see `package.json`)                                               |
| `build:generated`    | Compile `generated/**/*.ts` → `.js` for MCP                                   |
| `demo:mock-api`      | Start mock-api in foreground                                                  |
| `demo:mock-api:kill` | Stop background mock-api                                                      |
| `demo:mcp-http:all`  | Start all HTTP MCP hosts in background (ports 3848–3851)                      |
| `demo:mcp-http:kill` | Stop processes on those HTTP MCP ports                                        |
| `demo:mcp-http:*`    | Start one HTTP MCP host in foreground (see [HTTP MCP](#stateless-http-mcp))   |

## Stateless HTTP MCP

HTTP demos use **`stateless-http-mcp-server.js`**. [`.cursor/mcp.json`](./.cursor/mcp.json) has **fixed** `"url"` values (ports **3848–3851**); enable the matching `http-api2ai-*` server in Cursor (disable the `stdio-api2ai-*` twin for that demo). You start the host manually.

| Script                               | MCP server (Cursor)                | Port |
| ------------------------------------ | ---------------------------------- | ---- |
| `demo:mcp-http:open-meteo`           | `http-api2ai-open-meteo`           | 3848 |
| `demo:mcp-http:spaceflight-news`     | `http-api2ai-spaceflight-news`     | 3849 |
| `demo:mcp-http:mock-api`             | `http-api2ai-mock-api`             | 3850 |
| `demo:mcp-http:open-meteo-geocoding` | `http-api2ai-open-meteo-geocoding` | 3851 |

**TMDB** and **GitHub** are **stdio only** (`stdio-api2ai-tmdb`, `stdio-api2ai-github`, `envFile: .env.local`). No `http-api2ai-*` entries for them.

```bash
npm run demo:mcp-http:all
# or one host in foreground: npm run demo:mcp-http:open-meteo
```

Stop all HTTP hosts: `npm run demo:mcp-http:kill`. Enable **one** server per demo (`stdio-api2ai-*` **or** `http-api2ai-*`, not both), reload MCP. Prompts with prefix **`api2ai`** — see [`mcp-api2ai-only.mdc`](./.cursor/rules/mcp-api2ai-only.mdc).

### mock-api over HTTP (JWT)

There is **no** `mcp-http-exports.sh` and **no** Cursor restart from a sourced env script. HTTP hosts read upstream URLs from the Node process env when you run `demo:mcp-http:*`; JWT for protected tools does **not** come from `MOCK_API_ACCESS_TOKEN` in `.env.local` for the HTTP transport.

1. Mock **backend** on port **3847**: `npm run init` or `npm run demo:mock-api`.
2. HTTP **MCP host** on **3850**: `npm run demo:mcp-http:mock-api` or `npm run demo:mcp-http:all`.
3. Cursor: enable only **`http-api2ai-mock-api`**, reload MCP.
4. JWT: committed `mcp.json` ships a **demo admin** token in `headers.x-api-token` (default `MOCK_API_JWT_SECRET`). Replace with `node mock-api/get-token.mjs alice` output when testing other roles.

For JWT via env only, use stdio **`stdio-api2ai-mock-api`** with `MOCK_API_ACCESS_TOKEN` in `.env.local`.

## MCP servers

| Server                              | Transport | Auth / env                                            | Prerequisite         |
| ----------------------------------- | --------- | ----------------------------------------------------- | -------------------- |
| `stdio-api2ai-open-meteo`           | stdio     | `OPEN_METEO_BASE_URL` in mcp.json                     | —                    |
| `http-api2ai-open-meteo`            | http      | host `demo:mcp-http:open-meteo`                       | —                    |
| `stdio-api2ai-open-meteo-geocoding` | stdio     | `OPEN_METEO_GEOCODING_BASE_URL` in mcp.json           | —                    |
| `http-api2ai-open-meteo-geocoding`  | http      | host `demo:mcp-http:open-meteo-geocoding`             | —                    |
| `stdio-api2ai-spaceflight-news`     | stdio     | `SPACEFLIGHT_NEWS_BASE_URL` in mcp.json               | —                    |
| `http-api2ai-spaceflight-news`      | http      | host `demo:mcp-http:spaceflight-news`                 | —                    |
| `stdio-api2ai-tmdb`                 | stdio     | `TMDB_*`; token in `.env.local`                       | Bearer token         |
| `stdio-api2ai-github`               | stdio     | `GITHUB_*`; token in `.env.local`                     | Bearer token         |
| `stdio-api2ai-mock-api`             | stdio     | `MOCK_API_*`; `MOCK_API_ACCESS_TOKEN` in `.env.local` | mock-api backend up  |
| `http-api2ai-mock-api`              | http      | `headers.x-api-token` in mcp.json (demo admin JWT)    | mock-api + HTTP host |

Do not commit API keys; use `.env.local` (see [`.env.example`](./.env.example)).

## Credentials and env

Env file: **`.env.local`** (from `.env.example` via `init`). MCP reads startup env when the server starts — reload MCP after changing those variables.

### Local backend

**mock-api** (HTTPS JWT demo) starts in the background on **`npm run init`** (port **3847**, override `MOCK_API_PORT`). Stop: **`npm run demo:mock-api:kill`**.

Token: `node mock-api/get-token.mjs alice` → set **`MOCK_API_ACCESS_TOKEN`** in `.env.local`. Checked tool stub: [`src/auth/listCustomerOrders.ts`](./src/auth/listCustomerOrders.ts).

### Demo tokens

| Variable                | Demo                             |
| ----------------------- | -------------------------------- |
| `TMDB_ACCESS_TOKEN`     | TMDB search                      |
| `GITHUB_TOKEN`          | GitHub user/repos                |
| `MOCK_API_ACCESS_TOKEN` | mock-api protected/checked tools |

Open-Meteo and Spaceflight News need no token.

### Dev TLS

For **local HTTPS** with self-signed certificates, set on the MCP entry in [`.cursor/mcp.json`](./.cursor/mcp.json) (dev only):

```json
"env": {
    "NODE_TLS_REJECT_UNAUTHORIZED": "0"
}
```

Never use in production.

## Example prompts

Use prefix **`api2ai`** in chat ([`./.cursor/rules/mcp-api2ai-only.mdc`](./.cursor/rules/mcp-api2ai-only.mdc)).

| Scenario    | Prompt                                          |
| ----------- | ----------------------------------------------- |
| Weather     | `api2ai wie ist das Wetter in Berlin`           |
| Spaceflight | `api2ai was ist die naechste SpaceX Mission`    |
| TMDB        | `api2ai suche Filme mit dem Titel Dune`         |
| GitHub      | `api2ai gib mir die user infos und meine repos` |
| mock-api    | `api2ai list my orders`                         |

## Troubleshooting

- **MCP tools missing or stale:** run `generate:*` or save `.api2ai`, then `npm run build:generated`, then reload MCP.
- **401 / missing credential:** set token in `.env.local`, reload MCP.
- **mock-api connection refused:** `npm run demo:mock-api` or re-run `init`; check port **3847**.
- **HTTP MCP connection refused:** start `npm run demo:mcp-http:<demo>`; URL/port must match [`.cursor/mcp.json`](./.cursor/mcp.json).
- **Token changed in `.env.local`:** reload the matching MCP server.

## Development

From the **api2ai** monorepo root:

```bash
npm test --prefix packages/extension/demos
```

---

#Col3:23
