---
name: examples-generated-tools-cli
overview: **`examples`** (bzw. der Nutzer-Workspace) trägt **Laufzeit** für MCP (**`generated/**/*`** plus **`npm install`**). **Codegen** beim **DSL‑Plugin**; erste Generate‑Runde kann eine **minimale `package.json` im Projektroot** schreiben, **falls noch keine existiert**, und sie **danach nie überschreiben**. Kein Zurücklegen fester Generate‑Scripts im Nutzer‑`package.json` nötig. Statisches MCP‑Blob wird weiter mit ausgegeben.
todos:
  - id: extension-generate-integration
    content: "**Extension/Plugin** so erweitern, dass Generate (wie heutiges `generate`-Kommando) Ziel **`…/generated/tools/*.ts|.mjs`** + **`…/generated/cli/mcp-serve.mjs`** schreibt; kein separates Nutzer‑`npm run generate` in `examples` nötig"
    status: pending
  - id: npm-publish-chain
    content: "**Optional abhängig von Plugin‑Architektur:** Language ± Generator als npm‑Artefakte, die die Extension konsumiert oder einbündelt (Versionierung dokumentieren)"
    status: pending
  - id: bundle-mcp-at-cli-build
    content: "**Build** MCP‑Runtime zu gebündeltem Artefikat im gleichen Lieferpaket wie der Generator (`mcp-serve-emitted.mjs`)"
    status: pending
  - id: generator-emit-static-mcp
    content: "`generateOutput` schreibt bei jedem Lauf zusätzlich `generated/cli/mcp-serve.mjs` aus diesem Artefakt"
    status: pending
  - id: move-generated-tools
    content: "**Convention** `examples/generated/tools/*`; Aufrufe aus Plugin konsequent darauf zeigen"
    status: pending
  - id: conditional-package-json
    content: "Generator/Plugin: wenn im **Projektroot** (Ordner mit der DSL/OpenAPI‑Arbeit oder eindeutig vereinbarter Root) **keine** `package.json` → **minimal** (`type module`, `@modelcontextprotocol/sdk`, `zod`, ggf. `private`) schreiben; **wenn vorhanden → nicht ändern/überschreiben** (Nutzer erhält erste Codegen eigene npm‑Basis ohne Konflikt)"
    status: pending
  - id: remove-user-facing-mcp-cli
    content: "`mcp-serve-generated` aus `packages/cli` entfernen (Endnutzer nutzt emittierte Datei)"
    status: pending
  - id: cursor-mcp-json
    content: "`examples/.cursor/mcp.json`: node + paths zu generated/cli + generated/tools"
    status: pending
  - id: root-maintainer-scripts
    content: "**Monorepo-Maintainer**: `generate:*` bleiben in **Root `package.json`** oder nur über Workspace/CLI; nicht als Produkt-Anforderung für `examples`"
    status: pending
  - id: verify
    content: "Nach Plugin‑Generate oder Root‑CLI: **`npm install`** in **`examples`** (nur Runtime) → MCP startbar; keine `generate`-Scripts in **`examples`** nötig"
    status: pending
isProject: false
---

# Plan: `examples` = Laufzeit; Codegen = Plugin; Generator emittiert alles inkl. `mcp-serve.mjs`

## Rollenverteilung

| Ort | Zweck |
|-----|--------|
| **IDE‑Plugin / Extension** | **Codegenerierung** („Speichern“ / „Generate“ / Commands): ruft Diesel/Language + **`generateOutput`** auf; schreibt **`generated/tools/*`** und **`generated/cli/mcp-serve.mjs`**. |
| **Nutzerprojekt / `examples`** | Enthält **DSL + OpenAPI + `generated/`**; **`package.json`** entsteht beim **ersten Generate**, sobald keine existiert (**niemals** bestehende überschreiben); danach dort **`npm install`** für MCP‑Runtime‑Deps (**keine** Pflicht‑`generate`‑Scripts in dieser Datei). |
| **Monorepo Root** (`package.json`) | **Optional** Maintainer‑Shortcuts (`generate:*`), CI — nicht Teil des „Nutzer öffnet nur examples“‑Produkts. |

