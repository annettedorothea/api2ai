# Command-line interface (CLI)

Langium-backed **`parse`**, **`validate`**, and **`generate`** for `.api2ai` files, plus **`smoke-generated`** for testing generated tool modules.

## Commands

From the **workspace root** (after `npm install`, `npm run langium:generate`, `npm run build`):

```bash
node ./packages/cli/bin/cli.js parse <file.api2ai>
node ./packages/cli/bin/cli.js validate <file.api2ai>
node ./packages/cli/bin/cli.js generate <source.api2ai> <dest-tools.ts>
node ./packages/cli/bin/cli.js smoke-generated <path-to-*-tools.mjs> <toolName> [argsJson]
```

`validate` / `generate` block on DSL errors (shared gate from `@core2ai/core/codegen`).

Prefer `npm run generate:*` or `generate:all` in **[`../extension/demos/`](../extension/demos/)** for bundled demos.

## Smoke tests

From repo root:

```bash
npm run test:smoke              # all direct smokes
npm run test:smoke:mock-api     # one scenario
npm run test:e2e                # MCP stdio e2e
npm run test:mcp:mock-api       # same e2e scenario alone
```

Scenarios: [`../../scripts/dev-smoke.config.json`](../../scripts/dev-smoke.config.json). See [`test/README.md`](./test/README.md).

## Layout

- [`src/main.ts`](./src/main.ts) — Commander: `parse`, `validate`, `generate`, `smoke-generated`
- [`src/document-actions.ts`](./src/document-actions.ts) — parse/validate wiring
- [`src/generator.ts`](./src/generator.ts) — code generation
- [`resources/mcp-serve-emitted.mjs`](./resources/mcp-serve-emitted.mjs) — bundled MCP host (`npm run bundle:mcp-runtime`)

---

#Col3:23
