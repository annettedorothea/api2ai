# Changelog

All notable changes to **api2ai** (DSL, generator, VSIX, demos) are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com). VSIX version follows [Semantic Versioning](https://semver.org).

Policy: [core2ai docs/development/changelog-policy.md](https://github.com/annettedorothea/core2ai/blob/main/docs/development/changelog-policy.md)

---

## [Unreleased]

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