**Woher `package.json`?** Ohne Monorepo hat der Nutzer sie initial nicht. **Sinnvoll:** Beim **ersten** erfolgreichen Generate legt der Generator (oder das Plugin, das ihn aufruft) eine **Standard‑`package.json`** an — **nur wenn** im gewählten **Projektroot** noch **keine** liegt. **Spätere Generate‑Läufe** lassen eine vorhandene `package.json` **unverändert** (keine stillen Überraschungen, keine gelöschten Scripts). Nach dem ersten Gen: Hinweis im Plugin („`npm install` ausführen“). **Automatisches Nachziehen von Deps** in bestehende `package.json` bleibt **außerhalb MVP** (aktuell nur **Warn‑Hinweis** bei fehlenden Paketen).

## Ziel gleichermaßen

- Nach einem **Generate‑Vorgang (Plugin oder Maintainer‑CLI)** existieren **`generated/tools/*.mjs`** und **`generated/cli/mcp-serve.mjs`**.
- **`mcp-serve.mjs`** Kommt weiterhin aus **einmal gebündeltem Artefikat** beim Build der Generator‑Komponente; **`generate`** **kopiert** es mit — **nicht** manuell durch den Nutzer in `examples`.

## Warum ging „nur `examples`“ ohne Monorepo bisher nicht — und was sich ändert

- **Generate** brauchte **Language + CLI** aus dem Repo. Das liegt künftig **hinter der Extension** oder einem **öffentlichen Paket**, das die Extension einbindet — **nicht** in **`examples/package.json`**.
- **„Nur examples“ ohne Rest‑Repo:** Nutzerinnen installieren **`npm install` in `examples`** nur für **`node`/MCP**; **vorher** muss **`generated/`** bereits existieren (einmal durch **Plugin‑Generate**, oder Artefakte mitgeliefert / aus Repo gezogen). Das kann im Plan explizit so bleiben.

## Architektur (überarbeitet)

```mermaid
flowchart TB
  plugin[DSL IDE Plugin]
  gen[generator generateOutput]
  tools[examples/generated/tools]
  cliSrc[bundled MCP blob aus Build]
  mcpServe[examples/generated/cli/mcp-serve.mjs]
  pkgMini[Projekt/package.json wenn fehlend]
  plugin --> gen
  gen --> pkgMini
  gen --> tools
  cliSrc -.->|bei jedem generate aus Paket kopieren| gen
  gen --> mcpServe
```

## Bootstrap `package.json` (Plugin‑Nutzer)

- **Welcher „Root"?** Vereinbarung im Plugin: z. B. Workspace‑Folder, der die **`.api2ai`** enthält (oder übergeordneter Projektroot — **ein** klares Mapping dokumentieren).
- **Regel:** `if (!existsSync(join(projectRoot, 'package.json')))` → **minimalen Inhalt schreiben** (`name`, `private`, `"type":"module"`, `dependencies`: `@modelcontextprotocol/sdk`, `zod` mit Versionen konsistent zur emittierten `mcp-serve.mjs`-Erwartung).
- **`else`** → Datei **nicht** öffnen/überschreiben. Fehlen **`@modelcontextprotocol/sdk`** / **`zod`**: **vorerst nur Hinweis** im Plugin (Warnung / kurze Anleitung), **kein** automatisches Merge von `dependencies`.
- **Monorepo:** Liegt bereits eine **`package.json` am Repo‑Root** und der Nutzer arbeitet in **`examples/`** ohne eigene Datei → entweder **kein** automatisches zweites `examples/package.json` (nur wenn wirklich **keine** vorhanden) **oder** bewusst nur **`examples`** als Root wenn Workspace nur diese öffnet — hier **„kein Überschreiben“** wichtiger als automatisches Anlegen an falscher Tiefe.

## Inhalt Minimal‑`package.json` (nach erstem Generate)

```text
dependencies: @modelcontextprotocol/sdk, zod
Keine generate-scripts nötig; optional später Komfort-scripts nur MCP-Start.
```

## Monorepo

- **`npm run generate:…`** im **Repo‑Root** bleiben als **Maintainer**/CI‑Werkzeug erlaubt.
- Dokumentieren: **Endnutzer‑Story** ist **Plugin**, nicht **`examples`-Scripts**.

## Validierung

- **Frisches Verzeichnis** ohne `package.json` → ein Generate‑Lauf erzeugt **sowohl** `generated/**` **als auch** **`package.json`**, dann `npm install` → MCP lauffähig.
- Ordner mit **bestehendem** `package.json` nach Generate → **bytegleich**/unberührt bezüglich `package.json` (bis auf manuelle Änderungen des Nutzers).
