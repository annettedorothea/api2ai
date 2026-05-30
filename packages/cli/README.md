# Command-line interface (CLI)

Langium-backed **`parse`**, **`validate`**, and **`generate`** for `.api2ai` files, plus **`smoke-generated`** for ad-hoc tool-module checks.

For day-to-day work you usually **do not** call this CLI directly — see [How to run](#how-to-run) below.

## How to run

**Prerequisite** (workspace root): `npm run langium:generate && npm run build`

From the **api2ai repo root**, prefer the workspace bin:

```bash
npx api-2-ai-dsl-cli parse <file.api2ai>
npx api-2-ai-dsl-cli validate <file.api2ai>
npx api-2-ai-dsl-cli generate <source.api2ai> <dest-tools.ts>
npx api-2-ai-dsl-cli smoke-generated <path-to-*-tools.mjs> <toolName> [argsJson]
```

Equivalent (same entrypoint): `node ./packages/cli/bin/cli.js …`

| Workflow                        | Instead of raw CLI                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Demos in the monorepo**       | Extension Dev Host (save → regenerate) or `npm run generate:all` in [`../extension/demos/`](../extension/demos/) |
| **One demo file from terminal** | `node ../extension/demos/scripts/generate.mjs …` (from demos folder)                                             |
| **Installed VSIX**              | Save in editor, or embedded `cli.cjs` via demo generate script                                                   |
| **Smoke / MCP e2e**             | `npm run test:smoke`, `npm run test:e2e` from repo root — see [Smoke tests](#smoke-tests)                        |

`validate` / `generate` block on DSL errors (shared gate from `@core2ai/core/codegen`).

## Smoke tests

From repo root:

```bash
npm run test:smoke              # all direct smokes
npm run test:smoke:mock-api     # one scenario
npm run test:e2e                # MCP stdio e2e
npm run test:mcp:mock-api       # same e2e scenario alone
```

Scenarios: [`../../scripts/dev-smoke.config.json`](../../scripts/dev-smoke.config.json). Details: [`test/README.md`](./test/README.md).

## Layout

- [`src/main.ts`](./src/main.ts) — Commander: `parse`, `validate`, `generate`, `smoke-generated`
- [`src/document-actions.ts`](./src/document-actions.ts) — parse/validate wiring
- [`src/generator.ts`](./src/generator.ts) — code generation
- [`bin/cli.js`](./bin/cli.js) — launcher → compiled [`out/src/main.js`](./out/src/main.js)

---

#Col3:23
