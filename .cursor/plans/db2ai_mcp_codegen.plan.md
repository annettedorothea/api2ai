---
name: db2ai MCP Codegen
overview: "MCP-Tool-Codegen analog api2ai: database env (kein URL in DSL/Generated), SELECT * FROM table, limit/offset als MCP-Tool-Parameter für Agent-Pagination, pg-Runtime + mcp-bundle."
todos:
  - id: dsl-env-limit
    content: "Grammar: database env; Query nur SELECT * FROM table; optional maxLimit im Block; Validator/Tests"
    status: pending
  - id: cli-generator
    content: "generator: connectionEnv, dynamisches SQL mit limit/offset aus invokeTool-Args, inputSchema"
    status: pending
  - id: cli-commands
    content: "CLI generate + smoke; bundle:mcp-runtime + generate:pagila"
    status: pending
  - id: mcp-host
    content: "mcp-bundle adaptieren; generated/cli/mcp-serve.mjs"
    status: pending
  - id: examples-docs
    content: "pagila.db2ai + README/.env.example; Tool-Description Pagination-Hinweis"
    status: pending
  - id: extension-generate
    content: "Extension wie api2ai: Generate on Save, Command, embed-cli-bundle, DB2AI_EMBED_HOME"
    status: pending
isProject: false
---

# Plan: db2ai MCP-Tool-Codegen

## Ziel

Generierte MCP-Tools führen **parametrisiertes** `SELECT * FROM <table>` aus. Der **Agent** steuert Pagination über Tool-Argumente `limit` und `offset` (zweiter Aufruf = nächste Seite). Die **DB-URL** kommt nur aus einer **Umgebungsvariable** (Name in der DSL), nie als Klartext in `.db2ai` oder generierten Dateien.

```mermaid
flowchart LR
  agent[MCP Client]
  host[mcp-serve.mjs]
  mod[pagila-tools.mjs]
  pg[(PostgreSQL)]

  agent -->|"tools/call limit offset"| host
  host --> mod
  mod -->|"SELECT FROM table LIMIT n OFFSET m"| pg
```

---

## 1. DSL (Voraussetzung)

### Grammar ([`db2ai/packages/language/src/db-2-ai-dsl.langium`](db2ai/packages/language/src/db-2-ai-dsl.langium))

```langium
entry Model:
    'database' 'env' env=STRING
    (queries += Query)*;

Query:
    'SELECT' '*' 'FROM' table=TableName '{'
        (
              'toolName' ':' toolName=STRING
            | 'intent' ':' intent=STRING
            | 'example' ':' example=STRING
            | 'summary' ':' summary=STRING
            | 'maxLimit' ':' maxLimit=INT
        )*
    '}';

terminal INT: /[0-9]+/;
```

**Kein** `LIMIT`/`OFFSET` in der SQL-Zeile — Pagination liegt bei den **MCP-Tool-Parametern**.

### Optionales Sicherheits-Cap im Block

- `maxLimit: 500` — Validator: optional, `> 0`; Codegen nutzt es als **Obergrenze** für vom Agent übergebenes `limit`.
- Fehlt `maxLimit` → Generator setzt Default-Cap (z. B. `1000`) im generierten Modul.

### Beispiel [`examples/pagila.db2ai`](db2ai/examples/pagila.db2ai)

```text
database env "PAGILA_DATABASE_URL"

SELECT * FROM film {
    toolName: "listFilms"
    intent: "list films with pagination"
    example: "First 20 films: limit 20 offset 0; next page: limit 20 offset 20"
    summary: "Paginated film rows"
    maxLimit: 500
}
```

### Validator / Schema

- `database env` — Env-Name Pflicht, nicht leer.
- Tabellen-Check via `loadSchema(process.env[env])` wenn Env gesetzt.
- `maxLimit` optional, positiv.

---

## 2. MCP-Tool-Parameter (Pagination)

Pro Tool im generierten `inputSchemaByTool` (JSON Schema → Zod im MCP-Host):

| Parameter | Schema | Bedeutung |
|-----------|--------|-----------|
| `limit` | `integer`, `minimum: 1`, **optional**, `default: 100` | Zeilen pro Seite; fehlt → 100 |
| `offset` | `integer`, `minimum: 0`, `default: 0` | Überspringen für nächste Seite |

**Tool-Description** (Codegen) enthält explizit:

- Hinweis: „Use `offset` for next page (e.g. page 2: `limit` 20, `offset` 20).“
- `example` aus DSL als Nutzungs-Prompt.

**Runtime** in `invokeTool(toolName, { limit, offset })`:

```sql
SELECT * FROM "film" LIMIT $1 OFFSET $2
```

- Parameter **gebunden** (`pg` prepared query), keine String-Konkatenation von Agent-Input.
- `effectiveLimit = min(limit, maxLimitCap)` — Cap aus DSL `maxLimit` / Generator-Default.
- Rückgabe: JSON `{ rows, rowCount, limit, offset }` als MCP-Text (Agent sieht Pagination-Kontext).

---

## 3. Generiertes Modul

Analog [`api2ai/packages/cli/src/generator.ts`](api2ai/packages/cli/src/generator.ts):

