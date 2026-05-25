---
name: Generated-Only MCP
overview: Stellt den MCP-Pfad so um, dass Tools ausschließlich aus generierten Artefakten geladen werden (TS für Dev/Review, JS für Runtime-Serve), entfernt Root-MCP-Konfiguration und löscht obsoleten Runtime-Code für `.api2ai`-Interpretation.
todos:
  - id: define-generated-runtime-contract
    content: Generator-Ausgabe auf stabiles MCP-Runtime-Interface festlegen (generatedTools/baseUrl/invokeTool + optional Schemas)
    status: pending
  - id: implement-generated-module-mcp-loader
    content: MCP-Server auf dynamischen Import generierter Module umstellen
    status: pending
  - id: switch-cli-to-generated-commands
    content: CLI-Kommandos auf generated-only Pfad umstellen und `.api2ai`-Runtimepfad entfernen
    status: pending
  - id: remove-root-mcp-config
    content: `.cursor/mcp.json` entfernen, nur `examples/.cursor/mcp.json` für Preview beibehalten
    status: pending
  - id: remove-obsolete-runtime-code
    content: Toten Code aus `main.ts`, `mcp-server.ts`, `runtime.ts`, `smoke.ts` löschen (Model/OpenAPI-Lookup-abhängige Pfade)
    status: pending
  - id: update-scripts-and-readme
    content: package scripts und README auf generated-only Runtime umstellen
    status: pending
  - id: add-generated-runtime-tests
    content: Tests für generated-module loading, tool invocation und Fehlerszenarien ergänzen
    status: pending
  - id: verify-build-and-tests
    content: Langium generate/build und relevante Tests ausführen
    status: pending
isProject: false
---

# MCP nur aus generiertem Code laden (inkl. Cleanup)

## Prüfung: Wo heute toter/sinnloser Code entsteht

Nach der Umstellung auf generated-only wären diese aktuellen Pfade obsolet und sollen gelöscht werden:

- In [packages/cli/src/main.ts](file:///Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/main.ts):
    - `mcpServeAction` mit `extractAstNode<Model>(...)`
    - `resolveOperationLookup(...)`
    - Imports `createApi2AiDslServices`, `NodeFileSystem`, `loadOpenApi`, `OperationLookup` (für MCP/Smoke-Runtime)
- In [packages/cli/src/mcp-server.ts](file:///Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/mcp-server.ts):
    - `runMcpServer(model, baseUrl, operationLookup)` und alles, was `Model/getOperations` erwartet
- In [packages/cli/src/runtime.ts](file:///Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/runtime.ts):
    - modelbasierte `getOperations(...)`-/OpenAPI-Serialisierungslogik, sofern MCP/Smoke nur noch `invokeTool` aus generated Modulen nutzt
- In [packages/cli/src/smoke.ts](file:///Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/smoke.ts):
    - `Model/OperationLookup`-basierte Toolauswahl, wenn `smoke` auf generated modules umgestellt ist
- Root-MCP-Konfig [`.cursor/mcp.json`](file:///Users/annette/Documents/Projekte/api2ai/api2ai/.cursor/mcp.json), da du nur Preview (`examples`) nutzt.

## Zielzustand

- MCP-Server lädt ausschließlich **JS-Runtime-Artefakte** aus `examples/generated/*-tools.mjs` (oder `.js`) und registriert daraus Tools.
- TS bleibt als Dev-/Review-Artefakt erhalten, ist aber nicht die Runtime-Quelle des MCP-Servers.
- `.api2ai` wird nur noch für Codegen (`generate`) genutzt.
- Cursor-Preview nutzt ausschließlich [examples/.cursor/mcp.json](file:///Users/annette/Documents/Projekte/api2ai/api2ai/examples/.cursor/mcp.json).

## Umsetzungsplan

1. **Generated Runtime Contract finalisieren**

- Generator in [packages/cli/src/generator.ts](file:///Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/generator.ts) als Source of Truth definieren:
    - `generatedTools`
    - `baseUrl`
    - `invokeTool(toolName, options)`
    - optional `inputSchemaByTool` für bessere MCP-Schemas.
- Ausgabeformat festziehen:
    - TS-Artefakt für Entwicklung (`*-tools.ts`)
    - zusätzlich JS-Runtime-Artefakt (`*-tools.mjs` oder `*-tools.js`) für `mcp-serve-generated`.

2. **Generated-Module-Loader für MCP bauen**

- In [packages/cli/src/mcp-server.ts](file:///Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/mcp-server.ts) eine neue API `runMcpServerFromGeneratedModule(modulePath)` implementieren.
- Runtime-Import validieren (klarer Fehler bei fehlenden Exports).

3. **CLI-Kommandos umstellen**

- In [packages/cli/src/main.ts](file:///Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/main.ts):
    - `mcp-serve-generated <generated-module-js>` einführen.
    - `smoke-generated <generated-module-js> <toolName> [argsJson]` einführen.
    - Altes `mcp-serve <file.api2ai>` entfernen oder hart als deprecated failen.

4. **Dead Code löschen**

- Alte modelbasierte Pfade aus `main.ts`, `mcp-server.ts`, `runtime.ts`, `smoke.ts` entfernen.
- Falls `runtime.ts` danach nur noch Legacy enthält: Datei entfernen und Aufrufe direkt über generated module führen.

5. **Configs/Skripte aktualisieren**

- [package.json](file:///Users/annette/Documents/Projekte/api2ai/api2ai/package.json) `test:mcp`/`test:smoke` auf generated-Dateien umstellen.
- [examples/.cursor/mcp.json](file:///Users/annette/Documents/Projekte/api2ai/api2ai/examples/.cursor/mcp.json) auf `mcp-serve-generated` mit JS-Artefakten umstellen.
- Root [`.cursor/mcp.json`](file:///Users/annette/Documents/Projekte/api2ai/api2ai/.cursor/mcp.json) löschen.

6. **README präzisieren**

- In [README.md](file:///Users/annette/Documents/Projekte/api2ai/api2ai/README.md):
    - klarer Flow: `generate (TS + JS) -> mcp-serve-generated (JS)`.
    - `.api2ai` ist Build-Time Input, nicht MCP Runtime Source.

7. **Tests + Verifikation**

- CLI-Tests für generated-only Loader/Invoke ergänzen.
- Danach: `npm run langium:generate && npm run build` + relevante Tests.
