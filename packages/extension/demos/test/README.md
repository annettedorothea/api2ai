# api2ai demos — tests

| File                                              | What it covers                                     |
| ------------------------------------------------- | -------------------------------------------------- |
| `integration/bookings-api-direct-invoke.test.ts`  | bookings-api tools; JWT + role-based vacation list |
| `integration/bookings-api-mcp-stdio.test.ts`      | stdio MCP                                          |
| `integration/bookings-api-oauth-mcp-http.test.ts` | OAuth HTTP MCP host (hs256 + oidc)                 |

Run from `packages/extension/demos`: `npm test`.
