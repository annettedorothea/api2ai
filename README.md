# api2ai

`api2ai` is a PoC for turning existing OpenAPI descriptions into small, curated AI tools.

The OpenAPI file stays the technical source of truth. The `.api2ai` DSL selects which endpoints should become tools and adds AI-facing metadata such as intent, examples, tool names, and optional runtime auth. Inside each HTTP operation block you can add an optional **`summary`** and **`description`**:

- The **MCP tool title** is derived from `summary` with a consistent fallback chain: DSL `summary` → OpenAPI `summary` → OpenAPI `operationId` → `toolName`. The first non-empty value wins.
- The **MCP `API:` section** uses `description`. Any DSL value wins over OpenAPI, including the empty string — `description: ""` suppresses the section entirely. OpenAPI's `description` is only used when the DSL field is omitted.
- The generator always adds a compact **`Response:`** section to each tool from OpenAPI (documented success response plus up to a few documented error statuses).

In the `open-meteo` example, the OpenAPI `summary` and `description` for `/v1/forecast` are intentionally poor (prefixed with `CRAP:`) to demonstrate that `.api2ai` can override OpenAPI text. The matching operation in `examples/open-meteo.api2ai` adds a better `summary` (used as the tool title) and `description`, which are what AI tools actually see.

```txt
openapi "./openapi/spaceflight-news.openapi.yaml"
baseUrl "https://api.spaceflightnewsapi.net"

GET "/v4/articles/{id}/" {
    toolName: "getSpaceflightArticleById"
    intent: "get one spaceflight article by id"
    example: "Get article with id 1"
}
```

Properties inside `{ ... }` blocks may appear in any order. For an operation, `toolName` and `intent` are required; `example`, `summary`, and `description` are optional. For `auth bearerEnv`, `in`, `name`, and `env` are required; `prefix` is optional. For `auth bearerSealed`, `in`, `name`, and `privateKeyEnv` are required; `prefix` is optional. Each property may appear at most once per block.

The generator writes TypeScript and ESM `.mjs` modules under [`examples/generated/tools/`](examples/generated/tools/), plus the standalone MCP entry copied to [`examples/generated/cli/`](examples/generated/cli/) (see `mcp-serve.mjs`). Those artifacts can be smoke-tested directly or exposed as MCP tools for any MCP-compatible agent or client.

## Project Layout

- `packages/language`: Langium grammar, AST generation, validation, and completion support.
- `packages/cli`: CLI generator, smoke runner, and generated-module MCP server.
- `packages/extension`: Cursor/VSCode extension wrapper for the DSL.
- `examples`: demo `.api2ai` files and OpenAPI under [`examples/openapi/`](examples/openapi/) (and peers), MCP config under [`examples/.cursor/`](examples/.cursor/), codegen output under [`examples/generated/tools/`](examples/generated/tools/) and [`examples/generated/cli/`](examples/generated/cli/).

## Getting Started (Checkliste)

Voraussetzung: **Node.js 20+** (`node -v`).

| Schritt | Aktion |
|--------|--------|
| 1 | Repository klonen |
| 2 | Im **Repository-Root:** `npm install` → `npm run langium:generate` → `npm run build` |
| 3 | **`examples/`:** `cd examples && npm install` (MCP-SDK für die Demo-Server) |
| 4 | **Secrets & Keys:** [examples/README.md](examples/README.md) — TMDB API-Key, Seal-Keys für `bearerSealed` (GitHub, interne APIs) |
| 5 | **Cursor:** Workspace-Ordner **`examples`** öffnen; `cp .cursor/mcp.json.example .cursor/mcp.json` (lokal, gitignored) |
| 6 | **MCP:** Einstellungen → Tools & MCP → `api2ai-*` Server aktivieren |
| 7 | **Smoke-Test:** `npm run test:smoke` (Open-Meteo, im Root) |
| 8 | **Chat-Test:** `api2ai wie ist das Wetter in Berlin` |

Nach Änderungen an `.api2ai`: passendes `npm run generate:*` im Root, dann MCP neu laden (`Cmd+Shift+P` → MCP-Refresh oder `Developer: Reload Window`).

**Neuer Rechner / Demo morgen:** dieselbe Checkliste; PEM-Keys und `.env.local` liegen nicht im Git — auf dem Arbeits-Rechner Keys neu erzeugen und Tokens neu versiegeln (siehe examples README).

Weitere Docs: [docs/architecture-sketches.md](docs/architecture-sketches.md) · Demo-Prompts: [examples/README.md](examples/README.md)

### Entwicklung (optional)

Generierte Demos neu erzeugen:

```bash
npm run generate:spaceflight-tools
npm run generate:open-meteo-tools
npm run generate:open-meteo-geocoding-tools
npm run generate:tmdb-tools
npm run generate:github-tools
```

MCP-Prozess manuell starten: `npm run test:mcp`

Extension Development Host: Launch-Konfiguration `Run Extension` (öffnet `examples` als Workspace). Beim Speichern von `.api2ai` dort regeneriert die Extension die Tools automatisch.

## Extension (VSIX) — bauen und verteilen

Die **api2ai**-Extension (Syntax, Validation, Completion, Generate beim Speichern) liegt als VSIX-Paket vor. Kollegen brauchen dafür **kein** Klon dieses Repos — nur die VSIX-Datei und ihren eigenen Projektordner mit `.api2ai`.

### Wo liegt die VSIX nach dem Build?

