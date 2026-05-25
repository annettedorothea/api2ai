# api2ai MCP demos

Use the **api2ai** extension (VSIX or Extension Development Host). This folder is the recommended **Cursor/VS Code workspace**: `.api2ai` files, OpenAPI specs, generated MCP tools, and [`.cursor/mcp.json`](./.cursor/mcp.json).

> **Links:** Paths are relative to **this demo workspace** unless noted. The api2ai project (DSL, build): [GitHub README](https://github.com/annettedorothea/api2ai/blob/main/README.md).

## Get demos without cloning the repo

1. Install the **api2ai** VSIX.
2. Command Palette → **api2ai: Create demo workspace (MCP examples)** → choose an empty folder.
3. In that folder: `npm install` → `npm run generate:all` (or save each `.api2ai` with the extension).
4. Open the folder as workspace → enable MCP servers in `.cursor/mcp.json`.

## What you can do here

- Edit **`.api2ai`** — on save, the extension generates `generated/tools/*` and `generated/cli/mcp-serve.mjs`
- Point MCP at public APIs (weather, spaceflight) or APIs that need tokens (TMDB, GitHub)
- Try the local **JWT demo** ([`./mock-api/`](./mock-api/))
- Chat in Cursor with prompts prefixed by **`api2ai`** (see [Demo prompts](#demo-prompts))

## Getting started

Prerequisite: **Node.js 20+** and the **api2ai** extension.

1. Open **this folder** as the workspace (so `.cursor/mcp.json` applies).
2. `npm install`
3. Generate tool code:
    ```bash
    npm run generate:all
    ```
    Or one API: `npm run generate:open-meteo-tools`, etc. (see [`./package.json`](./package.json)). Alternative: save each `.api2ai` or Command Palette → **Generate tool code**.
4. **Secrets:** copy [`.env.example`](./.env.example) to `./.env.local` and set `TMDB_ACCESS_TOKEN`, `GITHUB_TOKEN`, … (`.env.local` is gitignored)
5. **Cursor:** Settings → **Tools & MCP** → enable `api2ai-*` → reload MCP.

### TMDB / GitHub (tokens)

- TMDB: `TMDB_ACCESS_TOKEN` in `.env.local` ([TMDB settings](https://www.themoviedb.org/settings/api)).
- GitHub: `GITHUB_TOKEN` in `.env.local` or `mcp.json` `env` for `api2ai-github`.

### mock-api (JWT)

1. `npm run demo:mock-api` (stop: `npm run demo:mock-api:kill`)
2. `node mock-api/get-token.mjs alice` → `MOCK_API_ACCESS_TOKEN` in `.env.local`
3. `npm run generate:mock-api-tools`
4. Enable `api2ai-mock-api`, reload MCP

Details: [`./mock-api/README.md`](./mock-api/README.md).

## Test in Cursor

1. Workspace = this folder, MCP servers **on**.
2. Prompts with prefix **`api2ai`** ([`./.cursor/rules/mcp-api2ai-only.mdc`](./.cursor/rules/mcp-api2ai-only.mdc)).

| API         | Prompt (no token unless noted)                                 |
| ----------- | -------------------------------------------------------------- |
| Open-Meteo  | `api2ai wie ist das Wetter in Berlin`                          |
| Spaceflight | `api2ai was ist die naechste SpaceX Mission`                   |
| TMDB        | `api2ai suche Filme mit dem Titel Dune` (token required)       |
| GitHub      | `api2ai gib mir die user infos und meine repos` (PAT required) |
| mock-api    | `api2ai list my orders` (after token / login demo)             |

After editing `.api2ai`: save, **Generate tool code**, or `npm run generate:…`, then reload MCP.

## MCP configuration

[`./.cursor/mcp.json`](./.cursor/mcp.json) — do not commit API keys.

## MCP servers

| Server                        | Auth         | Host `env`                                   |
| ----------------------------- | ------------ | -------------------------------------------- |
| `api2ai-open-meteo`           | —            | `OPEN_METEO_BASE_URL`                        |
| `api2ai-open-meteo-geocoding` | —            | `OPEN_METEO_GEOCODING_BASE_URL`              |
| `api2ai-spaceflight-news`     | —            | `SPACEFLIGHT_NEWS_BASE_URL`                  |
| `api2ai-tmdb`                 | Bearer       | `TMDB_BASE_URL`, `TMDB_ACCESS_TOKEN`         |
| `api2ai-github`               | Bearer       | `GITHUB_BASE_URL`, `GITHUB_TOKEN`            |
| `api2ai-mock-api`             | Bearer + JWT | `MOCK_API_BASE_URL`, `MOCK_API_ACCESS_TOKEN` |

## Demo prompts

Prefix with **`api2ai`**: weather, SpaceX launch, TMDB Dune, GitHub user/repos.

## Own API (local)

1. OpenAPI under `./openapi/`
2. `my-api.api2ai` with curated operations
3. Save, **Generate tool code**, or `npm run generate:…` (add a script in `package.json` like the others)
4. Extend `mcp.json` and `.env.local`

---

_Created with gratitude to Jesus Christ._
