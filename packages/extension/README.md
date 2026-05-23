# api2ai

Editor support for the **`.api2ai` DSL**: syntax highlighting, validation, completion, and **generate on save** (TypeScript/ESM tool modules + MCP host).

Select OpenAPI operations in `.api2ai` and generate MCP tool modules — the full project (DSL, CLI, examples) lives in the [api2ai](https://github.com/annettedorothea/api2ai) monorepo. Sibling: [db2ai](https://github.com/annettedorothea/db2ai) (PostgreSQL → MCP).

## Requirements

- VS Code or Cursor **1.67+**
- Node.js **20+** in projects where you generate tools (for `@modelcontextprotocol/sdk` / `zod` at runtime)

## Usage

1. Open a workspace folder that contains `.api2ai` files (and optional `openapi/` specs).
2. Edit `.api2ai` — on **save**, generated files appear under `generated/tools/` and `generated/cli/mcp-serve.mjs` (paths relative to the workspace).
3. Command Palette: **Generate tool code (.ts + .mjs + MCP host)** for manual generation.

Base URLs and API tokens belong in the MCP host config (e.g. `.cursor/mcp.json` / env), not in the DSL.

## License

MIT — Copyright (c) Annette Pohl. Full license text is included in the VSIX (`LICENSE` file, copied from the api2ai repository root when you run `npm run extension:vsix`).
