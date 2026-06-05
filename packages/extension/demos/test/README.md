# api2ai demos — tests

| File                                              | What it covers                                                  |
| ------------------------------------------------- | --------------------------------------------------------------- |
| `integration/bookings-api-direct-invoke.test.ts`  | bookings-api tools; JWT + role-based vacation list              |
| `integration/bookings-api-mcp-stdio.test.ts`      | stdio MCP host codegen (not in MCP matrix)                      |
| `integration/bookings-api-oauth-mcp-http.test.ts` | bookings-oauth MCP path: OAuth HTTP + oidc JWKS                 |
| `integration/cakes-api-oauth-mcp-http.test.ts`    | cakes OAuth opaque + upstream JWT                               |
| `integration/open-meteo-mcp-http.test.ts`         | stateless HTTP MCP host codegen (open-meteo is stdio in matrix) |

Run from `packages/extension/demos`: `npm test`.
