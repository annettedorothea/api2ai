# api2ai

**api2ai** curates OpenAPI operations into MCP tools: an **`.api2ai` DSL** selects endpoints and adds AI-facing metadata (intent, examples, tool names, optional auth). A **code generator** (CLI + extension on save) emits tool modules and a stdio MCP host. The language stack is built with **[Langium](https://langium.org/)** (grammar, validation, completion).

Sibling project: [db2ai](https://github.com/annettedorothea/db2ai) (PostgreSQL → MCP).

Keywords: **DSL** · **OpenAPI** · **code generator** · **MCP** · **Langium**

## DSL at a glance

From [`./packages/extension/demos/spaceflight-news.api2ai`](./packages/extension/demos/spaceflight-news.api2ai) — OpenAPI path, then per operation a block with tool metadata:

```txt
openapi "./openapi/spaceflight-news.openapi.yaml"

GET "/v4/articles/{id}/" {
    toolName: "getSpaceflightArticleById"
    intent: "get one spaceflight article by id"
    example: "Get article with id 1"
}
```

`toolName` and `intent` are required; `example`, `summary`, and `description` are optional. Base URL and API keys are **not** in the DSL — configure them in the MCP host (`mcp.json` / env). More demos: [`./packages/extension/demos/`](./packages/extension/demos/).

## MCP demos

Bundled demos and walkthrough: **[`./packages/extension/demos/`](./packages/extension/demos/)** — see **[`./packages/extension/demos/README.md`](./packages/extension/demos/README.md)**.

**Without cloning the repo:** install the VSIX, then Command Palette → **api2ai: Create demo workspace (MCP examples)**. Details: [`./packages/extension/README.md`](./packages/extension/README.md).

## Getting started (DSL / monorepo)

Prerequisite: **Node.js 20+**.

- Clone the repo
- Repository root: `npm install` → `npm run langium:generate` → `npm run build`
- Open the **`api2ai`** repository root in Cursor/VS Code
- Edit or create a `.api2ai` file (e.g. under `./packages/extension/demos/`)
- **Extension dev:** Run and Debug → **Run api2ai Extension** (opens `packages/extension/demos/` in an Extension Development Host; save regenerates tools)
- **CLI only:** `node ./packages/cli/bin/cli.js generate <file.api2ai> <out-tools.ts>` then `npm run build` if needed

Details for MCP demos: **[`./packages/extension/demos/README.md`](./packages/extension/demos/README.md)**.

## Project layout

| Path                        | Role                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `packages/language`         | Langium grammar, validation, OpenAPI linking                        |
| `packages/cli`              | `generate`, smoke tests, MCP bundle                                 |
| `packages/extension`        | VS Code / Cursor extension (VSIX); includes **`demos/`**            |
| `packages/extension/demos/` | Sample `.api2ai`, OpenAPI, `.cursor/mcp.json`, `generate:*` scripts |

Package notes: [`./packages/language/README.md`](./packages/language/README.md) · [`./packages/cli/README.md`](./packages/cli/README.md)

## npm scripts (repository root)

| Script                | Purpose                                                      |
| --------------------- | ------------------------------------------------------------ |
| `langium:generate`    | Regenerate Langium AST/grammar from `packages/language`      |
| `langium:watch`       | Watch grammar and regenerate on change                       |
| `build`               | TypeScript build (workspaces) + `bundle:mcp-runtime`         |
| `build:clean`         | `clean` then `build`                                         |
| `watch`               | TypeScript watch on the monorepo build graph                 |
| `clean`               | Clean all workspace build outputs                            |
| `bundle:mcp-runtime`  | Bundle standalone `mcp-serve` into `packages/cli/resources/` |
| `test`                | Language package unit tests                                  |
| `test:smoke`          | Smoke-call one generated Open-Meteo tool                     |
| `test:smoke:tmdb`     | Smoke TMDB search (needs env/token)                          |
| `test:smoke:mock-api` | Smoke mock-api `listCustomerOrders`                          |
| `test:mcp`            | Start MCP server manually (Open-Meteo)                       |

Example tool regeneration: `npm run generate:*` or `npm run generate:all` inside **[`./packages/extension/demos/`](./packages/extension/demos/)**.

## Launch configurations ([`./.vscode/launch.json`](./.vscode/launch.json))

| Configuration                             | What it does                                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Run api2ai Extension**                  | Extension Development Host with workspace `packages/extension/demos/`. Pre-launch task **Build api-2-ai-dsl**. |
| **api2ai: completion debug log**          | Same host; sets `API2AI_DSL_DEBUG_COMPLETION=1` for completion tracing.                                        |
| **Attach: api2ai Language Server (6009)** | Attach debugger to the language server (port 6009).                                                            |

Pre-launch task **Build api-2-ai-dsl** in [`./.vscode/tasks.json`](./.vscode/tasks.json) (`langium:generate` + `build`).

## Extension (VSIX)

Build (maintainers), in **`packages/extension/`**:

```bash
npm run extension:vsix
```

→ `./packages/extension/vscode-api2ai-<version>.vsix` (**version** from [`./packages/extension/package.json`](./packages/extension/package.json); gitignored via `*.vsix`).

From repo root: `npm run extension:vsix -w packages/extension`

### Install in Cursor / VS Code (test)

1. `Cmd+Shift+P` → **`Install from VSIX`** or **`vsix`**
2. **`Extensions: Install from VSIX`**
3. Select `./packages/extension/vscode-api2ai-<version>.vsix`
4. **`Developer: Reload Window`**

Alternatively drag the `.vsix` into the Extensions panel, or:

```bash
cursor --install-extension "/absolute/path/to/api2ai/packages/extension/vscode-api2ai-0.0.1.vsix"
```

Extension details: [`./packages/extension/README.md`](./packages/extension/README.md) (includes icon in VSIX).

## License

MIT — see [`./LICENSE`](./LICENSE).

---

_Created with gratitude to Jesus Christ._
