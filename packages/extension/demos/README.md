# api2ai MCP demos

Use the **api2ai** extension (VSIX or Extension Development Host). This folder is the recommended **Cursor/VS Code workspace**: `.api2ai` files, OpenAPI specs, generated MCP tools, and [`.cursor/mcp.json`](./.cursor/mcp.json).

> **Links:** Paths are relative to **this demo workspace** unless noted. The api2ai project (DSL, build): [GitHub README](https://github.com/annettedorothea/api2ai/blob/main/README.md).

## Get demos without cloning the repo

1. Install the **api2ai** VSIX.
2. Create a demo workspace:
    - Open the Command Palette.
    - Run **api2ai: Create demo workspace (MCP examples)**.
    - Choose an empty folder.
3. Prepare the folder:
    - Run `npm install`.
    - Copy [`.env.example`](./.env.example) to `.env.local`.
    - Set tokens for TMDB, GitHub, and mock-api if you want to use those demos. Open-Meteo needs no token.
4. Generate and compile:
    - `npm run generate:all`
    - `npm run build:generated`
    - Or save each `.api2ai` with the extension, then `npm run build:generated`.
5. Enable MCP:
    - Open the demo folder as the workspace.
    - Open Cursor Settings, then **Tools & MCP**.
    - Enable the `api2ai-*` MCP servers.

Generated **`generated/cli/mcp-serve.ts`** is self-contained (no `@core2ai/core` at runtime). MCP uses **`generated/cli/mcp-serve.js`** — the extension compiles that on save; from the terminal use **`npm run build:generated`** after **`npm run generate:*`**. Only **`.ts`** is committed; **`.js`** is gitignored (run **`build:generated`** after clone).

## What you can do here

- Edit **`.api2ai`** — on save, the extension writes **`generated/tools/*.ts`**, **`generated/cli/mcp-serve.ts`**, and compiles **`.js`** for MCP (requires **`npm install`** in this folder for TypeScript).
- Point MCP at public APIs (weather, spaceflight) or APIs that need tokens (TMDB, GitHub)
- Try the local **JWT demo** ([`./mock-api/`](./mock-api/)) with checked access in [`./src/auth/`](./src/auth/)
- Chat in Cursor with prompts prefixed by **`api2ai`** (see [Demo prompts](#demo-prompts))

## Getting started

Prerequisite: **Node.js 20+** and the **api2ai** extension.

1. Open **this folder** as the workspace so `.cursor/mcp.json` applies.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Generate and compile:
    ```bash
    npm run generate:all
    npm run build:generated
    ```
    For one API only, use a targeted script such as `npm run generate:open-meteo-tools`, then **`npm run build:generated`** (see [`./package.json`](./package.json)).
4. Configure optional secrets:
    - Copy [`.env.example`](./.env.example) to `./.env.local`.
    - Set `TMDB_ACCESS_TOKEN`, `GITHUB_TOKEN`, or mock-api values only for the demos you want to use.
    - `.env.local` is gitignored.
5. Enable MCP in Cursor:
    - Open Settings, then **Tools & MCP**.
    - Enable the `api2ai-*` servers.
    - Reload MCP after changing `.env.local`; MCP servers read env values when they start, not on every tool call.

### TMDB / GitHub (tokens)

- TMDB: `TMDB_ACCESS_TOKEN` in `.env.local` ([TMDB settings](https://www.themoviedb.org/settings/api)).
- GitHub: `GITHUB_TOKEN` in `.env.local` or `mcp.json` `env` for `api2ai-github`.
- After adding or changing a token, reload the matching MCP server so the new env value is available.

### mock-api (JWT + checked access)

1. `npm run demo:mock-api` (stop: `npm run demo:mock-api:kill`)
2. `node mock-api/get-token.mjs alice`
3. Add `MOCK_API_ACCESS_TOKEN` to `.env.local`
4. `npm run generate:mock-api-tools && npm run build:generated`
5. Implement or adjust [`./src/auth/listCustomerOrders.ts`](./src/auth/listCustomerOrders.ts) (types from `generated/tools/mock-api-tools.ts`)
6. Enable `api2ai-mock-api`, then reload MCP

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

After editing `.api2ai`: save or `npm run generate:…`, then **`npm run build:generated`**, then reload MCP.

## MCP transport and credentials

These demos serve tools through a **local MCP server over stdio**. Cursor starts [`generated/cli/mcp-serve.js`](./generated/cli/mcp-serve.js), loads the matching `generated/tools/*-tools.js`, and talks MCP via [`.cursor/mcp.json`](./.cursor/mcp.json).

There is **no sign-in step in MCP** itself. Put tokens in [`.env.local`](./.env.example) (`GITHUB_TOKEN`, `TMDB_ACCESS_TOKEN`, `MOCK_API_ACCESS_TOKEN`, …). Reload the MCP server after changing `.env.local`.

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
3. Save, **Generate tool code**, or add a `generate:*` script in `package.json`
4. `npm run build:generated`
5. Extend `mcp.json` and `.env.local`

Generate scripts: [`./scripts/generate.mjs`](./scripts/generate.mjs), config [`./demos-generate.config.json`](./demos-generate.config.json).

---

#Col3:23
