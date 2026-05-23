# Command-line interface (CLI)

Thin wrapper around the Langium-backed language plus the **`generate`** pipeline that emits TypeScript, ESM `.mjs`, bundled tooling metadata, and a copy of the standalone MCP host into `packages/extension/demos/generated/cli/` when you generate from bundled demos.

Langium’s Minilogo CLI guide is still a useful reference for the shared patterns: [customizing the CLI](https://langium.org/docs/learn/minilogo/customizing_cli/).

## Layout

- [package.json](./package.json) – package manifest and `bin` entry.
- [bin/cli.js](./bin/cli.js) – executable stub (run from repo root as `node ./packages/cli/bin/cli.js`, or use workspace scripts in the root `package.json`).
- [src/main.ts](./src/main.ts) – Commander setup: `generate`, `smoke-generated`.
- [src/generate-command.ts](./src/generate-command.ts) – wiring for the generate command.
- [src/generator.ts](./src/generator.ts) – writes generated tool modules and copies the bundled MCP entry.
- [src/smoke.ts](./src/smoke.ts) – `smoke-generated` runner.
- [src/openapi-tool-codegen.ts](./src/openapi-tool-codegen.ts) – OpenAPI-derived input schemas for tools.
- [src/util.ts](./src/util.ts), [src/env.ts](./src/env.ts) – helpers and optional `.env` loading for smoke runs.
- [mcp-bundle/](./mcp-bundle/) – MCP server implementation; root `npm run bundle:mcp-runtime` produces [resources/mcp-serve-emitted.mjs](./resources/mcp-serve-emitted.mjs), which the generator copies next to generated outputs.

## Commands

From the **workspace root** (after `npm install`, `npm run langium:generate`, `npm run build`):

```bash
node ./packages/cli/bin/cli.js generate <source.api2ai> <dest-tools.ts>
node ./packages/cli/bin/cli.js smoke-generated <path-to-*-tools.mjs> <toolName> [argsJson]
```

Prefer `npm run generate:*` or `generate:all` in **[`../extension/demos/`](../extension/demos/)** for the bundled demos. Root `test:smoke` / `test:mcp` use [`../extension/demos/generated/`](../extension/demos/generated/).
