# api2ai

Editor support for the **`.api2ai` DSL**: syntax highlighting, validation, completion, and **generate on save** (TypeScript tool modules + MCP host).

The full project (DSL, CLI, demos) lives in the [api2ai](https://github.com/annettedorothea/api2ai) repository. Sibling: [db2ai](https://github.com/annettodorothea/db2ai) (relational DB to MCP).

## Requirements

- VS Code or Cursor **1.67+**
- Node.js **20+** in demo/tool workspaces (for `@modelcontextprotocol/sdk` / `zod` at runtime)

## Usage

1. Open a workspace folder that contains `.api2ai` files (and optional `openapi/` specs).
2. Edit `.api2ai` — on **save**, the extension writes **`generated/tools/*.ts`**, **`generated/cli/stdio-mcp-server.ts`**, and compiles **`.js`** for MCP (same as **`npm run build:generated`**). Run **`npm install`** once in the workspace so TypeScript is available.
3. Command Palette: **Generate tool code (.ts + MCP host)** for manual generation of the focused `.api2ai` file.

Base URLs and API tokens belong in the MCP host config (e.g. `.cursor/mcp.json` / env), not in the DSL.

## MCP demo workspace

1. Install this extension (VSIX).
2. Command Palette → **api2ai: Create demo workspace (MCP examples)** → choose an empty folder.
3. In that folder run **`npm run start`** (creates `.env.local` from `.env.example` if missing, install, generate, compile, starts demo APIs and MCP hosts).
4. Edit **`.env.local`** for optional tokens (TMDB, GitHub). Open-Meteo needs no token.
5. Open the demo folder as the workspace. In Cursor Settings → **Tools & MCP**, enable one server per demo (`stdio-api2ai-*` or `http-api2ai-*`, names in `.cursor/mcp.json`).

**Reload MCP** after changing `.api2ai`, running generate/build, or env vars that MCP reads at server startup.

Details, scripts, and example prompts: **`README.md`** in the demo folder.

## License

BUSL-1.1 - Copyright (c) 2026 Annette Pohl. Full license text is included in the VSIX (`LICENSE` file, copied from the api2ai repository root when you run `npm run vsix:build` from the monorepo root).

---

#Col3:23
