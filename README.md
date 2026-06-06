# api2ai

## Turn any OpenAPI specification into AI-ready tools.

Generate MCP-compatible tools from existing APIs without writing custom MCP servers.

---

## Get Started

The fastest way to try api2ai is with the VSIX extension and the bundled demo workspace.

### 1. Install the VSIX

Download the latest release:

https://github.com/annettedorothea/api2ai/releases

### 2. Create a Demo Workspace

Open Cursor or VS Code and run:

```text
api2ai: Create demo workspace (MCP examples)
```

### 3. Explore

Open any `.api2ai` file, make a change, and save.

api2ai automatically generates MCP-compatible tools from your OpenAPI definitions.

No repository checkout required.

---

## Example

```api2ai
openapi "./petstore.openapi.yaml"

GET "/pet/{petId}" {
    toolName: getPetById
    intent: "Get a pet by id"
    example: "Show me pet 42"
}
```

```text
OpenAPI
    ↓
.api2ai
    ↓
MCP Tool
    ↓
AI Agent
```

---

## Why api2ai?

Building MCP tools manually usually requires:

- defining tools
- mapping API requests and responses
- maintaining MCP server code
- keeping everything in sync with your API

api2ai lets you focus on describing business capabilities instead of writing boilerplate.

---

## Documentation

The architecture behind api2ai is documented in core2ai:

- Tool Factory
- Tool Authoring
- AI Runtime
- Personas

https://github.com/annettedorothea/core2ai/tree/main/docs

---

## Related Projects

- **core2ai** – shared runtime and platform architecture
- **db2ai** – generate MCP tools from SQL queries and relational databases

---

## License

BUSL-1.1

---

#Col3:23
