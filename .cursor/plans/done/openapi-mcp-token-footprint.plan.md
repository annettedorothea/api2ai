---
name: OpenAPI-MCP Token-Footprint
overview: 'Alles, was vor allem Token-Nutzung in tools/list und inputSchema betrifft: schlankere Hülle, kompaktere Enums.'
todos:
    - id: slim-input-hull
      content: 'buildToolInputSchema: nur pathParams/query/headers/body ausliefern wenn nötig; InvokeOptions + MCP Zod + invokeTool an fehlende Buckets anpassen'
      status: pending
    - id: enum-normalize
      content: 'Optional: anyOf+const → enum kompaktieren wo sinnvoll'
      status: pending
isProject: false
---

# Plan: Token-Footprint (Review 3 und 4)

Ausgelagert aus [openapi-mcp-qualitaet-review.plan.md](openapi-mcp-qualitaet-review.plan.md).

Ziel: **weniger irrelevante Struktur** in `inputSchema` und **kompaktere** Enum-Darstellung, damit `tools/list` und Few-Shot-Kontext für Modelle schlanker werden.

## Review 4 — Immer gleiche Hülle (`pathParams` / `query` / `headers` / `body`)

**Problem:** Leeres `pathParams` mit `additionalProperties: true`, generisches `body`-Objekt und oft generische `headers` suggerieren Freiheiten und verbrauchen Kontext.

**Umsetzung** ([`buildToolInputSchema`](packages/cli/src/openapi-tool-codegen.ts))

- `pathParams` nur, wenn Path-Parameter existieren.
- `query` nur, wenn Query-Parameter existieren.
- `body` weglassen (oder nur in Tool-Text erwähnen), wenn kein Request-Body-Schema.
- `headers` nur bei Header-Parametern aus der Spec oder wenn Security Header erfordert.

**Runtime:** [`InvokeOptions`](packages/cli/src/generator.ts), Zod in [`mcp-server.ts`](packages/cli/mcp-bundle/mcp-server.ts) / [`mcp-serve-emitted.mjs`](packages/cli/resources/mcp-serve-emitted.mjs), [`invokeTool`](packages/cli/src/generator.ts) — fehlende Buckets wie „nicht gesetzt“ behandeln.

**Risiko:** Breaking Change für Clients, die immer alle Keys erwarten — Migration: Runtime tolerant; optional Generator-Flag „strictSlimSchema“.

## Review 3 — Große Enums / lange `anyOf`-Ketten

**Stand:** Viele Specs sind bereits als **`enum`-Arrays** kompakt (z. B. Open-Meteo in [`examples/generated/tools/open-meteo-tools.ts`](examples/generated/tools/open-meteo-tools.ts)).

**Optional:** Wo OpenAPI **`anyOf` + `const`** liefert, zu **`enum`** (+ ggf. `null` bei nullable) normalisieren statt langer Ketten; Beschreibungen wichtiger Werte eher **einmal** in der Tool-Description als pro `const`.

## Nicht in diesem Plan

- **Review 5** (Serialisierungs-Hinweis in der Beschreibung): eher **Korrektheit / Agent-Verständnis**; kann einen Satz **zusätzlich** kosten — im Gesamtplan [openapi-mcp-qualitaet-review.plan.md](openapi-mcp-qualitaet-review.plan.md) unter „Serialisierung“.
- **Review 6** (Fehler-Texte in der Beschreibung): Qualität, nicht primär Token-Minimierung — [openapi-mcp-schema-and-responses.plan.md](openapi-mcp-schema-and-responses.plan.md).
- **Review 1** (min/max, Metadaten): eher Validierung/Qualität — derselbe Schema-/Response-Plan.
