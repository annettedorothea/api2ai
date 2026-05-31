# Demo integration tests

Vitest tests for the mock-api demo: direct tool invocation and MCP stdio against a local mock HTTP server.

| Path                                         | What it checks                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `integration/mock-api-direct-invoke.test.ts` | Generate mock-api tools; direct `invokeTool` (login + listCustomerOrders) |
| `integration/mock-api-mcp-stdio.test.ts`     | Generated `mcp-serve.js`; MCP `listTools` + `callTool` over stdio         |

Run from repo root: `npm test` (includes these after CLI unit tests).

From this folder: `npm test` (after `npm install` here).

No Docker required — tests start the mock API server on a free local port.

---

#Col3:23
