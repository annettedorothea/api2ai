# CLI tests

| Path                                 | Kind              | What it checks                                                                          |
| ------------------------------------ | ----------------- | --------------------------------------------------------------------------------------- |
| `integration/smoke-generated.ts`     | Integration smoke | One `invokeTool` on a generated `*-tools.mjs` from demos (HTTP only, **no** MCP server) |
| `json-schema-to-zod-codegen.test.ts` | Unit (Vitest)     | Zod emission from JSON Schema IR                                                        |

## Run from repo root

```bash
# Integration smoke (generated tool module)
npm run test:smoke
npm run test:smoke:tmdb
npm run test:smoke:mock-api

# MCP stdio host + generated tools (starts server on stdio; Ctrl+C to stop)
npm run test:mcp
```

`smoke-generated` is still exposed as a CLI subcommand (`node packages/cli/bin/cli.js smoke-generated …`) for ad-hoc runs; implementation lives here under `test/integration/`.

---

_Created with gratitude to Jesus Christ._
