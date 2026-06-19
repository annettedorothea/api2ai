# api2ai

> **Pre-release** --- early access; APIs, DSL, and generated output may
> change before v1.0.

## Turn any OpenAPI specification into curated MCP tools.

Generate MCP tools from existing APIs --- without writing custom MCP
servers.

---

## Get Started

The fastest way to try api2ai is with the VSIX extension and the bundled
demo workspace.

### 1. Install the VSIX

Download the [latest release](https://github.com/annettedorothea/api2ai/releases).

### 2. Create a Demo Workspace

Open Cursor or VS Code and run:

```text
api2ai: Create demo workspace (MCP examples)
```

### 3. Test your first MCP server

Open **`README.md`** in the demo folder and follow **Quick start**:

- **No API token:** `npm run start`, enable **`open-meteo-geocoding`** + **`open-meteo`**, then ask for tomorrow's weather in a city (see demos README).
- **With a personal PAT:** set **`GITHUB_TOKEN`** in **`.env.local`** (from `.env.example`), enable **`github`**, then ask for your GitHub profile or repos.

No repository checkout required.

---

## Demo

![api2ai demo](images/api2ai.gif)

The video shows:

- editing **`github.api2ai`** and generating MCP tools on save
- enabling the **`github`** MCP server in Cursor
- calling a tool with a PAT from **`.env.local`**
- for a no-token first run: **`open-meteo`** / **`open-meteo-geocoding`** (Quick start in the demo README)

---

## Example

```api2ai
openapi "./openapi/github-user-min.openapi.yaml"

auth {
    in: header
    name: "Authorization"
    prefix: "Bearer "
}

GET "/user" {
    toolName: getGitHubAuthenticatedUser
    access: protected
    intent: "return the GitHub user profile for the authenticated PAT; use to confirm which account the token represents before calling repo-scoped tools"
    summary: "Get the authenticated user"
    example: "No path or query parameters"
}
```

### Flow

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

api2ai lets you focus on describing API capabilities instead of writing
MCP boilerplate.

---

## Documentation

The architecture behind api2ai is documented in
[core2ai](https://github.com/annettedorothea/core2ai):

- [Tool Factory](https://github.com/annettedorothea/core2ai/blob/main/docs/01-layer-1-tool-factory.md)
- [Tool Authoring](https://github.com/annettedorothea/core2ai/blob/main/docs/02-layer-2-tool-authoring.md)
- [AI Runtime](https://github.com/annettedorothea/core2ai/blob/main/docs/03-layer-3-ai-runtime.md)
- [Personas](https://github.com/annettedorothea/core2ai/blob/main/docs/04-personas.md)

Overview: [core2ai docs](https://github.com/annettedorothea/core2ai/tree/main/docs)

---

## Related Projects

- [**core2ai**](https://github.com/annettedorothea/core2ai) — shared runtime
  and code generation infrastructure
- [**db2ai**](https://github.com/annettedorothea/db2ai) — generate MCP tools
  from SQL queries and relational databases

---

## License

BUSL-1.1

---

#Col3:23
