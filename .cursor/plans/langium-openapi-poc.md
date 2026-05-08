# Langium OpenAPI PoC Plan

1. Define DSL grammar v1 with `openapi` and operation blocks.
2. Regenerate Langium artifacts and confirm service wiring/build.
3. Implement OpenAPI 3.x loader with `@apidevtools/swagger-parser`.
4. Validate that each DSL `method + path` exists in OpenAPI and `toolName` is unique.
5. Generate TypeScript MCP tools directly from DSL operations.
6. Add Petstore examples, tests, and short usage documentation.
