# api2ai

Editor support for the **`.api2ai` DSL**: syntax highlighting, validation, completion, and **generate on save** (TypeScript/ESM tool modules + MCP host).

The full project (DSL, CLI, demos) lives in the [api2ai](https://github.com/annettedorothea/api2ai) repository. Sibling: [db2ai](https://github.com/annettedorothea/db2ai) (PostgreSQL to MCP).

## Requirements

- VS Code or Cursor **1.67+**
- Node.js **20+** in demo/tool workspaces (for `@modelcontextprotocol/sdk` / `zod` at runtime)

## Usage

1. Open a workspace folder that contains `.api2ai` files (and optional `openapi/` specs).
2. Edit `.api2ai` — on **save**, the extension writes **`generated/tools/*.ts`** and **`generated/cli/mcp-serve.ts`**; run **`npm run build:generated`** for **`.js`** used by MCP.
3. Command Palette: **Generate tool code (.ts + MCP host)** for manual generation of the focused `.api2ai` file.

Base URLs and API tokens belong in the MCP host config (e.g. `.cursor/mcp.json` / env), not in the DSL.

## MCP demos without cloning the repo

1. Install this extension (VSIX).
2. Create a demo workspace:
    - Open the Command Palette.
    - Run **api2ai: Create demo workspace (MCP examples)**.
    - Pick an empty folder.
3. Prepare the demo folder:
    - Run `npm install`.
    - Copy `.env.example` to `.env.local`.
    - Set tokens for TMDB, GitHub, and mock-api if you want to use those demos. Open-Meteo needs no token.
4. Generate and compile:
    - `npm run generate:all`
    - `npm run build:generated`
5. Open and enable:
    - Open the demo folder as the workspace.
    - In Cursor Settings, open **Tools & MCP** and enable the `api2ai-*` MCP servers.

See the generated **`README.md`** in your demo folder for prompts and server names.

## License

BUSL-1.1 - Copyright (c) 2026 Annette Pohl. Full license text is included in the VSIX (`LICENSE` file, copied from the api2ai repository root when you run `npm run extension:vsix -w packages/extension` from the monorepo root).

---

#Col3:23
