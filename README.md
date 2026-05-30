# api2ai

**api2ai** curates OpenAPI operations into MCP tools: an **`.api2ai` DSL** selects endpoints and adds AI-facing metadata (intent, examples, tool names, optional auth). A **code generator** (CLI + extension on save) emits tool modules and a stdio MCP host. The language stack is built with **[Langium](https://langium.org/)** (grammar, validation, completion).

Sibling project: [db2ai](https://github.com/annettedorothea/db2ai) (relational DB to MCP). Shared library: [core2ai](https://github.com/annettedorothea/core2ai) (`@core2ai/core`).

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

Prerequisite: **Node.js 20+**.

```bash
npm run install:github-https
npm run install:demos
npm run langium:generate && npm run build && npm run check
```

**`@core2ai/core` pin:** Git tag in `packages/cli/package.json` (canonical: **core2ai** `scripts/core2ai-pin.json`). Show pin: `npm run core2ai:pin`. After a core2ai release: `npm run core2ai:use-pin` (+ `install:demos` if needed). Local core2ai work: `npm run core2ai:use-local` (switch back with `use-pin` before push).

Edit `.api2ai` under `packages/extension/demos/`, then:

- **Extension dev:** **Run api2ai Extension** (opens demos workspace; save regenerates tools).
- **CLI:** `node ./packages/cli/bin/cli.js parse|validate|generate <file> …`

More workflows: **[core2ai docs hub](../core2ai/docs/README.md)** (sibling repo).

## Project layout

| Path                        | Role                                         |
| --------------------------- | -------------------------------------------- |
| `packages/language`         | Langium grammar, validation, OpenAPI linking |
| `packages/cli`              | `parse`, `validate`, `generate`, smoke tests |
| `packages/extension`        | VS Code / Cursor extension; **`demos/`**     |
| `packages/extension/demos/` | Sample DSL, OpenAPI, `generate:*`, MCP setup |

Package notes: [`packages/language/README.md`](./packages/language/README.md) · [`packages/cli/README.md`](./packages/cli/README.md)

## Daily npm scripts (repository root)

| Script              | Purpose                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `build`             | TypeScript + `bundle:mcp-runtime` + workspaces                       |
| `check`             | format + typecheck + lint + generated tools                          |
| `test`              | unit + MCP e2e (`test:e2e`)                                          |
| `test:smoke`        | all direct generated-tool smokes                                     |
| `test:e2e`          | MCP stdio e2e (mock API)                                             |
| `generate:all`      | regenerate all demo tools (forwards to demos)                        |
| `core2ai:use-pin`   | apply GitHub pin after core2ai release                               |
| `core2ai:use-local` | link sibling `../core2ai` for dev                                    |
| `release:vsix`      | GitHub prerelease of tested VSIX (build with `extension:vsix` first) |

Per-demo smokes: `npm run test:smoke:mock-api`, `test:smoke:open-meteo`, `test:smoke:tmdb`, `test:mcp:mock-api`. Scenarios live in [`scripts/dev-smoke.config.json`](./scripts/dev-smoke.config.json).

Regenerate tools: `npm run generate:all` or `npm run generate:*` inside **`packages/extension/demos/`**.

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

Pre-launch task **Build api-2-ai-dsl**: `langium:generate` + `build` ([`./.vscode/tasks.json`](./.vscode/tasks.json)).

## License

BUSL-1.1 — see [`./LICENSE`](./LICENSE).

---

#Col3:23
