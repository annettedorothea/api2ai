# Changelog

All notable changes to **api2ai** (DSL, generator, VSIX, demos) are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com). VSIX version follows [Semantic Versioning](https://semver.org).

Policy: [core2ai docs/development/changelog-policy.md](https://github.com/annettedorothea/core2ai/blob/main/docs/development/changelog-policy.md)

---

## [Unreleased]

---

## [1.0.0-rc.3] - 2026-07-09

Composed MCP codegen, build-stamp fingerprint, slimmer `/test-all` trust model, banking demo hooks, tag-only CI quality gate. Pins `@toolfactory.dev/core` **1.0.0-rc.6** from npmjs.

### Added

- **Banking demo:** OpenAPI fixture, OAuth/token-exchange hooks, MCP servers in demos
- **Build stamp:** central `mcp-build-generated-at.ts`; MCP banner and tool descriptions show build fingerprint
- **Token exchange:** hook authoring for banking credential flow

### Changed

- **Codegen:** consumer `compose` templates/fragments; slimmer check-stub renderer
- **`/test-all`:** trust terminal `start:all` banner (no per-tool version column); MCP required in Cursor
- **CI:** quality gate on tag `v*` only; `vsix:release` uses `vX.Y.Z` Git tag
- **Release skill:** CP5 commit → CP6 tag → CP7 after CI green

### Upgrade notes

- After install: `generate:all` + `build:generated`; restart MCP servers in Cursor

---

Hook stubs per export name, demo start script split, invoke codegen fixes (query bucket, MCP dot params), core **1.0.0-rc.4**. Pins `@toolfactory.dev/core` **1.0.0-rc.4** from npmjs.

### Added

- **Demo scripts:** `start:mcp` (foreground MCP), `start:all` (full stack), `start:fixtures` (background backends); `demo:kill-mcp` / `demo:kill-fixtures` / `demo:kill-all`
- **Hook stubs:** one file per `checkToolAccessFor*` / `prepareToolCallFor*` export; generator always imports from DSL

### Changed

- **`npm run start`** aliases `start:mcp`; `/test-all` uses `start:all`
- **Demos README** and `/test-all` skill updated for new start workflow
- **`mcp:inspect`:** auth hints inlined (removed `mcp-inspect-auth-hints.mjs`)
- **OAuth:** `localhost:8787/callback` in `.env.example`; demos `.env` gitignored
- **MCP tool schemas:** OpenAPI query params with dots (e.g. `vote_average.gte`) emit MCP-safe names (`vote_average_gte`) with HTTP wire remap at invoke time; dotted names sanitized in tool descriptions

### Fixed

- **`normalizeInvokeOptions`:** flat MCP arg `query` no longer collides with the internal `query` bucket (fixes empty TMDB search results when the API query parameter is literally named `query`)

### Removed

- `start.mjs`, `start-mcp-http*.mjs`, `start-mcp-oauth.mjs`, `start:background`, per-demo `start:<name>` npm scripts

### Upgrade notes

- Regenerate: `npm run generate:all`, `npm run build:generated --prefix packages/extension/demos`
- Split legacy combined hook stub files; delete orphan `${toolName}.ts` stubs

---

## [1.0.0-rc.1] - 2026-07-06

MCP Option B hosts, shippable `build:mcp` bundles, and resilient demo start. Pins `@toolfactory.dev/core` **1.0.0-rc.2** from npmjs.

### Added

- **MCP host layout (Option B):** shared `generated/api2ai/cli/*-runtime.ts` plus per-module `generated/api2ai/servers/<module>-<host>-mcp-server.ts` (stdio, public HTTP, passthrough HTTP, OAuth HTTP)
- **`npm run build:mcp -- --host <kind> <module>`** — standalone bundle under `dist/mcp/<module>-<host>/` (`server.mjs`, `package.json`, `.env.example`, `mcp.json.example`, `npm start` with demo CLI flags)
- **Startup UX:** catalog-style MCP banners per host; orchestrator summary when starting demos
- **`npm run start:background`** — same stack without blocking the terminal (for `/test-all` and automation); foreground `npm run start` remains the default for local work
- **Demos README:** bundling walkthrough (`spaceflight-news` / public HTTP)

### Changed

- Demo launchers and `.cursor/mcp.json` use `servers/*` entrypoints (regenerate after upgrade)
- **`npm run start`:** missing optional user secrets warn instead of exiting; each MCP host starts in its own try/catch so one failure does not stop the rest
- **`/test-all` skill:** documents `start:background` for automated runs

### Removed

- Legacy generic `generated/api2ai/cli/*-mcp-server.ts` hosts — run `npm run generate:all` and `npm run build:generated` after upgrading

### Upgrade notes

- Regenerate and rebuild demos: `npm run generate:all`, `npm run build:generated --prefix packages/extension/demos`
- Update `.cursor/mcp.json` / custom launchers to `servers/<module>-<host>-mcp-server.js` if you forked the old `cli/*-mcp-server` paths

---

## [1.0.0-rc] - 2026-07-03

First release-candidate: **curated MCP tools from OpenAPI 3.x** — select operations in `.api2ai`, enrich with intent and auth, generate executable MCP servers.

### Added

- **Langium `.api2ai` DSL** with VSIX extension (syntax, validation, completions, generate-on-save)
- **OpenAPI 3.x loader** with `SwaggerParser.dereference()` — `$ref` in parameters, request bodies, and response schemas resolve before LSP validation and codegen
- **Code generator:** per-DSL tool module (`*-tools.ts`), Zod input schemas, `invokeTool`, hook stubs under `src/hooks/api2ai/`
- **Four MCP hosts per project:** stdio (Cursor), public HTTP, passthrough HTTP (client header → upstream), OAuth HTTP (MCP Inspector / OAuth demos)
- **Upstream auth block:** `auth { in: header|query, name, prefix }` maps MCP credential to API header or query param on protected tools; optional `hooks: { verifyCredential: true }` for module verify stub
- **Access control:** `access: public | protected` plus optional per-operation hooks — `checkToolAccess`, `prepareToolCall`, `clientMayOmit` (see core2ai auth pipeline)
- **Flat MCP tool arguments** — agents pass `itemId`, `limit`, `X-Trace-Id` as top-level fields; nested `pathParams` / `query` objects are rejected by the tool JSON Schema
- **OpenAPI → Zod:** primitives, objects, arrays, `enum`, `nullable`, resolved `oneOf` / `anyOf` as unions; `allOf` may degrade to `z.unknown()` when composition cannot be flattened
- **DSL overrides:** `params`, `body`, `response`, `intent`, `summary`, `description`, `example` to guide agents when the spec is weak
- **TRACE invoke fallback:** `performToolHttpRequest` uses `node:http` / `node:https` when Node `fetch` rejects the TRACE method
- **Demo workspace** with mock/local APIs and public upstreams: open-meteo, open-meteo-geocoding, github, tmdb, xquik, spaceflight-news, todo, bookings, cakes
- **Coverage test harness:** `test.api2ai` + `test-api` mock (port 3857), stdio MCP server `test`, 18 tools covering HTTP methods, params, `$ref`, combinators, auth, hooks
- **`xquik.api2ai` demo** (community PR by [@kriptoburak](https://github.com/kriptoburak)): read-only X post/user search via [Xquik](https://xquik.com) — `XQUIK_API_KEY` in demos `.env`
- **Manual E2E gate:** `/test-all` skill (`api2ai-test-all-mcp`) — one MCP call per tool across all servers in `.cursor/mcp.json`
- **Validator warning** when `auth { }` is set but every operation uses `access: public`
- **LSP completions:** OpenAPI paths; `auth { in: ` → `header` / `query`; `access: ` → `public` / `protected`

### Changed

- Pre-0.5 iterative features (flat args, OAuth HTTP demos, MCP Inspector workflow) are folded into this baseline; changelog maintenance starts here
- **Hooks DSL:** `hooks: { checkToolAccess, prepareToolCall }` replaces top-level `authorize` / `prepare` on operations
- **verifyCredential stubs:** renamed to `verify*Credential.ts`; credential is a raw string (void hook)
- **Demos:** bookings/cakes use JWT in `checkToolAccess` / `prepareToolCall`
- **`/test-all`:** result report only (table + Auffälligkeiten), no full Audit section

### Removed

- `banking.api2ai`, `banking-api/**`, Enterprise IdP wiring for banking

### Fixed

- TRACE operations no longer fail at invoke with `'TRACE' HTTP method is unsupported`

### Known limitations (documented, not bugs)

- Cookie parameters and exotic parameter styles → validation errors or warnings
- Object/array header parameters → rejected in MVP serialization
- Unresolved `$ref` or circular schemas → generic JSON object in tool input schema
- Generated hosts are MCP **tool servers** only (`tools/list`, `tools/call`) — no resources, prompts, or sampling
- No automated MCP/invoke smoke in CI — use `/test-all` before release

### Upgrade notes

- Install VSIX from GitHub release; open or create a project workspace
- Migrate every `.api2ai` operation to `hooks` syntax; run `npm run generate:all` and `npm run build:generated --prefix packages/extension/demos`
- Update hand-written hooks under `src/hooks/api2ai/**` to `checkToolAccessFor*` / `prepareToolCallFor*` export names
- Sync `@toolfactory.dev/core` pin when upgrading sibling core2ai
- Before tagging final **1.0.0:** run `npm run check` and full `/test-all` with `npm run start` in demos

---

> _Whatever you do, work heartily, as for the Lord and not for men._
>
> **— Colossians 3:23**
>
> _Created by Annette Pohl_
