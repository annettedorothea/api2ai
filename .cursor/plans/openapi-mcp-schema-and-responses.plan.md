---
name: OpenAPI-MCP Schema und Responses
overview: "Review-Punkte 1 (Parameter-Metadaten im JSON Schema) und 6 (Response-/Fehlerkontext für Agenten): OpenAPI → MCP inputSchema und Tool-Beschreibung."
todos:
  - id: schema-constraints
    content: "OpenApiSchema + openApiPrimitiveToJsonSchema: minimum/maximum (und optional pattern, length, items bounds) durchreichen; Fixture-Test"
    status: pending
  - id: response-errors
    content: "includeResponses-Pfad: kompakte 4xx/5xx-Zeilen aus OpenAPI responses ergänzen"
    status: pending
  - id: schema-ref-composition
    content: "Optional: $ref/Komposition — dereferenzieren oder Validator-Warnung wenn Metadaten fehlen"
    status: pending
isProject: false
---

# Plan: Schema-Metadaten (Review 1) und Response-/Fehlerinfos (Review 6)

Ausgelagert aus [openapi-mcp-qualitaet-review.plan.md](openapi-mcp-qualitaet-review.plan.md).

## Bezug zum abgeschlossenen PoC

Im Plan [agent-qualitaet-poc.plan.md](done/agent-qualitaet-poc.plan.md) war **Parameter-`description`** bereits: Merge in [`parameterPropertySchema`](packages/cli/src/openapi-tool-codegen.ts).

Das **breitere** Thema „Parameter-Dokumentation“ (Review 1) umfasst zusätzlich **`minimum` / `maximum`**, weitere JSON-Schema-Keywords, und bei **`$ref` / Komposition** (`oneOf`/`allOf`/`anyOf`) gehen Metadaten verloren, solange [`openApiSchemaToJsonSchema`](packages/cli/src/openapi-tool-codegen.ts) auf ein degradiertes Objekt ausweicht.

**Evidenz:** Geocoding [`examples/generated/tools/open-meteo-geocoding-tools.ts`](examples/generated/tools/open-meteo-geocoding-tools.ts) — `count` ohne `minimum`/`maximum` trotz Spec in [`examples/openapi/open-meteo-geocoding.openapi.yaml`](examples/openapi/open-meteo-geocoding.openapi.yaml).

## Review 1 — Metadaten im JSON Schema

| Aspekt | Stand | Ziel |
|--------|--------|------|
| `description` (Param) | erledigt (Merge) | — |
| `format`, `default`, `enum` aus Schema | bereits in [`openApiPrimitiveToJsonSchema`](packages/cli/src/openapi-tool-codegen.ts) | — |
| `minimum` / `maximum` u. a. | fehlt in `OpenApiSchema` / Durchreichung | ergänzen |
| `$ref` / Komposition | degradiert | optional verbessern oder warnen |

**Umsetzung**

- [`OpenApiSchema`](packages/language/src/openapi.ts): mindestens `minimum`, `maximum`; optional `exclusiveMinimum`, `exclusiveMaximum`, `minLength`, `maxLength`, `pattern`, `minItems`, `maxItems`.
- [`openApiPrimitiveToJsonSchema`](packages/cli/src/openapi-tool-codegen.ts): Felder durchreichen wie `description`/`format`/`default`.
- Test: Fixture mit `minimum`/`maximum` am Query-Param; Assertion auf generiertes `inputSchemaByTool`.

**Optional:** `$ref` nach `SwaggerParser.validate` prüfen; dereferenzieren oder Validator-Hinweis.

## Review 6 — Response- und Fehlerinformationen

[`buildMcpDescription`](packages/cli/src/openapi-tool-codegen.ts) kann bei `includeResponses` bereits eine **Success**-Zeile liefern ([`buildResponseParagraph`](packages/cli/src/openapi-tool-codegen.ts)). **Offen:** kompakte **4xx/5xx**-Hinweise aus OpenAPI `responses` (Status + `description`, gekürzt, max. N Zeilen), optional Top-Level-Shape für typische Fehler-JSON — ohne riesige Schemas in `tools/list`. Runtime-Hinweise (401/403/429) bleiben im generierten `invokeTool` (PoC).

## Abgrenzung

- Keine vollständigen Response-Schemas pro Tool im MCP-Listing.
- Token-schlanke Schemas (leere Hülle, Enum-Kompaktierung) liegen im Plan [openapi-mcp-token-footprint.plan.md](openapi-mcp-token-footprint.plan.md).
