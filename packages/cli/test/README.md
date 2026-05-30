# CLI tests

| Path                                         | What it checks                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `integration/mock-api-direct-invoke.test.ts` | Generate mock-api tools; direct `invokeTool` (login + listCustomerOrders) |
| `integration/mock-api-mcp-stdio.test.ts`     | Generated `mcp-serve.js`; MCP `listTools` + `callTool` over stdio         |
| `document-actions.test.ts`                   | parse/validate gate                                                       |
| `generate-validation.test.ts`                | generate blocked on DSL errors                                            |
| `json-schema-to-zod-codegen.test.ts`         | Zod emission from JSON Schema IR                                          |

Run from repo root: `npm test` (includes language + CLI Vitest).

From `packages/cli` only: `npm test`.

---

#Col3:23
