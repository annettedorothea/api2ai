# api2ai

Editor support for the **`.api2ai` DSL**: syntax highlighting, validation, completion, and **generate on save** (TypeScript/ESM tool modules + MCP host).

The full project (DSL, CLI, demos) lives in the [api2ai](https://github.com/annettedorothea/api2ai) repository. Sibling: [db2ai](https://github.com/annettedorothea/db2ai) (PostgreSQL → MCP).

## Requirements

- VS Code or Cursor **1.67+**
- Node.js **20+** in demo/tool workspaces (for `@modelcontextprotocol/sdk` / `zod` at runtime)

## Usage

1. Open a workspace folder that contains `.api2ai` files (and optional `openapi/` specs).
2. Edit `.api2ai` — on **save**, generated files appear under `generated/tools/` and `generated/cli/mcp-serve.mjs` (paths relative to the workspace).
3. Command Palette: **Generate tool code (.ts + .mjs + MCP host)** for manual generation of the focused `.api2ai` file.

Base URLs and API tokens belong in the MCP host config (e.g. `.cursor/mcp.json` / env), not in the DSL.

## MCP demos without cloning the repo

1. Install this extension (VSIX).
2. Command Palette → **api2ai: Create demo workspace (MCP examples)** → pick an empty folder.
3. In that folder: `npm install` → `npm run generate:all` (or save each `.api2ai` file / use **Generate tool code**).
4. **File → Open Folder** on the demo workspace.
5. Cursor/VS Code: enable MCP servers in `.cursor/mcp.json` (Settings → Tools & MCP).
6. Optional: copy `.env.example` → `.env.local` and set tokens (TMDB, GitHub, mock-api). Open-Meteo needs no token.

See the generated **`README.md`** in your demo folder for prompts and server names.

## License

MIT — Copyright (c) Annette Pohl. Full license text is included in the VSIX (`LICENSE` file, copied from the api2ai repository root when you run `npm run extension:vsix`).
