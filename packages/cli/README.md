# Command-line interface (CLI)

Langium-backed **`parse`**, **`validate`**, and **`generate`** for `.api2ai` files.

For day-to-day work you usually **do not** call this CLI directly — see [How to run](#how-to-run) below.

## How to run

**Prerequisite** (workspace root): `npm run langium:generate && npm run build`

From the **api2ai repo root**, prefer the workspace bin:

```bash
npx api-2-ai-dsl-cli parse <file.api2ai>
npx api-2-ai-dsl-cli validate <file.api2ai>
npx api-2-ai-dsl-cli generate <source.api2ai> <dest-tools.ts>
```

Equivalent (same entrypoint): `node ./packages/cli/bin/cli.js …`

| Workflow                  | Instead of raw CLI                                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Demos in the monorepo** | Extension Dev Host (save → regenerate) or `npm run generate:all` in [`../extension/demos/`](../extension/demos/)                                                               |
| **One demo file**         | `node ../extension/demos/scripts/generate.mjs …` (from demos folder)                                                                                                           |
| **Installed VSIX**        | Save in editor, or embedded `cli.cjs` via demo generate script                                                                                                                 |
| **Integration tests**     | `npm test` from repo root — mock-api tests in [`../extension/demos/test/README.md`](../extension/demos/test/README.md); CLI unit tests in [`test/README.md`](./test/README.md) |

`validate` / `generate` block on DSL errors (shared gate from `@core2ai/core/codegen`).

## Layout

- [`src/main.ts`](./src/main.ts) — Commander: `parse`, `validate`, `generate`
- [`src/generator/`](./src/generator/) — code generation
- [`test/`](./test/) — Vitest unit tests (integration tests live in [`../extension/demos/test/`](../extension/demos/test/))

---

#Col3:23
