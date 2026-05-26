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
4. Generate tools:
    - Run `npm run generate:all`.
    - Alternatively, save each `.api2ai` file with the extension.
5. Enable MCP:
    - Open the demo folder as the workspace.
    - Open Cursor Settings, then **Tools & MCP**.
    - Enable the `api2ai-*` MCP servers.

## What you can do here

- Edit **`.api2ai`** — on save, the extension generates `generated/tools/*` and `generated/cli/mcp-serve.mjs`
- Point MCP at public APIs (weather, spaceflight) or APIs that need tokens (TMDB, GitHub)
- Try the local **JWT demo** ([`./mock-api/`](./mock-api/))
- Chat in Cursor with prompts prefixed by **`api2ai`** (see [Demo prompts](#demo-prompts))

## Getting started

Prerequisite: **Node.js 20+** and the **api2ai** extension.

1. Open **this folder** as the workspace so `.cursor/mcp.json` applies.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Generate tool code:
    ```bash
    npm run generate:all
    ```
    For one API only, use a targeted script such as `npm run generate:open-meteo-tools` (see [`./package.json`](./package.json)).
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

### mock-api (JWT)

1. `npm run demo:mock-api` (stop: `npm run demo:mock-api:kill`)
2. `node mock-api/get-token.mjs alice`
3. Add `MOCK_API_ACCESS_TOKEN` to `.env.local`
4. `npm run generate:mock-api-tools`
5. Enable `api2ai-mock-api`, then reload MCP

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
3. Save, run **Generate tool code**, or use a `generate:*` script (add one in `package.json` like the others)
4. Extend `mcp.json` and `.env.local`

---

#Col3:23
