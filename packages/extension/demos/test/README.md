# Demo tests

| Test                                              | Scope                                           |
| ------------------------------------------------- | ----------------------------------------------- |
| `integration/shopping-api-direct-invoke.test.ts`  | Generate shopping-api tools; `invokeTool` + JWT |
| `integration/shopping-api-mcp-stdio.test.ts`      | stdio MCP `listTools` / `callTool`              |
| `integration/shopping-api-oauth-mcp-http.test.ts` | OAuth HTTP MCP host (hs256 + oidc)              |
| `integration/open-meteo-mcp-http.test.ts`         | Stateless HTTP MCP smoke                        |

Run: `npm test` from this folder.
