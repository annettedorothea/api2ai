# Command-line interface (CLI)

Thin wrapper around the Langium-backed language plus the **`generate`** pipeline that emits TypeScript, ESM `.mjs`, bundled tooling metadata, and a copy of the standalone MCP host into `packages/extension/demos/generated/cli/` when you generate from bundled demos.

Langium’s Minilogo CLI guide is still a useful reference for the shared patterns: [customizing the CLI](https://langium.org/docs/learn/minilogo/customizing_cli/).

## Layout

- [package.json](./package.json) – package manifest and `bin` entry.
- [bin/cli.js](./bin/cli.js) – executable stub (run from repo root as `node ./packages/cli/bin/cli.js`, or use workspace scripts in the root `package.json`).
- [src/main.ts](./src/main.ts) – Commander setup: `generate`, `smoke-generated`.
- [src/generate-command.ts](./src/generate-command.ts) – wiring for the generate command.
- [src/generator.ts](./src/generator.ts) – writes generated tool modules and copies the bundled MCP entry.
- [smoke/smoke-generated.ts](./smoke/smoke-generated.ts) – integration smoke runner (`smoke-generated` CLI command).
- [test/integration/](./test/integration/) – Vitest integration tests, including mock API direct invoke.
- [test/README.md](./test/README.md) – how smoke vs `test:mcp` differ.
- [src/openapi-tool-codegen.ts](./src/openapi-tool-codegen.ts) – OpenAPI-derived input schemas for tools.
- [src/util.ts](./src/util.ts) – helpers.
- [resources/mcp-serve-emitted.mjs](./resources/mcp-serve-emitted.mjs) – bundled MCP host from `@core2ai/mcp-host` (`npm run bundle:mcp-runtime`); copied to `generated/cli/mcp-serve.mjs` on generate.
- DSL-specific host logic lives in generated `mcpHostAdapter` inside each `*-tools.mjs`.

## Commands

From the **workspace root** (after `npm install`, `npm run langium:generate`, `npm run build`):

```bash
node ./packages/cli/bin/cli.js generate <source.api2ai> <dest-tools.ts>
node ./packages/cli/bin/cli.js smoke-generated <path-to-*-tools.mjs> <toolName> [argsJson]
```

Prefer `npm run generate:*` or `generate:all` in **[`../extension/demos/`](../extension/demos/)** for the bundled demos. Root `test:smoke` / `test:mcp` use [`../extension/demos/generated/`](../extension/demos/generated/).

---

_Created with gratitude to Jesus Christ._
