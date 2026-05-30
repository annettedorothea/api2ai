# CLI tests

| Path                                         | Kind              | What it checks                                                                                   |
| -------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| `integration/mock-api-direct-invoke.test.ts` | Integration test  | Generates mock API tools, calls public `login`, then authenticated `listCustomerOrders` directly |
| `document-actions.test.ts`                   | Unit (Vitest)     | parse/validate gate (duplicate `toolName`)                                                       |
| `smoke/smoke-generated.ts`                   | Integration smoke | One `invokeTool` on a generated `*-tools.mjs` (HTTP only, **no** MCP server)                     |
| `e2e/mcp-smoke-mock-api.ts`                  | E2E smoke         | Mock API through MCP stdio host                                                                  |
| `json-schema-to-zod-codegen.test.ts`         | Unit (Vitest)     | Zod emission from JSON Schema IR                                                                 |

## Run from repo root

```bash
npm test                        # full suite including test:e2e

npm run test:smoke              # all direct smokes (open-meteo, tmdb, mock-api)
npm run test:smoke:mock-api     # one smoke

npm run test:e2e                # MCP stdio e2e
npm run test:mcp:mock-api       # same e2e alone
```

Scenarios are defined in [`../../scripts/dev-smoke.config.json`](../../scripts/dev-smoke.config.json).

Ad-hoc: `node packages/cli/bin/cli.js smoke-generated …`

---

#Col3:23
