# examples — MCP demos for api2ai

You use the **api2ai** extension (installed from a **VSIX** or opened via **Extension Development Host** from the monorepo). This folder is the recommended **Cursor/VS Code workspace**: `.api2ai` files, OpenAPI specs, generated MCP tools, and [`.cursor/mcp.json`](./.cursor/mcp.json).

> **Links:** Paths are relative to **`examples/`** unless noted. For the monorepo README, use [`../README.md`](../README.md) (parent = **api2ai** root, not db2ai).

## What you can do here

- Edit **`.api2ai`** — on save, the extension generates `generated/tools/*` and `generated/cli/mcp-serve.mjs`
- Point MCP at public APIs (weather, spaceflight) or APIs that need tokens (TMDB, GitHub)
- Try the local **JWT demo** ([`./mock-api/`](./mock-api/)) with `fromJwt` / `public` tools
- Chat in Cursor with prompts prefixed by **`api2ai`** (see [Demo prompts](#demo-prompts))

Monorepo build and DSL grammar: [`../README.md`](../README.md) in the **api2ai** repository root.

## Getting started (examples)

Prerequisite: **Node.js 20+** and the **api2ai** extension active.

1. Open this folder **`examples`** as the workspace (so `.cursor/mcp.json` is picked up).
2. Install MCP runtime deps once:
   ```bash
   npm install
   ```
3. If you cloned the full repo and changed the DSL without saving in the IDE, regenerate from the **api2ai** repository root:
   ```bash
   npm run generate:open-meteo-tools
   ```
   (other APIs: `generate:spaceflight-tools`, `generate:tmdb-tools`, … — see [`../README.md`](../README.md#npm-scripts-repository-root).)
4. **Secrets:** copy or create `./.env.local` (gitignored). TMDB/GitHub tokens are **not** in git — set `TMDB_ACCESS_TOKEN`, `GITHUB_TOKEN`, etc. Open-Meteo needs no token.
5. **Cursor:** Settings → **Tools & MCP** → enable servers named `api2ai-*` → reload MCP or **Developer: Reload Window**.

### TMDB / GitHub (tokens)

- TMDB: API read token in `.env.local` as `TMDB_ACCESS_TOKEN` ([TMDB settings](https://www.themoviedb.org/settings/api)); base URL is already in `mcp.json`.
- GitHub: `GITHUB_TOKEN` in `.env.local` or `mcp.json` `env` for `api2ai-github`.

### mock-api (JWT)

1. `npm run demo:mock-api` (stop: `npm run demo:mock-api:kill`)
2. `node mock-api/get-token.mjs alice` → paste into `.env.local` as `MOCK_API_ACCESS_TOKEN`
3. From **api2ai** repo root: `npm run generate:mock-api-tools`
4. Enable `api2ai-mock-api`, reload MCP

Details: [`./mock-api/README.md`](./mock-api/README.md).

## Test in Cursor

1. Workspace = **`examples`**, MCP servers **on**.
2. Use prompts starting with **`api2ai`** ([`./.cursor/rules/mcp-api2ai-only.mdc`](./.cursor/rules/mcp-api2ai-only.mdc)).

Quick checks:

| API | Prompt (no token unless noted) |
|-----|--------------------------------|
| Open-Meteo | `api2ai wie ist das Wetter in Berlin` |
| Spaceflight | `api2ai was ist die naechste SpaceX Mission` |
| TMDB | `api2ai suche Filme mit dem Titel Dune` (token required) |
| GitHub | `api2ai gib mir die user infos und meine repos` (PAT required) |
| mock-api | `api2ai list my orders` (after token / login demo) |

After editing `.api2ai`: save (extension regenerates) or run `npm run generate:…` from repo root, then reload MCP.

## MCP configuration

[`./.cursor/mcp.json`](./.cursor/mcp.json) lists demo servers, base URLs, and `--base-url-env` / `--auth-env` flags. **Do not commit API keys.** For a new `.api2ai` file, add a matching server block manually (extension does not sync `mcp.json` yet).

Template:

```json
"api2ai-my-api": {
  "command": "node",
  "args": [
    "./generated/cli/mcp-serve.mjs",
    "./generated/tools/my-api-tools.mjs",
    "--base-url-env", "MY_API_BASE_URL",
    "--auth-env", "MY_API_TOKEN"
  ],
  "env": {
    "MY_API_BASE_URL": "https://api.example.com"
  }
}
```

## MCP servers in this workspace

| Server | Auth | Host `env` (examples) |
|--------|------|------------------------|
| `api2ai-open-meteo` | — | `OPEN_METEO_BASE_URL` |
| `api2ai-open-meteo-geocoding` | — | `OPEN_METEO_GEOCODING_BASE_URL` |
| `api2ai-spaceflight-news` | — | `SPACEFLIGHT_NEWS_BASE_URL` |
| `api2ai-tmdb` | Bearer | `TMDB_BASE_URL`, `TMDB_ACCESS_TOKEN` |
| `api2ai-github` | Bearer | `GITHUB_BASE_URL`, `GITHUB_TOKEN` |
| `api2ai-mock-api` | Bearer + JWT | `MOCK_API_BASE_URL`, `MOCK_API_ACCESS_TOKEN` |

## Demo prompts

Prefix every test prompt with **`api2ai`**.

- Weather: `api2ai wie ist das aktuelle Wetter in Ortenberg`
- Spaceflight: `api2ai zeig mir die naechsten 5 Spaceflight-Starts`
- Combined: `api2ai Wann ist der naechste SpaceX Start und könnte er durch das Wetter gefährdet sein?`
- TMDB: `api2ai suche Filme mit dem Titel Dune`
- GitHub: `api2ai gib mir die user infos und meine repos`

## Own API (local)

1. Add OpenAPI under `./openapi/` (or your project).
2. Create `my-api.api2ai` with a few curated GET operations.
3. Save (extension) or `node ../packages/cli/bin/cli.js generate ./my-api.api2ai ./generated/tools/my-api-tools.ts` from **api2ai** repo root.
4. Extend **your** `mcp.json` and set secrets in `.env.local`.

Optional DSL flag `insecureEnv` for local TLS only (self-signed certs).
