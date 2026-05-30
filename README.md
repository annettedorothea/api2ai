# api2ai

**api2ai** curates OpenAPI operations into MCP tools: an **.api2ai DSL** selects API operations and enriches them with AI-facing metadata (intent, examples, tool names, optional authentication settings). A **code generator** (CLI + extension on save) emits tool modules and a stdio MCP host. Built with **[Langium](https://langium.org/)** (grammar, validation, and completion).

Sibling project: [db2ai](https://github.com/annettedorothea/db2ai) (relational DB to MCP). Shared library: [core2ai](https://github.com/annettedorothea/core2ai) (`@core2ai/core` via **npm link**).

Keywords: **DSL** · **OpenAPI** · **code generator** · **MCP** · **Langium**

## DSL at a glance

From [`./packages/extension/demos/spaceflight-news.api2ai`](./packages/extension/demos/spaceflight-news.api2ai):

```txt
openapi "./openapi/spaceflight-news.openapi.yaml"

GET "/v4/articles/{id}/" {
    toolName: getSpaceflightArticleById
    access: public
    intent: "get one spaceflight article by id"
    example: "Get article with id 1"
}
```

`toolName` is an identifier (no quotes). Base URL and API keys are **not** in the DSL — configure them in the MCP host (`mcp.json` / env). More demos: [`./packages/extension/demos/`](./packages/extension/demos/).

## MCP demos

Bundled demos: **[`./packages/extension/demos/README.md`](./packages/extension/demos/README.md)**.

**Without cloning:** install the VSIX → **api2ai: Create demo workspace (MCP examples)**. See [`./packages/extension/README.md`](./packages/extension/README.md).

## Getting started

Prerequisite: **Node.js 20+** and sibling checkout **`../core2ai`**.

```bash
npm run install:github-https
npm run install:demos
npm run langium:generate && npm run build && npm run check
```

**`@core2ai/core`:** not on npm — link sibling core2ai once (see **[core2ai README](../core2ai/README.md#npm-link-api2ai--db2ai)**). While hacking core2ai, run **`npm run watch`** there so `out/` stays current.

Edit `.api2ai` under `packages/extension/demos/`, then:

| Workflow                    | How                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Extension dev (usual)**   | **Run api2ai Extension** — save regenerates tools                                                             |
| **All demos from terminal** | `npm run generate:all`                                                                                        |
| **One demo file**           | scripts in [`packages/extension/demos/`](./packages/extension/demos/)                                         |
| **CLI (debug / scripts)**   | `npx api-2-ai-dsl-cli parse\|validate\|generate …` — see [`packages/cli/README.md`](./packages/cli/README.md) |

## Documentation

Shared architecture: **[core2ai docs hub](../core2ai/docs/README.md)** (sibling repo).

| Doc                                                                      | When to read                    |
| ------------------------------------------------------------------------ | ------------------------------- |
| [Layer 1 — Tool Factory](../core2ai/docs/01-layer-1-tool-factory.md)     | Langium, generators, extensions |
| [Layer 2 — Tool Authoring](../core2ai/docs/02-layer-2-tool-authoring.md) | `.api2ai` and generated tools   |
| [Layer 3 — AI Runtime](../core2ai/docs/03-layer-3-ai-runtime.md)         | MCP, agents, execution          |
| [Personas](../core2ai/docs/04-personas.md)                               | Roles across the stack          |

## Project layout

| Path                        | Role                                         |
| --------------------------- | -------------------------------------------- |
| `packages/language`         | Langium grammar, validation, OpenAPI linking |
| `packages/cli`              | `parse`, `validate`, `generate`, smoke tests |
| `packages/extension`        | VS Code / Cursor extension; **`demos/`**     |
| `packages/extension/demos/` | Sample DSL, OpenAPI, `generate:*`, MCP setup |

Package notes: [`packages/language/README.md`](./packages/language/README.md) · [`packages/cli/README.md`](./packages/cli/README.md)

## Daily npm scripts (repository root)

| Script         | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `build`        | TypeScript project references + workspace builds                     |
| `check`        | `format:check` + `typecheck` + `lint`                                |
| `watch`        | TypeScript watch (monorepo)                                          |
| `test`         | unit + MCP e2e                                                       |
| `test:smoke`   | all direct generated-tool smokes                                     |
| `test:e2e`     | MCP stdio e2e (mock API)                                             |
| `generate:all` | regenerate all demo tools (forwards to demos)                        |
| `release:vsix` | GitHub prerelease of tested VSIX (build with `extension:vsix` first) |

Per-demo smokes: `npm run test:smoke:mock-api`, `test:smoke:open-meteo`, `test:smoke:tmdb`, `test:mcp:mock-api`. Scenarios: [`scripts/dev-smoke.config.json`](./scripts/dev-smoke.config.json).

Regenerate tools: `npm run generate:all` or per-demo scripts inside **`packages/extension/demos/`**.

## Extension (VSIX)

Build locally:

```bash
npm run extension:vsix -w packages/extension
```

Prerelease (after local VSIX build + manual test):

```bash
npm run extension:vsix -w packages/extension   # build + install/test in Cursor
npm run release:vsix                           # upload that VSIX to GitHub
```

Bump extension version: `npm run version:patch` (or `minor` / `major`). Details: [`./packages/extension/README.md`](./packages/extension/README.md).

## Launch configurations

| Configuration                             | What it does                                       |
| ----------------------------------------- | -------------------------------------------------- |
| **Run api2ai Extension**                  | Extension Development Host with `demos/` workspace |
| **api2ai: completion debug log**          | same + `API2AI_DSL_DEBUG_COMPLETION=1`             |
| **Attach: api2ai Language Server (6009)** | attach debugger (port 6009)                        |

Pre-launch task **Build api2ai**: `langium:generate` + `build` ([`./.vscode/tasks.json`](./.vscode/tasks.json) / workspace [`mcp-dsl.code-workspace`](../mcp-dsl.code-workspace)).

## License

BUSL-1.1 — see [`./LICENSE`](./LICENSE).

---

#Col3:23
