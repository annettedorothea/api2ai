# Demo integration tests

Vitest tests for demo generated tools: direct invocation and MCP (stdio / stateless HTTP).

| Path                                         | What it checks                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `integration/mock-api-direct-invoke.test.ts` | Generate mock-api tools via `scripts/generate.mjs`; direct `invokeTool` (login + listCustomerOrders) |
| `integration/mock-api-mcp-stdio.test.ts`     | Generate via `scripts/generate.mjs`; `stdio-mcp-server.js`; MCP `listTools` + `callTool` over stdio  |
| `integration/open-meteo-mcp-http.test.ts`    | `stateless-http-mcp-server.js`; MCP HTTP against live Open-Meteo API (network)                       |

Run from repo root: `npm test` (includes these after CLI unit tests).

From this folder (standalone demo workspace): `npm install`, then `npm run check` and `npm test`.

No Docker required — tests start the mock API server on a free local port.

---

#Col3:23
