# api2ai

`api2ai` is a PoC for turning existing OpenAPI descriptions into small, curated AI tools.

The OpenAPI file stays the technical source of truth. The `.api2ai` DSL selects which endpoints should become tools and adds AI-facing metadata such as intent, examples, tool names, and optional runtime auth.

```txt
openapi "./openapi/spaceflight-news.openapi.yaml"
baseUrl "https://api.spaceflightnewsapi.net"

GET "/v4/articles/{id}/" {
    intent: "get one spaceflight article by id"
    example: "Get article with id 1"
    toolName: "getSpaceflightArticleById"
}
```

The generator produces TypeScript and runnable `.mjs` modules. Those modules can be smoke-tested directly or exposed as MCP tools for any MCP-compatible agent or client.

## Project Layout

- `packages/language`: Langium grammar, AST generation, validation, and completion support.
- `packages/cli`: CLI generator, smoke runner, and generated-module MCP server.
- `packages/extension`: Cursor/VSCode extension wrapper for the DSL.
- `examples`: demo DSL files, OpenAPI specs, generated tool modules, and MCP config.

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

For the included Cursor demo setup, open `examples` as a workspace and use `examples/.cursor/mcp.json` to enable the configured `api2ai-*` MCP servers. Restart or reload the MCP server after regenerating a tool module.

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

At runtime, the generated module reads the secret from `process.env`. The CLI also loads local `.env.local` or `env.local` files for `smoke-generated` and `mcp-serve-generated`.

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
- `Extension + Language Server`: compound launch for extension debugging plus language server attach.

Useful development commands:

```bash
npm run langium:watch
npm run watch
```

Saving a `.api2ai` file in the extension host generates `generated/<name>-tools.ts` and `generated/<name>-tools.mjs` next to the source file.