Nach erfolgreichem Build:

```text
packages/extension/vscode-api2ai-<version>.vsix
```

Aktuell z. B. [`packages/extension/vscode-api2ai-0.0.1.vsix`](packages/extension/vscode-api2ai-0.0.1.vsix) — `<version>` entspricht `version` in [`packages/extension/package.json`](packages/extension/package.json).

Die Datei ist **nicht** im Git (`*.vsix` in [`.gitignore`](.gitignore)); sie entsteht lokal beim Packen.

### VSIX erstellen (Maintainer)

Im **Repository-Root**, einmalig `npm install`, dann:

```bash
npm run extension:vsix
```

Das Script führt aus: `langium:generate` → `build` (inkl. eingebettetem CLI/MCP-Bundle) → `vsce package` im Workspace `packages/extension`.

Nur das Paket neu bauen (wenn schon kompiliert):

```bash
npm run package:vsix -w packages/extension
```

### Verteilung an Kollegen

| Weg | Hinweis |
|-----|--------|
| SharePoint / Teams / interner File-Share | Dateiname mit Version (`vscode-api2ai-0.0.1.vsix`) |
| GitHub Release / Artifactory | VSIX als Release-Asset; keine Secrets im Paket |
| E-Mail | Nur intern; Größe ca. 0,7–1 MB |

**Versionierung:** Vor neuem Rollout `version` in `packages/extension/package.json` erhöhen, neu bauen, neue VSIX verteilen. Empfehlung: alte VSIX-Datei nicht überschreiben, sondern versioniert ablegen.

**Nicht nötig für Kollegen:** Monorepo, `langium:generate`, Root-`npm run build` — das steckt in der VSIX.

### Installation (Cursor / VS Code)

1. VSIX-Datei bereitstellen (Download vom Share o. Ä.).
2. **Cursor:** Seitenleiste **Extensions** → Menü `…` → **Install from VSIX…** (bzw. „Aus VSIX installieren…“) → VSIX wählen.
3. **VS Code:** gleicher Menüpunkt unter Extensions.
4. Fenster ggf. neu laden (`Developer: Reload Window`).

CLI (optional):

```bash
cursor --install-extension /pfad/zu/vscode-api2ai-0.0.1.vsix
# oder: code --install-extension …
```

### Nutzung nach der Installation

1. Eigenen Ordner als Workspace öffnen (z. B. nur `examples/` oder ein separates Demo-Projekt).
2. `.api2ai` anlegen oder bearbeiten — beim **Speichern** werden `generated/tools/*` und `generated/cli/mcp-serve.mjs` erzeugt.
3. Einmal `npm install` im Projektroot (MCP-Runtime: `@modelcontextprotocol/sdk`, `zod`), falls noch keine `package.json` existiert: legt der Generator beim ersten Generate eine minimale an.
4. MCP: `mcp.json.example` nach `.cursor/mcp.json` kopieren und bei Bedarf erweitern — derzeit **manuell** (Vorlage: [examples/README.md](examples/README.md#mcp-konfiguration-cursormcpjson)).

## Auth

The DSL can reference API keys without embedding secret values in generated code:

```txt
auth bearerEnv {
    in: header
    name: "Authorization"
    env: "TMDB_ACCESS_TOKEN"
    prefix: "Bearer "
}
```

For **sealed** credentials (PAT, staging access token, or other bearer secret encrypted for this MCP process), use `auth bearerSealed { … privateKeyEnv: "…" }` and pass a Base64 **A2S1** blob as `sealedCredential` on each `invokeTool` / MCP call. Step-by-step (keypair, seal, internal/BFF APIs): [**examples/README.md**](examples/README.md) and [`examples/seal-keys/README.md`](examples/seal-keys/README.md). Example DSL: [`examples/github.api2ai`](examples/github.api2ai).

```txt
auth bearerSealed {
    in: header
    name: "Authorization"
    prefix: "Bearer "
    privateKeyEnv: "API2AI_SEAL_PRIVATE_KEY"
}
```

At runtime, **`bearerEnv`** reads the API secret from `process.env` at the variable you name in `env`. **`bearerSealed`** resolves the private key from `process.env[privateKeyEnv]`: if the value starts with `-----BEGIN`, it is used as inline PEM; otherwise it is treated as a filesystem path (absolute, or relative to `process.cwd()` and then to each parent directory up a few levels so differing MCP working directories still resolve repo-relative paths like `examples/seal-keys/private.pem`). It then decrypts the per-call `sealedCredential` argument (see script above).

For the TMDB demo, set `TMDB_ACCESS_TOKEN` in `examples/.env.local` (see [examples/README.md](examples/README.md#tmdb-api-key-bearerenv)).

## DSL Extension Preview (Entwicklung im Monorepo)

Zum Debuggen der Extension **ohne** VSIX (Extension Development Host):

1. Open this repository as workspace root.
2. Run `npm install`, `npm run langium:generate`, and `npm run build`.
3. Open Run and Debug and start the `Run Extension` launch configuration.
4. Open or create a `.api2ai` file in the Extension Development Host.

Available debug launch configurations:

- `Run Extension`: starts an Extension Development Host with `examples` as the workspace.
- `Run Extension (completion debug log)`: same as `Run Extension`, but enables completion debug logging.
- `Attach to Language Server`: attaches the debugger to the language server on port `6009`.

Useful development commands:

```bash
npm run langium:watch
npm run watch
```
