# Demo integration tests

Vitest tests for the mock-api demo: direct tool invocation and MCP stdio against a local mock HTTP server.

| Path                                         | What it checks                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `integration/mock-api-direct-invoke.test.ts` | Generate mock-api tools via `scripts/generate.mjs`; direct `invokeTool` (login + listCustomerOrders) |
| `integration/mock-api-mcp-stdio.test.ts`     | Generate via `scripts/generate.mjs`; `stdio-mcp-server.js`; MCP `listTools` + `callTool` over stdio  |

Run from repo root: `npm test` (includes these after CLI unit tests).

From this folder (standalone demo workspace): `npm install`, then `npm run check` and `npm test`.

No Docker required — tests start the mock API server on a free local port.

---

#Col3:23
