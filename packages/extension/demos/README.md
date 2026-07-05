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

3. `bookings.api2ai`
   Demonstrates `checkToolAccess` and `prepareToolCall` hooks with OAuth MCP.

4. `test.api2ai`
   Coverage harness used by `/test-all`.

Authoring documentation: [Documentation index](https://github.com/annettedorothea/core2ai/blob/main/docs/README.md)

---

## Available Demos

| Demo                          | Description                            |
| ----------------------------- | -------------------------------------- |
| `open-meteo.api2ai`           | Public weather API                     |
| `open-meteo-geocoding.api2ai` | Public geocoding API                   |
| `github.api2ai`               | Personal access token via host relay   |
| `tmdb.api2ai`                 | API key authentication                 |
| `xquik.api2ai`                | Xquik read-only search (API key)       |
| `todo.api2ai`                 | Passthrough MCP authentication         |
| `bookings.api2ai`             | OAuth MCP with mock API                |
| `cakes.api2ai`                | OAuth with upstream JWT API            |
| `spaceflight-news.api2ai`     | Public API with `prepareToolCall` hook |
| `test.api2ai`                 | Test harness for `/test-all`           |

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

For HTTP transport debugging (tools, auth headers, sessions):

```bash
npm run mcp:inspect -- open-meteo
npm run mcp:inspect -- todo --with-deps
```

Prerequisites:

- `npm run start`
- MCP servers enabled in `.cursor/mcp.json`

The demo workspace includes the skill:

```text
api2ai-test-all-mcp
```

---

## Bundling an MCP Server

Generated MCP hosts can be bundled into standalone deployment packages.

Example (`spaceflight-news` — public HTTP, no API key):

```bash
npm run build:generated
npm run build:mcp -- --host public-http spaceflight-news
```

This creates a distributable MCP bundle in:

```text
dist/mcp/spaceflight-news-public-http/
```

Depending on the selected host type, configure environment variables before starting the server.

From the bundle directory:

```bash
cd dist/mcp/spaceflight-news-public-http
npm install
cp .env.example .env
npm start
```

`npm start` runs `server.mjs` with the demo flags from `build:mcp` (for api2ai HTTP hosts: `--base-url-env …`, `--port`, `--path`). Values come from `.env`; the env **variable name** is fixed in the bundle `package.json` script.

Edit `.env` if you need to change upstream URLs, ports, or credentials.

The bundle contains:

- the MCP server runtime
- generated tools
- a minimal `package.json`
- `.env.example`
- `mcp.json.example`

Supported host types:

- `public-http`
- `passthrough-http`
- `oauth-http`

This feature is still evolving and may change before the final `1.0` release.

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
Cursor • ChatGPT • Claude • MCP Inspector
```

---

## Documentation

[Documentation index](https://github.com/annettedorothea/core2ai/blob/main/docs/README.md) — architecture, authoring, runtime, and integrations.

---

## Related Projects

- https://github.com/annettedorothea/core2ai
- https://github.com/annettedorothea/db2ai

---

## Feedback

**1.0.0-rc** — share onboarding and integration feedback in [GitHub Discussions](https://github.com/annettedorothea/api2ai/discussions/3). For bugs, open an [Issue](https://github.com/annettedorothea/api2ai/issues).

---

> _Whatever you do, work heartily, as for the Lord and not for men._
>
> **— Colossians 3:23**
>
> _Created by Annette Pohl_
