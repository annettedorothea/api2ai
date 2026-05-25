# CLI tests

| Path                                         | Kind              | What it checks                                                                                   |
| -------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| `integration/mock-api-direct-invoke.test.ts` | Integration test  | Generates mock API tools, calls public `login`, then authenticated `listCustomerOrders` directly |
| `smoke/smoke-generated.ts`                   | Integration smoke | One `invokeTool` on a generated `*-tools.mjs` from demos (HTTP only, **no** MCP server)          |
| `e2e/mcp-smoke-mock-api.ts`                  | E2E smoke         | Generates mock API tools, starts the mock API, and calls `login` through MCP stdio               |
| `json-schema-to-zod-codegen.test.ts`         | Unit (Vitest)     | Zod emission from JSON Schema IR                                                                 |

## Run from repo root

```bash
# All automated tests (Vitest suites + local MCP stdio smoke)
npm test

# Integration smoke (generated tool module)
npm run test:smoke
npm run test:smoke:tmdb
npm run test:smoke:mock-api

# MCP stdio host + generated tools (starts server on stdio; Ctrl+C to stop)
npm run test:mcp
npm run test:mcp:mock-api
```

`smoke-generated` is still exposed as a CLI subcommand (`node packages/cli/bin/cli.js smoke-generated …`) for ad-hoc generated-module runs; implementation lives in `packages/cli/test/smoke/`. MCP stdio smokes live in `packages/cli/test/e2e/`.

---

_Created with gratitude to Jesus Christ._