```typescript
export const connectionEnv = "PAGILA_DATABASE_URL";

export const generatedTools = [{
  toolName: "listFilms",
  title: "...",
  description: "...",  // inkl. Pagination-Hinweis
  table: "film",
  maxLimit: 500,
}];

export const inputSchemaByTool = {
  listFilms: {
    type: "object",
    properties: {
      limit: { type: "integer", minimum: 1, description: "Rows per page" },
      offset: { type: "integer", minimum: 0, default: 0, description: "Skip rows (next page)" }
    },
    required: [],
    additionalProperties: false
  }
};

export async function invokeTool(toolName, options = {}) { /* pg + dynamic LIMIT/OFFSET */ }
```

- **Kein** festes `sql`-Literal pro Tool — nur `table` + Cap; SQL wird zur Laufzeit gebaut.
- Connection: `process.env[options.connectionEnv ?? connectionEnv]`.

Neue CLI-Dateien: `db-query-codegen.ts`, `generator.ts`, `generate-command.ts`, `smoke.ts`.

---

## 4. MCP-Host

Kopie/Anpassung von [`api2ai/packages/cli/mcp-bundle/mcp-server.ts`](api2ai/packages/cli/mcp-bundle/mcp-server.ts) — `registerTool` mit `inputSchema` aus `inputSchemaByTool` (limit/offset).

---

## 5. Extension: Generate on Save + Command (wie api2ai)

**Ja — api2ai hat das bereits; db2ai noch nicht.** Nach CLI-Codegen dieselbe Extension-UX spiegeln.

### Referenz (api2ai, bereits implementiert)

| Teil | Datei |
|------|--------|
| On Save + Command | [`api2ai/packages/extension/src/extension/main.ts`](api2ai/packages/extension/src/extension/main.ts) — `registerGenerateOnSave`, `registerGenerateCommand`, `generateForSourceFile` |
| Command-ID | `api2ai.generateTools` in [`package.json`](api2ai/packages/extension/package.json) |
| Eingebettete CLI | [`embed-cli-bundle.mjs`](api2ai/packages/extension/embed-cli-bundle.mjs) → `out/embed-api2ai/cli.cjs` + `API2AI_EMBED_HOME` |
| Zielpfad | `<dir der .api2ai>/generated/tools/<name>-tools.ts` (+ `.mjs` + `generated/cli/mcp-serve.mjs` via `generateOutput`) |

### db2ai — zu ergänzen

1. **[`db2ai/packages/extension/src/extension/main.ts`](db2ai/packages/extension/src/extension/main.ts)**  
   - `onDidSaveTextDocument` wenn `languageId === 'db-2-ai-dsl'`  
   - Command `db2ai.generateTools` („Generate tool code (.ts + .mjs + MCP host)“)  
   - `execFile(node, [cli, 'generate', sourcePath, destinationPath])`  
   - `destinationPath = path.join(parsed.dir, 'generated', 'tools', `${parsed.name}-tools.ts`)`  
   - Queue pro Datei (wie api2ai, kein paralleles Doppel-Generate)  
   - `resolveCliSpawn`: Monorepo `packages/cli/bin/cli.js`, sonst `out/embed-db2ai/cli.cjs` + `DB2AI_EMBED_HOME`

2. **[`db2ai/packages/extension/package.json`](db2ai/packages/extension/package.json)**  
   - `commands` + `activationEvents`: `onCommand:db2ai.generateTools`  
   - Build: `embed-cli-bundle.mjs` (analog api2ai, Ziel `embed-db2ai`)

3. **CLI-Einstieg für Bundle**  
   - `vscode-bundle-cli-entry.ts` (wie api2ai), damit die Extension ohne globales `npm link` generieren kann

4. **Dev-Workflow**  
   - Extension-Build: `npm run bundle:mcp-runtime` (Root) vor `extension build`, wie bei api2ai dokumentiert

Damit gilt für db2ai derselbe Loop wie bei api2ai: **Speichern → generiert**, oder **Command Palette → Generate tool code**.

---

## 6. `examples/.cursor/mcp.json`

Analog [`api2ai/examples/.cursor/mcp.json`](api2ai/examples/.cursor/mcp.json):

```json
{
  "mcpServers": {
    "db2ai-pagila": {
      "command": "node",
      "args": [
        "./generated/cli/mcp-serve.mjs",
        "./generated/tools/pagila-tools.mjs"
      ],
      "env": {
        "PAGILA_DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/pagila"
      }
    }
  }
}
```

`env` in `mcp.json` nur für lokales Cursor-Testing; die DSL referenziert nur den Variablennamen.

---

## 7. CLI & Env

```bash
export PAGILA_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pagila"
node packages/cli/bin/cli.js generate examples/pagila.db2ai examples/generated/tools/pagila-tools.ts
node packages/cli/bin/cli.js smoke-generated examples/generated/tools/pagila-tools.mjs listFilms '{"limit":5,"offset":0}'
```

Smoke zweiter Aufruf: `'{"limit":5,"offset":5}'` — gleiche Tabelle, nächste Seite.

---

## 8. Abgrenzung

- Kein `SKIP`/`TAKE` (Postgres: `LIMIT`/`OFFSET`)
- Kein Connection-String in DSL/Generated
- Kein freies SQL vom Agent
- WHERE/ORDER BY später

---

## Umsetzungsreihenfolge

1. DSL `database env` + optional `maxLimit`; Validator/Tests
2. CLI `generate` + `generateOutput` (`.ts` / `.mjs` / `mcp-serve`) + dynamisches `invokeTool` + inputSchema
3. MCP bundle + examples + Doku + Smoke
4. **Extension** Generate on Save + Command + `embed-cli-bundle` (Parität api2ai)
5. Build + Smoke gegen Pagila (CLI + optional Extension-Dev-Host)
