# api2ai Demo Workspace

Welcome to the `api2ai` demo workspace.

This workspace contains examples for MCP tool generation, authentication, authorization, and integration patterns.

If this is your first time using `api2ai`, start with `open-meteo.api2ai`.

---

## Quick Start

### 1. Start the demo environment

From the demo workspace root:

```bash
npm run start
```

This command:

- installs missing dependencies
- generates tool code
- compiles generated files
- starts demo backends
- starts HTTP MCP hosts

Leave the terminal running while working with the demos.

---

### 2. Open the Open-Meteo example

Open:

[open-meteo.api2ai](open-meteo.api2ai)

This example works out of the box and does not require an API key.

---

### 3. Ask your AI assistant

Examples:

```text
api2ai What will the weather be like tomorrow in Berlin?

api2ai Will I need an umbrella in London this weekend?

api2ai Compare today's temperature in Paris and Rome.
```

Using the `api2ai` prefix helps Cursor focus on generated MCP tools and avoid unrelated built-in tools.

---

## Learning Path

1. `open-meteo.api2ai`
   Public tools without authentication.

2. `todo.api2ai`
   Introduces protected tools, `auth`, and `verifyCredential`.

3. `banking.api2ai`
   Demonstrates `authorize` and `prepare` hooks.

4. `test.api2ai`
   Coverage harness used by `/test-all`.

Authoring documentation:

https://github.com/annettedorothea/core2ai/tree/main/docs/authoring

---

## Available Demos

| Demo                          | Description                          |
| ----------------------------- | ------------------------------------ |
| `open-meteo.api2ai`           | Public weather API                   |
| `open-meteo-geocoding.api2ai` | Public geocoding API                 |
| `github.api2ai`               | Personal access token via host relay |
| `tmdb.api2ai`                 | API key authentication               |
| `todo.api2ai`                 | Passthrough MCP authentication       |
| `bookings.api2ai`             | OAuth MCP with mock API              |
| `cakes.api2ai`                | OAuth with upstream JWT API          |
| `banking.api2ai`              | `authorize` and `prepare` hooks      |
| `spaceflight-news.api2ai`     | Public API with `prepare` hook       |
| `test.api2ai`                 | Test harness for `/test-all`         |

---

## Testing

Before release, run:

```text
/test-all
```

or:

```text
api2ai /test-all
```

Prerequisites:

- `npm run start`
- MCP servers enabled in `.cursor/mcp.json`

The demo workspace includes the skill:

```text
api2ai-test-all-mcp
```

---

## Next Steps

After exploring the demos, try connecting one of your own APIs.

```text
OpenAPI Specification
        ↓
     .api2ai
        ↓
Generated MCP Server
        ↓
Cursor • ChatGPT • Claude • Open WebUI
```

---

## Documentation

Shared architecture, runtime, authoring, and integration documentation:

- [Documentation index](https://github.com/annettedorothea/core2ai/blob/main/docs/README.md)
- [Authoring guides](https://github.com/annettedorothea/core2ai/tree/main/docs/authoring)
- [Cursor integration](https://github.com/annettedorothea/core2ai/blob/main/docs/integrations/cursor.md)
- [MCP hosts](https://github.com/annettedorothea/core2ai/blob/main/docs/runtime/mcp-hosts.md)

---

## Related Projects

- https://github.com/annettedorothea/core2ai
- https://github.com/annettedorothea/db2ai

---

> _Whatever you do, work heartily, as for the Lord and not for men._
>
> **— Colossians 3:23**
>
> _Created by Annette Pohl_
