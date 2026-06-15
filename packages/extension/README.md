# api2ai

Language support and code generation for the **`.api2ai` DSL** (OpenAPI → MCP tools): syntax highlighting, validation, completion, and generate on save.

## Requirements

- VS Code or Cursor **1.67+**
- Node.js **20+** in the demo workspace

## Create demo workspace

**Goal:** set up a local folder with example `.api2ai` files and MCP config.

1. Command Palette → **`api2ai: Create demo workspace (MCP examples)`**
2. Choose an **empty folder** (or confirm overwrite if retrying)
3. Click **Open folder** when prompted

**Next:** open **`README.md`** in that demo folder — it walks you through testing your first MCP server.

## Your own `.api2ai` projects

Open any folder with `.api2ai` files. On **save**, the extension generates `generated/tools/*.ts` and compiles MCP hosts (run **`npm install`** once for TypeScript). Base URLs and API tokens belong in `.cursor/mcp.json` / env, not in the DSL.

Command Palette: **Generate tool code (.ts + MCP host)** for manual generation of the focused file.

## License

BUSL-1.1 — Copyright (c) 2026 Annette Pohl. Full license text is in the VSIX (`LICENSE`).

---

#Col3:23
