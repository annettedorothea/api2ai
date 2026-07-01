# api2ai

> Generate curated MCP tools from OpenAPI specifications.

> **Pre-release**
> APIs, the DSL, and generated output may change before v1.0.

## Ecosystem

| Repository                                            | Purpose                                                |
| ----------------------------------------------------- | ------------------------------------------------------ |
| [core2ai](https://github.com/annettedorothea/core2ai) | Shared runtime, architecture, and documentation        |
| [api2ai](https://github.com/annettedorothea/api2ai)   | Generate curated MCP tools from OpenAPI specifications |
| [db2ai](https://github.com/annettedorothea/db2ai)     | Generate curated MCP tools from relational databases   |

Instead of writing and maintaining custom MCP servers by hand, describe your API once and let `api2ai` generate the tooling for you.

---

## Quick Start

The easiest way to explore `api2ai` is with the VSIX extension and the bundled demo workspace.

### 1. Install the extension

Download the latest VSIX from the releases page:

[https://github.com/annettedorothea/api2ai/releases](https://github.com/annettedorothea/api2ai/releases)

### 2. Create a demo workspace

In Cursor or VS Code, run:

```text
api2ai: Create demo workspace (MCP examples)
```

### 3. Start your first MCP server

Open the generated [Demo Workspace README](packages/extension/demos/README.md) and follow the Quick Start.

The Open-Meteo example works out of the box and does not require an API key.

---

## How it works

```text
OpenAPI Specification
        │
        ▼
    .api2ai
        │
        ▼
Generated MCP Server
        │
        ▼
Cursor • ChatGPT • Claude • Open WebUI
```

Example:

```text
openapi "./openapi/github-user-min.openapi.yaml"

auth {
    in: header
    name: "Authorization"
    prefix: "Bearer "
}

GET "/user" {
    toolName: getGitHubAuthenticatedUser
    access: protected
    summary: "Get the authenticated user"
}
```

---

## Documentation

Looking for architecture, authentication, MCP concepts, integrations, or development guides?

See the shared documentation in [core2ai](https://github.com/annettedorothea/core2ai):

- [Documentation index](https://github.com/annettedorothea/core2ai/blob/main/docs/README.md)

---

## Related Projects

- [core2ai](https://github.com/annettedorothea/core2ai) — Shared runtime, code generation infrastructure, and documentation.
- [db2ai](https://github.com/annettedorothea/db2ai) — Generate curated MCP tools from relational databases.

---

## License

MIT — see [LICENSE](LICENSE).

Questions, ideas, bug reports, and feature requests are always welcome through GitHub Discussions or Issues.

---

> _Whatever you do, work heartily, as for the Lord and not for men._
>
> **— Colossians 3:23**
>
> _Created by Annette Pohl_
