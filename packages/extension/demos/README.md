# api2ai Demo Workspace

Welcome to the `api2ai` demo workspace.

This workspace contains a collection of examples that demonstrate different aspects of MCP tool generation, authentication, and integration patterns.

If this is your first time using `api2ai`, start with `open-meteo.api2ai`.

---

## Quick Start

### 1. Open the Open-Meteo example

Open [open-meteo.api2ai](open-meteo.api2ai)

This example works out of the box and does not require an API key.

---

### 2. Generate the MCP server

Save the file.

The extension automatically generates:

- tool implementations
- MCP host configuration
- runtime files

---

### 3. Ask your AI assistant

Examples:

```text
api2ai What will the weather be like tomorrow in Berlin?

api2ai Will I need an umbrella in London this weekend?

api2ai Compare today's temperature in Paris and Rome.
```

Using the `api2ai` prefix helps Cursor focus on the generated MCP tools and avoid unrelated built-in tools.

---

## Available Demos

| Demo                | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `open-meteo.api2ai` | Public weather API without authentication                  |
| `github.api2ai`     | Personal access token authentication                       |
| `bookings.api2ai`   | OAuth authentication and more advanced API design patterns |

Additional demos may be added over time as the ecosystem evolves.

---

## Next Steps

After exploring the demos, try connecting one of your own APIs.

A typical workflow looks like this:

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

Looking for architecture, authentication, MCP concepts, integrations, or development guides?

See the shared documentation in:

https://github.com/annettedorothea/core2ai

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
