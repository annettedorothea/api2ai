# api2ai

Editor support for the **`.api2ai` DSL**: syntax highlighting, validation, completion, and **generate on save** (TypeScript/ESM tool modules + MCP host).

The full project (DSL, CLI, demos) lives in the [api2ai](https://github.com/annettedorothea/api2ai) repository. Sibling: [db2ai](https://github.com/annettedorothea/db2ai) (PostgreSQL to MCP).

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
2. Create a demo workspace:
    - Open the Command Palette.
    - Run **api2ai: Create demo workspace (MCP examples)**.
    - Pick an empty folder.
3. Prepare the demo folder:
    - Run `npm install`.
    - Copy `.env.example` to `.env.local`.
    - Set tokens for TMDB, GitHub, and mock-api if you want to use those demos. Open-Meteo needs no token.
4. Generate tools:
    - Run `npm run generate:all`.
    - Alternatively, save each `.api2ai` file or run **Generate tool code**.
5. Open and enable:
    - Open the demo folder as the workspace.
    - In Cursor Settings, open **Tools & MCP** and enable the `api2ai-*` MCP servers.

See the generated **`README.md`** in your demo folder for prompts and server names.

## Share a VSIX build

From the repository root:

```bash
npm run release:vsix
```

This runs tests, checks, packages the VSIX, creates a GitHub prerelease, and uploads the matching `.vsix` as a release asset. The release/tag name uses the extension `name` and `version` from [`package.json`](./package.json), for example `vscode-api2ai-0.0.1`. It requires the GitHub CLI (`gh`) to be installed and authenticated.

For a future version, bump the extension package first from the repository root:

```bash
npm run version:patch
```

Use `version:minor` or `version:major` when appropriate, then commit the version change before publishing.

## License

BUSL-1.1 - Copyright (c) 2026 Annette Pohl. Full license text is included in the VSIX (`LICENSE` file, copied from the api2ai repository root when you run `npm run extension:vsix`).

---

#Col3:23
