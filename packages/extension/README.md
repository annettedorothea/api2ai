# api2ai

Language support and code generation for the `.api2ai` DSL.

The extension provides:

- Syntax highlighting
- Validation
- Auto completion
- Generate on save
- MCP host generation

`api2ai` generates curated MCP tools from existing OpenAPI specifications.

---

## Requirements

- VS Code or Cursor **1.67+**
- Node.js **20+** for generated projects and demo workspaces

---

## Quick Start

### 1. Create a demo workspace

Open the Command Palette and run:

```text
api2ai: Create demo workspace (MCP examples)
```

Choose an empty folder and open it when prompted.

### 2. Open the demo README

The generated workspace contains its own `README.md` with a guided walkthrough and several example projects.

The Open-Meteo example works out of the box and does not require an API key.

---

## Working with your own APIs

Open a folder containing `.api2ai` files.

Whenever you save a file, the extension generates tool code and MCP hosts automatically.

Generated files are written to:

```text
generated/api2ai/
```

API credentials and runtime configuration belong in:

```text
.cursor/mcp.json
```

You can also trigger generation manually:

```text
api2ai: Generate tool code (.ts + MCP host)
```

---

## Documentation

Looking for architecture, authentication, MCP concepts, integrations, or development guides?

See the shared documentation in:

https://github.com/annettedorothea/core2ai

---

## Related Projects

- https://github.com/annettedorothea/core2ai
- https://github.com/annettedorothea/db2ai

---

## License

MIT — see `LICENSE`.

---

> _Whatever you do, work heartily, as for the Lord and not for men._
>
> **— Colossians 3:23**
>
> _Created by Annette Pohl_
