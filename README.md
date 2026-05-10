# api2ai

`api2ai` is a PoC for turning existing OpenAPI descriptions into small, curated AI tools.

The OpenAPI file stays the technical source of truth. The `.api2ai` DSL selects which endpoints should become tools and adds AI-facing metadata such as intent, examples, tool names, and optional runtime auth. Inside each HTTP operation block you can add optional **`title`**, **`summary`**, **`description`** (an empty string suppresses pulling OpenAPI text into the MCP **`API:`** section), and **`includeResponses`** alone on its own line to attach a **`Response:`** excerpt from OpenAPI success responses.

```txt
openapi "./openapi/spaceflight-news.openapi.yaml"
baseUrl "https://api.spaceflightnewsapi.net"

GET "/v4/articles/{id}/" {
    toolName: "getSpaceflightArticleById"
    intent: "get one spaceflight article by id"
    example: "Get article with id 1"
}
```

The generator writes TypeScript and ESM `.mjs` modules under [`examples/generated/tools/`](examples/generated/tools/), plus the standalone MCP entry copied to [`examples/generated/cli/`](examples/generated/cli/) (see `mcp-serve.mjs`). Those artifacts can be smoke-tested directly or exposed as MCP tools for any MCP-compatible agent or client.

## Project Layout

- `packages/language`: Langium grammar, AST generation, validation, and completion support.
- `packages/cli`: CLI generator, smoke runner, and generated-module MCP server.
- `packages/extension`: Cursor/VSCode extension wrapper for the DSL.
- `examples`: demo `.api2ai` files and OpenAPI under [`examples/openapi/`](examples/openapi/) (and peers), MCP config under [`examples/.cursor/`](examples/.cursor/), codegen output under [`examples/generated/tools/`](examples/generated/tools/) and [`examples/generated/cli/`](examples/generated/cli/).

## Getting Started

Install dependencies and build the workspace:

```bash
npm install
npm run langium:generate
npm run build
```

Generate demo tool modules:

```bash
npm run generate:spaceflight-tools
npm run generate:open-meteo-tools
npm run generate:open-meteo-geocoding-tools
npm run generate:tmdb-tools
```

Run a quick smoke test against Open-Meteo:

```bash
npm run test:smoke
```

Start an MCP server from one generated module:

```bash
npm run test:mcp
```

For the included Cursor demo setup, either open `examples` as a workspace and use `examples/.cursor/mcp.json`, or start the `Run Extension` launch configuration, which opens the Extension Development Host with `examples` as the workspace. Enable the configured `api2ai-*` MCP servers there.

To connect Cursor to the generated MCP servers, open Cursor Settings and go to `Tools & MCP` -> `Installed MCP Servers`. The servers from `examples/.cursor/mcp.json` should appear there and can be enabled or disabled individually.

When a `.api2ai` file changes in the Extension Development Host, saving the file automatically regenerates the matching tool module. If you edit files outside the extension workflow, run the matching `npm run generate:*` command manually. After regeneration, reload the MCP server so the client picks up the new `.mjs` runtime. In Cursor, press `Cmd+Shift+P`, search for `MCP`, and run the available refresh/restart command. If the server list or tool schema still looks stale, run `Developer: Reload Window`.

## Auth

The DSL can reference API keys without embedding secret values in generated code:

```txt
auth apiKey {
    in: header
    name: "Authorization"
    env: "TMDB_ACCESS_TOKEN"
    prefix: "Bearer "
}
```

At runtime, the generated module reads the secret from `process.env`.

For the TMDB demo, `examples/.env` documents the required `TMDB_ACCESS_TOKEN` with a dummy value. Use a real token only in your local environment, for example via `examples/.env.local` or an exported shell variable.

## DSL Extension Preview

To preview the language extension in Cursor/VSCode:

1. Open this repository as workspace root.
2. Run `npm install`, `npm run langium:generate`, and `npm run build`.
3. Open Run and Debug and start the `Run Extension` launch configuration.
4. Open or create a `.api2ai` file in the Extension Development Host.

Available debug launch configurations:

- `Run Extension`: starts an Extension Development Host with `examples` as the workspace.
- `Run Extension (completion debug log)`: same as `Run Extension`, but enables completion debug logging.
- `Attach to Language Server`: attaches the debugger to the language server on port `6009`.

Useful development commands:

```bash
npm run langium:watch
npm run watch
```
