# api2ai MCP demos

Demo workspace for **api2ai** MCP examples: `.api2ai` files, generated tools, and [`.cursor/mcp.json`](./.cursor/mcp.json). Project repo: [api2ai](https://github.com/annettedorothea/api2ai/blob/main/README.md).

## Quick start

1. **`npm run init`** — creates `.env.local` from `.env.example` if missing, `npm install`, `generate:all`, `build:generated`, mock-api in background.
2. Edit **`.env.local`** for optional API tokens (see [Credentials and env](#credentials-and-env)).
3. Open **this folder** as the Cursor/VS Code workspace. Enable **`api2ai-*`** MCP servers under **Tools & MCP**.
4. After DSL changes, generate/build, or env vars read at MCP startup: **reload** the affected MCP server.

## How it works

- You author **`.api2ai`** (and optional **`openapi/`** specs).
- The **api2ai** extension or CLI generates **`generated/tools/*.ts`** and **`generated/cli/mcp-serve.ts`**.
- **`npm run build:generated`** compiles **`generated/cli/mcp-serve.js`** for MCP.
- [`.cursor/mcp.json`](./.cursor/mcp.json) starts `mcp-serve.js` per server over **stdio** and loads the matching tool module.

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

| DSL file                      | MCP server                    | Prerequisite                              |
| ----------------------------- | ----------------------------- | ----------------------------------------- |
| `open-meteo.api2ai`           | `api2ai-open-meteo`           | —                                         |
| `open-meteo-geocoding.api2ai` | `api2ai-open-meteo-geocoding` | —                                         |
| `spaceflight-news.api2ai`     | `api2ai-spaceflight-news`     | —                                         |
| `tmdb.api2ai`                 | `api2ai-tmdb`                 | `TMDB_ACCESS_TOKEN`                       |
| `github.api2ai`               | `api2ai-github`               | `GITHUB_TOKEN`                            |
| `mock-api.api2ai`             | `api2ai-mock-api`             | mock-api running, `MOCK_API_ACCESS_TOKEN` |

## Scripts

| Script               | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `init`               | Env from example, install, generate all, compile, start mock-api (background) |
| `generate:all`       | Regenerate all demo tool modules                                              |
| `generate:*`         | Single API (see `package.json`)                                               |
| `build:generated`    | Compile `generated/**/*.ts` → `.js` for MCP                                   |
| `demo:mock-api`      | Start mock-api in foreground                                                  |
| `demo:mock-api:kill` | Stop background mock-api                                                      |

## MCP servers

| Server                        | Auth / env                                   | Prerequisite |
| ----------------------------- | -------------------------------------------- | ------------ |
| `api2ai-open-meteo`           | `OPEN_METEO_BASE_URL`                        | —            |
| `api2ai-open-meteo-geocoding` | `OPEN_METEO_GEOCODING_BASE_URL`              | —            |
| `api2ai-spaceflight-news`     | `SPACEFLIGHT_NEWS_BASE_URL`                  | —            |
| `api2ai-tmdb`                 | `TMDB_BASE_URL`, `TMDB_ACCESS_TOKEN`         | Bearer token |
| `api2ai-github`               | `GITHUB_BASE_URL`, `GITHUB_TOKEN`            | Bearer token |
| `api2ai-mock-api`             | `MOCK_API_BASE_URL`, `MOCK_API_ACCESS_TOKEN` | JWT demo     |

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
- **Token changed in `.env.local`:** reload the matching MCP server.

## Development

From the **api2ai** monorepo root:

```bash
npm test --prefix packages/extension/demos
```

---

#Col3:23
