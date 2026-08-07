# api2ai

> Generate curated MCP tools from OpenAPI specifications.

## Ecosystem

| Repository                                            | Purpose                                                |
| ----------------------------------------------------- | ------------------------------------------------------ |
| [core2ai](https://github.com/annettedorothea/core2ai) | Shared runtime, architecture, and documentation        |
| [api2ai](https://github.com/annettedorothea/api2ai)   | Generate curated MCP tools from OpenAPI specifications |
| [db2ai](https://github.com/annettedorothea/db2ai)     | Generate curated MCP tools from relational databases   |

Instead of hand-writing MCP servers, pick the OpenAPI operations you want as tools, enrich them in `.api2ai`, and generate executable MCP tooling.

You curate which endpoints become tools — not every path in the specification is exposed automatically.

---

## Quick Start

The easiest way to explore `api2ai` is with the VSIX extension and the bundled demo workspace.

### 1. Install the extension

Download the latest VSIX from the releases page:

https://github.com/annettedorothea/api2ai/releases

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
  select & enrich
        │
        ▼
    .api2ai
        │
        ▼
Generated MCP Server
        │
        ▼
Cursor • ChatGPT • Claude • MCP Inspector
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

[Documentation index](https://github.com/annettedorothea/core2ai/blob/main/docs/README.md) — architecture, authoring, runtime, and integrations.

[Videos](https://github.com/annettedorothea/core2ai/blob/main/docs/videos.md) — [Willkommen bei Tool Factory](https://www.youtube.com/watch?v=KYaKTWkooeU) (DE) and more.

See [CHANGELOG.md](CHANGELOG.md) for version history and upgrade notes.

---

## Related Projects

- [core2ai](https://github.com/annettedorothea/core2ai) — Shared runtime, code generation infrastructure, and documentation.
- [db2ai](https://github.com/annettedorothea/db2ai) — Generate curated MCP tools from relational databases.

---

## Feedback

We welcome feedback on onboarding, documentation, DSL ergonomics, and MCP integration. Share your experience in [GitHub Discussions](https://github.com/annettedorothea/api2ai/discussions/3). For bugs, open an [Issue](https://github.com/annettedorothea/api2ai/issues).

---

## License

MIT — see [LICENSE](LICENSE).

---

> _Whatever you do, work heartily, as for the Lord and not for men._
>
> **— Colossians 3:23**
>
> _Created by Annette Pohl_
