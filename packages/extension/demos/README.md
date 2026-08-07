# api2ai Demo Workspace

Welcome to the `api2ai` demo workspace.

This workspace contains examples for MCP tool generation, authentication, authorization, and integration patterns.

If this is your first time using `api2ai`, start with `open-meteo.api2ai`.

Walkthrough (DE): [Willkommen bei Tool Factory](https://www.youtube.com/watch?v=KYaKTWkooeU)

---

## Quick Start

### 1. Start the demo environment

From the demo workspace root, pick one path:

#### Cursor

HTTP MCP hosts (leave the terminal open):

```bash
npm run start:all
```

This command:

- installs missing dependencies
- generates tool code
- compiles generated files
- starts demo backends (background)
- starts HTTP MCP hosts (foreground — leave this terminal open)

For MCP-only restarts after DSL or codegen changes (fixtures already running):

```bash
npm run start:mcp
```

(`npm run start` is an alias for `start:mcp`.)

#### VS Code

stdio MCP only (see [`.vscode/mcp.json`](.vscode/mcp.json); no HTTP hosts):

```bash
npm run start:all:vscode
```

This command:

- installs missing dependencies
- generates tool code
- compiles generated files
- starts demo backends (background)

It does **not** start HTTP MCP hosts. VS Code / Copilot spawns stdio servers from `.vscode/mcp.json`. OAuth demos (`bookings`, `cakes`, `banking`) are omitted there. Do not use the HTTP entries from [`.cursor/mcp.json`](.cursor/mcp.json) for Copilot.

---

### 2. Open the Open-Meteo example

Open:

[open-meteo.api2ai](open-meteo.api2ai)

This example works out of the box and does not require an API key.

---

### 3. Enable MCP servers, then ask your AI assistant

**Cursor:** Settings → **Tools & MCP** → enable the servers from [`.cursor/mcp.json`](.cursor/mcp.json) (reload MCP if they were already listed). HTTP hosts must be running from step 1.

**VS Code:** open [`.vscode/mcp.json`](.vscode/mcp.json) (or the MCP view) and **start** the stdio servers listed there. Use **Agent** mode in Copilot Chat.

Examples:

```text
api2ai What will the weather be like tomorrow in Berlin?

api2ai Will I need an umbrella in London this weekend?

api2ai Compare today's temperature in Paris and Rome.
```

Using the `api2ai` prefix helps the assistant focus on generated MCP tools and avoid unrelated built-in tools.

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

### Test-All Skill in Cursor

To exercise every configured MCP tool once in Cursor (after `npm run start:all` and with servers enabled in `.cursor/mcp.json`):

```text
/test-all
```

### MCP Inspector

For **HTTP** MCP hosts only (not stdio). After `npm run start:all`, you can inspect any server from `.cursor/mcp.json`, e.g.:

```bash
npm run mcp:inspect -- open-meteo
npm run mcp:inspect -- todo
```

---

## Bundling an MCP Server

Build a standalone package for a generated host, e.g. (`spaceflight-news` — public HTTP):

```bash
npm run build:generated
npm run build:mcp -- --host public-http spaceflight-news
```

Output: `dist/mcp/spaceflight-news-public-http/` (runtime, tools, `package.json`, `.env.example`, `mcp.json.example`).

```bash
cd dist/mcp/spaceflight-news-public-http
npm install
cp .env.example .env
npm start
```

`npm start` runs `server.mjs` with the flags from `build:mcp` (HTTP hosts: `--base-url-env`, `--port`, `--path`). Values come from `.env`.

Host types: `public-http`, `passthrough-http`, `oauth-http`.

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

[Videos](https://github.com/annettedorothea/core2ai/blob/main/docs/videos.md) — [Willkommen bei Tool Factory](https://www.youtube.com/watch?v=KYaKTWkooeU) (DE) and more.

---

## Related Projects

- https://github.com/annettedorothea/core2ai
- https://github.com/annettedorothea/db2ai

---

## Feedback

Share onboarding and integration feedback in [GitHub Discussions](https://github.com/annettedorothea/api2ai/discussions/3). For bugs, open an [Issue](https://github.com/annettedorothea/api2ai/issues).

---

> _Whatever you do, work heartily, as for the Lord and not for men._
>
> **— Colossians 3:23**
>
> _Created by Annette Pohl_
