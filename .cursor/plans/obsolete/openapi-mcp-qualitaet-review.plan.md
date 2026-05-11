---
name: OpenAPI-MCP Qualität
overview: "Überblick und verbleibende Review-Themen; Schema/Responses und Token-Footprint sind in eigene Pläne ausgelagert."
todos:
  - id: serialize-hint
    content: "buildMcpDescription: kurzer Hinweis wenn Query-Arrays explode=false (oder non-default style)"
    status: pending
  - id: server-metadata
    content: "Optional später: SERVER_METADATA / MCP-Info aus OpenAPI info+servers"
    status: pending
isProject: false
---

# Plan: Review-Vorschläge — Überblick

**Ausgelagerte Pläne (Workspace):**

- [openapi-mcp-schema-and-responses.plan.md](openapi-mcp-schema-and-responses.plan.md) — **Review 1** (Parameter-Metadaten im JSON Schema, inkl. min/max) und **Review 6** (Response-/Fehlerkontext in der Tool-Beschreibung).
- [openapi-mcp-token-footprint.plan.md](openapi-mcp-token-footprint.plan.md) — **Review 3** und **4** (Enums kompakt, schlanke `inputSchema`-Hülle).

Kontext zum abgeschlossenen PoC: [done/agent-qualitaet-poc.plan.md](done/agent-qualitaet-poc.plan.md) (u. a. Parameter-`description`-Merge).

---

## Kurz: „Punkt 1“ und Metadaten

Die **enge** PoC-Aufgabe „Parameter-Beschreibungen“ ist erledigt ([`parameterPropertySchema`](packages/cli/src/openapi-tool-codegen.ts)). **Weitere Schema-Metadaten** (min/max, Refs) und **Fehler-Response-Texte** — siehe [openapi-mcp-schema-and-responses.plan.md](openapi-mcp-schema-and-responses.plan.md).

---

## Bewertung der acht Review-Punkte (Rest + Verweise)

| # | Thema | Wo |
|---|--------|-----|
| 1 | Metadaten im JSON Schema | [openapi-mcp-schema-and-responses.plan.md](openapi-mcp-schema-and-responses.plan.md) |
| 2 | integer vs number | In Beispielen meist `integer`; Risiko bei degradierten Schemas — mit Schema-Plan testen |
| 3 | Enums tokenlastig | [openapi-mcp-token-footprint.plan.md](openapi-mcp-token-footprint.plan.md) |
| 4 | Immer gleiche Hülle | [openapi-mcp-token-footprint.plan.md](openapi-mcp-token-footprint.plan.md) |
| 5 | Query style/explode (Sichtbarkeit) | unten **C** |
| 6 | Response-/Fehlerinfos | [openapi-mcp-schema-and-responses.plan.md](openapi-mcp-schema-and-responses.plan.md) |
| 7 | Defaults | größtenteils schon via Schema-`default`; Einzelfälle prüfen |
| 8 | Server-Metadaten | Todo `server-metadata` |

---

## Verbleibende Umsetzung in diesem Plan

### C. Serialisierung sichtbar machen (Review 5)

- Hilfsfunktion: mindestens ein Query-Array mit **`explode: false`** (oder non-default laut [`effectiveQueryParamSerialization`](packages/cli/src/openapi-tool-codegen.ts)).
- Wenn ja, **einen Satz** in [`buildMcpDescription`](packages/cli/src/openapi-tool-codegen.ts) (z. B. kommagetrennte Array-Query), ohne vollständige OpenAPI-Serialisierungsdoku. Runtime: [`appendSerializedQueryParams`](packages/cli/src/generator.ts).

### F. Server-Metadaten (Review 8)

- Optional `SERVER_METADATA.json` oder MCP-Setup aus `info` + `servers` — Todo `server-metadata`.

---

## Abgrenzung

- **Breaking Change** bei schlanker Hülle: siehe Token-Footprint-Plan.
- OpenAPI 3.1 / alle Serialisierungs-Stile: nicht MVP; Validator [getUnsupportedSerializationMessages](packages/language/src/openapi.ts).
